import {
  AppBar,
  Box,
  Button,
  Chip,
  IconButton,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
  useTheme,
  alpha,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  Grid,
  Paper,
  BottomNavigation,
  BottomNavigationAction,
} from "@mui/material";
import { useEffect, useState } from "react";
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import WorkspacePremiumRoundedIcon from "@mui/icons-material/WorkspacePremiumRounded";
import ReceiptRoundedIcon from "@mui/icons-material/ReceiptRounded";
import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";
import GridViewRoundedIcon from "@mui/icons-material/GridViewRounded";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import QueryStatsRoundedIcon from "@mui/icons-material/QueryStatsRounded";
import SettingsSuggestRoundedIcon from "@mui/icons-material/SettingsSuggestRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import DarkModeRoundedIcon from "@mui/icons-material/DarkModeRounded";
import LightModeRoundedIcon from "@mui/icons-material/LightModeRounded";
import VolumeUpRoundedIcon from "@mui/icons-material/VolumeUpRounded";
import VolumeOffRoundedIcon from "@mui/icons-material/VolumeOffRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import KeyboardDoubleArrowLeftRoundedIcon from "@mui/icons-material/KeyboardDoubleArrowLeftRounded";
import KeyboardDoubleArrowRightRoundedIcon from "@mui/icons-material/KeyboardDoubleArrowRightRounded";
import AdminPanelSettingsRoundedIcon from "@mui/icons-material/AdminPanelSettingsRounded";
import { Link, useLocation } from "react-router-dom";
import { useShop } from "../context/ShopContext";
import { useAuth } from "../context/AuthContext";
import { useUIExperience } from "../context/UIExperienceContext";

const navItems = [
  { label: "Billing", to: "/", icon: <ReceiptRoundedIcon fontSize="small" /> },
  { label: "Dashboard", to: "/dashboard", icon: <GridViewRoundedIcon fontSize="small" /> },
  { label: "Dues", to: "/dues", icon: <AccountBalanceWalletRoundedIcon fontSize="small" /> },
  { label: "Inventory", to: "/inventory", icon: <Inventory2RoundedIcon fontSize="small" /> },
  { label: "Sales", to: "/sales", icon: <TrendingUpRoundedIcon fontSize="small" /> },
  { label: "Analytics", to: "/analytics", icon: <QueryStatsRoundedIcon fontSize="small" /> },
  { label: "Settings", to: "/settings", icon: <SettingsSuggestRoundedIcon fontSize="small" /> },
  { label: "Guide", to: "/guide", icon: <AutoAwesomeRoundedIcon fontSize="small" /> },
];

const Navbar = () => {
  const location = useLocation();
  const { shop } = useShop();
  const { logoutUser, profile } = useAuth();
  const [pricingOpen, setPricingOpen] = useState(false);
  const [annualBilling, setAnnualBilling] = useState(true);
  
  const bottomNavValue = () => {
    if (location.pathname === "/") return 0;
    if (location.pathname === "/dashboard") return 1;
    if (location.pathname === "/dues") return 2;
    if (location.pathname === "/inventory") return 3;
    return 4;
  };

  const handleBottomNavChange = (event, newValue) => {
    if (newValue === 4) {
      setMobileOpen(true);
    }
  };

  const activeNavItems = [
    ...navItems,
    ...(profile?.role === "admin"
      ? [
          {
            label: "Admin Console",
            to: "/admin",
            icon: <AdminPanelSettingsRoundedIcon fontSize="small" />,
          },
        ]
      : []),
  ];
  const { themeMode, toggleThemeMode, soundEnabled, setSound, playSound } = useUIExperience();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();

  const statusPulseGreen = {
    "@keyframes statusPulseGreenKey": {
      "0%": {
        transform: "scale(0.92)",
        boxShadow: `0 0 0 0 ${alpha(theme.palette.success.main, 0.7)}`,
      },
      "70%": {
        transform: "scale(1.05)",
        boxShadow: `0 0 0 6px ${alpha(theme.palette.success.main, 0)}`,
      },
      "100%": {
        transform: "scale(0.92)",
        boxShadow: `0 0 0 0 ${alpha(theme.palette.success.main, 0)}`,
      },
    },
    animation: "statusPulseGreenKey 2s infinite ease-in-out",
  };

  const statusPulseWarning = {
    "@keyframes statusPulseWarningKey": {
      "0%": {
        transform: "scale(0.92)",
        boxShadow: `0 0 0 0 ${alpha(theme.palette.warning.main, 0.7)}`,
      },
      "70%": {
        transform: "scale(1.05)",
        boxShadow: `0 0 0 6px ${alpha(theme.palette.warning.main, 0)}`,
      },
      "100%": {
        transform: "scale(0.92)",
        boxShadow: `0 0 0 0 ${alpha(theme.palette.warning.main, 0)}`,
      },
    },
    animation: "statusPulseWarningKey 2s infinite ease-in-out",
  };

  const pulseAnimation = isOnline ? statusPulseGreen : statusPulseWarning;

  // Desktop collapsed preference persistence
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem("dokan-sidebar-collapsed") === "true";
  });

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("dokan-sidebar-collapsed", String(next));
      return next;
    });
    playSound?.("click");
  };

  // Render Sidebar Content (handles collapsed desktop vs expanded drawer views)
  const renderSidebarContent = (isDrawer = false) => {
    const collapsed = isDrawer ? false : isCollapsed;

    return (
      <Stack sx={{ height: "100%", py: 3, px: collapsed ? 1.5 : 2, justifyContent: "space-between" }}>
        <Stack spacing={3}>
          {/* Logo and Shop Header - Perfectly Centered when collapsed */}
          <Stack
            direction="row"
            justifyContent="center"
            alignItems="center"
            sx={{ px: collapsed ? 0 : 1, py: 0.5 }}
          >
            {!collapsed ? (
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ width: "100%", minWidth: 0 }}>
                <Box
                  sx={{
                    width: 42,
                    height: 42,
                    borderRadius: 1.5,
                    p: 0.5,
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: theme.palette.background.paper,
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.22)}`,
                    boxShadow: `0 0 16px ${alpha(theme.palette.primary.main, themeMode === "dark" ? 0.22 : 0.18)}`,
                  }}
                >
                  <Box
                    component="img"
                    src="/branding/dokan pro logo sm.png"
                    alt="Dokan Pro logo"
                    sx={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
                  />
                </Box>
                <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                  <Typography variant="subtitle1" fontWeight={800} noWrap sx={{ color: "text.primary" }}>
                    {shop.name || "Dokan Pro"}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap sx={{ display: "block" }}>
                    Smart Billing Pro
                  </Typography>
                </Box>
              </Stack>
            ) : (
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 1.5,
                  p: 0.5,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: theme.palette.background.paper,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.22)}`,
                  boxShadow: `0 0 16px ${alpha(theme.palette.primary.main, themeMode === "dark" ? 0.22 : 0.18)}`,
                }}
              >
                <Box
                  component="img"
                  src="/branding/dokan pro logo sm.png"
                  alt="Dokan Pro logo"
                  sx={{ width: "100%", height: "100%", objectFit: "contain" }}
                />
              </Box>
            )}
          </Stack>

          <Divider sx={{ opacity: 0.5 }} />

          {/* Navigation Items List */}
          <List sx={{ p: 0 }} component="nav">
            <Stack spacing={0.75}>
              {activeNavItems.map((item) => {
                const isActive = location.pathname === item.to;
                const buttonContent = (
                  <ListItemButton
                    component={Link}
                    to={item.to}
                    onMouseEnter={() => playSound("hover")}
                    onClick={() => {
                      playSound("click");
                      setMobileOpen(false);
                    }}
                    sx={{
                      borderRadius: 2,
                      py: 1.25,
                      px: collapsed ? 0 : 2,
                      justifyContent: collapsed ? "center" : "flex-start",
                      color: isActive ? "white" : "text.primary",
                      background: isActive
                        ? `linear-gradient(120deg, ${theme.palette.primary.main} 0%, ${theme.palette.success.main} 100%)`
                        : "transparent",
                      boxShadow: isActive
                        ? `0 0 0 1px rgba(255,255,255,0.15), 0 8px 20px ${alpha(theme.palette.primary.main, 0.35)}`
                        : "none",
                      "&:hover": {
                        backgroundColor: isActive ? undefined : alpha(theme.palette.primary.main, 0.08),
                      },
                      transition: "all 0.25s ease",
                    }}
                  >
                    <ListItemIcon sx={{ color: "inherit", minWidth: collapsed ? 0 : 36, justifyContent: "center" }}>
                      {item.icon}
                    </ListItemIcon>
                    {!collapsed && (
                      <ListItemText
                        primary={item.label}
                        primaryTypographyProps={{ fontSize: "0.95rem", fontWeight: 700 }}
                      />
                    )}
                  </ListItemButton>
                );

                return collapsed ? (
                  <Tooltip key={item.to} title={item.label} placement="right" arrow>
                    <Box>{buttonContent}</Box>
                  </Tooltip>
                ) : (
                  <Box key={item.to}>{buttonContent}</Box>
                );
              })}

              <Divider sx={{ opacity: 0.3, my: 0.5 }} />
            </Stack>
          </List>
        </Stack>

        {/* Sidebar Footer / Controls */}
        <Stack spacing={2} sx={{ px: collapsed ? 0 : 1 }}>
          <Divider sx={{ opacity: 0.5 }} />

          {/* Sync Status Indicator - Mathematically Centered */}
          {collapsed ? (
            <Tooltip title={isOnline ? "Live Sync Active" : "Offline Mode"} placement="right" arrow>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  width: "100%",
                  py: 0.75,
                }}
              >
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: isOnline ? alpha(theme.palette.success.main, 0.08) : alpha(theme.palette.warning.main, 0.08),
                    border: `1px solid ${isOnline ? alpha(theme.palette.success.main, 0.16) : alpha(theme.palette.warning.main, 0.16)}`,
                    transition: "all 0.3s ease",
                  }}
                >
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      bgcolor: isOnline ? "success.main" : "warning.main",
                      ...pulseAnimation,
                    }}
                  />
                </Box>
              </Box>
            </Tooltip>
          ) : (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 1.5,
                py: 1.25,
                px: 2,
                borderRadius: "999px",
                bgcolor: isOnline ? alpha(theme.palette.success.main, 0.08) : alpha(theme.palette.warning.main, 0.08),
                border: `1px solid ${isOnline ? alpha(theme.palette.success.main, 0.24) : alpha(theme.palette.warning.main, 0.24)}`,
                backdropFilter: "blur(4px)",
                transition: "all 0.3s ease",
              }}
            >
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  bgcolor: isOnline ? "success.main" : "warning.main",
                  ...pulseAnimation,
                }}
              />
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 800,
                  fontSize: "0.78rem",
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  color: isOnline ? "success.main" : "warning.main",
                }}
              >
                {isOnline ? "Live Sync" : "Offline Mode"}
              </Typography>
            </Box>
          )}

          {/* Upgrade Banner in Sidebar */}
          {!collapsed ? (
            <Box
              onClick={() => {
                playSound?.("modal");
                setPricingOpen(true);
              }}
              sx={{
                p: 2,
                borderRadius: 2,
                cursor: "pointer",
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.15)} 0%, ${alpha(theme.palette.success.main, 0.15)} 100%)`,
                border: `1px solid ${theme.palette.primary.main}4d`,
                boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.08)}`,
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-3px)",
                  borderColor: theme.palette.primary.main,
                  boxShadow: `0 12px 24px ${alpha(theme.palette.primary.main, 0.18)}`,
                }
              }}
            >
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
                <WorkspacePremiumRoundedIcon sx={{ color: "primary.main", fontSize: 20 }} />
                <Typography variant="body2" sx={{ fontWeight: 900, textTransform: "uppercase", fontSize: "0.8rem", letterSpacing: "0.05em" }}>
                  Upgrade Dukan ⚡
                </Typography>
              </Stack>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", lineHeight: 1.3, fontSize: "0.72rem" }}>
                Unlock WhatsApp alerts, analytics, & 10k invoices!
              </Typography>
            </Box>
          ) : (
            <Tooltip title="Upgrade Plan" placement="right" arrow>
              <IconButton
                onClick={() => {
                  playSound?.("modal");
                  setPricingOpen(true);
                }}
                sx={{
                  border: `1px solid ${theme.palette.primary.main}4d`,
                  py: 1.25,
                  borderRadius: 2,
                  color: "primary.main",
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                  "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.15) }
                }}
              >
                <WorkspacePremiumRoundedIcon />
              </IconButton>
            </Tooltip>
          )}

          {/* Action Controls Stack */}
          <Stack
            direction={collapsed ? "column" : "row"}
            spacing={1}
            justifyContent="center"
            alignItems="stretch"
          >
            <Tooltip
              title={themeMode === "dark" ? "Switch to light theme" : "Switch to dark theme"}
              placement={collapsed ? "right" : "bottom"}
              arrow
            >
              <IconButton
                onClick={toggleThemeMode}
                sx={{ border: "1px solid rgba(148,163,184,0.3)", py: 1.25, borderRadius: 2 }}
              >
                {themeMode === "dark" ? <LightModeRoundedIcon /> : <DarkModeRoundedIcon />}
              </IconButton>
            </Tooltip>
            <Tooltip
              title={soundEnabled ? "Mute UI sounds" : "Unmute UI sounds"}
              placement={collapsed ? "right" : "bottom"}
              arrow
            >
              <IconButton
                onClick={() => setSound(!soundEnabled)}
                sx={{ border: "1px solid rgba(148,163,184,0.3)", py: 1.25, borderRadius: 2 }}
              >
                {soundEnabled ? <VolumeUpRoundedIcon /> : <VolumeOffRoundedIcon />}
              </IconButton>
            </Tooltip>
          </Stack>

          {/* Logout Button */}
          {collapsed ? (
            <Tooltip title={profile?.name ? `Logout ${profile.name}` : "Logout"} placement="right" arrow>
              <IconButton
                color="error"
                onClick={logoutUser}
                sx={{
                  border: "1px solid rgba(220,38,38,0.24)",
                  py: 1.25,
                  borderRadius: 2,
                  "&:hover": { bgcolor: alpha(theme.palette.error.main, 0.08) },
                }}
              >
                <LogoutRoundedIcon />
              </IconButton>
            </Tooltip>
          ) : (
            <Button
              variant="outlined"
              color="error"
              startIcon={<LogoutRoundedIcon />}
              onClick={logoutUser}
              fullWidth
              sx={{ py: 1.25, borderRadius: 2, fontWeight: 700 }}
            >
              {profile?.name ? `Logout ${profile.name.split(" ")[0]}` : "Logout"}
            </Button>
          )}
        </Stack>
      </Stack>
    );
  };

  return (
    <>
      {/* Mobile Top App Bar */}
      <AppBar
        position="sticky"
        color="transparent"
        elevation={0}
        sx={{
          display: { xs: "block", md: "none" },
          backdropFilter: "blur(18px)",
          backgroundColor: alpha(theme.palette.background.default, 0.82),
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Toolbar sx={{ minHeight: 70, justifyContent: "space-between" }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <IconButton onClick={handleDrawerToggle} color="inherit" edge="start">
              <MenuRoundedIcon />
            </IconButton>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: 1,
                p: 0.25,
                bgcolor: theme.palette.background.paper,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.22)}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Box
                component="img"
                src="/branding/dokan pro logo sm.png"
                alt="Dokan Pro Logo"
                sx={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            </Box>
            <Typography variant="h6" sx={{ fontSize: "1.1rem", fontWeight: 800 }}>
              {shop.name || "Dokan Pro"}
            </Typography>
          </Stack>
          <IconButton onClick={toggleThemeMode}>
            {themeMode === "dark" ? <LightModeRoundedIcon /> : <DarkModeRoundedIcon />}
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Desktop Persistent Sidebar with Premium Scrollbars */}
      <Box
        component="nav"
        sx={{
          width: { md: isCollapsed ? 88 : 280 },
          flexShrink: { md: 0 },
          display: { xs: "none", md: "block" },
          position: "sticky",
          top: 0,
          height: "100vh",
          overflow: "visible", // ALLOW the floating toggle button to hover over the border
          transition: "width 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
          zIndex: 100,
        }}
      >
        {/* Inner Scrollable Sidebar with gradient and custom scrollbar */}
        <Box
          sx={{
            width: "100%",
            height: "100%",
            borderRight: `1px solid ${theme.palette.divider}`,
            background:
              themeMode === "dark"
                ? "linear-gradient(180deg, rgba(18,26,23,0.5) 0%, rgba(10,15,13,0.6) 100%)"
                : "linear-gradient(180deg, rgba(255,255,255,0.6) 0%, rgba(240,253,244,0.5) 100%)",
            backdropFilter: "blur(18px)",
            overflowY: "auto",
            overflowX: "hidden",
            transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
            "&::-webkit-scrollbar": {
              width: "6px",
            },
            "&::-webkit-scrollbar-thumb": {
              background: "rgba(148, 163, 184, 0.18)",
              borderRadius: "999px",
            },
            "&::-webkit-scrollbar-track": {
              background: "transparent",
            },
          }}
        >
          {renderSidebarContent(false)}
        </Box>

        {/* Floating Expand/Collapse Button Sitting Perfectly on the Border */}
        <IconButton
          onClick={toggleCollapse}
          onMouseEnter={() => playSound("hover")}
          sx={{
            position: "absolute",
            top: 36,
            right: -14,
            zIndex: 1200,
            width: 28,
            height: 28,
            bgcolor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: themeMode === "dark" 
              ? "0 4px 12px rgba(0,0,0,0.6), 0 0 8px rgba(74,222,128,0.15)"
              : "0 4px 10px rgba(15,23,42,0.08), 0 0 6px rgba(74,222,128,0.1)",
            color: "text.primary",
            "&:hover": {
              bgcolor: theme.palette.background.paper,
              transform: "scale(1.1)",
              boxShadow: themeMode === "dark"
                ? `0 4px 16px rgba(0,0,0,0.8), 0 0 12px ${theme.palette.primary.main}4d`
                : `0 4px 14px rgba(15,23,42,0.12), 0 0 10px ${theme.palette.primary.main}33`,
              borderColor: theme.palette.primary.main,
            },
            transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <KeyboardDoubleArrowLeftRoundedIcon
            sx={{
              fontSize: 16,
              transform: isCollapsed ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.3s ease",
            }}
          />
        </IconButton>
      </Box>

      {/* Mobile Sidebar Sliding Drawer (Always Fully Expanded) */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }} // Better mobile performance
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: 280,
            backgroundImage: "none",
            background:
              themeMode === "dark"
                ? "linear-gradient(180deg, rgba(18,26,23,0.98) 0%, rgba(10,15,13,0.98) 100%)"
                : "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(240,253,244,0.98) 100%)",
            backdropFilter: "blur(18px)",
          },
        }}
      >
        {renderSidebarContent(true)}
      </Drawer>

      {/* APK-style Bottom Navigation Bar for Mobile */}
      <BottomNavigation
        value={bottomNavValue()}
        onChange={handleBottomNavChange}
        showLabels
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          display: { xs: "flex", md: "none" },
          backdropFilter: "blur(24px)",
          bgcolor: themeMode === "dark" ? "rgba(10, 18, 14, 0.95)" : "rgba(255, 255, 255, 0.95)",
          borderTop: `1px solid ${theme.palette.divider}`,
          height: "calc(60px + env(safe-area-inset-bottom))",
          pb: "env(safe-area-inset-bottom)",
          boxShadow: "0 -4px 16px rgba(0,0,0,0.08)",
        }}
      >
        <BottomNavigationAction label="Billing" icon={<ReceiptRoundedIcon />} component={Link} to="/" />
        <BottomNavigationAction label="Dashboard" icon={<GridViewRoundedIcon />} component={Link} to="/dashboard" />
        <BottomNavigationAction label="Dues" icon={<AccountBalanceWalletRoundedIcon />} component={Link} to="/dues" />
        <BottomNavigationAction label="Stock" icon={<Inventory2RoundedIcon />} component={Link} to="/inventory" />
        <BottomNavigationAction label="More" icon={<MoreHorizRoundedIcon />} />
      </BottomNavigation>

      {/* Overhauled psychological Indian SaaS Pricing plans Dialog */}
      <Dialog
        open={pricingOpen}
        onClose={() => setPricingOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            p: 1.5,
            bgcolor: themeMode === "dark" ? "rgba(10, 18, 14, 0.97)" : "rgba(255, 255, 255, 0.98)",
            border: `1.5px solid ${theme.palette.primary.main}4d`,
            boxShadow: `0 24px 60px rgba(0, 0, 0, 0.6), 0 0 32px ${theme.palette.primary.main}26`,
            backdropFilter: "blur(24px)",
            position: "relative",
            overflow: "visible" // Ensure floating badges are never clipped
          }
        }}
      >
        {/* Patriotic Indian Banner Strip */}
        <Stack direction="row" sx={{ position: "absolute", top: 0, left: 0, right: 0, height: 4 }}>
          <Box sx={{ flexGrow: 1, bgcolor: "#FF9933" }} />
          <Box sx={{ flexGrow: 1, bgcolor: "#FFFFFF" }} />
          <Box sx={{ flexGrow: 1, bgcolor: "#138808" }} />
        </Stack>

        <DialogTitle sx={{ pt: 4, pb: 2 }}>
          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems="center" spacing={2}>
            <Box>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Typography variant="h5" sx={{ fontWeight: 900 }}>
                  Dokan Pro Subscription Suite
                </Typography>
                {/* Real Flag Image Fallback for Windows Compatibility */}
                <Box 
                  component="img" 
                  src="https://flagcdn.com/w40/in.png" 
                  alt="India Flag" 
                  sx={{ width: 24, height: 16, borderRadius: 0.5, boxShadow: "0 2px 6px rgba(0,0,0,0.15)" }} 
                />
              </Stack>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: "block", mt: 0.5 }}>
                Over 186+ Indian Dukandars growing their business today
              </Typography>
            </Box>

            {/* Billing Cycle Switch */}
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Typography variant="caption" sx={{ fontWeight: 800, color: !annualBilling ? "primary.main" : "text.secondary" }}>
                Monthly
              </Typography>
              <Switch
                checked={annualBilling}
                onChange={(e) => setAnnualBilling(e.target.checked)}
                color="primary"
                size="small"
              />
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="caption" sx={{ fontWeight: 800, color: annualBilling ? "primary.main" : "text.secondary" }}>
                  Annual Billing
                </Typography>
                <Chip label="Save 40% 🔥" color="success" size="small" sx={{ fontWeight: 950, height: 18, fontSize: "0.6rem", px: 0.5 }} />
              </Stack>
            </Stack>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ py: 3, overflow: "visible" }}>
          {/* Grid setup with display flex on items to force equal height */}
          <Grid container spacing={3} sx={{ mt: 1, overflow: "visible" }}>
            {[
              {
                key: "free",
                name: "Free Dukan 🆓",
                cost: "Free Forever",
                desc: "Perfect to start billing today",
                features: ["150 invoices/mo", "50 products", "Basic support"]
              },
              {
                key: "basic",
                name: "Starter Dukan ⭐",
                cost: annualBilling ? "₹699 / year" : "₹99 / month",
                dailyCost: "Less than ₹2/day! ☕",
                desc: "Your main scaling partner",
                badge: "Most Popular 🔥",
                features: ["1,500 invoices/mo", "500 products", "WhatsApp reminders", "Basic analytics"]
              },
              {
                key: "pro_monthly",
                name: "Pro Business 🚀",
                cost: annualBilling ? "₹2,499 / year" : "₹299 / month",
                dailyCost: "Less than ₹7/day! 📈",
                desc: "Complete shop operations suite",
                features: ["10,000 invoices/mo", "5,000 products", "Multi-device sync", "Advanced analytics", "Staff access", "Priority support"]
              },
              {
                key: "enterprise",
                name: "Enterprise 🏢",
                cost: "Custom Pricing",
                desc: "For large retail chains",
                features: ["Unlimited invoices & products", "Custom branding", "Dedicated support manager", "API access"]
              }
            ].map((plan) => {
              const isMostPopular = plan.badge;
              const isCurrent = profile?.pricingTier === plan.key || (plan.key === "free" && !profile?.pricingTier);

              return (
                <Grid item xs={12} sm={6} md={3} key={plan.key} sx={{ display: "flex" }}>
                  <Box
                    sx={{
                      p: 2.5,
                      pt: isMostPopular ? 4 : 2.5, // Extra top padding for the popular badge
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      borderRadius: 3,
                      border: isMostPopular 
                        ? `2px solid ${theme.palette.primary.main}` 
                        : `1px solid ${theme.palette.divider}`,
                      bgcolor: isMostPopular 
                        ? alpha(theme.palette.primary.main, 0.04) 
                        : alpha(theme.palette.background.default, 0.4),
                      boxShadow: isMostPopular 
                        ? `0 8px 32px ${alpha(theme.palette.primary.main, 0.2)}` 
                        : "none",
                      position: "relative",
                      overflow: "visible", // Ensure floating badge is not clipped
                      flexGrow: 1, // Stretches all cards to match the largest sibling
                      transition: "all 0.25s ease",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        borderColor: theme.palette.primary.main,
                        boxShadow: isMostPopular 
                          ? `0 12px 40px ${alpha(theme.palette.primary.main, 0.35)}`
                          : `0 8px 24px rgba(0,0,0,0.15)`
                      }
                    }}
                  >
                    {isMostPopular && (
                      <Chip 
                        label={plan.badge} 
                        color="primary" 
                        size="small" 
                        sx={{ 
                          position: "absolute", 
                          top: -12, // Position perfectly floating over the top border
                          left: "50%", 
                          transform: "translateX(-50%)", 
                          fontWeight: 900,
                          fontSize: "0.68rem",
                          height: 20,
                          boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.4)}`,
                          zIndex: 10
                        }} 
                      />
                    )}

                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 900, mb: 0.5 }}>
                        {plan.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1.5, fontSize: "0.72rem" }}>
                        {plan.desc}
                      </Typography>
                      <Typography variant="subtitle1" sx={{ fontWeight: 950, color: isMostPopular ? "primary.main" : "text.primary" }}>
                        {plan.cost}
                      </Typography>
                      {plan.dailyCost && (
                        <Typography variant="caption" sx={{ color: "success.main", fontWeight: 800, display: "block", mt: 0.25 }}>
                          {plan.dailyCost}
                        </Typography>
                      )}

                      <Divider sx={{ my: 1.5, opacity: 0.5 }} />

                      <Stack spacing={1}>
                        {plan.features.map((feat, idx) => (
                          <Typography key={idx} variant="caption" color="text.secondary" sx={{ display: "flex", alignItems: "center", gap: 0.75, fontSize: "0.72rem" }}>
                            • {feat}
                          </Typography>
                        ))}
                      </Stack>
                    </Box>

                    <Box sx={{ mt: 3.5 }}>
                      <Button
                        variant={isCurrent ? "outlined" : "contained"}
                        color={isMostPopular ? "primary" : "inherit"}
                        disabled={isCurrent}
                        fullWidth
                        size="small"
                        sx={{ 
                          py: 1, 
                          borderRadius: 1.5, 
                          fontWeight: 900, 
                          fontSize: "0.72rem",
                          transition: "all 0.2s",
                          "&:hover": {
                            transform: isCurrent ? "none" : "scale(1.02)"
                          }
                        }}
                      >
                        {isCurrent ? "Active Plan" : (plan.key === "enterprise" ? "Contact Support" : "Activate Dukan ⚡")}
                      </Button>
                    </Box>
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, pt: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Stack direction="row" spacing={3} sx={{ color: "text.secondary" }}>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <Box 
                component="img" 
                src="https://flagcdn.com/w40/in.png" 
                sx={{ width: 16, height: 11, borderRadius: 0.2, boxShadow: 1 }} 
              />
              <Typography variant="caption" sx={{ fontWeight: 800 }}>
                Made with pride in India
              </Typography>
            </Stack>
            <Typography variant="caption" sx={{ fontWeight: 800 }}>
              ☕ Less than daily chai cost
            </Typography>
          </Stack>
          <Button onClick={() => setPricingOpen(false)} variant="outlined" color="inherit" size="small" sx={{ px: 3 }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Navbar;
