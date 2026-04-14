import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Stack,
  Divider,
  Alert,
} from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import { useAuth } from "../context/AuthContext";

const AuthScreen = () => {
  const { loginWithEmail, registerWithEmail, loginWithGoogle } = useAuth();
  const [mode, setMode] = useState("login"); // 'login' or 'register'
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
      // Note: For Google login, you might need a check to see
      // if it's a new user to prompt for their shopName later.
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Box sx={{ display: "grid", placeItems: "center", minHeight: "100vh" }}>
      <Card sx={{ maxWidth: 400, width: "100%", p: 2 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom align="center">
            {mode === "login" ? "Welcome to Dokan Pro" : "Create Your Shop"}
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Stack spacing={2}>
            {mode === "register" && (
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
            )}
            <TextField
              label="Email"
              fullWidth
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
            <TextField
              label="Password"
              type="password"
              fullWidth
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />

            <Button variant="contained" onClick={handleAuth}>
              {mode === "login" ? "Login" : "Register"}
            </Button>

            <Divider>OR</Divider>

            <Button
              variant="outlined"
              startIcon={<GoogleIcon />}
              onClick={handleGoogle}
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
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AuthScreen;
