import { BrowserRouter as Router, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Box, CircularProgress, Container, CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import AuthScreen from "./component/AuthScreen";
import Analysis from "./component/Analysis";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";
import Calculator from "./component/Calculator";
import Dashboard from "./component/Dashboard";
import ErrorBoundary from "./component/ErrorBoundary";
import Inventory from "./component/Inventory";
import Navbar from "./component/Navbar";
import ShopSettings from "./component/ShopSettings";
import SplashScreen from "./component/SplashScreen";
import UserGuide from "./component/UserGuide";
import { useAuth } from "./context/AuthContext";
import { useUIExperience } from "./context/UIExperienceContext";

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
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/sales" element={<Analysis />} />
          <Route path="/analytics" element={<AnalyticsDashboard />} />
          <Route path="/analysis" element={<Navigate to="/sales" replace />} />
          <Route path="/guide" element={<UserGuide />} />
          <Route path="/settings" element={<ShopSettings />} />
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
};

const App = () => {
  const { authLoading, user } = useAuth();
  const { themeMode, immersiveEnabled, playSound } = useUIExperience();
  const [showSplash, setShowSplash] = useState(true);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: themeMode,
          primary: { main: themeMode === "dark" ? "#4ade80" : "#15803d" },
          secondary: { main: themeMode === "dark" ? "#86efac" : "#166534" },
          success: { main: themeMode === "dark" ? "#22c55e" : "#16a34a" },
          warning: { main: themeMode === "dark" ? "#fbbf24" : "#d97706" },
          error: { main: themeMode === "dark" ? "#f87171" : "#dc2626" },
          background: {
            default: themeMode === "dark" ? "#0a0f0d" : "#f6f8f7",
            paper: themeMode === "dark" ? "#121a17" : "#ffffff",
          },
          text: {
            primary: themeMode === "dark" ? "#f1f5f9" : "#0f172a",
            secondary: themeMode === "dark" ? "#94a3b8" : "#475569",
          },
          divider: themeMode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.10)",
        },
        shape: { borderRadius: 8 },
        typography: {
          fontFamily: `"Plus Jakarta Sans", "Segoe UI", "Inter", sans-serif`,
          h4: { fontWeight: 700, letterSpacing: "-0.03em" },
          h5: { fontWeight: 700 },
          h6: { fontWeight: 700 },
          button: { textTransform: "none", fontWeight: 700 },
        },
        components: {
          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundImage: "none",
                backdropFilter: "blur(14px)",
                border: themeMode === "dark" ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(148,163,184,0.14)",
                boxShadow: themeMode === "dark" ? "0 24px 64px rgba(0, 0, 0, 0.45)" : "0 20px 54px rgba(15, 23, 42, 0.08)",
              },
            },
          },
          MuiCard: { styleOverrides: { root: { borderRadius: 8 } } },
          MuiButton: {
            defaultProps: { disableElevation: true },
            styleOverrides: {
              root: {
                borderRadius: 8,
                minHeight: 40,
                transition: "all .2s ease",
                "&.Mui-disabled": {
                  opacity: themeMode === "dark" ? 0.52 : 0.42,
                  color: themeMode === "dark" ? "#94a3b8" : undefined,
                },
              },
              containedPrimary: {
                background:
                  themeMode === "dark"
                    ? "linear-gradient(120deg, #22c55e 0%, #16a34a 100%)"
                    : "linear-gradient(120deg, #16a34a 0%, #15803d 100%)",
                color: "#ffffff",
                boxShadow:
                  themeMode === "dark"
                    ? "0 8px 22px rgba(34,197,94,0.35)"
                    : "0 8px 20px rgba(22,163,74,0.28)",
                "&:hover": {
                  boxShadow:
                    themeMode === "dark"
                      ? "0 10px 26px rgba(34,197,94,0.45)"
                      : "0 10px 24px rgba(22,163,74,0.36)",
                },
              },
            },
          },
          MuiOutlinedInput: {
            styleOverrides: {
              root: {
                borderRadius: 8,
                backgroundColor: themeMode === "dark" ? "rgba(18,26,22,0.95) !important" : "#ffffff",
                color: themeMode === "dark" ? "#ffffff" : "#0f172a",
                "& .MuiOutlinedInput-input": {
                  color: themeMode === "dark" ? "#ffffff" : "#0f172a",
                  WebkitTextFillColor: themeMode === "dark" ? "#ffffff" : "#0f172a",
                },
                "& .MuiSelect-select": {
                  color: themeMode === "dark" ? "#ffffff" : "#0f172a",
                },
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: themeMode === "dark" ? "rgba(255,255,255,0.18)" : "rgba(15,23,42,0.2)",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: themeMode === "dark" ? "rgba(74,222,128,0.55)" : "rgba(22,163,74,0.45)",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: themeMode === "dark" ? "#4ade80" : "#16a34a",
                  boxShadow: themeMode === "dark" ? "0 0 0 3px rgba(74,222,128,0.22)" : "0 0 0 3px rgba(22,163,74,0.14)",
                },
                "& input:-webkit-autofill": {
                  WebkitBoxShadow: themeMode === "dark"
                    ? "0 0 0 100px rgba(18,26,22,0.95) inset"
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
                  color: themeMode === "dark" ? "#86efac" : undefined,
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
                  color: themeMode === "dark" ? "#94a3b8" : "#64748b",
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
              root: themeMode === "dark" ? {
                color: "#e2e8f0",
                "&.Mui-selected": { backgroundColor: "rgba(74,222,128,0.16)" },
                "&:hover": { backgroundColor: "rgba(74,222,128,0.12)" },
              } : undefined,
            },
          },
        },
      }),
    [themeMode]
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setShowSplash(false);
      if (immersiveEnabled) playSound("startup");
    }, immersiveEnabled ? 1700 : 900);
    return () => window.clearTimeout(timer);
  }, [immersiveEnabled, playSound]);

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
        <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
          <CircularProgress />
        </Box>
      </ThemeProvider>
    );
  }

  const appBackground =
    themeMode === "dark"
      ? "radial-gradient(circle at 20% 12%, rgba(34,197,94,0.14), transparent 42%), radial-gradient(circle at 82% 24%, rgba(22,163,74,0.10), transparent 48%), linear-gradient(180deg,#0a0f0d 0%, #0d1411 52%, #0a0f0d 100%)"
      : "radial-gradient(circle at 20% 14%, rgba(34,197,94,0.10), transparent 40%), radial-gradient(circle at 82% 22%, rgba(22,163,74,0.08), transparent 46%), linear-gradient(180deg,#f8faf9 0%, #f0f5f2 48%, #ecf2ee 100%)";

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
          <Box sx={{ minHeight: "100vh", background: appBackground }}>
            <Navbar />
            <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }}>
              <AppRoutes />
            </Container>
          </Box>
        </Router>
      </ErrorBoundary>
    </ThemeProvider>
  );
};

export default App;

