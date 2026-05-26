import {
  IconButton,
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
  Tooltip,
  alpha,
  useTheme,
  Box
} from "@mui/material";
import PreviewIcon from "@mui/icons-material/Preview";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";

const BillsTable = ({
  bills,
  onPreview,
  onEdit,
  onDelete,
  onWhatsApp,
}) => {
  const theme = useTheme();

  if (!bills.length) {
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
        <Typography variant="h6" fontWeight={600}>No bills found</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Try changing the search text or date filter.
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
      <TableContainer sx={{ maxHeight: 560, overflowX: "auto" }}>
        <Table sx={{ minWidth: 720, '& .MuiTableCell-root': { py: 1.5 } }} size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, backgroundColor: 'background.paper' }}>Customer Name</TableCell>
              <TableCell sx={{ fontWeight: 600, backgroundColor: 'background.paper' }}>Phone</TableCell>
              <TableCell sx={{ fontWeight: 600, backgroundColor: 'background.paper' }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 600, backgroundColor: 'background.paper' }}>Total Amount</TableCell>
              <TableCell sx={{ fontWeight: 600, backgroundColor: 'background.paper' }}>Status</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, backgroundColor: 'background.paper' }}>Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {bills.map((bill, index) => (
              <TableRow
                key={bill.id}
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
                <TableCell sx={{ fontWeight: 600 }}>{bill.name}</TableCell>
                <TableCell>{bill.phoneNumber}</TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {bill.date}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight={600} color="primary.main">
                    Rs. {Number(bill.totalAmount || 0).toFixed(2)}
                  </Typography>
                </TableCell>
                <TableCell>
                  {(() => {
                    const dueAmt = bill.dueAmount !== undefined ? Number(bill.dueAmount) : Number(bill.totalAmount || 0);
                    const totalAmt = Number(bill.totalAmount || 0);
                    
                    if (dueAmt <= 0) {
                      return (
                        <Chip 
                          label="Paid" 
                          size="small" 
                          color="success" 
                          sx={{ 
                            fontWeight: 600, 
                            borderRadius: 1.5,
                            backgroundColor: alpha(theme.palette.success.main, 0.1),
                            color: 'success.main',
                            border: 'none'
                          }} 
                        />
                      );
                    } else if (dueAmt < totalAmt) {
                      return (
                        <Chip 
                          label="Partial" 
                          size="small" 
                          color="warning" 
                          sx={{ 
                            fontWeight: 600, 
                            borderRadius: 1.5,
                            backgroundColor: alpha(theme.palette.warning.main, 0.1),
                            color: 'warning.main',
                            border: 'none'
                          }} 
                        />
                      );
                    } else {
                      return (
                        <Chip 
                          label="Due" 
                          size="small" 
                          color="error" 
                          sx={{ 
                            fontWeight: 600, 
                            borderRadius: 1.5,
                            backgroundColor: alpha(theme.palette.error.main, 0.1),
                            color: 'error.main',
                            border: 'none'
                          }} 
                        />
                      );
                    }
                  })()}
                </TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                    <Tooltip title="Preview Bill">
                      <Button 
                        onClick={() => onPreview(bill)} 
                        startIcon={<PreviewIcon />} 
                        variant="text"
                        size="small"
                        sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                      >
                        Preview
                      </Button>
                    </Tooltip>
                    <Tooltip title="Edit Bill">
                      <IconButton onClick={() => onEdit?.(bill)} size="small" aria-label="edit bill" sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
                        <EditRoundedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Send via WhatsApp">
                      <IconButton
                        onClick={() => onWhatsApp?.(bill)}
                        size="small"
                        aria-label="send whatsapp"
                        color="success"
                        sx={{ border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`, borderRadius: 2, backgroundColor: alpha(theme.palette.success.main, 0.05) }}
                      >
                        <WhatsAppIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Bill">
                      <IconButton
                        onClick={() => onDelete?.(bill)}
                        size="small"
                        aria-label="delete bill"
                        color="error"
                        sx={{ border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`, borderRadius: 2 }}
                      >
                        <DeleteRoundedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default BillsTable;
