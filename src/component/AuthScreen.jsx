import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  Stack,
  Typography,
} from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import BoltRoundedIcon from "@mui/icons-material/BoltRounded";
import PersonAddAlt1RoundedIcon from "@mui/icons-material/PersonAddAlt1Rounded";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import { useAuth } from "../context/AuthContext";

const AuthScreen = () => {
  const { loginWithGoogle } = useAuth();
  const [error, setError] = useState("");

  const handleGoogle = async () => {
    try {
      await loginWithGoogle();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        px: { xs: 2, md: 4 },
        py: { xs: 3, md: 5 },
      }}
    >
      <Card
        sx={{
          width: "100%",
          maxWidth: 1040,
          borderRadius: { xs: 5, md: 1.5 },
          overflow: "hidden",
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          border: "1px solid rgba(148, 163, 184, 0.18)",
          boxShadow: "0 22px 60px rgba(15, 23, 42, 0.16)",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            p: { xs: 3, md: 6 },
            minHeight: { xs: 320, md: 620 },
            color: "white",
            background:
              "linear-gradient(145deg, #2563eb 0%, #1d4ed8 45%, #1e40af 100%)",
          }}
        >
          <Box
            component="img"
            src="/branding/dokan-pro-logo.png"
            alt="Dokan Pro Logo"
            sx={{
              width: 1, // control size
              display: "block",
              mx: "auto", // center
            }}
          />

          <Typography
            variant="body1"
            sx={{ mt: 2, maxWidth: 440, opacity: 0.95 }}
          >
            Fast billing, customer memory, and thermal-ready printing built for
            real shop workflow.
          </Typography>

          <Stack spacing={2.2} sx={{ mt: 4 }}>
            <Stack direction="row" spacing={1.5}>
              <BoltRoundedIcon
                fontSize="small"
                sx={{ mt: 0.25, fontWeight: 700 }}
              />
              <Typography variant="body1" sx={{ fontWeight: 700 }}>
                Make bills in seconds while staff calls items.
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1.5}>
              <PersonAddAlt1RoundedIcon
                fontSize="small"
                sx={{ mt: 0.25, fontWeight: 700 }}
              />
              <Typography variant="body1" sx={{ fontWeight: 700 }}>
                Auto-fill customer details from previous history.
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1.5}>
              <DashboardRoundedIcon
                fontSize="small"
                sx={{ mt: 0.25, fontWeight: 700 }}
              />
              <Typography variant="body1" sx={{ fontWeight: 700 }}>
                Track daily sales with a clean smart dashboard.
              </Typography>
            </Stack>
          </Stack>

          <Box
            component="img"
            src="/branding/dokan-pro-mockup.png"
            alt="Dokan Pro Mockup"
            sx={{
              mt: 3,
              width: "100%",
              maxWidth: 420,
              borderRadius: 1.5,
              border: "1px solid rgba(255,255,255,0.2)",
              boxShadow: "0 18px 32px rgba(15, 23, 42, 0.35)",
              display: { xs: "none", md: "block" },
            }}
          />
        </Box>

        <Box
          sx={{
            p: { xs: 2.5, sm: 3.5, md: 4.5 },
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.96) 100%)",
            display: "flex",
            alignItems: "center",
          }}
        >
          <Box sx={{ width: "100%" }}>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              Welcome to Dokan Pro
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 1, mb: 3.5 }}
            >
              Sign in with Google to access your billing workspace.
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

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

              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ textAlign: "center", pt: 1 }}
              >
                Dokan Pro Billing v1.0
              </Typography>
            </Stack>
          </Box>
        </Box>
      </Card>
    </Box>
  );
};

export default AuthScreen;
