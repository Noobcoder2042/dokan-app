import React, { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Collapse,
  Divider,
  Grid,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import PrintRoundedIcon from "@mui/icons-material/PrintRounded";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import BookmarkBorderRoundedIcon from "@mui/icons-material/BookmarkBorderRounded";
import UndoRoundedIcon from "@mui/icons-material/UndoRounded";
import RedoRoundedIcon from "@mui/icons-material/RedoRounded";
import ReceiptRoundedIcon from "@mui/icons-material/ReceiptRounded";
import ClearRoundedIcon from "@mui/icons-material/ClearRounded";
import LocalShippingRoundedIcon from "@mui/icons-material/LocalShippingRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";

/**
 * MobileBillSummary
 * Clean POS checkout review screen for mobile.
 * Presents customer snapshot, itemized breakdown, taxes, total, and 48px action buttons.
 */
const MobileBillSummary = ({
  customerName = "",
  customerPhone = "",
  customerAddress = "",
  onEditCustomer,
  items = [],
  onEditItem,
  subtotal = 0,
  gstEnabled = false,
  gstRate = 0,
  gstAmount = 0,
  extraChargesTotal = 0,
  extraCharges = { rickshaw: "", bus: "", other: "" },
  onExtraChargeChange,
  grandTotal = 0,
  activeBillMeta = null,
  onGenerateBill,
  onThermalPrintOriginal,
  onThermalPrintPrivacy,
  onSaveDraft,
  onSendWhatsApp,
  canGenerate = false,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  savedBills = [],
  onLoadBill,
  onDeleteBill,
  verifiedItems = [],
  onToggleVerifiedItem,
  onToggleCheckAll,
}) => {
  const theme = useTheme();
  const verifiedCount = verifiedItems.filter(Boolean).length;
  const isAllVerified = items.length > 0 && verifiedCount === items.length;
  const [showExtraInputs, setShowExtraInputs] = useState(
    Boolean(
      Number(extraCharges?.rickshaw || 0) > 0 ||
        Number(extraCharges?.bus || 0) > 0 ||
        Number(extraCharges?.other || 0) > 0
    )
  );

  return (
    <Stack spacing={2}>
      {/* Active Bill Edit Badge if applicable */}
      {activeBillMeta?.id && (
        <Paper
          elevation={0}
          sx={{
            p: 1.5,
            borderRadius: 2.5,
            bgcolor: alpha(theme.palette.warning.main, 0.1),
            border: `1px solid ${alpha(theme.palette.warning.main, 0.3)}`,
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="caption" sx={{ fontWeight: 800, color: "warning.dark" }}>
              EDITING SAVED BILL
            </Typography>
            <Chip
              size="small"
              label={`ID: ${activeBillMeta.id}`}
              sx={{ height: 22, fontWeight: 700, fontSize: "0.72rem" }}
            />
          </Stack>
        </Paper>
      )}

      {/* Customer Snapshot Card */}
      <Card
        elevation={0}
        sx={{
          borderRadius: 2.5,
          border: `1px solid ${theme.palette.divider}`,
          bgcolor: alpha(theme.palette.background.paper, 0.75),
        }}
      >
        <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}
              >
                Customer
              </Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.25, mt: 0.25 }} noWrap>
                {customerName || "Walk-in Customer"}
              </Typography>
              {customerPhone && (
                <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.25 }}>
                  <PhoneRoundedIcon sx={{ fontSize: 13, color: "text.secondary" }} />
                  <Typography variant="body2" color="text.secondary">
                    {customerPhone}
                  </Typography>
                </Stack>
              )}
            </Box>

            <Button
              size="small"
              variant="outlined"
              color="inherit"
              onClick={onEditCustomer}
              startIcon={<EditRoundedIcon sx={{ fontSize: 14 }} />}
              sx={{
                minHeight: 36,
                px: 1.25,
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 700,
                fontSize: "0.78rem",
                borderColor: theme.palette.divider,
              }}
            >
              Change
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Items Review Card */}
      <Card
        elevation={0}
        sx={{
          borderRadius: 2.5,
          border: `1px solid ${theme.palette.divider}`,
          bgcolor: alpha(theme.palette.background.paper, 0.75),
        }}
      >
        <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}
              >
                Items ({items.length})
              </Typography>
              {items.length > 0 && (
                <Chip
                  size="small"
                  color={isAllVerified ? "success" : "default"}
                  label={`${verifiedCount}/${items.length} Checked`}
                  sx={{ height: 20, fontSize: "0.68rem", fontWeight: 800 }}
                />
              )}
            </Stack>

            {items.length > 0 && (
              <Button
                size="small"
                variant="text"
                onClick={onToggleCheckAll}
                sx={{
                  minHeight: 32,
                  py: 0.25,
                  px: 1,
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  textTransform: "none",
                }}
              >
                {isAllVerified ? "Uncheck All" : "Check All"}
              </Button>
            )}
          </Stack>

          <Stack spacing={0.75} divider={<Divider sx={{ borderStyle: "dashed" }} />}>
            {items.map((item, index) => {
              const isVerified = Boolean(verifiedItems[index]);
              return (
                <Stack
                  key={index}
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  onClick={() => onToggleVerifiedItem?.(index)}
                  sx={{
                    cursor: "pointer",
                    py: 0.5,
                    px: 0.75,
                    borderRadius: 2,
                    bgcolor: isVerified
                      ? alpha(theme.palette.success.main, 0.08)
                      : "transparent",
                    transition: "background-color 0.2s ease",
                  }}
                >
                  <Stack direction="row" spacing={0.75} alignItems="center" sx={{ minWidth: 0, flexGrow: 1, pr: 1 }}>
                    <Checkbox
                      checked={isVerified}
                      onChange={(e) => {
                        e.stopPropagation();
                        onToggleVerifiedItem?.(index);
                      }}
                      color="success"
                      size="small"
                      sx={{ p: 0.5 }}
                    />
                    <Box sx={{ minWidth: 0 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 750,
                          lineHeight: 1.2,
                          textDecoration: isVerified ? "none" : "none",
                        }}
                        noWrap
                      >
                        {item.name}
                      </Typography>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="caption" color="text.secondary">
                          {item.quantity} {item.quantityUnit === "dozen" ? "doz" : "pc"} × ₹
                          {Number(item.price || 0).toFixed(2)}
                        </Typography>
                        {isVerified && (
                          <Typography
                            variant="caption"
                            sx={{ fontWeight: 800, color: "success.main", fontSize: "0.68rem" }}
                          >
                            ✓ Verified
                          </Typography>
                        )}
                      </Stack>
                    </Box>
                  </Stack>

                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 800,
                      whiteSpace: "nowrap",
                      color: isVerified ? "success.main" : "text.primary",
                    }}
                  >
                    ₹{Number(item.totalPrice || 0).toFixed(2)}
                  </Typography>
                </Stack>
              );
            })}
          </Stack>
        </CardContent>
      </Card>

      {/* Payment & Totals Breakdown Card */}
      <Card
        elevation={0}
        sx={{
          borderRadius: 2.5,
          border: `1px solid ${theme.palette.divider}`,
          bgcolor: alpha(theme.palette.background.paper, 0.75),
        }}
      >
        <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", display: "block", mb: 1.5 }}
          >
            Bill Breakdown
          </Typography>

          <Stack spacing={1}>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">
                Subtotal
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                ₹{subtotal.toFixed(2)}
              </Typography>
            </Stack>

            {gstEnabled && (
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  GST ({gstRate}%)
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  ₹{gstAmount.toFixed(2)}
                </Typography>
              </Stack>
            )}

            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" color="text.secondary">
                Extra Charges
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  ₹{extraChargesTotal.toFixed(2)}
                </Typography>
                <Button
                  size="small"
                  variant="text"
                  onClick={() => setShowExtraInputs((prev) => !prev)}
                  sx={{
                    minHeight: 28,
                    py: 0.25,
                    px: 0.75,
                    fontSize: "0.72rem",
                    textTransform: "none",
                    fontWeight: 700,
                  }}
                >
                  {showExtraInputs ? "Done" : "+ Edit"}
                </Button>
              </Stack>
            </Stack>

            <Collapse in={showExtraInputs}>
              <Box
                sx={{
                  p: 1.5,
                  mt: 0.5,
                  mb: 1,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.action.hover, 0.05),
                  border: `1px dashed ${theme.palette.divider}`,
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 700,
                    display: "block",
                    mb: 1,
                    color: "text.secondary",
                  }}
                >
                  Delivery & Transport Charges
                </Typography>
                <Grid container spacing={1}>
                  <Grid item xs={4}>
                    <TextField
                      size="small"
                      label="Colie"
                      type="number"
                      value={extraCharges?.rickshaw || ""}
                      onChange={onExtraChargeChange?.("rickshaw")}
                      fullWidth
                      inputProps={{
                        style: { fontSize: "0.85rem", padding: "8px 10px" },
                      }}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      size="small"
                      label="Bus"
                      type="number"
                      value={extraCharges?.bus || ""}
                      onChange={onExtraChargeChange?.("bus")}
                      fullWidth
                      inputProps={{
                        style: { fontSize: "0.85rem", padding: "8px 10px" },
                      }}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      size="small"
                      label="Other"
                      type="number"
                      value={extraCharges?.other || ""}
                      onChange={onExtraChargeChange?.("other")}
                      fullWidth
                      inputProps={{
                        style: { fontSize: "0.85rem", padding: "8px 10px" },
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>
            </Collapse>

            <Divider sx={{ my: 0.5 }} />

            <Stack direction="row" justifyContent="space-between" alignItems="baseline">
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                Total Amount
              </Typography>
              <Typography
                variant="h5"
                sx={{ fontWeight: 900, color: "primary.main", letterSpacing: "-0.02em" }}
              >
                ₹{grandTotal}
              </Typography>
            </Stack>

            {items.length > 0 && (
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{
                  pt: 1,
                  mt: 0.5,
                  borderTop: `1px dashed ${theme.palette.divider}`,
                }}
              >
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Item Checklist
                </Typography>
                <Chip
                  size="small"
                  color={isAllVerified ? "success" : "default"}
                  label={`${verifiedCount} of ${items.length} verified`}
                  sx={{ height: 22, fontSize: "0.72rem", fontWeight: 750 }}
                />
              </Stack>
            )}
          </Stack>
        </CardContent>
      </Card>

      {/* Action Buttons Grid with 48px touch targets */}
      <Stack spacing={1.5} sx={{ pt: 1, pb: 2 }}>
        {/* Main PDF Generation Button */}
        <Button
          fullWidth
          variant="contained"
          size="large"
          disabled={!canGenerate}
          startIcon={<ReceiptRoundedIcon />}
          onClick={onGenerateBill}
          sx={{
            minHeight: 50,
            borderRadius: 2.5,
            fontWeight: 850,
            fontSize: "0.95rem",
            textTransform: "none",
            boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.35)}`,
          }}
        >
          {activeBillMeta?.id ? "Reprint Updated Bill" : "Generate & Print Bill"}
        </Button>

        {/* Thermal Print Row */}
        <Stack direction="row" spacing={1}>
          <Button
            fullWidth
            variant="outlined"
            disabled={!canGenerate}
            startIcon={<PrintRoundedIcon />}
            onClick={onThermalPrintOriginal}
            sx={{
              minHeight: 48,
              borderRadius: 2.5,
              fontWeight: 750,
              fontSize: "0.85rem",
              textTransform: "none",
            }}
          >
            Thermal
          </Button>
          <Button
            fullWidth
            variant="outlined"
            color="secondary"
            disabled={!canGenerate}
            startIcon={<PrintRoundedIcon />}
            onClick={onThermalPrintPrivacy}
            sx={{
              minHeight: 48,
              borderRadius: 2.5,
              fontWeight: 750,
              fontSize: "0.85rem",
              textTransform: "none",
            }}
          >
            Privacy Copy
          </Button>
        </Stack>

        {/* WhatsApp & Save for Later */}
        <Stack direction="row" spacing={1}>
          <Button
            fullWidth
            variant="outlined"
            color="success"
            disabled={!customerPhone}
            startIcon={<WhatsAppIcon />}
            onClick={onSendWhatsApp}
            sx={{
              minHeight: 48,
              borderRadius: 2.5,
              fontWeight: 750,
              fontSize: "0.85rem",
              textTransform: "none",
            }}
          >
            WhatsApp
          </Button>
          <Button
            fullWidth
            variant="outlined"
            color="info"
            disabled={!canGenerate}
            startIcon={<BookmarkBorderRoundedIcon />}
            onClick={onSaveDraft}
            sx={{
              minHeight: 48,
              borderRadius: 2.5,
              fontWeight: 750,
              fontSize: "0.85rem",
              textTransform: "none",
            }}
          >
            Save Draft
          </Button>
        </Stack>

        {/* Undo / Redo Row */}
        {(canUndo || canRedo) && (
          <Stack direction="row" spacing={1} justifyContent="center" sx={{ pt: 0.5 }}>
            <Button
              size="small"
              variant="text"
              startIcon={<UndoRoundedIcon />}
              onClick={onUndo}
              disabled={!canUndo}
              sx={{ minHeight: 40, px: 2, textTransform: "none", fontWeight: 700 }}
            >
              Undo
            </Button>
            <Button
              size="small"
              variant="text"
              startIcon={<RedoRoundedIcon />}
              onClick={onRedo}
              disabled={!canRedo}
              sx={{ minHeight: 40, px: 2, textTransform: "none", fontWeight: 700 }}
            >
              Redo
            </Button>
          </Stack>
        )}

        {/* Saved Draft Bills if present */}
        {savedBills.length > 0 && (
          <Card
            elevation={0}
            sx={{
              mt: 1,
              borderRadius: 2.5,
              border: `1px solid ${theme.palette.divider}`,
              bgcolor: alpha(theme.palette.background.paper, 0.75),
            }}
          >
            <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  display: "block",
                  mb: 1.25,
                }}
              >
                Saved Draft Bills ({savedBills.length})
              </Typography>
              <Stack spacing={1} divider={<Divider sx={{ borderStyle: "dashed" }} />}>
                {savedBills.map((bill, index) => (
                  <Stack
                    key={index}
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Box
                      onClick={() => onLoadBill?.(index)}
                      sx={{ minWidth: 0, flexGrow: 1, cursor: "pointer", pr: 1 }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 750 }} noWrap>
                        {bill.customerName || "Draft Bill"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" noWrap>
                        {bill.customerPhone ? `${bill.customerPhone} • ` : ""}
                        {bill.items?.length || 0} items
                      </Typography>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={() => onDeleteBill?.(index)}
                      sx={{ width: 44, height: 44, color: "error.main" }}
                      aria-label="Delete draft"
                    >
                      <ClearRoundedIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                ))}
              </Stack>
            </CardContent>
          </Card>
        )}
      </Stack>
    </Stack>
  );
};

export default MobileBillSummary;
