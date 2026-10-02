import React from "react";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import PhoneIphoneRoundedIcon from "@mui/icons-material/PhoneIphoneRounded";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
import SwapHorizRoundedIcon from "@mui/icons-material/SwapHorizRounded";

/**
 * MobileCustomerCard
 * Renders a compact confirmation card when a customer is chosen.
 */
const MobileCustomerCard = ({ customer, onChangeCustomer }) => {
  const theme = useTheme();

  if (!customer?.name) return null;

  const totalDue = Number(customer.totalDue || 0);

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 2.5,
        border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`,
        bgcolor: alpha(theme.palette.success.main, 0.04),
        backdropFilter: "blur(8px)",
      }}
    >
      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
          <Stack direction="row" spacing={0.75} alignItems="center">
            <CheckCircleRoundedIcon color="success" sx={{ fontSize: 18 }} />
            <Typography
              variant="caption"
              sx={{ fontWeight: 800, color: "success.main", textTransform: "uppercase", letterSpacing: "0.04em" }}
            >
              Customer Selected
            </Typography>
          </Stack>

          {totalDue > 0 && (
            <Chip
              size="small"
              color="error"
              label={`Due: ₹${totalDue.toLocaleString("en-IN")}`}
              sx={{ height: 22, fontWeight: 800, fontSize: "0.7rem" }}
            />
          )}
        </Stack>

        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar
            sx={{
              width: 44,
              height: 44,
              bgcolor: alpha(theme.palette.primary.main, 0.12),
              color: "primary.main",
              fontWeight: 800,
              fontSize: "1.1rem",
              border: `1px solid ${alpha(theme.palette.primary.main, 0.25)}`,
            }}
          >
            {customer.name[0]?.toUpperCase() || "C"}
          </Avatar>

          <Box sx={{ minWidth: 0, flexGrow: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.25 }} noWrap>
              {customer.name}
            </Typography>

            {customer.phoneNumber && (
              <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.25 }}>
                <PhoneIphoneRoundedIcon sx={{ fontSize: 13, color: "text.secondary" }} />
                <Typography variant="body2" color="text.secondary">
                  {customer.phoneNumber}
                </Typography>
              </Stack>
            )}

            {customer.address && (
              <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.25 }}>
                <LocationOnRoundedIcon sx={{ fontSize: 13, color: "text.secondary" }} />
                <Typography variant="caption" color="text.secondary" noWrap>
                  {customer.address}
                </Typography>
              </Stack>
            )}
          </Box>
        </Stack>

        <Button
          fullWidth
          variant="outlined"
          color="inherit"
          startIcon={<SwapHorizRoundedIcon fontSize="small" />}
          onClick={onChangeCustomer}
          sx={{
            mt: 1.5,
            minHeight: 44,
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 700,
            borderColor: theme.palette.divider,
            bgcolor: alpha(theme.palette.background.paper, 0.7),
          }}
        >
          Change Customer
        </Button>
      </CardContent>
    </Card>
  );
};

export default MobileCustomerCard;
