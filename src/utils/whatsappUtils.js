import jsPDF from "jspdf";
import "jspdf-autotable";

export const DEFAULT_WHATSAPP_MESSAGE =
  "Thank you {customerName} for shopping with {shopName}.\nVisit again.";

export const WHATSAPP_BILL_SHARE_MODES = {
  TOTAL_TEXT: "totalText",
  PDF_BILL: "pdfBill",
};

export const formatWhatsAppPhone = (value) => {
  const digits = (value || "").toString().replace(/[^\d]/g, "");
  if (!digits) return "";
  return digits.length === 10 ? `91${digits}` : digits;
};

export const buildWhatsAppMessage = ({
  template = DEFAULT_WHATSAPP_MESSAGE,
  customerName = "Customer",
  customerPhone = "",
  shopName = "Shop",
  totalAmount,
  billDate = "",
  includeTotal = false,
}) => {
  const roundedTotal =
    totalAmount === undefined || totalAmount === null
      ? ""
      : `Rs. ${Math.round(Number(totalAmount || 0))}`;

  const replacements = {
    customerName: customerName || "Customer",
    customerPhone: customerPhone || "",
    shopName: shopName || "Shop",
    total: roundedTotal,
    date: billDate || "",
  };

  let message = (template || DEFAULT_WHATSAPP_MESSAGE).replace(
    /\{(customerName|customerPhone|shopName|total|date)\}/g,
    (_, key) => replacements[key] || "",
  );

  if (includeTotal && roundedTotal && !message.includes(roundedTotal)) {
    message = `${message.trim()}\nBill total: ${roundedTotal}`;
  }

  return message.trim();
};

export const openWhatsAppMessage = (phone, message) => {
  const formattedPhone = formatWhatsAppPhone(phone);
  if (!formattedPhone) return false;

  window.open(
    `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`,
    "_blank",
    "noopener,noreferrer",
  );
  return true;
};

export const saveBillPdf = (bill, shop = {}) => {
  const doc = new jsPDF("landscape", "mm", [148, 210]);
  const billDate = bill.date || new Date().toLocaleDateString("en-IN");
  const billTime = bill.time || new Date().toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  doc.setFontSize(10);
  doc.text(`Date - ${billDate}`, 175, 10);
  doc.text(`Time - ${billTime}`, 175, 15);
  doc.text(`${shop.name || bill.shopName || "Shop"}`, 10, 10);
  doc.text(`Customer Name: ${bill.name || "Customer"}`, 10, 15);
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

  const itemRows = (bill.items || []).map((item, index) => ({
    no: String(index + 1),
    item: item.name || "-",
    price: `${item.price || 0} ${item.priceUnit || "piece"}`,
    qty: `${item.quantity || 0} ${item.quantityUnit || "piece"}`,
    total: Number(item.totalPrice || 0).toFixed(2),
  }));

  const extraRows = bill?.extraCharges
    ? [
        { label: "Colie", value: Number(bill.extraCharges.rickshaw || 0) },
        { label: "Bus", value: Number(bill.extraCharges.bus || 0) },
        { label: "Other", value: Number(bill.extraCharges.other || 0) },
      ]
        .filter((entry) => entry.value > 0)
        .map((entry, index) => ({
          no: `E${index + 1}`,
          item: `${entry.label} Cost`,
          price: "-",
          qty: "-",
          total: entry.value.toFixed(2),
        }))
    : [];

  const allRows = [...itemRows, ...extraRows];

  doc.autoTable({
    head: [columns.map((col) => col.header)],
    body: allRows.map((row) => columns.map((col) => row[col.dataKey])),
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

  const totalAmount =
    bill.totalAmount ??
    (bill.items || []).reduce((sum, item) => sum + Number(item.totalPrice || 0), 0);
  const finalY = doc.lastAutoTable?.finalY || 20;
  const gst = bill.gst || {};
  const gstEnabled = Boolean(gst.enabled);
  const gstRate = Number(gst.rate || 0);
  const gstAmount = Number(gst.amount || 0);
  let summaryY = finalY + 8;
  if (gstEnabled) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`GST (${gstRate}%) - RS. ${gstAmount.toFixed(2)}`, 140, summaryY);
    summaryY += 6;
  }
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(`Grand Total - RS. ${Math.round(Number(totalAmount || 0))}`, 140, summaryY);

  const safeName = `${billDate}-${bill.name || "customer"}`
    .split("")
    .filter((char) => char.charCodeAt(0) >= 32)
    .join("")
    .replace(/[<>:"/\\|?*]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 60);
  doc.save(`bill-${safeName}.pdf`);
};
