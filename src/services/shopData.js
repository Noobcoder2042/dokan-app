import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  setDoc,
  updateDoc,
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
  if (nameKey) return `name-${nameKey}`;

  return `customer-${Date.now()}`;
};

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

      transaction.update(itemRef, {
        stockQty: Number((stockQty - deductQty).toFixed(4)),
        updatedAt: new Date().toISOString(),
      });
    }

    transaction.set(billRef, bill);
  });

  return billRef;
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
