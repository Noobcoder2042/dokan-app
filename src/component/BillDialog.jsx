import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import PrintRoundedIcon from "@mui/icons-material/PrintRounded";
import jsPDF from "jspdf";
import "jspdf-autotable";

const downloadPdfBill = (bill) => {
  if (!bill) return;

  const doc = new jsPDF("landscape", "mm", [148, 210]);

  doc.setFontSize(10);
  doc.text(`Date - ${bill.date || "-"}`, 175, 10);
  doc.text(`${bill.shopName || "Shop"}`, 10, 10);
  doc.text(`Customer Name: ${bill.name || "-"}`, 10, 15);
  doc.text(`Customer Phone: ${bill.phoneNumber || "-"}`, 10, 20);
  if (bill.address) {
    doc.text(`Address: ${bill.address}`, 10, 25);
  }

  const columns = [
    { header: "No.", dataKey: "no" },
    { header: "Item", dataKey: "item" },
    { header: "Price", dataKey: "price" },
    { header: "Qty", dataKey: "qty" },
    { header: "Total", dataKey: "total" },
  ];

  const rows = (bill.items || []).map((item, index) => ({
    no: String(index + 1),
    item: item.name || "-",
    price: `${item.price || 0} ${item.priceUnit || "piece"}`,
    qty: `${item.quantity || 0} ${item.quantityUnit || "piece"}`,
    total: Number(item.totalPrice || 0).toFixed(2),
  }));

  doc.autoTable({
    head: [columns.map((col) => col.header)],
    body: rows.map((row) => columns.map((col) => row[col.dataKey])),
    startY: bill.address ? 30 : 25,
    styles: {
      fontSize: 10,
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
    },
    headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0] },
    tableLineColor: [0, 0, 0],
    tableLineWidth: 0.1,
    margin: { top: 10, left: 10, right: 10, bottom: 10 },
    rowHeight: 5,
  });

  const finalY = doc.lastAutoTable?.finalY || 20;
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(
    `Grand Total - RS. ${Math.round(Number(bill.totalAmount || 0))}`,
    140,
    finalY + 8
  );
  doc.setFont("helvetica", "normal");
  doc.save(`invoice_${bill.id || new Date().toISOString()}.pdf`);
};

const printPreviousBill = (bill) => {
  if (!bill) return;

  const printWindow = window.open("", "_blank", "width=900,height=900");
  if (!printWindow) return;

  const itemRows = (bill.items || [])
    .map(
      (item) => `
        <tr>
          <td>${item.name || "-"}</td>
          <td>${item.quantity || 0} ${item.quantityUnit || "piece"}</td>
          <td>${item.price || 0} ${item.priceUnit || "piece"}</td>
          <td>${Number(item.totalPrice || 0).toFixed(2)}</td>
        </tr>
      `
    )
    .join("");

  const extraRows = bill?.extraCharges
    ? [
        { label: "Colie", value: Number(bill.extraCharges.rickshaw || 0) },
        { label: "Bus", value: Number(bill.extraCharges.bus || 0) },
        { label: "Other", value: Number(bill.extraCharges.other || 0) },
      ]
        .filter((entry) => entry.value > 0)
        .map(
          (entry) => `
            <tr>
              <td>${entry.label} Cost</td>
              <td>-</td>
              <td>-</td>
              <td>${entry.value.toFixed(2)}</td>
            </tr>
          `
        )
        .join("")
    : "";

  printWindow.document.write(`
    <html>
      <head>
        <title>Print Bill</title>
        <style>
          body { font-family: Arial, sans-serif; color: #111827; padding: 16px; }
          .meta { margin: 2px 0; }
          table { width: 100%; border-collapse: collapse; margin-top: 12px; }
          th, td { border-bottom: 1px solid #d1d5db; text-align: left; padding: 8px 6px; }
          .total { margin-top: 12px; text-align: right; font-size: 20px; font-weight: 700; }
        </style>
      </head>
      <body>
        <h2>${bill.shopName || "Shop"} - Invoice</h2>
        <div class="meta">Date: ${bill.date || "-"}</div>
        <div class="meta">Customer: ${bill.name || "-"}</div>
        <div class="meta">Phone: ${bill.phoneNumber || "-"}</div>
        ${bill.address ? `<div class="meta">Address: ${bill.address}</div>` : ""}
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemRows}
            ${extraRows}
          </tbody>
        </table>
        <div class="total">${Math.round(Number(bill.totalAmount || 0))}</div>
      </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
};

const BillDialog = ({ bill, onClose }) => {
  const extraChargeEntries = bill?.extraCharges
    ? [
                    { label: "Colie", value: Number(bill.extraCharges.rickshaw || 0) },
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
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} color="inherit">
          Close
        </Button>
        <Button
          variant="outlined"
          startIcon={<PrintRoundedIcon />}
          onClick={() => printPreviousBill(bill)}
        >
          Print
        </Button>
        <Button
          variant="contained"
          startIcon={<DownloadRoundedIcon />}
          onClick={() => downloadPdfBill(bill)}
        >
          Download PDF
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BillDialog;
