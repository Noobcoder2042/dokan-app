import { Box, Stack, Typography, useTheme, alpha } from "@mui/material";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const FuturisticSplash = () => {
  const theme = useTheme();
  const [progress, setProgress] = useState(0);
  const [hudMessage, setHudMessage] = useState("SYSTEM BOOTING...");

  useEffect(() => {
    const duration = 1400; // 1.4 seconds
    const interval = 20; // 20ms steps
    const step = 100 / (duration / interval);
    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressTimer);
          return 100;
        }
        return Math.min(prev + step, 100);
      });
    }, interval);

    return () => clearInterval(progressTimer);
  }, []);

  useEffect(() => {
    if (progress < 25) {
      setHudMessage("INIT SECURE SESSION GATE...");
    } else if (progress < 50) {
      setHudMessage("DECRYPTING MERCHANT CREDENTIALS...");
    } else if (progress < 75) {
      setHudMessage("ESTABLISHING REAL-TIME FIRESTORE PORTAL...");
    } else if (progress < 95) {
      setHudMessage("OPTIMIZING LEDGER TRANSACTION SCHEMAS...");
    } else {
      setHudMessage("COMMAND DESK SECURED. WELCOME.");
    }
  }, [progress]);

  // Corner HUD Brackets Style
  const bracketSize = 16;
  const bracketThickness = 2;
  const bracketColor = alpha(theme.palette.success.main, 0.4);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        position: "relative",
        overflow: "hidden",
        bgcolor: "#050807",
        background: "linear-gradient(180deg, #050807 0%, #0c120f 100%)",
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
          backgroundImage: `linear-gradient(${alpha(theme.palette.success.main, 0.015)} 1px, transparent 1px), linear-gradient(90deg, ${alpha(theme.palette.success.main, 0.015)} 1px, transparent 1px)`,
          backgroundSize: "30px 30px",
          opacity: 0.8,
        }}
      />

      {/* Floating Shifting Ambient Color Orbs */}
      <motion.div
        animate={{
          x: [0, 40, -30, 0],
          y: [0, -30, 40, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          position: "absolute",
          top: "15%",
          left: "20%",
          width: 320,
          height: 320,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${alpha(theme.palette.success.main, 0.16)} 0%, transparent 70%)`,
          filter: "blur(50px)",
          pointerEvents: "none",
        }}
      />
      <motion.div
        animate={{
          x: [0, -50, 30, 0],
          y: [0, 40, -40, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          position: "absolute",
          bottom: "15%",
          right: "20%",
          width: 380,
          height: 380,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.12)} 0%, transparent 70%)`,
          filter: "blur(60px)",
          pointerEvents: "none",
        }}
      />

      {/* Floating HUD particles */}
      {Array.from({ length: 15 }).map((_, i) => (
        <Box
          key={i}
          sx={{
            position: "absolute",
            width: Math.random() * 4 + 2,
            height: Math.random() * 4 + 2,
            borderRadius: "50%",
            bgcolor: alpha(theme.palette.success.main, 0.3),
            boxShadow: `0 0 10px ${theme.palette.success.main}`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            opacity: Math.random() * 0.6 + 0.2,
            "@keyframes particleFloat": {
              "0%": { transform: "translateY(0) scale(1)", opacity: 0.2 },
              "50%": { opacity: 0.8 },
              "100%": { transform: "translateY(-40px) scale(1.3)", opacity: 0.1 },
            },
            animation: `particleFloat ${Math.random() * 6 + 4}s infinite linear`,
          }}
        />
      ))}

      {/* Futuristic HUD Card Container */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, cubicBezier: [0.16, 1, 0.3, 1] }}
        style={{
          position: "relative",
          width: "90%",
          maxWidth: 580,
          zIndex: 5,
        }}
      >
        <Box
          sx={{
            position: "relative",
            p: { xs: 4, md: 6 },
            borderRadius: 4,
            background: "rgba(10, 18, 14, 0.45)",
            backdropFilter: "blur(20px)",
            border: `1px solid ${alpha(theme.palette.success.main, 0.12)}`,
            boxShadow: `0 30px 70px rgba(0,0,0,0.8), inset 0 1px 0 ${alpha(theme.palette.success.main, 0.08)}`,
            overflow: "hidden",
          }}
        >
          {/* HUD Brackets in Corners */}
          {/* Top Left */}
          <Box sx={{ position: "absolute", top: bracketSize, left: bracketSize, width: bracketSize, height: bracketSize, borderTop: `${bracketThickness}px solid ${bracketColor}`, borderLeft: `${bracketThickness}px solid ${bracketColor}` }} />
          {/* Top Right */}
          <Box sx={{ position: "absolute", top: bracketSize, right: bracketSize, width: bracketSize, height: bracketSize, borderTop: `${bracketThickness}px solid ${bracketColor}`, borderRight: `${bracketThickness}px solid ${bracketColor}` }} />
          {/* Bottom Left */}
          <Box sx={{ position: "absolute", bottom: bracketSize, left: bracketSize, width: bracketSize, height: bracketSize, borderBottom: `${bracketThickness}px solid ${bracketColor}`, borderLeft: `${bracketThickness}px solid ${bracketColor}` }} />
          {/* Bottom Right */}
          <Box sx={{ position: "absolute", bottom: bracketSize, right: bracketSize, width: bracketSize, height: bracketSize, borderBottom: `${bracketThickness}px solid ${bracketColor}`, borderRight: `${bracketThickness}px solid ${bracketColor}` }} />

          <Stack spacing={4} alignItems="center">
            {/* Glowing Logo core inside interactive target box */}
            <Box
              sx={{
                position: "relative",
                width: 130,
                height: 130,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {/* Target Spinning Ring */}
              <Box
                sx={{
                  position: "absolute",
                  width: 120,
                  height: 120,
                  borderRadius: "50%",
                  border: `1px dashed ${alpha(theme.palette.success.main, 0.35)}`,
                  "@keyframes spinRing": {
                    "0%": { transform: "rotate(0deg)" },
                    "100%": { transform: "rotate(360deg)" },
                  },
                  animation: "spinRing 25s linear infinite",
                }}
              />

              {/* Glowing Halo Outer */}
              <Box
                sx={{
                  position: "absolute",
                  width: 96,
                  height: 96,
                  borderRadius: 3.5,
                  bgcolor: "transparent",
                  border: `2px solid ${alpha(theme.palette.success.main, 0.15)}`,
                  boxShadow: `0 0 25px ${alpha(theme.palette.success.main, 0.2)}`,
                  "@keyframes pulseHalo": {
                    "0%": { transform: "scale(0.96)", opacity: 0.6 },
                    "50%": { transform: "scale(1.05)", opacity: 1 },
                    "100%": { transform: "scale(0.96)", opacity: 0.6 },
                  },
                  animation: "pulseHalo 3s infinite ease-in-out",
                }}
              />

              {/* Logo Core */}
              <Box
                sx={{
                  position: "relative",
                  zIndex: 2,
                  width: 80,
                  height: 80,
                  borderRadius: 2.5,
                  bgcolor: "#0b110e",
                  border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`,
                  boxShadow: `0 0 35px ${alpha(theme.palette.success.main, 0.3)}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  p: 1.5,
                }}
              >
                <Box
                  component="img"
                  src="/branding/dokan pro logo sm.png"
                  alt="Dokan Pro"
                  sx={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                  }}
                />
              </Box>
            </Box>

            {/* Typography Title Section */}
            <Stack spacing={1} alignItems="center">
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 900,
                  letterSpacing: "-0.03em",
                  color: "#ffffff",
                  textShadow: `0 0 25px ${alpha(theme.palette.success.main, 0.55)}`,
                  textAlign: "center",
                }}
              >
                DOKAN PRO
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: alpha(theme.palette.text.secondary, 0.72),
                  fontWeight: 600,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  fontSize: "0.8rem",
                }}
              >
                Futuristic Billing Command Center
              </Typography>
            </Stack>

            {/* Glowing Linear Progress Bar */}
            <Stack spacing={1.5} sx={{ width: "100%", px: 2 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: alpha(theme.palette.text.secondary, 0.5),
                    fontFamily: "monospace",
                    fontSize: "0.72rem",
                    fontWeight: 700,
                  }}
                >
                  CONSOLE.BOOT_DESK()
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: theme.palette.success.main,
                    fontFamily: "monospace",
                    fontSize: "0.78rem",
                    fontWeight: 800,
                    textShadow: `0 0 10px ${theme.palette.success.main}`,
                  }}
                >
                  {Math.round(progress)}%
                </Typography>
              </Box>

              {/* Progress Track */}
              <Box
                sx={{
                  height: 6,
                  bgcolor: "rgba(255, 255, 255, 0.04)",
                  border: "1px solid rgba(255, 255, 255, 0.03)",
                  borderRadius: 3,
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                {/* Progress Fill */}
                <Box
                  sx={{
                    height: "100%",
                    width: `${progress}%`,
                    background: `linear-gradient(90deg, ${theme.palette.success.main} 0%, ${theme.palette.primary.main} 100%)`,
                    borderRadius: 3,
                    boxShadow: `0 0 8px ${theme.palette.success.main}, 0 0 4px ${theme.palette.primary.main}`,
                    transition: "width 0.08s linear",
                  }}
                />
              </Box>

              {/* Dynamic console printout */}
              <Box
                sx={{
                  minHeight: 18,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: theme.palette.success.main,
                    fontFamily: "monospace",
                    fontSize: "0.74rem",
                    fontWeight: 700,
                    textAlign: "center",
                    letterSpacing: "0.02em",
                  }}
                >
                  &gt;&gt; {hudMessage}
                </Typography>
              </Box>
            </Stack>
          </Stack>
        </Box>
      </motion.div>
    </Box>
  );
};

export default FuturisticSplash;
