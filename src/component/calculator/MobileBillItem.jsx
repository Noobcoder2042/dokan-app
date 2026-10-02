import React from "react";
import {
  Box,
  Button,
  IconButton,
  Paper,
  Stack,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import RemoveRoundedIcon from "@mui/icons-material/RemoveRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";

/**
 * MobileBillItem
 * Touch-first item card rendered directly below the item entry form.
 * Supports instant quantity increment/decrement, edit dialog, and deletion.
 */
const MobileBillItem = ({
  item,
  index,
  onQtyChange,
  onEdit,
  onDelete,
}) => {
  const theme = useTheme();

  const qty = Number(item.quantity || 1);
  const price = Number(item.price || 0);
  const total = Number(item.totalPrice || 0);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 1.75,
        borderRadius: 2.5,
        border: `1px solid ${theme.palette.divider}`,
        bgcolor: alpha(theme.palette.background.paper, 0.75),
        backdropFilter: "blur(8px)",
        transition: "border-color 0.2s ease, transform 0.15s ease",
        "&:active": {
          transform: "scale(0.99)",
        },
      }}
    >
      {/* Top Row: Name and Total Amount */}
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
        <Box sx={{ minWidth: 0, flexGrow: 1, pr: 1.5 }}>
          <Typography
            variant="body1"
            sx={{ fontWeight: 800, fontSize: "0.95rem", lineHeight: 1.25 }}
            noWrap
          >
            {item.name}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.25 }}>
            ₹{price.toFixed(2)} / {item.priceUnit || "piece"}
          </Typography>
        </Box>

        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 900, color: "primary.main", whiteSpace: "nowrap" }}
        >
          ₹{total.toFixed(2)}
        </Typography>
      </Stack>

      {/* Bottom Controls Row: − Qty + Stepper & Edit / Delete Buttons */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{
          mt: 1.25,
          pt: 1.25,
          borderTop: `1px dashed ${alpha(theme.palette.divider, 0.8)}`,
        }}
      >
        {/* Quantity Stepper (Min 44x44px Touch Targets) */}
        <Stack
          direction="row"
          alignItems="center"
          spacing={0.5}
          sx={{
            bgcolor: alpha(theme.palette.action.hover, 0.08),
            borderRadius: 2,
            p: 0.25,
            border: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
          }}
        >
          <IconButton
            size="small"
            onClick={() => onQtyChange?.(index, -1)}
            disabled={qty <= 1}
            sx={{
              width: 44,
              height: 44,
              borderRadius: 1.5,
              color: "text.primary",
            }}
            aria-label="Decrease quantity"
          >
            <RemoveRoundedIcon fontSize="small" />
          </IconButton>

          <Typography
            variant="body2"
            sx={{
              fontWeight: 850,
              minWidth: 32,
              textAlign: "center",
              fontSize: "0.88rem",
            }}
          >
            {qty} {item.quantityUnit === "dozen" ? "doz" : "pc"}
          </Typography>

          <IconButton
            size="small"
            onClick={() => onQtyChange?.(index, 1)}
            sx={{
              width: 44,
              height: 44,
              borderRadius: 1.5,
              color: "text.primary",
            }}
            aria-label="Increase quantity"
          >
            <AddRoundedIcon fontSize="small" />
          </IconButton>
        </Stack>

        {/* Edit and Delete Actions */}
        <Stack direction="row" spacing={0.5} alignItems="center">
          <Button
            size="small"
            variant="text"
            color="inherit"
            startIcon={<EditRoundedIcon sx={{ fontSize: "1rem !important" }} />}
            onClick={() => onEdit?.(index)}
            sx={{
              minHeight: 44,
              px: 1.25,
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 700,
              color: "text.secondary",
            }}
          >
            Edit
          </Button>

          <IconButton
            size="small"
            onClick={() => onDelete?.(index)}
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2,
              color: "error.main",
              "&:hover": {
                bgcolor: alpha(theme.palette.error.main, 0.08),
              },
            }}
            aria-label={`Delete ${item.name}`}
          >
            <DeleteRoundedIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Stack>
    </Paper>
  );
};

export default MobileBillItem;
