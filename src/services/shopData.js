import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
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

export const subscribeToShopBills = (shopId, onData, onError) => {
  const billsQuery = query(
    getShopBillsCollection(shopId),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(
    billsQuery,
    (snapshot) => {
      const bills = snapshot.docs.map((billDoc) => ({
        id: billDoc.id,
        ...billDoc.data(),
        items: billDoc.data().items || [],
      }));
      onData(bills);
    },
    onError
  );
};

export const saveBillForShop = (shopId, bill) =>
  addDoc(getShopBillsCollection(shopId), bill);

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

export const upsertShopSettings = (shopId, settings) =>
  setDoc(
    getShopDocRef(shopId),
    {
      ...settings,
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );
