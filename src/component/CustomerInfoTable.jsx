import {
  Avatar,
  Chip,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tooltip,
  Typography,
  useTheme,
  alpha
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import CallRoundedIcon from "@mui/icons-material/CallRounded";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";

const CustomerInfoTable = ({
  customers,
  onView,
  onEdit,
  onDelete,
  onCall,
  onWhatsApp,
  onCopyPhone,
}) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const theme = useTheme();

  useEffect(() => {
    const maxPage = Math.max(0, Math.ceil(customers.length / rowsPerPage) - 1);
    if (page > maxPage) setPage(maxPage);
  }, [customers.length, page, rowsPerPage]);

  const pagedCustomers = useMemo(() => {
    const start = page * rowsPerPage;
    return customers.slice(start, start + rowsPerPage);
  }, [customers, page, rowsPerPage]);

  if (!customers.length) {
    return (
      <Paper 
        elevation={0}
        sx={{ 
          p: 8, 
          textAlign: "center", 
          borderRadius: 4, 
          border: `1px dashed ${theme.palette.divider}`,
          background: 'transparent'
        }}
      >
        <Typography variant="h6" fontWeight={600}>No customers found</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Customer details will appear here from your saved bills.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        overflow: "hidden",
      }}
    >
      <TableContainer sx={{ overflowX: "auto" }}>
        <Table sx={{ minWidth: 980, '& .MuiTableCell-root': { py: 1.5 } }} stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, backgroundColor: 'background.paper' }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 600, backgroundColor: 'background.paper' }}>Mobile</TableCell>
              <TableCell sx={{ fontWeight: 600, backgroundColor: 'background.paper' }}>Address</TableCell>
              <TableCell sx={{ fontWeight: 600, backgroundColor: 'background.paper' }}>Total Bills</TableCell>
              <TableCell sx={{ fontWeight: 600, backgroundColor: 'background.paper' }}>Total Spend</TableCell>
              <TableCell sx={{ fontWeight: 600, backgroundColor: 'background.paper' }}>Last Bill</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, backgroundColor: 'background.paper' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pagedCustomers.map((customer, index) => (
              <TableRow
                key={`${customer.name}-${customer.phoneNumber}`}
                hover
                sx={{
                  "& td": {
                    borderBottom: `1px solid ${theme.palette.divider}`,
                  },
                  backgroundColor: theme.palette.mode === "dark"
                    ? (index % 2 === 0 ? alpha(theme.palette.action.hover, 0.05) : "transparent")
                    : (index % 2 === 0 ? "rgba(248, 250, 252, 0.7)" : "transparent"),
                  transition: 'background-color 0.2s ease',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.05),
                  }
                }}
              >
                <TableCell>
                  <Typography
                    component="span"
                    sx={{ display: "flex", alignItems: "center", gap: 1.5, fontWeight: 600 }}
                  >
                    <Avatar sx={{ width: 34, height: 34, bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', fontWeight: 700, border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}` }}>
                      {customer.name?.[0]?.toUpperCase() || "C"}
                    </Avatar>
                    {customer.name}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {customer.phoneNumber || "-"}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {customer.address || "-"}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={`${Number(customer.totalBills || 0)}`}
                    color={Number(customer.totalBills || 0) > 0 ? "primary" : "default"}
                    sx={{ 
                      fontWeight: 600, 
                      borderRadius: 1.5,
                      backgroundColor: Number(customer.totalBills || 0) > 0 ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                      color: Number(customer.totalBills || 0) > 0 ? 'primary.main' : 'text.secondary',
                      border: Number(customer.totalBills || 0) > 0 ? 'none' : `1px solid ${theme.palette.divider}`
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight={600} color="primary.main">
                    Rs. {Number(customer.totalSpend || 0).toFixed(2)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {customer.lastBillDate || "-"}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={0.5} justifyContent="flex-end" flexWrap="wrap">
                    <Tooltip title="View Profile">
                      <IconButton onClick={() => onView?.(customer)} size="small" aria-label="view customer" sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
                        <VisibilityRoundedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Call">
                      <IconButton onClick={() => onCall?.(customer)} size="small" aria-label="call customer" color="primary" sx={{ border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`, borderRadius: 2 }}>
                        <CallRoundedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="WhatsApp">
                      <IconButton onClick={() => onWhatsApp?.(customer)} size="small" aria-label="whatsapp customer" color="success" sx={{ border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`, borderRadius: 2, backgroundColor: alpha(theme.palette.success.main, 0.05) }}>
                        <WhatsAppIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Copy Phone">
                      <IconButton onClick={() => onCopyPhone?.(customer)} size="small" aria-label="copy phone" sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
                        <ContentCopyRoundedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton onClick={() => onEdit?.(customer)} size="small" aria-label="edit customer" sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
                        <EditRoundedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        onClick={() => onDelete?.(customer)}
                        size="small"
                        aria-label="delete customer"
                        color="error"
                        sx={{ border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`, borderRadius: 2 }}
                      >
                        <DeleteRoundedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={customers.length}
          page={page}
          onPageChange={(_, nextPage) => setPage(nextPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(Number(event.target.value));
            setPage(0);
          }}
          rowsPerPageOptions={[10, 25, 50, 100]}
          sx={{ borderTop: `1px solid ${theme.palette.divider}`, backgroundColor: 'background.paper' }}
        />
      </TableContainer>
    </Paper>
  );
};

export default CustomerInfoTable;
