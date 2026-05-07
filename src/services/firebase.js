import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { db, storage } from "../Firebase/firebase";

const getCategoriesCollection = (shopId) =>
  collection(db, "shops", shopId, "categories");

const getCategoryDoc = (shopId, categoryId) =>
  doc(db, "shops", shopId, "categories", categoryId);

const getSubcategoriesCollection = (shopId) =>
  collection(db, "shops", shopId, "subcategories");

const getSubcategoryDoc = (shopId, subcategoryId) =>
  doc(db, "shops", shopId, "subcategories", subcategoryId);

const getItemsCollection = (shopId) => collection(db, "shops", shopId, "items");

const getItemDoc = (shopId, itemId) => doc(db, "shops", shopId, "items", itemId);

export const subscribeCategories = (shopId, onData, onError) => {
  if (!shopId) {
    onData([]);
    return () => {};
  }

  const categoriesQuery = query(getCategoriesCollection(shopId), orderBy("name", "asc"));
  return onSnapshot(
    categoriesQuery,
    (snapshot) => {
      onData(
        snapshot.docs.map((entry) => ({
          id: entry.id,
          ...entry.data(),
        }))
      );
    },
    onError
  );
};

export const subscribeSubcategories = (shopId, onData, onError) => {
  if (!shopId) {
    onData([]);
    return () => {};
  }

  const subcategoriesQuery = query(
    getSubcategoriesCollection(shopId),
    orderBy("name", "asc")
  );
  return onSnapshot(
    subcategoriesQuery,
    (snapshot) => {
      onData(
        snapshot.docs.map((entry) => ({
          id: entry.id,
          ...entry.data(),
        }))
      );
    },
    onError
  );
};

export const subscribeItems = (shopId, onData, onError) => {
  if (!shopId) {
    onData([]);
    return () => {};
  }

  const itemsQuery = query(getItemsCollection(shopId), orderBy("createdAt", "desc"));
  return onSnapshot(
    itemsQuery,
    (snapshot) => {
      onData(
        snapshot.docs.map((entry) => ({
          id: entry.id,
          ...entry.data(),
        }))
      );
    },
    onError
  );
};

export const createCategory = (shopId, name) =>
  addDoc(getCategoriesCollection(shopId), {
    name: name.trim(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

export const updateCategory = (shopId, categoryId, name) =>
  updateDoc(getCategoryDoc(shopId, categoryId), {
    name: name.trim(),
    updatedAt: serverTimestamp(),
  });

export const removeCategory = async (shopId, categoryId) => {
  await deleteDoc(getCategoryDoc(shopId, categoryId));
};

export const createSubcategory = (shopId, payload) =>
  addDoc(getSubcategoriesCollection(shopId), {
    name: payload.name.trim(),
    categoryId: payload.categoryId || "",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

export const updateSubcategory = (shopId, subcategoryId, payload) =>
  updateDoc(getSubcategoryDoc(shopId, subcategoryId), {
    name: payload.name.trim(),
    categoryId: payload.categoryId || "",
    updatedAt: serverTimestamp(),
  });

export const removeSubcategory = (shopId, subcategoryId) =>
  deleteDoc(getSubcategoryDoc(shopId, subcategoryId));

export const uploadItemImage = async (shopId, file) => {
  const safeName = (file?.name || "image")
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]/g, "-");
  const imagePath = `shops/${shopId}/inventory/${Date.now()}-${safeName}`;
  const imageRef = ref(storage, imagePath);
  await uploadBytes(imageRef, file);
  const imageUrl = await getDownloadURL(imageRef);
  return { imageUrl, imagePath };
};

export const removeItemImageByPath = async (imagePath) => {
  if (!imagePath) return;
  await deleteObject(ref(storage, imagePath));
};

export const createItem = (shopId, payload) =>
  addDoc(getItemsCollection(shopId), {
    name: payload.name.trim(),
    price: Number(payload.price || 0),
    categoryId: payload.categoryId || "",
    subcategoryId: payload.subcategoryId || "",
    imageUrl: payload.imageUrl || "",
    imagePath: payload.imagePath || "",
    code: payload.code?.trim() || "",
    stockQty: Number(payload.stockQty || 0),
    stockUnit: payload.stockUnit === "dozen" ? "dozen" : "piece",
    lowStockThreshold: Number(payload.lowStockThreshold || 0),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

export const updateItem = (shopId, itemId, payload) =>
  updateDoc(getItemDoc(shopId, itemId), {
    name: payload.name.trim(),
    price: Number(payload.price || 0),
    categoryId: payload.categoryId || "",
    subcategoryId: payload.subcategoryId || "",
    imageUrl: payload.imageUrl || "",
    imagePath: payload.imagePath || "",
    code: payload.code?.trim() || "",
    stockQty: Number(payload.stockQty || 0),
    stockUnit: payload.stockUnit === "dozen" ? "dozen" : "piece",
    lowStockThreshold: Number(payload.lowStockThreshold || 0),
    updatedAt: serverTimestamp(),
  });

export const removeItem = (shopId, itemId) => deleteDoc(getItemDoc(shopId, itemId));
