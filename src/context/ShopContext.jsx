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

const SHOP_STORAGE_KEY = "active-shop-id";

export const ShopProvider = ({ children }) => {
  const { profile, authLoading } = useAuth();
  const [activeShopId, setActiveShopId] = useState(() => {
    return localStorage.getItem(SHOP_STORAGE_KEY) || DEFAULT_SHOP.id;
  });
  const [shop, setShop] = useState({ ...DEFAULT_SHOP, id: activeShopId });
  const [shopLoading, setShopLoading] = useState(true);

  useEffect(() => {
    localStorage.setItem(SHOP_STORAGE_KEY, activeShopId);
  }, [activeShopId]);

  useEffect(() => {
    if (authLoading) return;

    if (profile?.currentShopId) {
      setActiveShopId(profile.currentShopId);
      return;
    }

    if (!profile?.currentShopId && !profile && activeShopId !== DEFAULT_SHOP.id) {
      setActiveShopId(DEFAULT_SHOP.id);
    }
  }, [activeShopId, authLoading, profile]);

  useEffect(() => {
    const shopRef = doc(db, "shops", activeShopId);

    const unsubscribe = onSnapshot(shopRef, async (snapshot) => {
      if (!snapshot.exists()) {
        const initialShop = {
          ...DEFAULT_SHOP,
          id: activeShopId,
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
  }, [activeShopId]);

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
