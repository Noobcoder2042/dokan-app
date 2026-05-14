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
      <Paper sx={{ p: 4, textAlign: "center" }}>
        <Typography variant="h6">No customers found</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Customer details will appear here from your saved bills.
        </Typography>
      </Paper>
    );
  }

  return (
    <TableContainer
      component={Paper}
      sx={{ border: "1px solid rgba(148, 163, 184, 0.14)", overflowX: "auto" }}
    >
      <Table sx={{ minWidth: 980 }} stickyHeader size="small">
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Mobile</TableCell>
            <TableCell>Address</TableCell>
            <TableCell>Total Bills</TableCell>
            <TableCell>Total Spend</TableCell>
            <TableCell>Last Bill</TableCell>
            <TableCell align="right">Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {pagedCustomers.map((customer, index) => (
            <TableRow
              key={`${customer.name}-${customer.phoneNumber}`}
              sx={{
                "& td": {
                  borderBottom: "1px solid rgba(226, 232, 240, 0.9)",
                },
                backgroundColor:
                  (page * rowsPerPage + index) % 2 === 0
                    ? "rgba(248, 250, 252, 0.7)"
                    : "transparent",
              }}
            >
              <TableCell>
                <Typography
                  component="span"
                  sx={{ display: "flex", alignItems: "center", gap: 1.5, fontWeight: 600 }}
                >
                  <Avatar sx={{ width: 34, height: 34, bgcolor: "primary.main" }}>
                    {customer.name?.[0]?.toUpperCase() || "C"}
                  </Avatar>
                  {customer.name}
                </Typography>
              </TableCell>
              <TableCell>{customer.phoneNumber || "-"}</TableCell>
              <TableCell>{customer.address || "-"}</TableCell>
              <TableCell>
                <Chip
                  size="small"
                  label={Number(customer.totalBills || 0)}
                  color={Number(customer.totalBills || 0) > 0 ? "primary" : "default"}
                  variant="outlined"
                />
              </TableCell>
              <TableCell>Rs. {Number(customer.totalSpend || 0).toFixed(2)}</TableCell>
              <TableCell>{customer.lastBillDate || "-"}</TableCell>
              <TableCell align="right">
                <Stack direction="row" spacing={0.25} justifyContent="flex-end" flexWrap="wrap">
                  <Tooltip title="View">
                    <IconButton onClick={() => onView?.(customer)} aria-label="view customer">
                      <VisibilityRoundedIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit">
                    <IconButton onClick={() => onEdit?.(customer)} aria-label="edit customer">
                      <EditRoundedIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Call">
                    <IconButton onClick={() => onCall?.(customer)} aria-label="call customer">
                      <CallRoundedIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="WhatsApp">
                    <IconButton onClick={() => onWhatsApp?.(customer)} aria-label="whatsapp customer" color="success">
                      <WhatsAppIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Copy Phone">
                    <IconButton onClick={() => onCopyPhone?.(customer)} aria-label="copy phone">
                      <ContentCopyRoundedIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton
                      onClick={() => onDelete?.(customer)}
                      aria-label="delete customer"
                      color="error"
                    >
                      <DeleteRoundedIcon />
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
      />
    </TableContainer>
  );
};

export default CustomerInfoTable;
