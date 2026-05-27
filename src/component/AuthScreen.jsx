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
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import { useAuth } from "../context/AuthContext";
import { useUIExperience } from "../context/UIExperienceContext";

const highlights = [
  {
    icon: <BoltRoundedIcon sx={{ fontSize: 20 }} />,
    title: "Quick Billing POS Desk",
    text: "Keep checkout operations fast during peak rush hours.",
  },
  {
    icon: <PersonAddAlt1RoundedIcon sx={{ fontSize: 20 }} />,
    title: "Customer Memory Sync",
    text: "Instantly recall buyer details and autofill dues forms.",
  },
  {
    icon: <DashboardRoundedIcon sx={{ fontSize: 20 }} />,
    title: "Daily Pulse Analytics",
    text: "See real-time shop performance metrics at a glance.",
  },
];

const AuthScreen = () => {
  const { loginWithGoogle } = useAuth();
  const { playSound, themeMode } = useUIExperience();
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
        py: { xs: 3, md: 5 },
        background:
          "radial-gradient(circle at 10% 20%, rgba(34,197,94,0.18), transparent 40%), radial-gradient(circle at 90% 80%, rgba(6,182,212,0.12), transparent 45%), #050807",
      }}
    >
      {/* Background Cyber Grid */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          opacity: 0.7,
          pointerEvents: "none",
        }}
      />

      <Card
        component={motion.div}
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, cubicBezier: [0.16, 1, 0.3, 1] }}
        sx={{
          width: "100%",
          maxWidth: 1080,
          minHeight: { md: 620 },
          overflow: "hidden",
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1.05fr 0.95fr" },
          borderRadius: 4,
          border: `1px solid ${alpha(theme.palette.success.main, 0.12)}`,
          background: "rgba(10, 18, 14, 0.45)",
          backdropFilter: "blur(24px)",
          boxShadow:
            "0 30px 80px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255,255,255,0.03)",
        }}
      >
        {/* Left Interactive Art Panel */}
        <Box
          sx={{
            position: "relative",
            isolation: "isolate",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            gap: { xs: 4, md: 5 },
            minHeight: { xs: 460, md: "auto" },
            p: { xs: 4, sm: 5, md: 6 },
            color: "#ffffff",
            overflow: "hidden",
            background:
              "linear-gradient(135deg, rgba(5,46,22,0.85) 0%, rgba(3,7,18,0.92) 100%)",
          }}
        >
          {/* Shifting Nebula Glob Inside Left Panel */}
          <motion.div
            animate={{
              scale: [1, 1.15, 1],
              opacity: [0.5, 0.75, 0.5],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{
              position: "absolute",
              top: "-20%",
              right: "-10%",
              width: 320,
              height: 320,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${alpha(theme.palette.success.main, 0.25)} 0%, transparent 70%)`,
              filter: "blur(40px)",
              zIndex: -1,
            }}
          />

          <Stack spacing={{ xs: 4, md: 5 }}>
            {/* Header Branding */}
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 1.5,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: "rgba(18,26,22,0.85)",
                  border: `1px solid ${alpha(theme.palette.success.main, 0.25)}`,
                  boxShadow: `0 0 20px ${alpha(theme.palette.success.main, 0.25)}`,
                  p: 0.75,
                }}
              >
                <Box
                  component="img"
                  src="/branding/dokan pro logo sm.png"
                  alt="Dokan Pro"
                  sx={{ width: "100%", height: "100%", objectFit: "contain" }}
                />
              </Box>
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 900,
                    lineHeight: 1.1,
                    letterSpacing: "-0.01em",
                  }}
                >
                  DOKAN PRO
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: "success.main",
                    fontWeight: 700,
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                  }}
                >
                  Smart Billing Workspace
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: "rgba(255,255,255,0.55)",
                    fontWeight: 700,
                    letterSpacing: "0.04em",
                    display: "flex",
                    alignItems: "center",
                    gap: 0.7,
                  }}
                >
                  🇮🇳 Built by an Indian Dukandar, for Indian Dukandars
                </Typography>
              </Box>
            </Stack>

            {/* Core Message */}
            <Box>
              <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap sx={{ mb: 2.5 }}>
                <Chip
                  size="small"
                  icon={<ReceiptLongRoundedIcon style={{ color: theme.palette.success.main }} />}
                  label="Version 2.3.0 - Ready"
                  variant="outlined"
                  sx={{
                    color: "success.main",
                    fontWeight: 800,
                    borderColor: alpha(theme.palette.success.main, 0.35),
                    background: alpha(theme.palette.success.main, 0.08),
                    backdropFilter: "blur(4px)",
                  }}
                />
                <Chip
                  size="small"
                  icon={<AutoAwesomeRoundedIcon style={{ color: "#ff9933", fontSize: 16 }} />}
                  label="Made by an Indian Dukandar for Indian Dukans 🇮🇳"
                  variant="outlined"
                  sx={{
                    color: "#ffffff",
                    fontWeight: 800,
                    borderColor: "rgba(255, 153, 51, 0.3)",
                    background: "linear-gradient(90deg, rgba(255,153,51,0.1) 0%, rgba(255,255,255,0.05) 50%, rgba(19,136,8,0.1) 100%)",
                    backdropFilter: "blur(4px)",
                    boxShadow: "0 0 12px rgba(255,153,51,0.05)",
                  }}
                />
              </Stack>
              <Typography
                variant="h3"
                sx={{
                  maxWidth: 520,
                  fontWeight: 900,
                  lineHeight: 1.1,
                  fontSize: { xs: "2.1rem", sm: "2.6rem", md: "3.2rem" },
                  letterSpacing: "-0.02em",
                }}
              >
                Start every sale from one calm screen.
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  mt: 2.2,
                  maxWidth: 480,
                  color: "rgba(255,255,255,0.72)",
                  fontSize: { xs: "0.95rem", md: "1rem" },
                  lineHeight: 1.6,
                }}
              >
                Open the digital POS desk, record dues chronologically, manage
                inventory stock, and monitor analytics with real-time sync.
              </Typography>
            </Box>
          </Stack>

          {/* Highlights Stack with Frosted Cards */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{ width: "100%", mt: 2 }}
          >
            {highlights.map((item) => (
              <Box
                key={item.title}
                component={motion.div}
                whileHover={{ y: -6, scale: 1.02 }}
                transition={{ duration: 0.25 }}
                sx={{
                  flex: 1,
                  minWidth: 0,
                  p: 2,
                  borderRadius: 2,
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  backdropFilter: "blur(10px)",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
                }}
              >
                <Box sx={{ mb: 1.25, color: "success.main", display: "flex" }}>
                  {item.icon}
                </Box>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 800,
                    fontSize: "0.85rem",
                    color: "text.primary",
                  }}
                >
                  {item.title}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    display: "block",
                    mt: 0.5,
                    color: "rgba(255,255,255,0.48)",
                    lineHeight: 1.4,
                  }}
                >
                  {item.text}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>

        {/* Right Authentication Form Panel */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            p: { xs: 4, sm: 5, md: 7 },
            background: "rgba(10,18,14,0.35)",
            backdropFilter: "blur(20px)",
            borderLeft: {
              md: `1px solid ${alpha(theme.palette.success.main, 0.08)}`,
            },
          }}
        >
          <Stack spacing={4.5} sx={{ width: "100%" }}>
            {/* Form Title */}
            <Stack spacing={1}>
              <Typography
                variant="h4"
                sx={{
                  color: "#ffffff",
                  fontWeight: 900,
                  letterSpacing: "-0.02em",
                  textShadow: `0 0 20px ${alpha(theme.palette.success.main, 0.2)}`,
                }}
              >
                Welcome back
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: mutedText, fontWeight: 500 }}
              >
                Use your registered credentials to launch the POS.
              </Typography>
            </Stack>

            {/* Glassmorphic Security Feature Card */}
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: 3,
                border: "1px solid rgba(255,255,255,0.04)",
                background: "rgba(255,255,255,0.015)",
                backdropFilter: "blur(4px)",
              }}
            >
              <Stack spacing={1.5}>
                <Stack direction="row" spacing={1.2} alignItems="center">
                  <Box
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: alpha(theme.palette.success.main, 0.08),
                      border: `1px solid ${alpha(theme.palette.success.main, 0.16)}`,
                      color: "success.main",
                    }}
                  >
                    <LockRoundedIcon sx={{ fontSize: 16 }} />
                  </Box>
                  <Typography
                    variant="subtitle2"
                    sx={{ color: "#f1f5f9", fontWeight: 800 }}
                  >
                    Cloud Authorization
                  </Typography>
                </Stack>
                <Typography
                  variant="caption"
                  sx={{ color: mutedText, lineHeight: 1.5, display: "block" }}
                >
                  Every session is encrypted and securely linked to your account
                  database under strict merchant access rules.
                </Typography>
              </Stack>
            </Paper>

            {error && (
              <Alert severity="error" sx={{ borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            {/* Login Action Area */}
            <Stack spacing={2.5}>
              <Button
                variant="contained"
                startIcon={<GoogleIcon />}
                onClick={handleGoogle}
                size="large"
                fullWidth
                sx={{
                  py: 1.75,
                  borderRadius: 2.5,
                  fontWeight: 900,
                  fontSize: "0.95rem",
                  background: `linear-gradient(120deg, ${theme.palette.primary.main} 0%, ${theme.palette.success.main} 100%)`,
                  boxShadow: `0 8px 22px ${alpha(theme.palette.primary.main, 0.3)}`,
                  "&:hover": {
                    boxShadow: `0 12px 28px ${alpha(theme.palette.primary.main, 0.45)}`,
                    transform: "translateY(-2px)",
                  },
                  transition: "all 0.25s ease",
                }}
              >
                Continue with Google
              </Button>

              <Divider sx={{ opacity: 0.12 }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: mutedText,
                    fontWeight: 700,
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                  }}
                >
                  Secure POS Gateway
                </Typography>
              </Divider>

              <Stack
                direction="row"
                alignItems="center"
                justifyContent="center"
                spacing={1}
              >
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    bgcolor: "success.main",
                    boxShadow: `0 0 8px ${theme.palette.success.main}`,
                    "@keyframes pulseIndicator": {
                      "0%": { opacity: 0.4 },
                      "50%": { opacity: 1 },
                      "100%": { opacity: 0.4 },
                    },
                    animation: "pulseIndicator 2s infinite ease-in-out",
                  }}
                />
                <Typography
                  variant="caption"
                  sx={{
                    color: mutedText,
                    textAlign: "center",
                    fontWeight: 700,
                  }}
                >
                  Version 2.3.0 - Kinetic Release
                </Typography>
              </Stack>
            </Stack>
          </Stack>
        </Box>
      </Card>
    </Box>
  );
};

export default AuthScreen;
