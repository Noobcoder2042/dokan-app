import {
  Avatar,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";

const CustomerInfoTable = ({ customers, onView, onEdit, onDelete }) => {
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
      sx={{ border: "1px solid rgba(148, 163, 184, 0.14)" }}
    >
      <Table sx={{ minWidth: 720 }}>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Mobile</TableCell>
            <TableCell>Address</TableCell>
            <TableCell align="right">Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {customers.map((customer, index) => (
            <TableRow
              key={`${customer.name}-${customer.phoneNumber}`}
              sx={{
                "& td": {
                  borderBottom: "1px solid rgba(226, 232, 240, 0.9)",
                },
                backgroundColor:
                  index % 2 === 0 ? "rgba(248, 250, 252, 0.7)" : "transparent",
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
              <TableCell align="right">
                <IconButton onClick={() => onView?.(customer)} aria-label="view customer">
                  <VisibilityRoundedIcon />
                </IconButton>
                <IconButton onClick={() => onEdit?.(customer)} aria-label="edit customer">
                  <EditRoundedIcon />
                </IconButton>
                <IconButton
                  onClick={() => onDelete?.(customer)}
                  aria-label="delete customer"
                  color="error"
                >
                  <DeleteRoundedIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default CustomerInfoTable;
