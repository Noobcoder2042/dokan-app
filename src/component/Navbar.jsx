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
} from "@mui/material";
import { useEffect, useState } from "react";
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
              {navItems.map((item) => {
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
    </>
  );
};

export default Navbar;
