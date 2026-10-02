import { useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
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
import CallRoundedIcon from "@mui/icons-material/CallRounded";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import ArrowForwardIosRoundedIcon from "@mui/icons-material/ArrowForwardIosRounded";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";

const MobileCustomerList = ({
  customers,
  onView,
  onEdit,
  onDelete,
  onCall,
  onWhatsApp,
  onCopyPhone,
}) => {
  const theme = useTheme();
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [activeCustomer, setActiveCustomer] = useState(null);

  const handleOpenMenu = (event, customer) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
    setActiveCustomer(customer);
  };

  const handleCloseMenu = () => {
    setMenuAnchor(null);
    setActiveCustomer(null);
  };

  if (!customers || !customers.length) {
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
        <PeopleAltRoundedIcon sx={{ fontSize: 44, color: "text.secondary", mb: 1, opacity: 0.6 }} />
        <Typography variant="subtitle1" fontWeight={700}>
          No customers found
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Customer profiles are generated automatically from your bills.
        </Typography>
      </Paper>
    );
  }

  return (
    <Stack spacing={2} sx={{ width: "100%" }}>
      {customers.map((customer) => {
        const totalBills = Number(customer.totalBills || 0);
        const totalSpend = Number(customer.totalSpend || 0);
        const totalDue = Number(customer.totalDue || 0);

        return (
          <Card
            key={`${customer.name}-${customer.phoneNumber}`}
            elevation={0}
            onClick={() => onView?.(customer)}
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
              {/* Header: Avatar, Name & Phone */}
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
                <Avatar
                  sx={{
                    width: 44,
                    height: 44,
                    bgcolor: alpha(theme.palette.primary.main, 0.12),
                    color: "primary.main",
                    fontWeight: 800,
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.25)}`,
                  }}
                >
                  {customer.name?.[0]?.toUpperCase() || "C"}
                </Avatar>

                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.2 }} noWrap>
                    {customer.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                    {customer.phoneNumber || "No phone linked"}
                    {customer.address ? ` • ${customer.address}` : ""}
                  </Typography>
                </Box>

                <IconButton
                  size="medium"
                  onClick={(e) => handleOpenMenu(e, customer)}
                  sx={{
                    minWidth: 44,
                    minHeight: 44,
                    borderRadius: 2,
                    color: "text.secondary",
                  }}
                  aria-label="Customer options"
                >
                  <MoreVertRoundedIcon fontSize="small" />
                </IconButton>
              </Stack>

              {/* Balance & Stats Row */}
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{
                  py: 1.25,
                  px: 1.5,
                  borderRadius: 2,
                  bgcolor:
                    totalDue > 0
                      ? alpha(theme.palette.error.main, 0.06)
                      : alpha(theme.palette.action.hover, 0.04),
                  border: `1px solid ${
                    totalDue > 0
                      ? alpha(theme.palette.error.main, 0.15)
                      : theme.palette.divider
                  }`,
                }}
              >
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    {totalBills} {totalBills === 1 ? "Bill" : "Bills"} • Spend: ₹{totalSpend.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                  </Typography>
                </Box>

                <Box textAlign="right">
                  {totalDue > 0 ? (
                    <>
                      <Typography variant="caption" color="error.main" fontWeight={750} display="block">
                        Outstanding Due
                      </Typography>
                      <Typography variant="subtitle1" fontWeight={900} color="error.main" lineHeight={1.2}>
                        ₹{totalDue.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </Typography>
                    </>
                  ) : (
                    <Typography variant="caption" color="success.main" fontWeight={750}>
                      No Pending Dues ✓
                    </Typography>
                  )}
                </Box>
              </Stack>

              {/* Action Buttons (Call, WhatsApp, View) */}
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{ mt: 1.75 }}
                onClick={(e) => e.stopPropagation()}
              >
                {customer.phoneNumber ? (
                  <>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<CallRoundedIcon fontSize="small" />}
                      onClick={() => onCall?.(customer)}
                      sx={{
                        flexGrow: 1,
                        minHeight: 44,
                        borderRadius: 2,
                        textTransform: "none",
                        fontWeight: 750,
                      }}
                    >
                      Call
                    </Button>

                    <Button
                      variant="contained"
                      color="success"
                      size="small"
                      startIcon={<WhatsAppIcon fontSize="small" />}
                      onClick={() => onWhatsApp?.(customer)}
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
                  </>
                ) : null}

                <Button
                  variant="text"
                  size="small"
                  endIcon={<ArrowForwardIosRoundedIcon sx={{ fontSize: "0.8rem !important" }} />}
                  onClick={() => onView?.(customer)}
                  sx={{
                    minHeight: 44,
                    px: 1.5,
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 750,
                  }}
                >
                  View
                </Button>
              </Stack>
            </CardContent>
          </Card>
        );
      })}

      {/* Overflow Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleCloseMenu}
        PaperProps={{
          sx: {
            borderRadius: 2.5,
            minWidth: 180,
            boxShadow: "0 10px 28px rgba(0,0,0,0.15)",
          },
        }}
      >
        {activeCustomer?.phoneNumber && (
          <MenuItem
            onClick={() => {
              if (activeCustomer) onCopyPhone?.(activeCustomer.phoneNumber);
              handleCloseMenu();
            }}
            sx={{ py: 1.25 }}
          >
            <ListItemIcon>
              <ContentCopyRoundedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Copy Phone" />
          </MenuItem>
        )}
        <MenuItem
          onClick={() => {
            if (activeCustomer) onEdit?.(activeCustomer);
            handleCloseMenu();
          }}
          sx={{ py: 1.25 }}
        >
          <ListItemIcon>
            <EditRoundedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Edit Customer" />
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (activeCustomer) onDelete?.(activeCustomer);
            handleCloseMenu();
          }}
          sx={{ py: 1.25, color: "error.main" }}
        >
          <ListItemIcon sx={{ color: "error.main" }}>
            <DeleteRoundedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Delete Customer" />
        </MenuItem>
      </Menu>
    </Stack>
  );
};

export default MobileCustomerList;
