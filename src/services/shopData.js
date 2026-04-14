import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
} from "firebase/firestore";
import { db } from "../Firebase/firebase";

export const getShopDocRef = (shopId) => doc(db, "shops", shopId);

export const getShopBillsCollection = (shopId) =>
  collection(db, "shops", shopId, "bills");

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

export const upsertShopSettings = (shopId, settings) =>
  setDoc(
    getShopDocRef(shopId),
    {
      ...settings,
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );
