import { BrowserRouter as Router, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Box,
  CircularProgress,
  Container,
  CssBaseline,
  ThemeProvider,
  createTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Stack,
  Chip,
  alpha,
  useTheme
} from "@mui/material";
import AuthScreen from "./component/AuthScreen";
import Analysis from "./component/Analysis";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";
import Calculator from "./component/Calculator";
import Dashboard from "./component/Dashboard";
import DueLedger from "./component/DueLedger";
import ErrorBoundary from "./component/ErrorBoundary";
import Inventory from "./component/Inventory";
import Navbar from "./component/Navbar";
import ShopSettings from "./component/ShopSettings";
import SplashScreen from "./component/SplashScreen";
import UserGuide from "./component/UserGuide";
import FuturisticLoader from "./component/FuturisticLoader";
import AdminPanel from "./component/AdminPanel";
import AdminGuard from "./component/AdminGuard";
import { useAuth } from "./context/AuthContext";
import { useUIExperience, THEME_PRESETS } from "./context/UIExperienceContext";
import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";
import { db } from "./Firebase/firebase";
import CampaignRoundedIcon from "@mui/icons-material/CampaignRounded";

const AppRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 10, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        exit={{ opacity: 0, y: -8, filter: "blur(6px)" }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      >
        <Routes location={location}>
          <Route path="/" element={<Calculator />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dues" element={<DueLedger />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/sales" element={<Analysis />} />
          <Route path="/analytics" element={<AnalyticsDashboard />} />
          <Route path="/analysis" element={<Navigate to="/sales" replace />} />
          <Route path="/guide" element={<UserGuide />} />
          <Route path="/settings" element={<ShopSettings />} />
          <Route path="/admin" element={<AdminGuard><AdminPanel /></AdminGuard>} />
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
};

const CHANGELOG = {
  version: "2.3.0",
  title: "The Cybernetic HUD & Print Privacy Update",
  releaseDate: "May 26, 2026",
  features: [
    {
      title: "Collapsible Sidebar & Floating Toggle",
      desc: "Upgraded the top navigation into a collapsible left sidebar with automatic localStorage state caching and a floating border double-arrow that rotates 180 degrees.",
      icon: "🧭",
    },
    {
      title: "Futuristic Loading & Splash Screen HUDs",
      desc: "Replaced boring circular spinners with a premium cybernetic HUD console loading animation, dynamic percentage counters, cosmic shifting nebula orbs, and live boot sequence logs.",
      icon: "⚡",
    },
    {
      title: "Privacy-Aware Customer Prints",
      desc: "New receipts printed from the POS Billing Desk omit the customer's phone and address to protect privacy, while range duplicate prints from the Sales Dashboard display full customer details.",
      icon: "🖨️",
    },
    {
      title: "Frosted Glass Dialog Modals",
      desc: "Overrode global MUI properties to render every modal, editor popup, and receipt preview with organic rounded corners and rich backdrop-blur frosting overlays.",
      icon: "✨",
    },
  ]
};

const App = () => {
  const { authLoading, user } = useAuth();
  const { themeMode, themePreset, immersiveEnabled, playSound } = useUIExperience();
  const [showSplash, setShowSplash] = useState(true);
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  const currentPresetColors = useMemo(() => {
    return THEME_PRESETS[themePreset]?.colors[themeMode] || THEME_PRESETS.emerald.colors[themeMode];
  }, [themePreset, themeMode]);

  const theme = useMemo(() => {
    const isBmw = themePreset === "bmw";
    const borderRad = isBmw ? 0 : 8;
    const paperRad = isBmw ? 0 : 16;
    const cardRad = isBmw ? 0 : 16;
    const dialogRad = isBmw ? 0 : 20;

    const paperBorder = isBmw 
      ? "1px solid #3c3c3c"
      : (themeMode === "dark" ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(15,23,42,0.08)");

    const dialogBorder = isBmw
      ? "1px solid #3c3c3c"
      : (themeMode === "dark" ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(15,23,42,0.12)");

    const paperShadow = isBmw 
      ? "none" 
      : (themeMode === "dark" ? "0 20px 40px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255,255,255,0.05)" : "0 16px 36px rgba(15, 23, 42, 0.04), inset 0 1px 0 rgba(255,255,255,0.6)");

    const cardShadow = isBmw
      ? "none"
      : (themeMode === "dark" ? "0 12px 30px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255,255,255,0.04)" : "0 10px 24px rgba(15, 23, 42, 0.03), inset 0 1px 0 rgba(255,255,255,0.5)");

    const dialogShadow = isBmw
      ? "none"
      : (themeMode === "dark" ? "0 24px 60px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(255,255,255,0.06)" : "0 20px 48px rgba(15, 23, 42, 0.08), inset 0 1px 0 rgba(255,255,255,0.8)");

    const cardBackground = isBmw
      ? "#1a1a1a"
      : (themeMode === "dark" ? "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)" : "linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.4) 100%)");

    const dialogBackground = isBmw
      ? "#000000"
      : (themeMode === "dark" ? "linear-gradient(135deg, rgba(20,28,24,0.98) 0%, rgba(10,15,13,0.99) 100%)" : "linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(243,244,246,0.99) 100%)");

    return createTheme({
      palette: {
        mode: themeMode,
        primary: { main: currentPresetColors.primary },
        secondary: { main: currentPresetColors.secondary },
        success: { main: currentPresetColors.success },
        warning: { main: themeMode === "dark" ? "#fbbf24" : "#d97706" },
        error: { main: themeMode === "dark" ? "#f87171" : "#dc2626" },
        background: {
          default: currentPresetColors.background.default,
          paper: currentPresetColors.background.paper,
        },
        text: {
          primary: isBmw ? "#ffffff" : (themeMode === "dark" ? "#f1f5f9" : "#0f172a"),
          secondary: isBmw ? "#bbbbbb" : (themeMode === "dark" ? "#cbd5e1" : "#334155"),
        },
        divider: isBmw ? "#3c3c3c" : (themeMode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.10)"),
      },
      shape: { borderRadius: borderRad },
      typography: {
        fontFamily: isBmw ? `"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif` : `"Plus Jakarta Sans", "Segoe UI", "Inter", sans-serif`,
        h4: { fontWeight: 700, letterSpacing: isBmw ? "-0.5px" : "-0.03em", textTransform: isBmw ? "uppercase" : "none" },
        h5: { fontWeight: 700, textTransform: isBmw ? "uppercase" : "none", letterSpacing: isBmw ? "0.5px" : "normal" },
        h6: { fontWeight: 700, textTransform: isBmw ? "uppercase" : "none", letterSpacing: isBmw ? "0.5px" : "normal" },
        button: { textTransform: isBmw ? "uppercase" : "none", fontWeight: 700, letterSpacing: isBmw ? "1.5px" : "normal" },
      },
      components: {
        MuiPaper: {
          styleOverrides: {
            root: {
              backgroundImage: "none",
              backdropFilter: isBmw ? "none" : "blur(18px)",
              borderRadius: paperRad,
              border: paperBorder,
              boxShadow: paperShadow,
              transition: "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease, border-color 0.3s ease",
            },
          },
        },
        MuiCard: {
          styleOverrides: {
            root: {
              borderRadius: cardRad,
              backgroundImage: "none",
              background: cardBackground,
              border: paperBorder,
              boxShadow: cardShadow,
              transition: "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease, border-color 0.3s ease",
              "&:hover": {
                transform: isBmw ? "none" : "translateY(-6px)",
                boxShadow: isBmw ? "none" : (themeMode === "dark"
                  ? `0 24px 48px rgba(0, 0, 0, 0.45), 0 0 20px ${currentPresetColors.primary}26`
                  : `0 20px 40px rgba(15, 23, 42, 0.08), 0 0 16px ${currentPresetColors.primary}1f`),
                borderColor: isBmw ? "#ffffff" : (themeMode === "dark" 
                  ? `rgba(255,255,255, 0.15)`
                  : `rgba(15,23,42, 0.15)`),
              },
            },
          },
        },
        MuiDialog: {
          styleOverrides: {
            paper: {
              borderRadius: dialogRad,
              backgroundImage: "none",
              background: dialogBackground,
              border: dialogBorder,
              boxShadow: dialogShadow,
              backdropFilter: isBmw ? "none" : "blur(24px)",
            },
          },
        },
        MuiBackdrop: {
          styleOverrides: {
            root: {
              backgroundColor: isBmw ? "rgba(0,0,0,0.85)" : (themeMode === "dark" ? "rgba(4,6,5,0.65)" : "rgba(15,23,42,0.35)"),
              backdropFilter: isBmw ? "none" : "blur(8px)",
            },
          },
        },
        MuiButton: {
          defaultProps: { disableElevation: true },
          styleOverrides: {
            root: {
              borderRadius: borderRad,
              minHeight: 40,
              transition: "all .2s ease",
              "&.Mui-disabled": {
                opacity: themeMode === "dark" ? 0.52 : 0.42,
                color: themeMode === "dark" ? "#cbd5e1" : undefined,
              },
            },
            containedPrimary: {
              background: isBmw ? "#000000" : `linear-gradient(120deg, ${currentPresetColors.primary} 0%, ${currentPresetColors.success} 100%)`,
              color: "#ffffff",
              border: isBmw ? "1px solid #ffffff" : "none",
              boxShadow: isBmw ? "none" : (themeMode === "dark"
                ? `0 8px 22px ${currentPresetColors.primary}3b`
                : `0 8px 20px ${currentPresetColors.primary}28`),
              "&:hover": {
                background: isBmw ? "#ffffff" : undefined,
                color: isBmw ? "#000000" : undefined,
                boxShadow: isBmw ? "none" : (themeMode === "dark"
                  ? `0 10px 26px ${currentPresetColors.primary}4f`
                  : `0 10px 24px ${currentPresetColors.primary}3d`),
              },
            },
          },
        },
        MuiOutlinedInput: {
          styleOverrides: {
            root: {
              borderRadius: borderRad,
              backgroundColor: isBmw ? "#1a1a1a !important" : (themeMode === "dark" ? "rgba(10,15,13,0.5) !important" : "rgba(255,255,255,0.85)"),
              backdropFilter: isBmw ? "none" : "blur(4px)",
              color: "#ffffff",
              border: isBmw ? "1px solid #3c3c3c" : undefined,
              "& .MuiOutlinedInput-input": {
                color: "#ffffff",
                WebkitTextFillColor: "#ffffff",
                },
                "& .MuiSelect-select": {
                  color: themeMode === "dark" ? "#ffffff" : "#0f172a",
                },
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: themeMode === "dark" ? "rgba(255,255,255,0.12)" : "rgba(15,23,42,0.14)",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: themeMode === "dark" 
                    ? `${currentPresetColors.primary}8c`
                    : `${currentPresetColors.primary}73`,
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: currentPresetColors.primary,
                  boxShadow: themeMode === "dark" 
                    ? `0 0 0 3px ${currentPresetColors.primary}38` 
                    : `0 0 0 3px ${currentPresetColors.primary}22`,
                },
                "& input:-webkit-autofill": {
                  WebkitBoxShadow: themeMode === "dark"
                    ? "0 0 0 100px rgba(10,15,13,0.95) inset"
                    : "0 0 0 100px #ffffff inset",
                  WebkitTextFillColor: themeMode === "dark" ? "#ffffff" : "#0f172a",
                  transition: "background-color 9999s ease-out 0s",
                  caretColor: themeMode === "dark" ? "#ffffff" : "#0f172a",
                },
              },
            },
          },
          MuiInputLabel: {
            styleOverrides: {
              root: {
                color: themeMode === "dark" ? "#cbd5e1" : undefined,
                "&.MuiInputLabel-shrink": {
                  color: themeMode === "dark" ? "#e2e8f0" : undefined,
                },
                "&.Mui-focused": {
                  color: currentPresetColors.secondary,
                },
              },
            },
          },
          MuiInputBase: {
            defaultProps: {
              inputProps: {
                onWheel: (event) => {
                  const target = event.target;
                  if (target?.type === "number") {
                    target.blur();
                  }
                },
                onKeyDown: (event) => {
                  const target = event.target;
                  if (target?.type === "number" && (event.key === "ArrowUp" || event.key === "ArrowDown")) {
                    event.preventDefault();
                  }
                },
              },
            },
            styleOverrides: {
              input: {
                "::placeholder": {
                  color: themeMode === "dark" ? "#cbd5e1" : "#64748b",
                  opacity: 1,
                },
                '&[type="number"]': {
                  MozAppearance: "textfield",
                },
                '&[type="number"]::-webkit-outer-spin-button': {
                  WebkitAppearance: "none",
                  margin: 0,
                },
                '&[type="number"]::-webkit-inner-spin-button': {
                  WebkitAppearance: "none",
                  margin: 0,
                },
              },
            },
          },
          MuiMenuItem: {
            styleOverrides: {
              root: {
                color: themeMode === "dark" ? "#e2e8f0" : "#0f172a",
                "&.Mui-selected": { 
                  backgroundColor: `${currentPresetColors.primary}29` 
                },
                "&:hover": { 
                  backgroundColor: `${currentPresetColors.primary}1e` 
                },
              },
            },
          },
        },
      });
    }, [themeMode, currentPresetColors, themePreset]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setShowSplash(false);
      if (immersiveEnabled) playSound("startup");
    }, immersiveEnabled ? 1700 : 900);
    return () => window.clearTimeout(timer);
  }, [immersiveEnabled, playSound]);

  useEffect(() => {
    if (!showSplash && user) {
      const lastVersion = localStorage.getItem("dokan-app-version");
      if (lastVersion !== CHANGELOG.version) {
        setShowUpdateModal(true);
      }
    }
  }, [showSplash, user]);

  const handleCloseUpdateModal = () => {
    localStorage.setItem("dokan-app-version", CHANGELOG.version);
    setShowUpdateModal(false);
    playSound?.("click");
  };

  if (showSplash && immersiveEnabled) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SplashScreen />
      </ThemeProvider>
    );
  }

  if (authLoading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <FuturisticLoader />
      </ThemeProvider>
    );
  }

  const appBackground =
    themeMode === "dark"
      ? `radial-gradient(circle at 20% 12%, ${currentPresetColors.radial}, transparent 42%), radial-gradient(circle at 82% 24%, ${currentPresetColors.radialSecondary}, transparent 48%), ${currentPresetColors.linear}`
      : `radial-gradient(circle at 20% 14%, ${currentPresetColors.radial}, transparent 40%), radial-gradient(circle at 82% 22%, ${currentPresetColors.radialSecondary}, transparent 46%), ${currentPresetColors.linear}`;

  if (!user) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ minHeight: "100vh", background: appBackground }}>
          <AuthScreen />
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ErrorBoundary>
        <Router>
          <Box
            sx={{
              minHeight: "100vh",
              background: appBackground,
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
            }}
          >
            <Navbar />
            <Box
              component="main"
              sx={{
                flexGrow: 1,
                minWidth: 0,
                py: { xs: 2.5, md: 4.5 },
                px: { xs: 2.5, md: 4.5 },
                mb: { xs: 8, md: 0 },
              }}
            >
              <AppRoutes />
            </Box>
          </Box>

          {/* Frosted Glass "What's New" Release Notes Update Dialog */}
          <Dialog
            open={showUpdateModal}
            onClose={handleCloseUpdateModal}
            maxWidth="sm"
            fullWidth
            PaperProps={{
              sx: {
                borderRadius: 4,
                p: 1.5,
                bgcolor: themeMode === "dark" 
                  ? "rgba(10, 18, 14, 0.95)" 
                  : "rgba(255, 255, 255, 0.95)",
                border: themeMode === "dark" 
                  ? `1px solid ${alpha(currentPresetColors.primary, 0.25)}` 
                  : `1px solid ${alpha(currentPresetColors.primary, 0.18)}`,
                boxShadow: themeMode === "dark"
                  ? `0 24px 60px rgba(0, 0, 0, 0.7), 0 0 32px ${currentPresetColors.primary}26`
                  : `0 20px 48px rgba(15, 23, 42, 0.1), 0 0 20px ${currentPresetColors.primary}15`,
              }
            }}
          >
            <DialogTitle sx={{ pb: 1, pt: 3 }}>
              <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="space-between">
                <Stack spacing={0.5}>
                  <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: "-0.02em" }}>
                    What's New
                  </Typography>
                  <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700 }}>
                    {CHANGELOG.title}
                  </Typography>
                </Stack>
                <Chip
                  label={`v${CHANGELOG.version}`}
                  color="primary"
                  size="small"
                  sx={{
                    fontWeight: 900,
                    px: 1,
                    background: `linear-gradient(120deg, ${currentPresetColors.primary} 0%, ${currentPresetColors.success} 100%)`,
                    color: "white"
                  }}
                />
              </Stack>
            </DialogTitle>

            <DialogContent sx={{ py: 2 }}>
              <Stack spacing={2.5} sx={{ mt: 1 }}>
                {CHANGELOG.features.map((feature, idx) => (
                  <Stack 
                    key={idx} 
                    direction="row" 
                    spacing={2} 
                    alignItems="flex-start"
                    sx={{
                      p: 2,
                      borderRadius: 3,
                      bgcolor: themeMode === "dark" ? "rgba(255,255,255,0.02)" : "rgba(15,23,42,0.02)",
                      border: themeMode === "dark" ? "1px solid rgba(255,255,255,0.03)" : "1px solid rgba(15,23,42,0.03)",
                      transition: "all 0.2s",
                      "&:hover": {
                        transform: "translateX(4px)",
                        bgcolor: themeMode === "dark" ? "rgba(255,255,255,0.04)" : "rgba(15,23,42,0.04)",
                        borderColor: alpha(currentPresetColors.primary, 0.25)
                      }
                    }}
                  >
                    <Box 
                      sx={{ 
                        fontSize: "1.8rem", 
                        lineHeight: 1,
                        p: 1.25,
                        borderRadius: 2,
                        bgcolor: themeMode === "dark" ? "rgba(255,255,255,0.04)" : "rgba(15,23,42,0.04)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                    >
                      {feature.icon}
                    </Box>
                    <Stack spacing={0.5} sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "text.primary" }}>
                        {feature.title}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "text.secondary", lineHeight: 1.5, fontWeight: 500 }}>
                        {feature.desc}
                      </Typography>
                    </Stack>
                  </Stack>
                ))}
              </Stack>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 3, pt: 1 }}>
              <Button
                variant="contained"
                onClick={handleCloseUpdateModal}
                fullWidth
                sx={{
                  py: 1.5,
                  borderRadius: 2.5,
                  fontWeight: 900,
                  fontSize: "0.95rem",
                  background: `linear-gradient(120deg, ${currentPresetColors.primary} 0%, ${currentPresetColors.success} 100%)`,
                  boxShadow: `0 8px 22px ${currentPresetColors.primary}3b`,
                  "&:hover": {
                    boxShadow: `0 10px 26px ${currentPresetColors.primary}4f`,
                  }
                }}
              >
                Acknowledge & Continue
              </Button>
            </DialogActions>
          </Dialog>
          {/* Real-time System Broadcast Overlay for All Logged-In Merchants */}
          <LiveBroadcastHUD />
        </Router>
      </ErrorBoundary>
    </ThemeProvider>
  );
};

const LiveBroadcastHUD = () => {
  const { user } = useAuth();
  const { themeMode } = useUIExperience();
  const theme = useTheme();
  const [activeAlert, setActiveAlert] = useState(null);

  const getStorageKey = () => {
    return user ? `seen-broadcasts-${user.uid}` : "seen-broadcasts-anonymous";
  };

  useEffect(() => {
    if (!user) return;

    // Listen to the latest 5 system announcements
    const q = query(
      collection(db, "notifications"),
      orderBy("createdAt", "desc"),
      limit(5)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });

      if (list.length === 0) return;

      // Find the first notification that hasn't been acknowledged/seen by this specific user
      const seenIds = JSON.parse(localStorage.getItem(getStorageKey()) || "[]");
      const unseen = list.find((not) => !seenIds.includes(not.id));

      if (unseen) {
        setActiveAlert(unseen);
      } else {
        setActiveAlert(null);
      }
    });

    return unsubscribe;
  }, [user]);

  const handleAcknowledge = () => {
    if (!activeAlert || !user) return;
    const key = getStorageKey();
    const seenIds = JSON.parse(localStorage.getItem(key) || "[]");
    seenIds.push(activeAlert.id);
    localStorage.setItem(key, JSON.stringify(seenIds));
    setActiveAlert(null);
  };

  if (!activeAlert) return null;

  const getSeverityGlow = (severity) => {
    switch (severity) {
      case "high":
        return `0 8px 32px ${alpha(theme.palette.error.main, 0.45)}, inset 0 1px 0 rgba(255,255,255,0.1)`;
      case "medium":
        return `0 8px 32px ${alpha(theme.palette.warning.main, 0.35)}, inset 0 1px 0 rgba(255,255,255,0.1)`;
      default:
        return `0 8px 32px ${alpha(theme.palette.primary.main, 0.35)}, inset 0 1px 0 rgba(255,255,255,0.1)`;
    }
  };

  const getBorderColor = (severity) => {
    switch (severity) {
      case "high": return theme.palette.error.main;
      case "medium": return theme.palette.warning.main;
      default: return theme.palette.primary.main;
    }
  };

  return (
    <AnimatePresence>
      {activeAlert && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: 20, scale: 0.95, filter: "blur(4px)" }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            zIndex: 9999,
            width: "360px",
            maxWidth: "calc(100vw - 48px)",
          }}
        >
          <Box
            sx={{
              p: 2.5,
              borderRadius: 3,
              backdropFilter: "blur(24px)",
              bgcolor: themeMode === "dark" ? "rgba(10,18,14,0.96)" : "rgba(255,255,255,0.96)",
              border: `1.5px solid ${getBorderColor(activeAlert.severity)}`,
              boxShadow: getSeverityGlow(activeAlert.severity),
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Saffron, White, Green Patriot indicator strip for Indian Dukandars */}
            <Stack direction="row" sx={{ position: "absolute", top: 0, left: 0, right: 0, height: 3.5 }}>
              <Box sx={{ flexGrow: 1, bgcolor: "#FF9933" }} />
              <Box sx={{ flexGrow: 1, bgcolor: "#FFFFFF" }} />
              <Box sx={{ flexGrow: 1, bgcolor: "#138808" }} />
            </Stack>

            <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ mt: 0.5 }}>
              <motion.div
                animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
                transition={{ repeat: Infinity, duration: 2.5, repeatDelay: 1 }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  backgroundColor: alpha(getBorderColor(activeAlert.severity), 0.1),
                  flexShrink: 0,
                }}
              >
                <CampaignRoundedIcon sx={{ color: getBorderColor(activeAlert.severity) }} />
              </motion.div>

              <Stack spacing={0.5} sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 900, color: "text.primary" }} noWrap>
                  {activeAlert.title}
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary", lineHeight: 1.4, display: "block" }}>
                  {activeAlert.message}
                </Typography>
                <Box sx={{ mt: 1.5, display: "flex", justifyContent: "flex-end" }}>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={handleAcknowledge}
                    sx={{
                      fontSize: "0.75rem",
                      fontWeight: 800,
                      px: 2,
                      py: 0.5,
                      borderRadius: 1.5,
                      background: `linear-gradient(120deg, ${getBorderColor(activeAlert.severity)} 0%, ${theme.palette.success.main} 100%)`,
                      color: "white",
                    }}
                  >
                    Got it, close
                  </Button>
                </Box>
              </Stack>
            </Stack>
          </Box>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default App;

