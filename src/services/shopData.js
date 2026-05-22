import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  setDoc,
  updateDoc,
  writeBatch,
  where,
} from "firebase/firestore";
import { db } from "../Firebase/firebase";

export const getShopDocRef = (shopId) => doc(db, "shops", shopId);

export const getShopBillsCollection = (shopId) =>
  collection(db, "shops", shopId, "bills");

export const getShopBillDocRef = (shopId, billId) =>
  doc(db, "shops", shopId, "bills", billId);

export const getShopCustomersCollection = (shopId) =>
  collection(db, "shops", shopId, "customers");

export const getShopCustomerDocRef = (shopId, customerId) =>
  doc(db, "shops", shopId, "customers", customerId);

export const getInventoryCategoriesCollection = (shopId) =>
  collection(db, "shops", shopId, "inventoryCategories");

export const getInventoryCategoryDocRef = (shopId, categoryId) =>
  doc(db, "shops", shopId, "inventoryCategories", categoryId);

export const getInventorySubcategoriesCollection = (shopId, categoryId) =>
  collection(
    db,
    "shops",
    shopId,
    "inventoryCategories",
    categoryId,
    "subcategories"
  );

export const getInventorySubcategoryDocRef = (shopId, categoryId, subcategoryId) =>
  doc(
    db,
    "shops",
    shopId,
    "inventoryCategories",
    categoryId,
    "subcategories",
    subcategoryId
  );

export const getInventoryItemsCollection = (shopId, categoryId, subcategoryId) =>
  collection(
    db,
    "shops",
    shopId,
    "inventoryCategories",
    categoryId,
    "subcategories",
    subcategoryId,
    "items"
  );

export const getInventoryItemDocRef = (shopId, categoryId, subcategoryId, itemId) =>
  doc(
    db,
    "shops",
    shopId,
    "inventoryCategories",
    categoryId,
    "subcategories",
    subcategoryId,
    "items",
    itemId
  );

const normalize = (value) =>
  (value || "")
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const buildCustomerId = (customer) => {
  const phoneKey = (customer.phoneNumber || "").replace(/[^\d]/g, "");
  if (phoneKey) return `phone-${phoneKey}`;

  const nameKey = normalize(customer.name);
  const addressKey = normalize(customer.address);
  if (nameKey && addressKey) return `name-${nameKey}-${addressKey}`;
  if (nameKey) return `name-${nameKey}`;

  return `customer-${Date.now()}`;
};

const normalizeText = (value) =>
  (value || "").toString().trim().toLowerCase();

const normalizePhone = (value) =>
  (value || "").toString().replace(/[^\d]/g, "");

export const subscribeToShopBills = (shopId, userId, onData, onError) => {
  if (!shopId || !userId) {
    onData([]);
    return () => {};
  }

  const billsQuery = query(
    getShopBillsCollection(shopId),
    where("userId", "==", userId)
  );

  return onSnapshot(
    billsQuery,
    (snapshot) => {
      const bills = snapshot.docs
        .map((billDoc) => ({
          id: billDoc.id,
          ...billDoc.data(),
          items: billDoc.data().items || [],
        }))
        .sort((a, b) => {
          const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return bTime - aTime;
        });
      onData(bills);
    },
    onError
  );
};

export const saveBillForShop = (shopId, bill) =>
  addDoc(getShopBillsCollection(shopId), bill);

const pieceQtyToStockUnitQty = (pieceQty, stockUnit) =>
  stockUnit === "dozen" ? pieceQty / 12 : pieceQty;

export const saveBillAndConsumeStockForShop = async (
  shopId,
  bill,
  stockRequests = []
) => {
  const billRef = doc(getShopBillsCollection(shopId));
  const normalizedRequests = stockRequests.reduce((acc, request) => {
    if (!request?.itemId) return acc;
    const pieceQty = Number(request.pieceQty || 0);
    if (pieceQty <= 0) return acc;
    const current = acc.get(request.itemId) || {
      itemId: request.itemId,
      pieceQty: 0,
      itemName: request.itemName || "Item",
    };
    current.pieceQty += pieceQty;
    acc.set(request.itemId, current);
    return acc;
  }, new Map());

  await runTransaction(db, async (transaction) => {
    const stockUpdates = [];

    for (const request of normalizedRequests.values()) {
      const itemRef = doc(db, "shops", shopId, "items", request.itemId);
      const snapshot = await transaction.get(itemRef);
      if (!snapshot.exists()) continue;

      const itemData = snapshot.data() || {};
      const stockQty = Number(itemData.stockQty);
      if (Number.isNaN(stockQty)) continue;

      const stockUnit = itemData.stockUnit === "dozen" ? "dozen" : "piece";
      const deductQty = pieceQtyToStockUnitQty(request.pieceQty, stockUnit);

      if (stockQty < deductQty) {
        throw new Error(
          `Insufficient stock for ${itemData.name || request.itemName || "item"}`
        );
      }

      stockUpdates.push({
        itemRef,
        stockQty: Number((stockQty - deductQty).toFixed(4)),
        updatedAt: new Date().toISOString(),
      });
    }

    // Firestore transaction rule: all reads must happen before any write.
    stockUpdates.forEach((entry) => {
      transaction.update(entry.itemRef, {
        stockQty: entry.stockQty,
        updatedAt: entry.updatedAt,
      });
    });

    transaction.set(billRef, bill);
  });

  return billRef;
};

export const updateBillAndConsumeStockDeltaForShop = async (
  shopId,
  billId,
  billPatch,
  currentItems,
  previousItems
) => {
  const billRef = getShopBillDocRef(shopId, billId);

  const calculatePieceQty = (item) => {
    const qty = Number(item.quantity || 0);
    return item.quantityUnit === "dozen" ? qty * 12 : qty;
  };

  const deltaRequests = new Map();

  currentItems.forEach((item) => {
    const itemId = item.inventoryItemId;
    if (!itemId) return;
    const qty = calculatePieceQty(item);
    deltaRequests.set(itemId, (deltaRequests.get(itemId) || 0) + qty);
  });

  previousItems.forEach((item) => {
    const itemId = item.inventoryItemId;
    if (!itemId) return;
    const qty = calculatePieceQty(item);
    deltaRequests.set(itemId, (deltaRequests.get(itemId) || 0) - qty);
  });

  await runTransaction(db, async (transaction) => {
    const stockUpdates = [];

    for (const [itemId, deltaPieceQty] of deltaRequests.entries()) {
      if (deltaPieceQty === 0) continue;

      const itemRef = doc(db, "shops", shopId, "items", itemId);
      const snapshot = await transaction.get(itemRef);
      if (!snapshot.exists()) continue;

      const itemData = snapshot.data() || {};
      const stockQty = Number(itemData.stockQty);
      if (Number.isNaN(stockQty)) continue;

      const stockUnit = itemData.stockUnit === "dozen" ? "dozen" : "piece";
      const deductQty = pieceQtyToStockUnitQty(deltaPieceQty, stockUnit);

      if (stockQty < deductQty) {
        throw new Error(
          `Insufficient stock for ${itemData.name || "item"}`
        );
      }

      stockUpdates.push({
        itemRef,
        stockQty: Number((stockQty - deductQty).toFixed(4)),
        updatedAt: new Date().toISOString(),
      });
    }

    stockUpdates.forEach((entry) => {
      transaction.update(entry.itemRef, {
        stockQty: entry.stockQty,
        updatedAt: entry.updatedAt,
      });
    });

    transaction.update(billRef, {
      ...billPatch,
      updatedAt: new Date().toISOString(),
    });
  });
};

export const updateBillForShop = (shopId, billId, billPatch) =>
  updateDoc(getShopBillDocRef(shopId, billId), {
    ...billPatch,
    updatedAt: new Date().toISOString(),
  });

export const deleteBillForShop = (shopId, billId) =>
  deleteDoc(getShopBillDocRef(shopId, billId));

export const subscribeToShopCustomers = (shopId, onData, onError) => {
  const customersQuery = query(
    getShopCustomersCollection(shopId),
    orderBy("name", "asc")
  );

  return onSnapshot(
    customersQuery,
    (snapshot) => {
      const customers = snapshot.docs.map((customerDoc) => ({
        id: customerDoc.id,
        ...customerDoc.data(),
      }));
      onData(customers);
    },
    onError
  );
};

export const upsertCustomerForShop = (shopId, customer) => {
  const customerId = customer.id || buildCustomerId(customer);
  return setDoc(
    getShopCustomerDocRef(shopId, customerId),
    {
      name: customer.name || "",
      phoneNumber: customer.phoneNumber || "",
      address: customer.address || "",
      lastBilledAt: customer.lastBilledAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );
};

export const updateCustomerForShop = (shopId, customerId, customerPatch) =>
  updateDoc(getShopCustomerDocRef(shopId, customerId), {
    ...customerPatch,
    updatedAt: new Date().toISOString(),
  });

export const deleteCustomerForShop = (shopId, customerId) =>
  deleteDoc(getShopCustomerDocRef(shopId, customerId));

export const subscribeToInventoryCategories = (shopId, onData, onError) => {
  const categoriesQuery = query(
    getInventoryCategoriesCollection(shopId),
    orderBy("name", "asc")
  );

  return onSnapshot(
    categoriesQuery,
    (snapshot) => {
      onData(
        snapshot.docs.map((categoryDoc) => ({
          id: categoryDoc.id,
          ...categoryDoc.data(),
        }))
      );
    },
    onError
  );
};

export const subscribeToInventorySubcategories = (
  shopId,
  categoryId,
  onData,
  onError
) => {
  if (!shopId || !categoryId) {
    onData([]);
    return () => {};
  }

  const subcategoriesQuery = query(
    getInventorySubcategoriesCollection(shopId, categoryId),
    orderBy("name", "asc")
  );

  return onSnapshot(
    subcategoriesQuery,
    (snapshot) => {
      onData(
        snapshot.docs.map((subcategoryDoc) => ({
          id: subcategoryDoc.id,
          ...subcategoryDoc.data(),
        }))
      );
    },
    onError
  );
};

export const subscribeToInventoryItems = (
  shopId,
  categoryId,
  subcategoryId,
  onData,
  onError
) => {
  if (!shopId || !categoryId || !subcategoryId) {
    onData([]);
    return () => {};
  }

  const itemsQuery = query(
    getInventoryItemsCollection(shopId, categoryId, subcategoryId),
    orderBy("name", "asc")
  );

  return onSnapshot(
    itemsQuery,
    (snapshot) => {
      onData(
        snapshot.docs.map((itemDoc) => ({
          id: itemDoc.id,
          ...itemDoc.data(),
        }))
      );
    },
    onError
  );
};

export const subscribeToShopItems = (shopId, onData, onError) => {
  if (!shopId) {
    onData([]);
    return () => {};
  }

  const itemsQuery = query(collection(db, "shops", shopId, "items"), orderBy("name", "asc"));

  return onSnapshot(
    itemsQuery,
    (snapshot) => {
      onData(snapshot.docs.map((itemDoc) => ({ id: itemDoc.id, ...itemDoc.data() })));
    },
    onError
  );
};

export const addInventoryCategoryForShop = (shopId, category) =>
  addDoc(getInventoryCategoriesCollection(shopId), {
    name: category.name?.trim() || "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

export const updateInventoryCategoryForShop = (shopId, categoryId, patch) =>
  updateDoc(getInventoryCategoryDocRef(shopId, categoryId), {
    ...patch,
    name: patch.name?.trim() || "",
    updatedAt: new Date().toISOString(),
  });

export const deleteInventoryCategoryForShop = (shopId, categoryId) =>
  deleteDoc(getInventoryCategoryDocRef(shopId, categoryId));

export const addInventorySubcategoryForShop = (shopId, categoryId, subcategory) =>
  addDoc(getInventorySubcategoriesCollection(shopId, categoryId), {
    name: subcategory.name?.trim() || "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

export const updateInventorySubcategoryForShop = (
  shopId,
  categoryId,
  subcategoryId,
  patch
) =>
  updateDoc(getInventorySubcategoryDocRef(shopId, categoryId, subcategoryId), {
    ...patch,
    name: patch.name?.trim() || "",
    updatedAt: new Date().toISOString(),
  });

export const deleteInventorySubcategoryForShop = (
  shopId,
  categoryId,
  subcategoryId
) => deleteDoc(getInventorySubcategoryDocRef(shopId, categoryId, subcategoryId));

export const addInventoryItemForShop = (
  shopId,
  categoryId,
  subcategoryId,
  item
) =>
  addDoc(getInventoryItemsCollection(shopId, categoryId, subcategoryId), {
    shopId,
    categoryId,
    subcategoryId,
    name: item.name?.trim() || "",
    price: Number(item.price || 0),
    photoDataUrl: item.photoDataUrl?.trim() || "",
    photoName: item.photoName?.trim() || "",
    code: item.code?.trim() || "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

export const updateInventoryItemForShop = (
  shopId,
  categoryId,
  subcategoryId,
  itemId,
  patch
) =>
  updateDoc(getInventoryItemDocRef(shopId, categoryId, subcategoryId, itemId), {
    shopId,
    categoryId,
    subcategoryId,
    ...patch,
    name: patch.name?.trim() || "",
    price: Number(patch.price || 0),
    photoDataUrl: patch.photoDataUrl?.trim() || "",
    photoName: patch.photoName?.trim() || "",
    code: patch.code?.trim() || "",
    updatedAt: new Date().toISOString(),
  });

export const deleteInventoryItemForShop = (
  shopId,
  categoryId,
  subcategoryId,
  itemId
) => deleteDoc(getInventoryItemDocRef(shopId, categoryId, subcategoryId, itemId));

export const subscribeToShopInventoryItems = (shopId, onData, onError) => {
  if (!shopId) {
    onData([]);
    return () => {};
  }

  const itemsQuery = query(collection(db, "shops", shopId, "items"), orderBy("name", "asc"));

  return onSnapshot(
    itemsQuery,
    (snapshot) => {
      const items = snapshot.docs
        .map((itemDoc) => ({
          id: itemDoc.id,
          ...itemDoc.data(),
        }))
        .sort((a, b) => (a.name || "").localeCompare(b.name || ""));
      onData(items);
    },
    onError
  );
};

export const upsertShopSettings = (shopId, settings) =>
  setDoc(
    getShopDocRef(shopId),
    {
      ...settings,
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );

// Reads backup data by scope:
// - bills: only current user's bills (rule-safe)
// - customerInventory: customer + inventory documents
export const getShopBackupData = async (shopId, userId, scope = "all") => {
  const shopDoc = await getDoc(getShopDocRef(shopId));
  const includeBills = scope === "all" || scope === "bills";
  const includeCustomerInventory = scope === "all" || scope === "customerInventory";

  const billsSnap = includeBills
    ? await getDocs(
        query(getShopBillsCollection(shopId), where("userId", "==", userId))
      )
    : { docs: [] };
  const customersSnap = includeCustomerInventory
    ? await getDocs(getShopCustomersCollection(shopId))
    : { docs: [] };
  const rootItemsSnap = includeCustomerInventory
    ? await getDocs(collection(db, "shops", shopId, "items"))
    : { docs: [] };
  const categoriesSnap = includeCustomerInventory
    ? await getDocs(getInventoryCategoriesCollection(shopId))
    : { docs: [] };

  const categories = [];
  const subcategories = [];
  const nestedItems = [];

  for (const categoryDoc of categoriesSnap.docs) {
    categories.push({ id: categoryDoc.id, ...categoryDoc.data() });

    const subSnap = await getDocs(
      getInventorySubcategoriesCollection(shopId, categoryDoc.id)
    );

    for (const subDoc of subSnap.docs) {
      subcategories.push({
        id: subDoc.id,
        categoryId: categoryDoc.id,
        ...subDoc.data(),
      });

      const itemsSnap = await getDocs(
        getInventoryItemsCollection(shopId, categoryDoc.id, subDoc.id)
      );
      itemsSnap.forEach((itemDoc) => {
        nestedItems.push({
          id: itemDoc.id,
          categoryId: categoryDoc.id,
          subcategoryId: subDoc.id,
          ...itemDoc.data(),
        });
      });
    }
  }

  return {
    exportedAt: new Date().toISOString(),
    shopId,
    shop: shopDoc.exists() ? { id: shopDoc.id, ...shopDoc.data() } : null,
    bills: billsSnap.docs.map((docItem) => ({ id: docItem.id, ...docItem.data() })),
    customers: customersSnap.docs.map((docItem) => ({
      id: docItem.id,
      ...docItem.data(),
    })),
    inventory: {
      rootItems: rootItemsSnap.docs.map((docItem) => ({
        id: docItem.id,
        ...docItem.data(),
      })),
      categories,
      subcategories,
      nestedItems,
    },
  };
};

// Firestore batch hard limit is 500; keep below that for safer retries.
const deleteDocsInBatches = async (docRefs) => {
  if (!docRefs.length) return;
  const chunkSize = 400;
  for (let index = 0; index < docRefs.length; index += chunkSize) {
    const batch = writeBatch(db);
    docRefs.slice(index, index + chunkSize).forEach((docRef) => {
      batch.delete(docRef);
    });
    await batch.commit();
  }
};

// Deletes data by explicit scope so destructive actions stay predictable.
export const wipeShopData = async (shopId, userId, scope = "bills") => {
  const docRefs = [];

  if (scope === "bills") {
    const billsQuery = query(
      getShopBillsCollection(shopId),
      where("userId", "==", userId)
    );
    const billsSnap = await getDocs(billsQuery);
    billsSnap.forEach((entry) => docRefs.push(entry.ref));
  }

  if (scope === "customerInventory") {
    const customersSnap = await getDocs(getShopCustomersCollection(shopId));
    customersSnap.forEach((entry) => docRefs.push(entry.ref));

    const rootItemsSnap = await getDocs(collection(db, "shops", shopId, "items"));
    rootItemsSnap.forEach((entry) => docRefs.push(entry.ref));

    const categoriesSnap = await getDocs(getInventoryCategoriesCollection(shopId));
    for (const categoryDoc of categoriesSnap.docs) {
      const subSnap = await getDocs(
        getInventorySubcategoriesCollection(shopId, categoryDoc.id)
      );
      for (const subDoc of subSnap.docs) {
        const itemsSnap = await getDocs(
          getInventoryItemsCollection(shopId, categoryDoc.id, subDoc.id)
        );
        itemsSnap.forEach((entry) => docRefs.push(entry.ref));
        docRefs.push(subDoc.ref);
      }
      docRefs.push(categoryDoc.ref);
    }
  }

  await deleteDocsInBatches(docRefs);
};

// Restores backup with duplicate detection and skip counters.
// Existing records are preserved unless non-duplicate.
export const importShopBackupData = async (shopId, userId, backupData) => {
  const report = {
    imported: { bills: 0, customers: 0, items: 0, categories: 0, subcategories: 0, nestedItems: 0 },
    skipped: { bills: 0, customers: 0, items: 0, categories: 0, subcategories: 0, nestedItems: 0 },
  };

  const incomingBills = Array.isArray(backupData?.bills) ? backupData.bills : [];
  const incomingCustomers = Array.isArray(backupData?.customers) ? backupData.customers : [];
  const incomingRootItems = Array.isArray(backupData?.inventory?.rootItems)
    ? backupData.inventory.rootItems
    : [];
  const incomingCategories = Array.isArray(backupData?.inventory?.categories)
    ? backupData.inventory.categories
    : [];
  const incomingSubcategories = Array.isArray(backupData?.inventory?.subcategories)
    ? backupData.inventory.subcategories
    : [];
  const incomingNestedItems = Array.isArray(backupData?.inventory?.nestedItems)
    ? backupData.inventory.nestedItems
    : [];

  const existingBillsSnap = await getDocs(
    query(getShopBillsCollection(shopId), where("userId", "==", userId))
  );
  const existingCustomersSnap = await getDocs(getShopCustomersCollection(shopId));
  const existingRootItemsSnap = await getDocs(collection(db, "shops", shopId, "items"));
  const existingCategoriesSnap = await getDocs(getInventoryCategoriesCollection(shopId));

  const existingBillIdSet = new Set(existingBillsSnap.docs.map((item) => item.id));
  const existingBillCompositeSet = new Set(
    existingBillsSnap.docs.map((entry) => {
      const data = entry.data() || {};
      return [
        data.createdAt || "",
        normalizePhone(data.phoneNumber),
        Number(data.totalAmount || 0).toFixed(2),
      ].join("|");
    })
  );

  const existingCustomerKeySet = new Set(
    existingCustomersSnap.docs.map((entry) => {
      const data = entry.data() || {};
      const phone = normalizePhone(data.phoneNumber);
      if (phone) return `phone:${phone}`;
      return `name:${normalizeText(data.name)}|address:${normalizeText(data.address)}`;
    })
  );

  const existingRootItemKeySet = new Set(
    existingRootItemsSnap.docs.map((entry) => {
      const data = entry.data() || {};
      return `name:${normalizeText(data.name)}|code:${normalizeText(data.code)}`;
    })
  );

  const existingCategoryIdSet = new Set(existingCategoriesSnap.docs.map((entry) => entry.id));
  const existingSubcategoryIdSet = new Set();
  const existingNestedItemKeySet = new Set();

  for (const categoryDoc of existingCategoriesSnap.docs) {
    const subSnap = await getDocs(
      getInventorySubcategoriesCollection(shopId, categoryDoc.id)
    );
    for (const subDoc of subSnap.docs) {
      existingSubcategoryIdSet.add(`${categoryDoc.id}|${subDoc.id}`);
      const nestedItemsSnap = await getDocs(
        getInventoryItemsCollection(shopId, categoryDoc.id, subDoc.id)
      );
      nestedItemsSnap.forEach((itemDoc) => {
        const data = itemDoc.data() || {};
        existingNestedItemKeySet.add(
          `${categoryDoc.id}|${subDoc.id}|${normalizeText(data.name)}|${normalizeText(
            data.code
          )}`
        );
      });
    }
  }

  const chunkSize = 300;
  const commitQueue = [];
  let batch = writeBatch(db);
  let batchCount = 0;
  const pushSet = (ref, data) => {
    batch.set(ref, data, { merge: true });
    batchCount += 1;
    if (batchCount >= chunkSize) {
      commitQueue.push(batch.commit());
      batch = writeBatch(db);
      batchCount = 0;
    }
  };

  incomingBills.forEach((bill) => {
    const compositeKey = [
      bill.createdAt || "",
      normalizePhone(bill.phoneNumber),
      Number(bill.totalAmount || 0).toFixed(2),
    ].join("|");
    if (existingBillIdSet.has(bill.id) || existingBillCompositeSet.has(compositeKey)) {
      report.skipped.bills += 1;
      return;
    }
    const billRef = bill.id
      ? getShopBillDocRef(shopId, bill.id)
      : doc(getShopBillsCollection(shopId));
    pushSet(billRef, {
      ...bill,
      userId,
      shopId,
    });
    existingBillCompositeSet.add(compositeKey);
    report.imported.bills += 1;
  });

  incomingCustomers.forEach((customer) => {
    const phone = normalizePhone(customer.phoneNumber);
    const dedupKey = phone
      ? `phone:${phone}`
      : `name:${normalizeText(customer.name)}|address:${normalizeText(customer.address)}`;
    if (existingCustomerKeySet.has(dedupKey)) {
      report.skipped.customers += 1;
      return;
    }
    const customerRef = customer.id
      ? getShopCustomerDocRef(shopId, customer.id)
      : getShopCustomerDocRef(shopId, buildCustomerId(customer));
    pushSet(customerRef, {
      name: customer.name || "",
      phoneNumber: customer.phoneNumber || "",
      address: customer.address || "",
      lastBilledAt: customer.lastBilledAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    existingCustomerKeySet.add(dedupKey);
    report.imported.customers += 1;
  });

  incomingRootItems.forEach((item) => {
    const key = `name:${normalizeText(item.name)}|code:${normalizeText(item.code)}`;
    if (existingRootItemKeySet.has(key)) {
      report.skipped.items += 1;
      return;
    }
    const itemRef = item.id ? doc(db, "shops", shopId, "items", item.id) : doc(collection(db, "shops", shopId, "items"));
    pushSet(itemRef, {
      ...item,
      shopId,
      updatedAt: new Date().toISOString(),
    });
    existingRootItemKeySet.add(key);
    report.imported.items += 1;
  });

  incomingCategories.forEach((category) => {
    if (!category?.id) return;
    if (existingCategoryIdSet.has(category.id)) {
      report.skipped.categories += 1;
      return;
    }
    pushSet(getInventoryCategoryDocRef(shopId, category.id), {
      name: category.name || "",
      createdAt: category.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    existingCategoryIdSet.add(category.id);
    report.imported.categories += 1;
  });

  incomingSubcategories.forEach((subcategory) => {
    if (!subcategory?.id || !subcategory?.categoryId) return;
    const pair = `${subcategory.categoryId}|${subcategory.id}`;
    if (existingSubcategoryIdSet.has(pair)) {
      report.skipped.subcategories += 1;
      return;
    }
    pushSet(
      getInventorySubcategoryDocRef(shopId, subcategory.categoryId, subcategory.id),
      {
        name: subcategory.name || "",
        createdAt: subcategory.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    );
    existingSubcategoryIdSet.add(pair);
    report.imported.subcategories += 1;
  });

  incomingNestedItems.forEach((item) => {
    if (!item?.categoryId || !item?.subcategoryId) return;
    const nestedKey = `${item.categoryId}|${item.subcategoryId}|${normalizeText(
      item.name
    )}|${normalizeText(item.code)}`;
    if (existingNestedItemKeySet.has(nestedKey)) {
      report.skipped.nestedItems += 1;
      return;
    }
    const itemRef = item.id
      ? getInventoryItemDocRef(shopId, item.categoryId, item.subcategoryId, item.id)
      : doc(getInventoryItemsCollection(shopId, item.categoryId, item.subcategoryId));
    pushSet(itemRef, {
      ...item,
      shopId,
      updatedAt: new Date().toISOString(),
    });
    existingNestedItemKeySet.add(nestedKey);
    report.imported.nestedItems += 1;
  });

  if (batchCount > 0) {
    commitQueue.push(batch.commit());
  }
  await Promise.all(commitQueue);
  return report;
};
