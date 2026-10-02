import React from "react";
import {
  Box,
  Button,
  Paper,
  Stack,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import PrintRoundedIcon from "@mui/icons-material/PrintRounded";

/**
 * BillingBottomBar
 * Persistent, sticky bottom action bar for mobile POS.
 * Positioned right above the app's fixed bottom navigation bar (60px + safe area).
 * Ensures shopkeepers always know what to do next without having to scroll.
 */
const BillingBottomBar = ({
  step = 0,
  onStepChange,
  itemCount = 0,
  totalAmount = 0,
  customerName = "",
  canProceedToSummary = false,
  canGenerateBill = false,
  onGenerateBill,
  isEditing = false,
}) => {
  const theme = useTheme();

  return (
    <Paper
      elevation={8}
      square
      sx={{
        display: { xs: "flex", lg: "none" },
        position: "fixed",
        bottom: "calc(60px + env(safe-area-inset-bottom))",
        left: 0,
        right: 0,
        width: "100%",
        zIndex: 1100,
        borderRadius: "0 !important",
        px: 2,
        py: 1.25,
        bgcolor:
          theme.palette.mode === "dark"
            ? "#0f172a"
            : "#ffffff",
        backgroundImage: "none",
        border: "none",
        borderTop: `1px solid ${
          theme.palette.mode === "dark"
            ? "rgba(255, 255, 255, 0.12)"
            : "rgba(15, 23, 42, 0.1)"
        }`,
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow:
          theme.palette.mode === "dark"
            ? "0 -6px 24px rgba(0, 0, 0, 0.6)"
            : "0 -4px 16px rgba(0, 0, 0, 0.08)",
        transition: "all 0.2s ease-in-out",
      }}
    >
      {/* Bill Metrics: Item count and Total Amount */}
      <Box sx={{ minWidth: 0 }}>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ fontWeight: 600, display: "block", fontSize: "0.75rem" }}
        >
          {itemCount} {itemCount === 1 ? "Item" : "Items"}
        </Typography>
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 900,
            color: "primary.main",
            lineHeight: 1.15,
            fontSize: "1.1rem",
            letterSpacing: "-0.01em",
          }}
        >
          ₹{totalAmount}
        </Typography>
      </Box>

      {/* Action Buttons with 48px Touch Targets */}
      <Stack direction="row" spacing={1} alignItems="center">
        {step === 0 && (
          <Button
            variant="contained"
            size="medium"
            endIcon={<ArrowForwardRoundedIcon />}
            onClick={() => onStepChange?.(1)}
            sx={{
              borderRadius: 2.5,
              fontWeight: 800,
              px: 2.5,
              minHeight: 48,
              fontSize: "0.9rem",
              textTransform: "none",
              boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.35)}`,
              "&:active": {
                transform: "scale(0.98)",
              },
            }}
          >
            {customerName ? "Next: Add Items" : "Add Items →"}
          </Button>
        )}

        {step === 1 && (
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              color="inherit"
              size="medium"
              startIcon={<ArrowBackRoundedIcon />}
              onClick={() => onStepChange?.(0)}
              sx={{
                minHeight: 48,
                borderRadius: 2.5,
                fontWeight: 700,
                px: 1.75,
                fontSize: "0.85rem",
                textTransform: "none",
                borderColor: theme.palette.divider,
                bgcolor: alpha(theme.palette.background.paper, 0.6),
                "&:active": {
                  transform: "scale(0.98)",
                },
              }}
            >
              Customer
            </Button>
            <Button
              variant="contained"
              size="medium"
              disabled={!canProceedToSummary}
              endIcon={<ReceiptLongRoundedIcon />}
              onClick={() => onStepChange?.(2)}
              sx={{
                borderRadius: 2.5,
                fontWeight: 800,
                px: 2,
                minHeight: 48,
                fontSize: "0.9rem",
                textTransform: "none",
                boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.35)}`,
                "&:active": {
                  transform: "scale(0.98)",
                },
              }}
            >
              Review Bill
            </Button>
          </Stack>
        )}

        {step === 2 && (
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              color="inherit"
              size="medium"
              startIcon={<ArrowBackRoundedIcon />}
              onClick={() => onStepChange?.(1)}
              sx={{
                minHeight: 48,
                borderRadius: 2.5,
                fontWeight: 700,
                px: 1.75,
                fontSize: "0.85rem",
                textTransform: "none",
                borderColor: theme.palette.divider,
                bgcolor: alpha(theme.palette.background.paper, 0.6),
                "&:active": {
                  transform: "scale(0.98)",
                },
              }}
            >
              Items
            </Button>
            <Button
              variant="contained"
              color="success"
              size="medium"
              disabled={!canGenerateBill}
              startIcon={<PrintRoundedIcon />}
              onClick={onGenerateBill}
              sx={{
                borderRadius: 2.5,
                fontWeight: 850,
                px: 2.25,
                minHeight: 48,
                fontSize: "0.92rem",
                textTransform: "none",
                boxShadow: `0 4px 16px ${alpha(theme.palette.success.main, 0.35)}`,
                "&:active": {
                  transform: "scale(0.98)",
                },
              }}
            >
              {isEditing ? "Reprint Bill" : "Generate Bill"}
            </Button>
          </Stack>
        )}
      </Stack>
    </Paper>
  );
};

export default BillingBottomBar;
