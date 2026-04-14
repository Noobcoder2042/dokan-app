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
  const extraChargeEntries = bill?.extraCharges
    ? [
        { label: "Rickshaw", value: Number(bill.extraCharges.rickshaw || 0) },
        { label: "Bus", value: Number(bill.extraCharges.bus || 0) },
        { label: "Other", value: Number(bill.extraCharges.other || 0) },
      ].filter((entry) => entry.value > 0)
    : [];

  const subtotalAmount = Number(
    bill?.subtotalAmount ||
      bill?.items?.reduce(
        (sum, item) => sum + Number(item.totalPrice || 0),
        0
      ) ||
      0
  );
  const extraTotal = Number(bill?.extraCharges?.total || 0);

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

              {extraChargeEntries.map((entry) => (
                <Grid container key={`extra-${entry.label}`} spacing={1}>
                  <Grid item xs={7}>
                    <Typography sx={{ fontWeight: 600 }}>
                      {entry.label} Cost
                    </Typography>
                  </Grid>
                  <Grid item xs={5} textAlign="right">
                    <Typography sx={{ fontWeight: 700 }}>
                      Rs. {entry.value.toFixed(2)}
                    </Typography>
                  </Grid>
                </Grid>
              ))}
            </Stack>

            <Divider />

            <Box sx={{ textAlign: "right", display: "grid", gap: 0.5 }}>
              <Typography variant="body2" color="text.secondary">
                Subtotal: Rs. {subtotalAmount.toFixed(2)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Extra Cost: Rs. {extraTotal.toFixed(2)}
              </Typography>
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
