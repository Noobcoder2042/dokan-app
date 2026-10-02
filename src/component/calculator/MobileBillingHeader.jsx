import React from "react";
import { Box, Chip, Paper, Stack, Typography, alpha, useTheme } from "@mui/material";

/**
 * MobileBillingHeader
 * Compact 60-70px header for mobile screens (<600px).
 * Replaces the large 250px hero banner with a clean, high-density brand strip.
 */
const MobileBillingHeader = ({ itemCount = 0, totalAmount = 0 }) => {
  const theme = useTheme();

  return (
    <Paper
      elevation={0}
      sx={{
        p: 1.5,
        borderRadius: 2.5,
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.95)} 0%, ${alpha(
          theme.palette.success.main,
          0.85
        )} 100%)`,
        color: "white",
        boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.2)}`,
        border: "none",
        minHeight: 58,
        display: "flex",
        alignItems: "center",
      }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ width: "100%" }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 900,
              fontSize: "1.1rem",
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
            }}
          >
            Smart Billing
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} alignItems="center">
          <Chip
            size="small"
            label={`${itemCount} ${itemCount === 1 ? "item" : "items"}`}
            sx={{
              bgcolor: "rgba(255, 255, 255, 0.2)",
              color: "white",
              fontWeight: 750,
              fontSize: "0.72rem",
              height: 24,
              border: "none",
            }}
          />
          <Chip
            size="small"
            label={`₹${totalAmount}`}
            sx={{
              bgcolor: "white",
              color: theme.palette.primary.main,
              fontWeight: 900,
              fontSize: "0.85rem",
              height: 26,
              border: "none",
              boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
            }}
          />
        </Stack>
      </Stack>
    </Paper>
  );
};

export default MobileBillingHeader;
