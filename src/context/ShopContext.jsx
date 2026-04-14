import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "../Firebase/firebase";
import { useAuth } from "./AuthContext";

const DEFAULT_SHOP = {
  id: "demo-shop",
  name: "Demo Shop",
  address: "",
  phone: "",
  currency: "INR",
  extraChargesEnabled: true,
  thermalPrinterWidth: "80mm",
};

const ShopContext = createContext(null);

export const ShopProvider = ({ children }) => {
  const { profile, authLoading, user } = useAuth();
  const shopStorageKey = `active-shop-id-${user?.uid || "guest"}`;
  const defaultShopId = user?.uid ? `shop-${user.uid}` : DEFAULT_SHOP.id;
  const [activeShopId, setActiveShopId] = useState(DEFAULT_SHOP.id);
  const [shop, setShop] = useState({ ...DEFAULT_SHOP, id: activeShopId });
  const [shopLoading, setShopLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;
    localStorage.setItem(shopStorageKey, activeShopId);
  }, [activeShopId, shopStorageKey, user?.uid]);

  useEffect(() => {
    const persistedShopId = localStorage.getItem(shopStorageKey);
    setActiveShopId(persistedShopId || defaultShopId);
  }, [defaultShopId, shopStorageKey]);

  useEffect(() => {
    if (authLoading) return;

    if (profile?.currentShopId) {
      setActiveShopId(profile.currentShopId);
      return;
    }

    if (!profile?.currentShopId && activeShopId !== defaultShopId) {
      setActiveShopId(defaultShopId);
    }
  }, [activeShopId, authLoading, defaultShopId, profile]);

  useEffect(() => {
    const shopRef = doc(db, "shops", activeShopId);

    const unsubscribe = onSnapshot(shopRef, async (snapshot) => {
      if (!snapshot.exists()) {
        const initialShop = {
          ...DEFAULT_SHOP,
          id: activeShopId,
          ownerUid: user?.uid || null,
          createdAt: new Date().toISOString(),
        };
        await setDoc(shopRef, initialShop);
        setShop(initialShop);
        setShopLoading(false);
        return;
      }

      setShop({
        id: snapshot.id,
        ...DEFAULT_SHOP,
        ...snapshot.data(),
      });
      setShopLoading(false);
    });

    return () => unsubscribe();
  }, [activeShopId, user?.uid]);

  const value = useMemo(
    () => ({
      activeShopId,
      setActiveShopId,
      shop,
      shopLoading,
    }),
    [activeShopId, shop, shopLoading]
  );

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
};

export const useShop = () => {
  const context = useContext(ShopContext);

  if (!context) {
    throw new Error("useShop must be used inside ShopProvider");
  }

  return context;
};
