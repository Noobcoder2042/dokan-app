export const buildThermalBillHtml = ({
  printerWidth = "80mm",
  billDate = "",
  billTime = "",
  customerName = "",
  customerPhone = "",
  customerAddress = "",
  items = [],
  extraChargeEntries = [],
  subtotal = 0,
  extraTotal = 0,
  grandTotal = 0,
}) => {
  const rows = items
    .map(
      (item, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>${item.name}</td>
        <td class="right">
          ${Math.round(item.price || 0)}<br/>
          <small>${item.priceUnit === "dozen" ? "Dz" : "Ps"}</small>
        </td>
        <td class="right">
          ${item.quantity}<br/>
          <small>${item.quantityUnit === "dozen" ? "Dz" : "Ps"}</small>
        </td>
        <td class="right">
          ${Math.round(Number(item.totalPrice || 0))}
        </td>
      </tr>
    `,
    )
    .join("");

  const extraRows = extraChargeEntries
    .map(
      (entry) => `
        <tr>
          <td colspan="4">
            ${entry.label === "riksaw cost" ? "Coil Cost" : entry.label}
          </td>
          <td class="right">${Math.round(entry.value || 0)}</td>
        </tr>
      `,
    )
    .join("");

  return `
    <html>
      <head>
        <title>Thermal Bill</title>

        <style>
          @page {
            size: ${printerWidth} auto;
            margin: 0;
          }

          body {
            font-family: Arial, sans-serif;
            width: 100%;
            max-width: 72mm;
            margin: 0 auto;
            padding: 1mm;
            color: #000;
            font-size: 11px;
          }

          .head {
            text-align: center;
            margin-bottom: 6px;
          }

          .memo {
            font-size: 18px;
            font-weight: 900;
            margin: 0;
            letter-spacing: 1px;
          }

          .meta-row {
            display: flex;
            justify-content: space-between;
            font-size: 13px;
            margin: 2px 0;
            margin-bottom: 6px;
          }

          .meta-left {
            text-align: left;
          }

          .meta-right {
            text-align: right;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
            margin-top: 4px;
          }

          th, td {
            border-bottom: 1px dashed #000;
            padding: 2px 0;
            vertical-align: top;
          }

          th {
            text-align: left;
            font-weight: bold;
          }

          th:nth-child(1), td:nth-child(1) { width: 8%; }
          th:nth-child(2), td:nth-child(2) { width: 36%; }
          th:nth-child(3), td:nth-child(3) { width: 18%; }
          th:nth-child(4), td:nth-child(4) { width: 14%; }
          th:nth-child(5), td:nth-child(5) { width: 24%; }

          .right {
            text-align: right;
          }

          .summary {
            margin-top: 4px;
          }

          .summary div {
            font-size: 11px;
            margin: 1px 0;
          }

          .total {
            font-weight: 900;
            text-align: center;
            font-size: 18px;
            margin-top: 6px;
            border-top: 2px solid #000;
            padding-top: 5px;
          }

          .footer {
            text-align: center;
            margin-top: 6px;
            font-size: 10px;
          }
        </style>
      </head>

      <body>

        <div class="meta-row">
          <div class="meta-left">
            Name: ${customerName}
          </div>
          <div class="meta-right">
            ${billDate ? `Date: ${billDate}` : ""}
          </div>
        </div>

        <div class="meta-row">
          <div class="meta-left">
            Phone: ${customerPhone}
          </div>
          <div class="meta-right">
            ${billTime ? `Time: ${billTime}` : ""}
          </div>
        </div>

        ${
          customerAddress
            ? `
        <div class="meta-row">
          <div class="meta-left">
            Address: ${customerAddress}
          </div>
          <div></div>
        </div>
        `
            : ""
        }

        <table>
          <thead>
            <tr>
              <th>No</th>
              <th>Item</th>
              <th class="right">Price</th>
              <th class="right">Qty</th>
              <th class="right">Total</th>
            </tr>
          </thead>

          <tbody>
            ${rows}
            ${extraRows}
          </tbody>
        </table>

        <div class="summary">
          <div>Subtotal: ${Math.round(Number(subtotal || 0))}</div>
          <div>Extra Cost: ${Math.round(Number(extraTotal || 0))}</div>
        </div>

        <div class="total">
          ₹ ${Math.round(Number(grandTotal || 0))}
        </div>

        <div class="footer">
          Thank you! Visit again 🙏
        </div>
      </body>
    </html>
  `;
};
