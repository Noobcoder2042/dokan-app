import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Card,
  CardContent,
  Grid,
  MenuItem,
  Paper,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import StoreRoundedIcon from "@mui/icons-material/StoreRounded";
import { useShop } from "../context/ShopContext";
import { upsertShopSettings } from "../services/shopData";

const ShopSettings = () => {
  const { activeShopId, shop } = useShop();
  const [form, setForm] = useState(shop);
  const [toastOpen, setToastOpen] = useState(false);

  useEffect(() => {
    setForm(shop);
  }, [shop]);

  const handleChange = (key) => (event) => {
    const value =
      event.target.type === "checkbox"
        ? event.target.checked
        : event.target.value;

    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const handleSave = async () => {
    await upsertShopSettings(activeShopId, {
      name: form.name || "Demo Shop",
      address: form.address || "",
      phone: form.phone || "",
      currency: form.currency || "INR",
      thermalPrinterWidth: form.thermalPrinterWidth || "80mm",
      extraChargesEnabled: form.extraChargesEnabled ?? true,
    });

    setToastOpen(true);
  };

  return (
    <Stack spacing={3}>
      <Paper
        sx={{
          p: { xs: 2.5, md: 3.5 },
          borderRadius: 6,
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.96) 0%, rgba(239,246,255,0.98) 52%, rgba(236,253,245,0.96) 100%)",
          border: "1px solid rgba(148, 163, 184, 0.12)",
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          spacing={2}
        >
          <BoxRow />
          <Button
            variant="contained"
            startIcon={<SaveRoundedIcon />}
            onClick={handleSave}
          >
            Save Settings
          </Button>
        </Stack>
      </Paper>

      <Card>
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          <Grid container spacing={2.5}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Shop Name"
                value={form.name || ""}
                onChange={handleChange("name")}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Shop Phone"
                value={form.phone || ""}
                onChange={handleChange("phone")}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Shop Address"
                value={form.address || ""}
                onChange={handleChange("address")}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Currency"
                value={form.currency || "INR"}
                onChange={handleChange("currency")}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                select
                label="Thermal Printer Width"
                value={form.thermalPrinterWidth || "80mm"}
                onChange={handleChange("thermalPrinterWidth")}
                fullWidth
              >
                <MenuItem value="58mm">58mm</MenuItem>
                <MenuItem value="80mm">80mm</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Snackbar
        open={toastOpen}
        autoHideDuration={3000}
        onClose={() => setToastOpen(false)}
      >
        <Alert severity="success" onClose={() => setToastOpen(false)}>
          Shop settings saved
        </Alert>
      </Snackbar>
    </Stack>
  );
};

const BoxRow = () => (
  <Stack direction="row" spacing={1.5} alignItems="center">
    <Stack
      sx={{
        width: 48,
        height: 48,
        borderRadius: 3,
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(135deg, rgba(29, 78, 216, 1) 0%, rgba(15, 118, 110, 0.95) 100%)",
        color: "white",
      }}
    >
      <StoreRoundedIcon />
    </Stack>
    <div>
      <Typography variant="h4">Shop Settings</Typography>
      <Typography variant="body1" color="text.secondary">
        Configure per-shop identity, printing defaults, and sales metadata.
      </Typography>
    </div>
  </Stack>
);

export default ShopSettings;
