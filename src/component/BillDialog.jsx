import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  Stack,
  Typography,
} from "@mui/material";

const BillDialog = ({ bill, onClose }) => {
  return (
    <Dialog open={!!bill} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ pb: 1 }}>Invoice Preview</DialogTitle>

      <DialogContent sx={{ pb: 3 }}>
        {bill && (
          <Stack spacing={2}>
            <Box
              sx={{
                p: 2.5,
                borderRadius: 4,
                background:
                  "linear-gradient(135deg, rgba(29, 78, 216, 0.08) 0%, rgba(15, 118, 110, 0.08) 100%)",
              }}
            >
              <Typography variant="h6">{bill.name}</Typography>
              <Typography color="text.secondary">{bill.phoneNumber}</Typography>
              {bill.address ? (
                <Typography color="text.secondary">{bill.address}</Typography>
              ) : null}
              <Typography color="text.secondary">{bill.date}</Typography>
            </Box>

            <Divider />

            <Stack spacing={1.5}>
              {bill.items.map((item, index) => (
                <Grid container key={index} spacing={1}>
                  <Grid item xs={7}>
                    <Typography sx={{ fontWeight: 600 }}>{item.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.quantity} {item.quantityUnit} x {item.price}{" "}
                      {item.priceUnit}
                    </Typography>
                  </Grid>
                  <Grid item xs={5} textAlign="right">
                    <Typography sx={{ fontWeight: 700 }}>
                      Rs. {Number(item.totalPrice || 0).toFixed(2)}
                    </Typography>
                  </Grid>
                </Grid>
              ))}
            </Stack>

            <Divider />

            <Box sx={{ textAlign: "right" }}>
              <Typography variant="body2" color="text.secondary">
                Final Amount
              </Typography>
              <Typography variant="h5">
                Rs. {Number(bill.totalAmount || 0).toFixed(2)}
              </Typography>
            </Box>
          </Stack>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BillDialog;
