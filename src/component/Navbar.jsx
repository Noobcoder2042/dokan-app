import { AppBar, Box, Button, Chip, IconButton, Stack, Toolbar, Tooltip, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import ReceiptRoundedIcon from "@mui/icons-material/ReceiptRounded";
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
import { Link, useLocation } from "react-router-dom";
import { useShop } from "../context/ShopContext";
import { useAuth } from "../context/AuthContext";
import { useUIExperience } from "../context/UIExperienceContext";

const navItems = [
  { label: "Billing", to: "/", icon: <ReceiptRoundedIcon fontSize="small" /> },
  { label: "Dashboard", to: "/dashboard", icon: <GridViewRoundedIcon fontSize="small" /> },
  { label: "Inventory", to: "/inventory", icon: <Inventory2RoundedIcon fontSize="small" /> },
  { label: "Sales", to: "/sales", icon: <TrendingUpRoundedIcon fontSize="small" /> },
  { label: "Analytics", to: "/analytics", icon: <QueryStatsRoundedIcon fontSize="small" /> },
  { label: "Settings", to: "/settings", icon: <SettingsSuggestRoundedIcon fontSize="small" /> },
  { label: "Guide", to: "/guide", icon: <AutoAwesomeRoundedIcon fontSize="small" /> },
];

const MotionButton = motion(Button);

const Navbar = () => {
  const location = useLocation();
  const { shop } = useShop();
  const { logoutUser, profile } = useAuth();
  const { themeMode, toggleThemeMode, soundEnabled, setSound, playSound } = useUIExperience();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

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

  return (
    <AppBar
      position="sticky"
      color="transparent"
      elevation={0}
      sx={{
        backdropFilter: "blur(18px)",
        backgroundColor: themeMode === "dark" ? "rgba(10,15,13,0.82)" : "rgba(248,250,249,0.82)",
        borderBottom: "1px solid rgba(148, 163, 184, 0.18)",
      }}
    >
      <Toolbar sx={{ minHeight: { xs: 74, md: 84 }, gap: 1.5, justifyContent: "space-between" }}>
        <Stack direction="row" spacing={1.4} alignItems="center">
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 1.5,
              p: 0.5,
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: themeMode === "dark" ? "rgba(18,26,22,0.95)" : "#ffffff",
              border:
                themeMode === "dark"
                  ? "1px solid rgba(74,222,128,0.22)"
                  : "1px solid rgba(148,163,184,0.22)",
              boxShadow:
                themeMode === "dark"
                  ? "0 0 20px rgba(34,197,94,0.22)"
                  : "0 0 24px rgba(34,197,94,0.18)",
            }}
          >
            <Box
              component="img"
              src="/branding/dokan pro logo sm.png"
              alt="Dokan Pro"
              sx={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
            />
          </Box>
          <Box>
            <Typography variant="h6">{shop.name || "Dokan Pro"}</Typography>
            <Typography variant="body2" color="text.secondary">Smart billing command center</Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <MotionButton
                key={item.to}
                component={Link}
                to={item.to}
                startIcon={item.icon}
                onMouseEnter={() => playSound("hover")}
                onClick={() => playSound("click")}
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                variant={isActive ? "contained" : "text"}
                sx={{
                  display: { xs: "none", sm: "inline-flex" },
                  color: isActive ? "white" : "text.primary",
                  background: isActive
                    ? "linear-gradient(120deg, #22c55e 0%, #16a34a 100%)"
                    : "transparent",
                  boxShadow: isActive ? "0 0 0 1px rgba(255,255,255,0.2), 0 10px 28px rgba(34,197,94,0.38)" : "none",
                  transition: "all .25s ease",
                }}
              >
                {item.label}
              </MotionButton>
            );
          })}

          <Chip label={isOnline ? "Live Sync" : "Offline Mode"} color={isOnline ? "secondary" : "warning"} variant="outlined" sx={{ display: { xs: "none", md: "inline-flex" } }} />

          <Tooltip title={themeMode === "dark" ? "Switch to light theme" : "Switch to dark theme"}>
            <IconButton onClick={toggleThemeMode} sx={{ border: "1px solid rgba(148,163,184,0.3)" }}>
              {themeMode === "dark" ? <LightModeRoundedIcon /> : <DarkModeRoundedIcon />}
            </IconButton>
          </Tooltip>
          <Tooltip title={soundEnabled ? "Mute UI sounds" : "Unmute UI sounds"}>
            <IconButton onClick={() => setSound(!soundEnabled)} sx={{ border: "1px solid rgba(148,163,184,0.3)" }}>
              {soundEnabled ? <VolumeUpRoundedIcon /> : <VolumeOffRoundedIcon />}
            </IconButton>
          </Tooltip>
          <Button variant="outlined" startIcon={<LogoutRoundedIcon />} onClick={logoutUser} sx={{ display: { xs: "none", md: "inline-flex" } }}>
            {profile?.name ? `Logout ${profile.name}` : "Logout"}
          </Button>
        </Stack>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
