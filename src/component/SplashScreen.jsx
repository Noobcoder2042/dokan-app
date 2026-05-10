import { Box, Stack, Typography } from "@mui/material";

const SplashScreen = () => {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background:
          "radial-gradient(circle at 16% 18%, rgba(29,78,216,0.32), transparent 34%), radial-gradient(circle at 82% 22%, rgba(15,118,110,0.24), transparent 42%), linear-gradient(180deg, #f8fbff 0%, #eef3f8 100%)",
        overflow: "hidden",
      }}
    >
      <Stack spacing={1.5} alignItems="center" sx={{ textAlign: "center", px: 2 }}>
        <Box
          sx={{
            width: { xs: 76, md: 92 },
            height: { xs: 76, md: 92 },
            borderRadius: 2.5,
            p: 0.8,
            bgcolor: "rgba(255,255,255,0.9)",
            boxShadow: "0 24px 50px rgba(15, 23, 42, 0.16)",
            animation: "splashPop 700ms ease-out",
          }}
        >
          <Box
            component="img"
            src="/branding/dokan pro logo sm.png"
            alt="Dokan Pro"
            sx={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 2 }}
          />
        </Box>
        <Typography
          variant="h4"
          sx={{ fontWeight: 800, letterSpacing: "-0.03em", animation: "fadeUp 800ms ease-out" }}
        >
          Welcome to Dokan Pro
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ maxWidth: 460, animation: "fadeUp 900ms ease-out" }}
        >
          Fast billing, customer memory, and thermal-ready flow for real shop work.
        </Typography>
      </Stack>

      <Box
        sx={{
          "@keyframes splashPop": {
            "0%": { transform: "scale(0.8)", opacity: 0 },
            "100%": { transform: "scale(1)", opacity: 1 },
          },
          "@keyframes fadeUp": {
            "0%": { transform: "translateY(10px)", opacity: 0 },
            "100%": { transform: "translateY(0)", opacity: 1 },
          },
        }}
      />
    </Box>
  );
};

export default SplashScreen;
