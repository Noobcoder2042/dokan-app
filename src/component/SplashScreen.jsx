import { Box, Stack, Typography } from "@mui/material";
import { motion } from "framer-motion";

const particles = Array.from({ length: 26 }).map((_, index) => ({
  id: index,
  left: `${Math.random() * 100}%`,
  top: `${Math.random() * 100}%`,
  size: 2 + Math.round(Math.random() * 5),
  delay: Math.random() * 2.2,
  duration: 2.4 + Math.random() * 2.1,
}));

const SplashScreen = () => {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        position: "relative",
        overflow: "hidden",
        background:
          "radial-gradient(circle at 22% 20%, rgba(34,197,94,0.32), transparent 34%), radial-gradient(circle at 80% 24%, rgba(22,163,74,0.18), transparent 42%), linear-gradient(180deg, #0a0f0d 0%, #0d1411 48%, #0a0f0d 100%)",
      }}
    >
      {particles.map((particle) => (
        <Box
          key={particle.id}
          sx={{
            position: "absolute",
            left: particle.left,
            top: particle.top,
            width: particle.size,
            height: particle.size,
            borderRadius: "50%",
            backgroundColor: "rgba(134, 239, 172, 0.82)",
            boxShadow: "0 0 14px rgba(74,222,128,0.75)",
            animation: `floatParticle ${particle.duration}s ease-in-out ${particle.delay}s infinite alternate`,
          }}
        />
      ))}

      <Stack spacing={2} alignItems="center" sx={{ textAlign: "center", px: 2, zIndex: 1 }}>
        <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.65 }}>
          <Box
            sx={{
              width: { xs: 128, md: 152 },
              height: { xs: 128, md: 152 },
              borderRadius: 3,
              p: { xs: 2, md: 2.5 },
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "rgba(18,26,22,0.72)",
              border: "1px solid rgba(74,222,128,0.28)",
              boxShadow: "0 0 42px rgba(34,197,94,0.35)",
            }}
          >
            <Box
              component="img"
              src="/branding/dokan pro logo sm.png"
              alt="Dokan Pro"
              sx={{
                width: "100%",
                height: "100%",
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
                display: "block",
              }}
            />
          </Box>
        </motion.div>
        <motion.div initial={{ y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.65, delay: 0.2 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: "-0.03em", color: "#e2e8f0", textShadow: "0 0 20px rgba(74,222,128,0.4)" }}>
            Welcome to Dokan Pro
          </Typography>
        </motion.div>
        <motion.div initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.7, delay: 0.34 }}>
          <Typography variant="body1" sx={{ maxWidth: 500, color: "rgba(226,232,240,0.78)" }}>
            Launching your futuristic billing command center...
          </Typography>
        </motion.div>
      </Stack>

      <Box
        sx={{
          "@keyframes floatParticle": {
            "0%": { transform: "translateY(0px) scale(0.95)", opacity: 0.65 },
            "100%": { transform: "translateY(-20px) scale(1.16)", opacity: 1 },
          },
        }}
      />
    </Box>
  );
};

export default SplashScreen;
