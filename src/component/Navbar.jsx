import {
  AppBar,
  Box,
  Button,
  Chip,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import { Link, useLocation } from "react-router-dom";
import { useShop } from "../context/ShopContext";
import { useAuth } from "../context/AuthContext";

const navItems = [
  {
    label: "Billing",
    to: "/",
    icon: <ReceiptLongRoundedIcon fontSize="small" />,
  },
  {
    label: "Dashboard",
    to: "/dashboard",
    icon: <DashboardRoundedIcon fontSize="small" />,
  },
  {
    label: "Settings",
    to: "/settings",
    icon: <SettingsRoundedIcon fontSize="small" />,
  },
];

const Navbar = () => {
  const location = useLocation();
  const { shop } = useShop();
  const { logoutUser, profile } = useAuth();

  return (
    <AppBar
      position="sticky"
      color="transparent"
      elevation={0}
      sx={{
        backdropFilter: "blur(18px)",
        backgroundColor: "rgba(244, 247, 251, 0.82)",
        borderBottom: "1px solid rgba(148, 163, 184, 0.16)",
      }}
    >
      <Toolbar
        sx={{
          minHeight: { xs: 74, md: 84 },
          gap: 2,
          justifyContent: "space-between",
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 1,
              overflow: "hidden",
              bgcolor: "white",
              boxShadow: "0 14px 24px rgba(29, 78, 216, 0.25)",
            }}
          >
            <Box
              component="img"
              src="/branding/dokan pro logo sm.png"
              alt="Dokan Pro"
              sx={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </Box>
          <Box>
            <Typography variant="h6">{shop.name || "Dokan Pro"}</Typography>
            <Typography variant="body2" color="text.secondary">
              Modern billing for everyday shop work
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;

            return (
              <Button
                key={item.to}
                component={Link}
                to={item.to}
                startIcon={item.icon}
                variant={isActive ? "contained" : "text"}
                color={isActive ? "primary" : "inherit"}
                sx={{
                  display: { xs: "none", sm: "inline-flex" },
                  color: isActive ? "white" : "text.primary",
                }}
              >
                {item.label}
              </Button>
            );
          })}

          <Chip
            label="Mobile Ready"
            color="secondary"
            variant="outlined"
            sx={{ display: { xs: "none", md: "inline-flex" } }}
          />
          <Button
            variant="outlined"
            startIcon={<LogoutRoundedIcon />}
            onClick={logoutUser}
            sx={{ display: { xs: "none", md: "inline-flex" } }}
          >
            {profile?.name ? `Logout ${profile.name}` : "Logout"}
          </Button>
        </Stack>
      </Toolbar>

      <Stack
        direction="row"
        spacing={1}
        sx={{
          px: 2,
          pb: 1.5,
          display: { xs: "flex", sm: "none" },
          overflowX: "auto",
        }}
      >
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;

          return (
            <Button
              key={item.to}
              component={Link}
              to={item.to}
              startIcon={item.icon}
              variant={isActive ? "contained" : "outlined"}
              color={isActive ? "primary" : "inherit"}
              sx={{ minWidth: "fit-content" }}
            >
              {item.label}
            </Button>
          );
        })}
        <Button
          variant="outlined"
          startIcon={<LogoutRoundedIcon />}
          onClick={logoutUser}
          sx={{ minWidth: "fit-content" }}
        >
          Logout
        </Button>
      </Stack>
    </AppBar>
  );
};

export default Navbar;
