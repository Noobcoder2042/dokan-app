import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Box,
  CircularProgress,
  Container,
  CssBaseline,
  ThemeProvider,
  createTheme,
} from "@mui/material";
import AuthScreen from "./component/AuthScreen";
import Analysis from "./component/Analysis";
import Calculator from "./component/Calculator";
import Dashboard from "./component/Dashboard";
import ErrorBoundary from "./component/ErrorBoundary";
import Inventory from "./component/Inventory";
import Navbar from "./component/Navbar";
import ShopSettings from "./component/ShopSettings";
import SplashScreen from "./component/SplashScreen";
import UserGuide from "./component/UserGuide";
import { useAuth } from "./context/AuthContext";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1d4ed8",
    },
    secondary: {
      main: "#0f766e",
    },
    background: {
      default: "#f4f7fb",
      paper: "#ffffff",
    },
    text: {
      primary: "#0f172a",
      secondary: "#475569",
    },
  },
  shape: {
    borderRadius: 2,
  },
  typography: {
    fontFamily: `"Segoe UI", "Inter", "Arial", sans-serif`,
    h3: {
      fontWeight: 700,
      letterSpacing: "-0.04em",
    },
    h4: {
      fontWeight: 700,
      letterSpacing: "-0.03em",
    },
    h5: {
      fontWeight: 700,
    },
    h6: {
      fontWeight: 700,
    },
    button: {
      textTransform: "none",
      fontWeight: 600,
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          boxShadow: "0 18px 40px rgba(15, 23, 42, 0.08)",
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 10,
          paddingInline: 18,
          minHeight: 42,
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          backgroundColor: "#ffffff",
        },
      },
    },
    MuiInputBase: {
      defaultProps: {
        inputProps: {
          onWheel: (e) => e.target.blur(),
          onKeyDown: (e) => {
            if (e.key === "ArrowUp" || e.key === "ArrowDown") {
              e.preventDefault();
            }
          },
        },
      },
      styleOverrides: {
        input: {
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
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 14,
        },
      },
    },
  },
});

const App = () => {
  const { authLoading, user } = useAuth();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setShowSplash(false), 1200);
    return () => window.clearTimeout(timer);
  }, []);

  if (showSplash) {
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

  if (!user) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box
          sx={{
            minHeight: "100vh",
            background:
              "radial-gradient(circle at top left, rgba(29, 78, 216, 0.12), transparent 32%), linear-gradient(180deg, #f8fbff 0%, #f4f7fb 38%, #eef3f8 100%)",
          }}
        >
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
              background:
                "radial-gradient(circle at top left, rgba(29, 78, 216, 0.12), transparent 32%), linear-gradient(180deg, #f8fbff 0%, #f4f7fb 38%, #eef3f8 100%)",
            }}
          >
            <Navbar />
            <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }}>
              <Routes>
                <Route path="/" element={<Calculator />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/inventory" element={<Inventory />} />
                <Route path="/analysis" element={<Analysis />} />
                <Route path="/guide" element={<UserGuide />} />
                <Route path="/settings" element={<ShopSettings />} />
                <Route path="*" element={<Dashboard />} />
              </Routes>
            </Container>
          </Box>
        </Router>
      </ErrorBoundary>
    </ThemeProvider>
  );
};

export default App;
