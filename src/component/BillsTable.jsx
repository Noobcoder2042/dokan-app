import {
  Button,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import PreviewIcon from "@mui/icons-material/Preview";

const BillsTable = ({ bills, onPreview }) => {
  if (!bills.length) {
    return (
      <Paper sx={{ p: 4, textAlign: "center" }}>
        <Typography variant="h6">No bills found</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Try changing the search text or date filter.
        </Typography>
      </Paper>
    );
  }

  return (
    <TableContainer
      component={Paper}
      sx={{
        border: "1px solid rgba(148, 163, 184, 0.14)",
        overflowX: "auto",
      }}
    >
      <Table sx={{ minWidth: 720 }}>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Phone</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Total</TableCell>
            <TableCell>Status</TableCell>
            <TableCell align="right">Action</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {bills.map((bill, index) => (
            <TableRow
              key={bill.id}
              hover
              sx={{
                "& td": {
                  borderBottom: "1px solid rgba(226, 232, 240, 0.9)",
                },
                backgroundColor:
                  index % 2 === 0 ? "rgba(248, 250, 252, 0.7)" : "transparent",
              }}
            >
              <TableCell sx={{ fontWeight: 600 }}>{bill.name}</TableCell>
              <TableCell>{bill.phoneNumber}</TableCell>
              <TableCell>{bill.date}</TableCell>
              <TableCell>Rs. {Number(bill.totalAmount || 0).toFixed(2)}</TableCell>
              <TableCell>
                <Chip label="Paid" size="small" color="success" variant="outlined" />
              </TableCell>
              <TableCell align="right">
                <Button
                  onClick={() => onPreview(bill)}
                  startIcon={<PreviewIcon />}
                  variant="text"
                >
                  Preview
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default BillsTable;
