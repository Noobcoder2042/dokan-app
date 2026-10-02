import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import PreviewRoundedIcon from "@mui/icons-material/PreviewRounded";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";

const MobileBillsList = ({
  bills,
  onPreview,
  onEdit,
  onDelete,
  onWhatsApp,
}) => {
  const theme = useTheme();
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [activeBill, setActiveBill] = useState(null);

  const handleOpenMenu = (event, bill) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
    setActiveBill(bill);
  };

  const handleCloseMenu = () => {
    setMenuAnchor(null);
    setActiveBill(null);
  };

  if (!bills || !bills.length) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 5,
          textAlign: "center",
          borderRadius: 3,
          border: `1px dashed ${theme.palette.divider}`,
          background: "transparent",
        }}
      >
        <ReceiptLongRoundedIcon sx={{ fontSize: 44, color: "text.secondary", mb: 1, opacity: 0.6 }} />
        <Typography variant="subtitle1" fontWeight={700}>
          No bills found
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Try changing the search text or date filter.
        </Typography>
      </Paper>
    );
  }

  return (
    <Stack spacing={2} sx={{ width: "100%" }}>
      {bills.map((bill) => {
        const dueAmt =
          bill.dueAmount !== undefined
            ? Number(bill.dueAmount)
            : Number(bill.totalAmount || 0);
        const totalAmt = Number(bill.totalAmount || 0);
        const itemCount = Array.isArray(bill.items) ? bill.items.length : 0;
        const shortId = bill.id ? String(bill.id).slice(-6).toUpperCase() : "";

        let statusChip = {
          label: "Paid",
          color: "success",
          bg: alpha(theme.palette.success.main, 0.12),
          textColor: "success.main",
        };

        if (dueAmt > 0 && dueAmt < totalAmt) {
          statusChip = {
            label: `Due: ₹${dueAmt.toFixed(0)}`,
            color: "warning",
            bg: alpha(theme.palette.warning.main, 0.14),
            textColor: "warning.main",
          };
        } else if (dueAmt >= totalAmt && totalAmt > 0) {
          statusChip = {
            label: "Due",
            color: "error",
            bg: alpha(theme.palette.error.main, 0.12),
            textColor: "error.main",
          };
        }

        return (
          <Card
            key={bill.id}
            elevation={0}
            onClick={() => onPreview?.(bill)}
            sx={{
              borderRadius: 3,
              border: `1px solid ${theme.palette.divider}`,
              bgcolor: alpha(theme.palette.background.paper, 0.7),
              backdropFilter: "blur(12px)",
              cursor: "pointer",
              transition: "transform 0.18s ease, border-color 0.18s ease",
              "&:active": {
                transform: "scale(0.985)",
              },
            }}
          >
            <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
              {/* Top Row: Invoice Code & Status */}
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 1.25 }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    fontFamily: "monospace",
                    fontWeight: 800,
                    letterSpacing: "0.05em",
                    color: "text.secondary",
                    px: 1,
                    py: 0.25,
                    borderRadius: 1,
                    bgcolor: alpha(theme.palette.text.primary, 0.04),
                  }}
                >
                  #{shortId || "INV"}
                </Typography>
                <Chip
                  label={statusChip.label}
                  size="small"
                  sx={{
                    fontWeight: 800,
                    fontSize: "0.72rem",
                    height: 22,
                    bgcolor: statusChip.bg,
                    color: statusChip.textColor,
                    border: "none",
                  }}
                />
              </Stack>

              {/* Customer Name & Subtext */}
              <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.3 }}>
                {bill.name || "Walk-in Customer"}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.25 }}>
                {itemCount} {itemCount === 1 ? "Item" : "Items"} • {bill.date || "Today"}
                {bill.phoneNumber ? ` • ${bill.phoneNumber}` : ""}
              </Typography>

              {/* Amount Row */}
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="baseline"
                sx={{ mt: 1.5, pt: 1.25, borderTop: `1px dashed ${theme.palette.divider}` }}
              >
                <Typography variant="body2" color="text.secondary" fontWeight={600}>
                  Total Amount
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 900, color: "primary.main" }}>
                  ₹{totalAmt.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Typography>
              </Stack>

              {/* Quick Actions Bar (Min 44px touch targets) */}
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{ mt: 1.75 }}
                onClick={(e) => e.stopPropagation()}
              >
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<PreviewRoundedIcon fontSize="small" />}
                  onClick={() => onPreview?.(bill)}
                  sx={{
                    flexGrow: 1,
                    minHeight: 44,
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 750,
                  }}
                >
                  Preview
                </Button>

                <Button
                  variant="contained"
                  color="success"
                  size="small"
                  startIcon={<WhatsAppIcon fontSize="small" />}
                  onClick={() => onWhatsApp?.(bill)}
                  sx={{
                    flexGrow: 1,
                    minHeight: 44,
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 750,
                    boxShadow: `0 4px 12px ${alpha(theme.palette.success.main, 0.25)}`,
                  }}
                >
                  WhatsApp
                </Button>

                <IconButton
                  size="medium"
                  onClick={(event) => handleOpenMenu(event, bill)}
                  sx={{
                    minWidth: 44,
                    minHeight: 44,
                    borderRadius: 2,
                    border: `1px solid ${theme.palette.divider}`,
                    color: "text.secondary",
                  }}
                  aria-label="More bill options"
                >
                  <MoreVertRoundedIcon fontSize="small" />
                </IconButton>
              </Stack>
            </CardContent>
          </Card>
        );
      })}

      {/* Overflow Menu for Edit & Delete */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleCloseMenu}
        PaperProps={{
          sx: {
            borderRadius: 2.5,
            minWidth: 160,
            boxShadow: "0 10px 28px rgba(0,0,0,0.15)",
          },
        }}
      >
        <MenuItem
          onClick={() => {
            if (activeBill) onEdit?.(activeBill);
            handleCloseMenu();
          }}
          sx={{ py: 1.25 }}
        >
          <ListItemIcon>
            <EditRoundedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Edit Bill" />
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (activeBill) onDelete?.(activeBill);
            handleCloseMenu();
          }}
          sx={{ py: 1.25, color: "error.main" }}
        >
          <ListItemIcon sx={{ color: "error.main" }}>
            <DeleteRoundedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Delete Bill" />
        </MenuItem>
      </Menu>
    </Stack>
  );
};

export default MobileBillsList;
