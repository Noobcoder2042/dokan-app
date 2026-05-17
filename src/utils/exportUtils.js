import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";

export const exportOrdersAsExcel = (orders, filename = "analytics-orders.xlsx") => {
  const rows = (orders || []).map((order) => ({
    Date: order.date || order.createdAt || "",
    Customer: order.customerName || order.name || "Unknown",
    Phone: order.customerPhone || order.phoneNumber || "",
    Total: Number(order.totalAmount || 0).toFixed(2),
    Due: Number(order.dueAmount || 0).toFixed(2),
    Payment: order.paymentMethod || "-",
    Items: (order.items || []).map((item) => `${item.itemName || item.name || "Unnamed"} (${item.quantity || 0})`).join("; "),
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");
  XLSX.writeFile(workbook, filename);
};

export const exportOrdersAsPdf = (orders, metadata = {}, filename = "analytics-orders.pdf") => {
  const doc = new jsPDF("p", "mm", "a4");
  const title = metadata.title || "Analytics Orders Report";
  const subtitle = metadata.subtitle || "Exported order summary";

  doc.setFontSize(16);
  doc.text(title, 14, 16);
  doc.setFontSize(10);
  doc.text(subtitle, 14, 24);
  if (metadata.createdAt) {
    doc.text(`Exported: ${metadata.createdAt}`, 14, 30);
  }

  const body = (orders || []).slice(0, 50).map((order) => [
    order.date || order.createdAt || "",
    order.customerName || order.name || "Unknown",
    order.customerPhone || order.phoneNumber || "",
    Number(order.totalAmount || 0).toFixed(2),
    Number(order.dueAmount || 0).toFixed(2),
    order.paymentMethod || "-",
  ]);

  doc.autoTable({
    head: [["Date", "Customer", "Phone", "Total", "Due", "Payment"]],
    body,
    startY: 36,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [29, 78, 216] },
  });

  doc.save(filename);
};
