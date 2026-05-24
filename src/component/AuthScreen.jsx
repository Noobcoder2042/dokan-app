import { useState } from "react";
import { motion } from "framer-motion";
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  Divider,
  Paper,
  Stack,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import BoltRoundedIcon from "@mui/icons-material/BoltRounded";
import PersonAddAlt1RoundedIcon from "@mui/icons-material/PersonAddAlt1Rounded";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import LocalMallRoundedIcon from "@mui/icons-material/LocalMallRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import { useAuth } from "../context/AuthContext";
import { useUIExperience } from "../context/UIExperienceContext";

const highlights = [
  {
    icon: <BoltRoundedIcon fontSize="small" />,
    title: "Quick billing",
    text: "Keep counter work fast during busy hours.",
  },
  {
    icon: <PersonAddAlt1RoundedIcon fontSize="small" />,
    title: "Customer memory",
    text: "Bring back saved buyer details when needed.",
  },
  {
    icon: <DashboardRoundedIcon fontSize="small" />,
    title: "Daily clarity",
    text: "See the shop pulse before closing time.",
  },
];

const AuthScreen = () => {
  const { loginWithGoogle } = useAuth();
  const { playSound } = useUIExperience();
  const theme = useTheme();
  const [error, setError] = useState("");
  const mutedText = "#94a3b8";

  const handleGoogle = async () => {
    try {
      playSound("click");
      await loginWithGoogle();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: { xs: 2, sm: 3, md: 5 },
        py: { xs: 2, md: 4 },
        background:
          "radial-gradient(circle at 16% 12%, rgba(34,197,94,0.16), transparent 38%), radial-gradient(circle at 86% 18%, rgba(22,163,74,0.12), transparent 42%), linear-gradient(180deg, #0a0f0d 0%, #0d1411 52%, #0a0f0d 100%)",
      }}
    >
      <Card
        component={motion.div}
        initial={{ opacity: 0, y: 18, scale: 0.99 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.42, ease: "easeOut" }}
        sx={{
          width: "100%",
          maxWidth: 1120,
          minHeight: { md: 640 },
          overflow: "hidden",
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1.08fr 0.92fr" },
          borderRadius: { xs: 2, md: 3 },
          border: "1px solid rgba(255,255,255,0.08)",
          background:
            "linear-gradient(140deg, rgba(18,26,23,0.98), rgba(10,15,13,0.98))",
          boxShadow: "0 30px 80px rgba(0, 0, 0, 0.5)",
        }}
      >
        <Box
          sx={{
            position: "relative",
            isolation: "isolate",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            gap: { xs: 4, md: 5 },
            minHeight: { xs: 430, md: "auto" },
            p: { xs: 3, sm: 4, md: 5.5 },
            color: "#ffffff",
            background:
              "linear-gradient(145deg, rgba(5,46,22,0.82), rgba(20,83,45,0.58) 44%, rgba(3,7,18,0.72)), url('/branding/dokan-login-shop-scene.jpg')",
            backgroundSize: "cover",
            backgroundPosition: { xs: "45% center", md: "center" },
            "&::before": {
              content: '""',
              position: "absolute",
              inset: 0,
              zIndex: -1,
              background:
                "linear-gradient(90deg, rgba(6,78,59,0.58), rgba(6,78,59,0.08)), radial-gradient(circle at 18% 14%, rgba(255,255,255,0.2), transparent 34%)",
            },
          }}
        >
          <Stack spacing={{ xs: 3, md: 4 }}>
            <Stack direction="row" alignItems="center" spacing={1.4}>
              <Box
                sx={{
                  width: 46,
                  height: 46,
                  borderRadius: 2,
                  display: "grid",
                  placeItems: "center",
                  background: "rgba(255,255,255,0.18)",
                  border: "1px solid rgba(255,255,255,0.26)",
                }}
              >
                <LocalMallRoundedIcon />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ lineHeight: 1.1 }}>
                  Dokan Pro
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.82 }}>
                  Shop billing workspace
                </Typography>
              </Box>
            </Stack>

            <Box>
              <Chip
                size="small"
                icon={<ReceiptLongRoundedIcon />}
                label="Counter ready"
                variant="outlined"
                sx={{
                  mb: 2.2,
                  color: "#ffffff",
                  borderColor: "rgba(255,255,255,0.34)",
                  background: "rgba(255,255,255,0.14)",
                  "& .MuiChip-icon": { color: "#ffffff" },
                }}
              />
              <Typography
                variant="h3"
                sx={{
                  maxWidth: 560,
                  fontWeight: 800,
                  lineHeight: { xs: 1.08, md: 1.02 },
                  fontSize: { xs: "2.25rem", sm: "2.8rem", md: "3.45rem" },
                  letterSpacing: 0,
                }}
              >
                Start every sale from one calm screen.
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  mt: 2.2,
                  maxWidth: 500,
                  color: "rgba(255,255,255,0.86)",
                  fontSize: { xs: "0.98rem", md: "1.05rem" },
                }}
              >
                Sign in and open the billing desk, customer records, inventory,
                and sales dashboard for your shop.
              </Typography>
            </Box>
          </Stack>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            sx={{ width: "100%" }}
          >
            {highlights.map((item) => (
              <Box
                key={item.title}
                sx={{
                  flex: 1,
                  minWidth: 0,
                  p: 1.6,
                  borderRadius: 1.5,
                  background: "rgba(255,255,255,0.12)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  backdropFilter: "blur(10px)",
                }}
              >
                <Box sx={{ mb: 1, opacity: 0.9 }}>{item.icon}</Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                  {item.title}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    display: "block",
                    mt: 0.5,
                    color: "rgba(255,255,255,0.78)",
                  }}
                >
                  {item.text}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            p: { xs: 3, sm: 4, md: 6 },
            background:
              "linear-gradient(180deg, rgba(18,26,23,0.98), rgba(10,15,13,0.99))",
          }}
        >
          <Stack spacing={3} sx={{ width: "100%" }}>
            <Box
              component="img"
              src="/branding/dokan-pro-long-logo.png"
              alt="Dokan Pro"
              sx={{
                width: "min(100%, 360px)",
                display: "block",
                mx: { xs: "auto", md: 0 },
                borderRadius: 1,
                filter: "drop-shadow(0 12px 28px rgba(34,197,94,0.16))",
              }}
            />

            <Box>
              <Typography
                variant="h4"
                sx={{ color: "#f1f5f9", fontWeight: 800, letterSpacing: 0 }}
              >
                Welcome back
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, color: mutedText }}>
                Use your Google account to continue securely.
              </Typography>
            </Box>

            <Paper
              elevation={0}
              sx={{
                p: { xs: 2, sm: 2.5 },
                borderRadius: 2,
                border: "1px solid rgba(255,255,255,0.08)",
                background: alpha(theme.palette.common.white, 0.035),
              }}
            >
              <Stack spacing={1.4}>
                <Stack direction="row" spacing={1.2} alignItems="center">
                  <LockRoundedIcon color="primary" fontSize="small" />
                  <Typography
                    variant="subtitle2"
                    sx={{ color: "#f1f5f9", fontWeight: 800 }}
                  >
                    Secure sign in
                  </Typography>
                </Stack>
                <Typography variant="body2" sx={{ color: mutedText }}>
                  Your shop data stays connected to your approved Google login.
                </Typography>
              </Stack>
            </Paper>

            {error && <Alert severity="error">{error}</Alert>}

            <Stack spacing={2}>
              <Button
                variant="contained"
                startIcon={<GoogleIcon />}
                onClick={handleGoogle}
                size="large"
                fullWidth
              >
                Continue with Google
              </Button>

              <Divider>
                <Typography variant="caption" sx={{ color: mutedText }}>
                  Dokan Pro Billing
                </Typography>
              </Divider>

              <Typography
                variant="caption"
                sx={{ color: mutedText, textAlign: "center" }}
              >
                Version 1.0
              </Typography>
            </Stack>
          </Stack>
        </Box>
      </Card>
    </Box>
  );
};

export default AuthScreen;
