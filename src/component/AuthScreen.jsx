import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  Checkbox,
  Divider,
  FormControlLabel,
  Link,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import BoltRoundedIcon from "@mui/icons-material/BoltRounded";
import PersonAddAlt1RoundedIcon from "@mui/icons-material/PersonAddAlt1Rounded";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import { useAuth } from "../context/AuthContext";

const AuthScreen = () => {
  const { loginWithEmail, registerWithEmail, loginWithGoogle } = useAuth();
  const [mode, setMode] = useState("login");
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    shopName: "",
  });

  const handleAuth = async () => {
    setError("");
    try {
      if (mode === "login") {
        await loginWithEmail(formData.email, formData.password);
      } else {
        await registerWithEmail(formData.email, formData.password, {
          name: formData.name,
          shopName: formData.shopName,
        });
      }
    } catch (err) {
      setError(err.message);
    }
  };

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
              {mode === "login" ? "Welcome Back" : "Create Account"}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 1, mb: 3.5 }}
            >
              {mode === "login"
                ? "Log in to your account to continue"
                : "Create your account to start billing with Dokan Pro"}
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Stack spacing={2}>
              {mode === "register" ? (
                <>
                  <TextField
                    label="Owner Name"
                    fullWidth
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                  <TextField
                    label="Shop Name"
                    fullWidth
                    onChange={(e) =>
                      setFormData({ ...formData, shopName: e.target.value })
                    }
                  />
                </>
              ) : null}

              <TextField
                label="Username or Email"
                placeholder="e.g. owner@shop.com"
                fullWidth
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
              <TextField
                label="Password"
                type="password"
                placeholder="********"
                fullWidth
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />

              {mode === "login" ? (
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <FormControlLabel
                    control={<Checkbox size="small" />}
                    label={<Typography variant="body2">Remember me</Typography>}
                  />
                  <Link
                    href="#"
                    underline="hover"
                    sx={{ fontWeight: 600, fontSize: 14 }}
                    onClick={(event) => event.preventDefault()}
                  >
                    Forgot password?
                  </Link>
                </Stack>
              ) : null}

              <Button variant="contained" onClick={handleAuth} size="large">
                {mode === "login" ? "Secure Login" : "Register"}
              </Button>

              <Divider>OR</Divider>

              <Button
                variant="outlined"
                startIcon={<GoogleIcon />}
                onClick={handleGoogle}
                size="large"
                fullWidth
              >
                Continue with Google
              </Button>

              <Button
                variant="text"
                onClick={() => setMode(mode === "login" ? "register" : "login")}
              >
                {mode === "login"
                  ? "Need a shop? Register"
                  : "Have an account? Login"}
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
