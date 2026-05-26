import { Box, Stack, Typography, useTheme, alpha } from "@mui/material";
import { useEffect, useState } from "react";

const LOADING_STEPS = [
  "Securing merchant session...",
  "Initializing local ledger databases...",
  "Syncing real-time inventory index...",
  "Establishing high-speed POS channel...",
  "Opening secure billing command center...",
];

const FuturisticLoader = () => {
  const theme = useTheme();
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % LOADING_STEPS.length);
    }, 700);

    return () => clearInterval(stepInterval);
  }, []);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        position: "relative",
        overflow: "hidden",
        background: "radial-gradient(circle at 50% 30%, rgba(34,197,94,0.15), transparent 50%), linear-gradient(180deg, #070a09 0%, #0d1411 100%)",
      }}
    >
      {/* Background Grid Accent */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: "linear-gradient(rgba(255,255,255,0.01) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.01) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
          opacity: 0.8,
        }}
      />

      <Stack spacing={4} alignItems="center" sx={{ textAlign: "center", zIndex: 1 }}>
        {/* Glowing Pulse Ring and Logo */}
        <Box sx={{ position: "relative", width: 140, height: 140, display: "flex", alignItems: "center", justifyContent: "center" }}>
          
          {/* Outer Spin Ring */}
          <Box
            sx={{
              position: "absolute",
              width: 130,
              height: 130,
              borderRadius: "50%",
              border: "3px solid transparent",
              borderTopColor: theme.palette.primary.main,
              borderBottomColor: theme.palette.success.main,
              "@keyframes spinClockwise": {
                "0%": { transform: "rotate(0deg)" },
                "100%": { transform: "rotate(360deg)" },
              },
              animation: "spinClockwise 1.8s linear infinite",
            }}
          />

          {/* Inner Counter-Spin Ring */}
          <Box
            sx={{
              position: "absolute",
              width: 110,
              height: 110,
              borderRadius: "50%",
              border: "2px solid transparent",
              borderLeftColor: alpha(theme.palette.success.main, 0.8),
              borderRightColor: alpha(theme.palette.primary.main, 0.8),
              "@keyframes spinCounterClockwise": {
                "0%": { transform: "rotate(360deg)" },
                "100%": { transform: "rotate(0deg)" },
              },
              animation: "spinCounterClockwise 1.2s linear infinite",
            }}
          />

          {/* Pulsing Core Glowing Base */}
          <Box
            sx={{
              position: "absolute",
              width: 90,
              height: 90,
              borderRadius: 3,
              bgcolor: "rgba(18,26,22,0.85)",
              border: `1px solid ${alpha(theme.palette.primary.main, 0.25)}`,
              boxShadow: `0 0 30px ${alpha(theme.palette.success.main, 0.3)}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              p: 1.5,
              "@keyframes breathe": {
                "0%": { transform: "scale(0.96)", boxShadow: `0 0 20px ${alpha(theme.palette.success.main, 0.25)}` },
                "50%": { transform: "scale(1.04)", boxShadow: `0 0 40px ${alpha(theme.palette.success.main, 0.45)}` },
                "100%": { transform: "scale(0.96)", boxShadow: `0 0 20px ${alpha(theme.palette.success.main, 0.25)}` },
              },
              animation: "breathe 2.5s infinite ease-in-out",
            }}
          >
            <Box
              component="img"
              src="/branding/dokan pro logo sm.png"
              alt="Dokan Pro"
              sx={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          </Box>
        </Box>

        {/* Boot Sequence Status */}
        <Stack spacing={1.5} alignItems="center">
          <Typography
            variant="h6"
            sx={{
              fontWeight: 800,
              fontSize: "1.2rem",
              color: "text.primary",
              letterSpacing: "-0.01em",
              textShadow: `0 0 20px ${alpha(theme.palette.primary.main, 0.3)}`,
            }}
          >
            Dokan Pro
          </Typography>

          <Box sx={{ minHeight: 24 }}>
            <Typography
              variant="body2"
              sx={{
                color: alpha(theme.palette.text.secondary, 0.8),
                fontWeight: 700,
                fontSize: "0.88rem",
                letterSpacing: "0.02em",
                "@keyframes stepFade": {
                  "0%": { opacity: 0.4, transform: "translateY(2px)" },
                  "50%": { opacity: 1, transform: "translateY(0)" },
                  "100%": { opacity: 0.4, transform: "translateY(-2px)" },
                },
                animation: "stepFade 0.7s infinite alternate ease-in-out",
              }}
            >
              {LOADING_STEPS[currentStep]}
            </Typography>
          </Box>
        </Stack>
      </Stack>
    </Box>
  );
};

export default FuturisticLoader;
