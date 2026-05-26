import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid,
  MenuItem,
  Paper,
  Snackbar,
  Stack,
  Switch,
  TextField,
  Typography,
  useTheme,
  alpha,
} from "@mui/material";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import StoreRoundedIcon from "@mui/icons-material/StoreRounded";
import DeleteForeverRoundedIcon from "@mui/icons-material/DeleteForeverRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import UploadFileRoundedIcon from "@mui/icons-material/UploadFileRounded";
import jsPDF from "jspdf";
import "jspdf-autotable";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import {
  DEFAULT_WHATSAPP_MESSAGE,
  WHATSAPP_BILL_SHARE_MODES,
} from "../utils/whatsappUtils";
import { useShop } from "../context/ShopContext";
import { useAuth } from "../context/AuthContext";
import { useUIExperience, THEME_PRESETS } from "../context/UIExperienceContext";
import {
  getShopBackupData,
  importShopBackupData,
  upsertShopSettings,
  wipeShopData,
} from "../services/shopData";

const toCsv = (rows) => {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const escape = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
  const lines = [headers.join(",")];
  rows.forEach((row) => {
    lines.push(headers.map((key) => escape(row[key])).join(","));
  });
  return lines.join("\n");
};

const sanitizeFileName = (value) =>
  String(value || "bill")
    .split("")
    .filter((char) => char.charCodeAt(0) >= 32)
    .join("")
    .replace(/[<>:"/\\|?*]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 60);

// Builds a full bill PDF blob so backup ZIP can include printable per-bill files.
const createBillPdfBlob = (bill) => {
  const doc = new jsPDF("landscape", "mm", [148, 210]);

  doc.setFontSize(10);
  doc.text(`Date - ${bill.date || "-"}`, 175, 10);
  doc.text(`${bill.shopName || "Shop"}`, 10, 10);
  doc.text(`Customer Name: ${bill.name || "-"}`, 10, 15);
  doc.text(`Customer Phone: ${bill.phoneNumber || "-"}`, 10, 20);
  if (bill.address) {
    doc.text(`Address: ${bill.address}`, 10, 25);
  }

  const columns = [
    { header: "No.", dataKey: "no" },
    { header: "Item", dataKey: "item" },
    { header: "Price", dataKey: "price" },
    { header: "Qty", dataKey: "qty" },
    { header: "Total", dataKey: "total" },
  ];

  const rows = (bill.items || []).map((item, index) => ({
    no: String(index + 1),
    item: item.name || "-",
    price: `${item.price || 0} ${item.priceUnit || "piece"}`,
    qty: `${item.quantity || 0} ${item.quantityUnit || "piece"}`,
    total: Number(item.totalPrice || 0).toFixed(2),
  }));

  const extraRows = bill?.extraCharges
    ? [
        { label: "Colie", value: Number(bill.extraCharges.rickshaw || 0) },
        { label: "Bus", value: Number(bill.extraCharges.bus || 0) },
        { label: "Other", value: Number(bill.extraCharges.other || 0) },
      ]
        .filter((entry) => entry.value > 0)
        .map((entry, index) => ({
          no: `E${index + 1}`,
          item: `${entry.label} Cost`,
          price: "-",
          qty: "-",
          total: Number(entry.value || 0).toFixed(2),
        }))
    : [];

  const allRows = [...rows, ...extraRows];

  doc.autoTable({
    head: [columns.map((col) => col.header)],
    body: allRows.map((row) => columns.map((col) => row[col.dataKey])),
    startY: bill.address ? 30 : 25,
    styles: {
      fontSize: 10,
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
    },
    headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0] },
    tableLineColor: [0, 0, 0],
    tableLineWidth: 0.1,
    margin: { top: 10, left: 10, right: 10, bottom: 10 },
    rowHeight: 5,
  });

  const finalY = doc.lastAutoTable?.finalY || 20;
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(
    `Grand Total - RS. ${Math.round(Number(bill.totalAmount || 0))}`,
    140,
    finalY + 8
  );

  return doc.output("blob");
};

const ShopSettings = () => {
  const theme = useTheme();
  const { activeShopId, shop } = useShop();
  const { user } = useAuth();
  const {
    themeMode,
    toggleThemeMode,
    soundEnabled,
    setSound,
    immersiveEnabled,
    setImmersive,
    themePreset,
    setThemePreset,
    playSound
  } = useUIExperience();
  const [form, setForm] = useState(shop);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("Shop settings saved");
  const [toastSeverity, setToastSeverity] = useState("success");
  const [wipeDialogOpen, setWipeDialogOpen] = useState(false);
  const [wipeScope, setWipeScope] = useState("bills");
  const [wiping, setWiping] = useState(false);
  const [importing, setImporting] = useState(false);

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
      thermalPrinterWidth: "80mm",
      extraChargesEnabled: form.extraChargesEnabled ?? true,
      gstEnabled: form.gstEnabled ?? false,
      gstRate: Number(form.gstRate || 18),
      whatsappMessage: form.whatsappMessage || DEFAULT_WHATSAPP_MESSAGE,
      whatsappBillShareMode:
        form.whatsappBillShareMode || WHATSAPP_BILL_SHARE_MODES.TOTAL_TEXT,
    });

    setToastMessage("Shop settings saved");
    setToastSeverity("success");
    setToastOpen(true);
  };

  // Creates one ZIP archive containing all export assets for the requested scope.
  const downloadBackupFiles = async (backupData, scope = "all") => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const billsRows = backupData.bills.map((bill) => ({
      id: bill.id,
      date: bill.date || "",
      time: bill.time || "",
      customerName: bill.name || "",
      phoneNumber: bill.phoneNumber || "",
      address: bill.address || "",
      totalAmount: Number(bill.totalAmount || 0),
      subtotalAmount: Number(bill.subtotalAmount || 0),
      extraTotal: Number(bill?.extraCharges?.total || 0),
      createdAt: bill.createdAt || "",
    }));
    const customersRows = backupData.customers.map((customer) => ({
      id: customer.id,
      name: customer.name || "",
      phoneNumber: customer.phoneNumber || "",
      address: customer.address || "",
      lastBilledAt: customer.lastBilledAt || "",
      updatedAt: customer.updatedAt || "",
    }));
    const itemRows = backupData.inventory.rootItems.map((item) => ({
      id: item.id,
      name: item.name || "",
      price: Number(item.price || 0),
      stockQty: Number(item.stockQty || 0),
      stockUnit: item.stockUnit || "",
      code: item.code || "",
      createdAt: item.createdAt || "",
      updatedAt: item.updatedAt || "",
    }));

    const zip = new JSZip();
    const backupFolder = zip.folder("shop-backup");
    const csvFolder = backupFolder.folder("csv");
    const billsPdfFolder = backupFolder.folder("bills-pdf");

    if (scope === "all" || scope === "bills") {
      csvFolder.file(`shop-bills-${timestamp}.csv`, toCsv(billsRows));
    }
    if (scope === "all" || scope === "customerInventory") {
      csvFolder.file(`shop-customers-${timestamp}.csv`, toCsv(customersRows));
      csvFolder.file(`shop-items-${timestamp}.csv`, toCsv(itemRows));
    }

    const fullJson = JSON.stringify(backupData, null, 2);
    backupFolder.file(`shop-full-backup-${timestamp}.json`, fullJson);

    const doc = new jsPDF("p", "mm", "a4");
    doc.setFontSize(16);
    doc.text("Shop Backup Summary", 14, 16);
    doc.setFontSize(11);
    doc.text(`Shop: ${backupData?.shop?.name || "Shop"}`, 14, 24);
    doc.text(`Exported At: ${backupData.exportedAt}`, 14, 30);
    doc.text(`Scope: ${scope}`, 14, 36);
    doc.text(`Bills: ${backupData.bills.length}`, 14, 42);
    doc.text(`Customers: ${backupData.customers.length}`, 14, 48);
    doc.text(`Items: ${backupData.inventory.rootItems.length}`, 14, 54);
    doc.text(
      `Total Sales: ${backupData.bills
        .reduce((sum, bill) => sum + Number(bill.totalAmount || 0), 0)
        .toFixed(2)}`,
      14,
      60
    );
    const summaryPdfBlob = doc.output("blob");
    backupFolder.file(`shop-backup-summary-${timestamp}.pdf`, summaryPdfBlob);

    if ((scope === "all" || scope === "bills") && backupData.bills.length) {
      for (const bill of backupData.bills) {
        const billBlob = createBillPdfBlob(bill);
        const baseName = sanitizeFileName(
          `${bill.date || "no-date"}-${bill.name || "customer"}-${bill.id || "bill"}`
        );
        billsPdfFolder.file(`${baseName}.pdf`, billBlob);
      }
    }

    const zipBlob = await zip.generateAsync({ type: "blob" });
    saveAs(zipBlob, `shop-${scope}-backup-${timestamp}.zip`);
  };

  // Safety sequence: backup first, delete second.
  const handleBackupAndWipe = async () => {
    setWiping(true);
    try {
      const backupData = await getShopBackupData(activeShopId, user?.uid, wipeScope);
      await downloadBackupFiles(backupData, wipeScope);
      await wipeShopData(activeShopId, user?.uid, wipeScope);

      const localPrefixes = [
        "savedBills-",
        "dashboard-show-stats-",
        "active-shop-id-",
      ];
      Object.keys(localStorage).forEach((key) => {
        if (localPrefixes.some((prefix) => key.startsWith(prefix))) {
          localStorage.removeItem(key);
        }
      });

      setWipeDialogOpen(false);
      setToastMessage(
        wipeScope === "bills"
          ? "Bills backup done and bills deleted."
          : "Customer/Inventory backup done and customer+inventory deleted."
      );
      setToastSeverity("success");
      setToastOpen(true);
    } catch (error) {
      console.error(error);
      setToastMessage("Backup/Delete failed. Please try again.");
      setToastSeverity("error");
      setToastOpen(true);
    } finally {
      setWiping(false);
    }
  };

  // Imports from backup JSON and returns duplicate-safe restore counts.
  const handleImportBackup = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setImporting(true);
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const report = await importShopBackupData(activeShopId, user?.uid, parsed);
      setToastMessage(
        `Import done. Bills ${report.imported.bills}/${report.skipped.bills} skipped, Customers ${report.imported.customers}/${report.skipped.customers} skipped, Items ${report.imported.items}/${report.skipped.items} skipped`
      );
      setToastSeverity("success");
      setToastOpen(true);
    } catch (error) {
      console.error(error);
      setToastMessage("Import failed. Please use valid shop-full-backup JSON.");
      setToastSeverity("error");
      setToastOpen(true);
    } finally {
      setImporting(false);
    }
  };

  return (
    <Stack spacing={3}>
      <Paper
        sx={{
          p: { xs: 2.5, md: 3.5 },
          borderRadius: 3,
          background: themeMode === "dark"
            ? `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)} 0%, ${alpha(theme.palette.primary.main, 0.08)} 52%, ${alpha(theme.palette.background.paper, 0.95)} 100%)`
            : `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.96)} 0%, ${alpha(theme.palette.primary.main, 0.06)} 52%, ${alpha(theme.palette.background.paper, 0.96)} 100%)`,
          border: `1px solid ${theme.palette.divider}`,
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
          <Stack spacing={2}>
            <div>
              <Typography variant="h6">Experience Settings</Typography>
              <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                Control premium visual mode, select brand color presets, and set acoustic themes for your workspace.
              </Typography>
            </div>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <FormControlLabel
                control={<Switch checked={themeMode === "dark"} onChange={toggleThemeMode} />}
                label={themeMode === "dark" ? "Neon Dark Theme" : "Premium Light Theme"}
              />
              <FormControlLabel
                control={<Switch checked={soundEnabled} onChange={(event) => setSound(event.target.checked)} />}
                label="UI Sound Effects"
              />
              <FormControlLabel
                control={<Switch checked={immersiveEnabled} onChange={(event) => setImmersive(event.target.checked)} />}
                label="Immersive Startup Screen"
              />
            </Stack>

            <Typography variant="subtitle1" sx={{ mt: 1, fontWeight: 700 }}>
              Brand Theme Presets
            </Typography>
            <Grid container spacing={2}>
              {Object.entries(THEME_PRESETS).map(([key, preset]) => {
                const isSelected = themePreset === key;
                const colors = preset.colors[themeMode];
                return (
                  <Grid item xs={12} sm={6} md={2.4} key={key}>
                    <Paper
                      onClick={() => {
                        setThemePreset(key);
                        playSound?.("click");
                      }}
                      sx={{
                        p: 2,
                        borderRadius: 3,
                        cursor: "pointer",
                        border: isSelected 
                          ? `2px solid ${colors.primary}` 
                          : "2px solid rgba(148, 163, 184, 0.12)",
                        boxShadow: isSelected 
                          ? `0 8px 24px ${colors.primary}22` 
                          : "none",
                        backgroundColor: themeMode === "dark" ? "rgba(255,255,255,0.02)" : "#ffffff",
                        transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
                        transform: isSelected ? "translateY(-4px)" : "none",
                        "&:hover": {
                          borderColor: colors.primary,
                          boxShadow: `0 6px 20px ${colors.primary}15`,
                          transform: "translateY(-4px)",
                        }
                      }}
                    >
                      <Stack spacing={1.5} alignItems="center">
                        <Stack direction="row" spacing={0.75} justifyContent="center">
                          <Box 
                            sx={{ 
                              width: 20, 
                              height: 20, 
                              borderRadius: "50%", 
                              bgcolor: colors.primary,
                              boxShadow: `0 0 10px ${colors.primary}66`
                            }} 
                          />
                          <Box 
                            sx={{ 
                              width: 20, 
                              height: 20, 
                              borderRadius: "50%", 
                              bgcolor: colors.secondary 
                            }} 
                          />
                          <Box 
                            sx={{ 
                              width: 20, 
                              height: 20, 
                              borderRadius: "50%", 
                              bgcolor: colors.success 
                            }} 
                          />
                        </Stack>
                        <Typography 
                          variant="body2" 
                          align="center" 
                          sx={{ 
                            fontWeight: isSelected ? 800 : 600,
                            color: isSelected ? "text.primary" : "text.secondary" 
                          }}
                        >
                          {preset.name}
                        </Typography>
                      </Stack>
                    </Paper>
                  </Grid>
                );
              })}
            </Grid>
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          <Stack spacing={1.5}>
            <Typography variant="h6">Data Actions</Typography>
            <Typography color="text.secondary">
              Manage backup and delete separately for bills and customer/inventory.
            </Typography>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1} flexWrap="wrap">
              <Button
                variant="text"
                size="small"
                startIcon={<DownloadRoundedIcon />}
                onClick={async () => {
                  try {
                    const backupData = await getShopBackupData(activeShopId, user?.uid, "bills");
                    await downloadBackupFiles(backupData, "bills");
                    setToastMessage("Bills backup downloaded");
                    setToastSeverity("success");
                    setToastOpen(true);
                  } catch (error) {
                    console.error(error);
                    setToastMessage("Bills backup failed");
                    setToastSeverity("error");
                    setToastOpen(true);
                  }
                }}
              >
                Backup Bills
              </Button>
              <Button
                variant="text"
                size="small"
                color="error"
                startIcon={<DeleteForeverRoundedIcon />}
                onClick={() => {
                  setWipeScope("bills");
                  setWipeDialogOpen(true);
                }}
              >
                Backup + Delete Bills
              </Button>
              <Button
                variant="text"
                size="small"
                startIcon={<DownloadRoundedIcon />}
                onClick={async () => {
                  try {
                    const backupData = await getShopBackupData(
                      activeShopId,
                      user?.uid,
                      "customerInventory"
                    );
                    await downloadBackupFiles(backupData, "customerInventory");
                    setToastMessage("Customer/Inventory backup downloaded");
                    setToastSeverity("success");
                    setToastOpen(true);
                  } catch (error) {
                    console.error(error);
                    setToastMessage("Customer/Inventory backup failed");
                    setToastSeverity("error");
                    setToastOpen(true);
                  }
                }}
              >
                Backup Customer+Inventory
              </Button>
              <Button
                variant="text"
                size="small"
                color="error"
                startIcon={<DeleteForeverRoundedIcon />}
                onClick={() => {
                  setWipeScope("customerInventory");
                  setWipeDialogOpen(true);
                }}
              >
                Backup + Delete Customer+Inventory
              </Button>
              <Button
                variant="text"
                size="small"
                component="label"
                disabled={importing}
                startIcon={<UploadFileRoundedIcon />}
              >
                {importing ? "Importing..." : "Import Backup JSON"}
                <input
                  hidden
                  type="file"
                  accept="application/json,.json"
                  onChange={handleImportBackup}
                />
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

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
              <TextField label="Thermal Printer Width" value="80mm" fullWidth disabled />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={Boolean(form.gstEnabled)}
                    onChange={handleChange("gstEnabled")}
                  />
                }
                label="GST Mode"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="GST Rate (%)"
                type="number"
                value={form.gstRate ?? 18}
                onChange={handleChange("gstRate")}
                fullWidth
                disabled={!form.gstEnabled}
                helperText="GST is calculated on item subtotal before extra charges."
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card>
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          <Stack spacing={2}>
            <Box>
              <Typography variant="h6">WhatsApp Message</Typography>
              <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                Set the message used from Billing and Dashboard WhatsApp buttons.
              </Typography>
            </Box>

            <TextField
              label="Message Template"
              value={form.whatsappMessage || DEFAULT_WHATSAPP_MESSAGE}
              onChange={handleChange("whatsappMessage")}
              fullWidth
              multiline
              minRows={4}
              helperText="Use {customerName}, {shopName}, {total}, {date}, or {customerPhone} where needed."
            />

            <TextField
              select
              label="Bill Sharing Style"
              value={form.whatsappBillShareMode || WHATSAPP_BILL_SHARE_MODES.TOTAL_TEXT}
              onChange={handleChange("whatsappBillShareMode")}
              fullWidth
              helperText="Browsers cannot attach a PDF automatically. PDF mode downloads the bill first, then opens WhatsApp."
            >
              <MenuItem value={WHATSAPP_BILL_SHARE_MODES.TOTAL_TEXT}>
                Send total in WhatsApp text
              </MenuItem>
              <MenuItem value={WHATSAPP_BILL_SHARE_MODES.PDF_BILL}>
                Download PDF bill before WhatsApp
              </MenuItem>
            </TextField>
          </Stack>
        </CardContent>
      </Card>

      <Snackbar
        open={toastOpen}
        autoHideDuration={3000}
        onClose={() => setToastOpen(false)}
      >
        <Alert severity={toastSeverity} onClose={() => setToastOpen(false)}>
          {toastMessage}
        </Alert>
      </Snackbar>

      <Dialog open={wipeDialogOpen} onClose={() => setWipeDialogOpen(false)}>
        <DialogTitle>Danger Zone</DialogTitle>
        <DialogContent>
          <Stack spacing={1}>
            <Typography>
              {wipeScope === "bills"
                ? "This will backup bills and then permanently delete only bills + local bill drafts."
                : "This will backup customer/inventory and then permanently delete customers and inventory."}
            </Typography>
            <Typography sx={{ fontWeight: 700 }}>
              Are you sure you want to continue?
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWipeDialogOpen(false)} disabled={wiping}>
            Cancel
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleBackupAndWipe}
            disabled={wiping}
          >
            {wiping ? "Processing..." : "Yes, Backup & Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

const BoxRow = () => {
  const theme = useTheme();
  return (
    <Stack direction="row" spacing={1.5} alignItems="center">
      <Stack
        sx={{
          width: 48,
          height: 48,
          borderRadius: 1.5,
          alignItems: "center",
          justifyContent: "center",
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.success.main} 100%)`,
          color: "white",
          boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.25)}`,
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
};

export default ShopSettings;

