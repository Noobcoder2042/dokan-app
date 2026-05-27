import React, { useState, useEffect } from "react";
import {
  Box, Typography, Button, Stack, CircularProgress, Tabs, Tab, useTheme, alpha
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import AdminPanelSettingsRoundedIcon from "@mui/icons-material/AdminPanelSettingsRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import SpeedRoundedIcon from "@mui/icons-material/SpeedRounded";
import ContactSupportRoundedIcon from "@mui/icons-material/ContactSupportRounded";
import ShieldRoundedIcon from "@mui/icons-material/ShieldRounded";
import CampaignRoundedIcon from "@mui/icons-material/CampaignRounded";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../Firebase/firebase";
import { useUIExperience } from "../context/UIExperienceContext";

// Modular tab components
import { AdminOverview } from "../admin/dashboard/AdminOverview";
import { UserManager } from "../admin/users/UserManager";
import { SubscriptionControls } from "../admin/subscriptions/SubscriptionControls";
import { SupportDesk } from "../admin/support/SupportDesk";
import { SecurityCenter } from "../admin/security/SecurityCenter";
import { NotificationCenter } from "../admin/notifications/NotificationCenter";

export const AdminPanel = () => {
  const theme = useTheme();
  const { playSound } = useUIExperience();

  // Active Tab Index state
  const [activeTab, setActiveTab] = useState(0);

  // Active States
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pre-compiled Telemetry calculations
  const [stats, setStats] = useState({
    totalMerchants: 0,
    blockedMerchants: 0,
    proMerchants: 0
  });

  // 1. Fetch Real Users from Firestore Database
  const fetchMerchants = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, "users"));
      
      // Fetch live subcollection sizes asynchronously for every merchant
      const promises = querySnapshot.docs.map(async (userDoc) => {
        const userData = userDoc.data();
        const shopId = userData.currentShopId || `shop-${userData.uid || userDoc.id}`;
        
        let billsCount = 0;
        let inventoryCount = 0;
        
        try {
          // Fetch actual size of bills subcollection
          const billsSnap = await getDocs(collection(db, "shops", shopId, "bills"));
          billsCount = billsSnap.size;
        } catch (e) {
          console.warn(`No bills read permission or collection empty for shop ${shopId}:`, e);
        }

        try {
          // Fetch actual size of items subcollection
          const itemsSnap = await getDocs(collection(db, "shops", shopId, "items"));
          inventoryCount = itemsSnap.size;
        } catch (e) {
          console.warn(`No items read permission or collection empty for shop ${shopId}:`, e);
        }

        return {
          id: userDoc.id,
          ...userData,
          usage: {
            billsCount,
            inventoryCount,
            storageMb: parseFloat((inventoryCount * 0.15 + billsCount * 0.02 + 0.5).toFixed(2)),
            apiCalls: billsCount * 18 + inventoryCount * 8 + 120
          }
        };
      });

      const list = await Promise.all(promises);
      setMerchants(list);

      // Compute Live Telemetry metrics
      const total = list.length;
      const blocked = list.filter(m => m.isBlocked).length;
      const pro = list.filter(m => m.pricingTier === "pro_monthly" || m.role === "admin").length;
      
      setStats({
        totalMerchants: total,
        blockedMerchants: blocked,
        proMerchants: pro
      });

    } catch (error) {
      console.error("Failed to query merchant registry:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMerchants();
  }, []);

  // 2. Direct database update for modifying user roles/tiers or custom info
  const handleUpdateMerchant = async (id, updatedFields) => {
    try {
      const docRef = doc(db, "users", id);
      await updateDoc(docRef, updatedFields);
      
      // Instantly refresh and sync local view
      fetchMerchants();
    } catch (err) {
      console.error("Failed to save merchant changes:", err);
    }
  };

  // 3. Execute database write dynamically to block/unblock the account
  const handleBlockToggle = async (merchant) => {
    const nextBlockedState = !merchant.isBlocked;
    try {
      const docRef = doc(db, "users", merchant.id || merchant.uid);
      await updateDoc(docRef, {
        isBlocked: nextBlockedState
      });
      fetchMerchants(); // Refresh and re-sync
    } catch (error) {
      console.error("Failed to update access status:", error);
    }
  };

  const handleTabChange = (event, newValue) => {
    playSound?.("click");
    setActiveTab(newValue);
  };

  const tabsInfo = [
    { label: "Overview", icon: <DashboardRoundedIcon fontSize="small" /> },
    { label: "Merchants", icon: <PeopleAltRoundedIcon fontSize="small" /> },
    { label: "SaaS Usage", icon: <SpeedRoundedIcon fontSize="small" /> },
    { label: "Broadcasts", icon: <CampaignRoundedIcon fontSize="small" /> },
    { label: "Support Desk", icon: <ContactSupportRoundedIcon fontSize="small" /> },
    { label: "Cyber Security", icon: <ShieldRoundedIcon fontSize="small" /> },
  ];

  if (loading && merchants.length === 0) {
    return (
      <Box sx={{ minHeight: "80vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2 }}>
        <CircularProgress color="primary" />
        <Typography variant="body2" color="text.secondary">Booting SaaS operating HUD...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, minHeight: "100vh", color: "text.primary" }}>
      {/* Header Panel */}
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems="flex-start" sx={{ mb: 4 }} spacing={2}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <AdminPanelSettingsRoundedIcon sx={{ fontSize: 36, color: "primary.main" }} />
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.01em" }}>
              SaaS Control Center
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Central operational console for the Dokan Pro marketplace platform.
            </Typography>
          </Box>
        </Stack>
        <Button
          variant="outlined"
          startIcon={<RefreshRoundedIcon />}
          onClick={fetchMerchants}
          disabled={loading}
        >
          Sync Realtime
        </Button>
      </Stack>

      {/* Futuristic Tabs Selector */}
      <Box sx={{ borderBottom: `1px solid ${theme.palette.divider}`, mb: 4 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            "& .MuiTab-root": {
              fontWeight: 800,
              fontSize: "0.88rem",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              minHeight: 48,
              transition: "all 0.2s ease",
              "&:hover": {
                color: "primary.main",
              }
            }
          }}
        >
          {tabsInfo.map((tab, idx) => (
            <Tab key={idx} icon={tab.icon} iconPosition="start" label={tab.label} />
          ))}
        </Tabs>
      </Box>

      {/* Tab Panel View with Framer Motion Animation */}
      <Box>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            {activeTab === 0 && <AdminOverview stats={stats} />}
            {activeTab === 1 && (
              <UserManager
                merchants={merchants}
                onUpdateMerchant={handleUpdateMerchant}
                onBlockToggle={handleBlockToggle}
              />
            )}
            {activeTab === 2 && <SubscriptionControls stats={stats} merchants={merchants} />}
            {activeTab === 3 && <NotificationCenter />}
            {activeTab === 4 && <SupportDesk />}
            {activeTab === 5 && <SecurityCenter />}
          </motion.div>
        </AnimatePresence>
      </Box>
    </Box>
  );
};

export default AdminPanel;
