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
    if (!user?.uid || !activeShopId) return () => {};

    const shopRef = doc(db, "shops", activeShopId);
    const userRef = doc(db, "users", user.uid);

    const unsubscribe = onSnapshot(shopRef, async (snapshot) => {
      if (!snapshot.exists()) {
        const initialShop = {
          ...DEFAULT_SHOP,
          id: activeShopId,
          ownerUid: user?.uid || null,
          createdAt: new Date().toISOString(),
        };
        await setDoc(shopRef, initialShop);
        await setDoc(
          doc(db, "shops", activeShopId, "members", user.uid),
          {
            uid: user.uid,
            role: "owner",
            createdAt: new Date().toISOString(),
          },
          { merge: true }
        );
        setShop(initialShop);
        setShopLoading(false);
        return;
      }

      const existingShop = snapshot.data() || {};
      if (existingShop.ownerUid === user.uid) {
        await setDoc(
          doc(db, "shops", activeShopId, "members", user.uid),
          {
            uid: user.uid,
            role: "owner",
            createdAt: new Date().toISOString(),
          },
          { merge: true }
        );
      }

      setShop({
        id: snapshot.id,
        ...DEFAULT_SHOP,
        ...existingShop,
      });
      setShopLoading(false);
    }, async (error) => {
      console.error("Shop subscription failed:", error);

      if (error?.code === "permission-denied" && activeShopId !== defaultShopId) {
        try {
          await setDoc(
            userRef,
            {
              currentShopId: defaultShopId,
              updatedAt: new Date().toISOString(),
            },
            { merge: true }
          );
        } catch (profilePatchError) {
          console.error("Failed to patch profile shop id:", profilePatchError);
        }
        setActiveShopId(defaultShopId);
      }

      setShopLoading(false);
    });

    return () => unsubscribe();
  }, [activeShopId, defaultShopId, user?.uid]);

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
