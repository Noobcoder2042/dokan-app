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
          "radial-gradient(circle at 22% 20%, rgba(37,99,235,0.45), transparent 34%), radial-gradient(circle at 80% 24%, rgba(236,72,153,0.26), transparent 42%), linear-gradient(180deg, #04070f 0%, #091126 48%, #050914 100%)",
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
            backgroundColor: "rgba(186, 230, 253, 0.82)",
            boxShadow: "0 0 14px rgba(96,165,250,0.85)",
            animation: `floatParticle ${particle.duration}s ease-in-out ${particle.delay}s infinite alternate`,
          }}
        />
      ))}

      <Stack spacing={2} alignItems="center" sx={{ textAlign: "center", px: 2, zIndex: 1 }}>
        <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.65 }}>
          <Box sx={{ width: { xs: 82, md: 100 }, height: { xs: 82, md: 100 }, borderRadius: 3, p: 0.8, bgcolor: "rgba(15,23,42,0.58)", border: "1px solid rgba(148,163,184,0.35)", boxShadow: "0 0 42px rgba(59,130,246,0.45)" }}>
            <Box component="img" src="/branding/dokan pro logo sm.png" alt="Dokan Pro" sx={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 2 }} />
          </Box>
        </motion.div>
        <motion.div initial={{ y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.65, delay: 0.2 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: "-0.03em", color: "#e2e8f0", textShadow: "0 0 20px rgba(96,165,250,0.45)" }}>
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
