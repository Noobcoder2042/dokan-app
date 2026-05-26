import { useDeferredValue, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Paper,
  Snackbar,
  Skeleton,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
  Tooltip,
  IconButton,
  InputAdornment,
  useTheme,
  alpha
} from "@mui/material";
import FilterAltRoundedIcon from "@mui/icons-material/FilterAltRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import PrintRoundedIcon from "@mui/icons-material/PrintRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import FileDownloadRoundedIcon from "@mui/icons-material/FileDownloadRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import MergeTypeRoundedIcon from "@mui/icons-material/MergeTypeRounded";
import jsPDF from "jspdf";
import "jspdf-autotable";
import Fuse from "fuse.js";
import { buildThermalBillHtml } from "./calculator/thermalPrint";
import {
  WHATSAPP_BILL_SHARE_MODES,
  buildWhatsAppMessage,
  openWhatsAppMessage,
  saveBillPdf,
} from "../utils/whatsappUtils";
import BillDialog from "./BillDialog";
import BillsTable from "./BillsTable";
import CustomerInfoTable from "./CustomerInfoTable";
import StatsCards from "./StatsCards";
import { useShop } from "../context/ShopContext";
import { useAuth } from "../context/AuthContext";
import {
  deleteBillForShop,
  deleteCustomerForShop,
  subscribeToShopBills,
  subscribeToShopCustomers,
  updateBillForShop,
  updateCustomerForShop,
} from "../services/shopData";

const filterOptions = [
  { label: "Today", value: "today" },
  { label: "Last 3 Days", value: "3" },
  { label: "Last 7 Days", value: "7" },
  { label: "Last 15 Days", value: "15" },
  { label: "Last 30 Days", value: "30" },
  { label: "Custom Range", value: "custom" },
];

const getBillDate = (bill) => {
  if (bill.createdAt) {
    const parsed = new Date(bill.createdAt);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }

  if (!bill.date) return null;
  const [day, month, year] = bill.date.split("/");
  const fullYear = year?.length === 2 ? Number(`20${year}`) : Number(year);
  const parsed = new Date(fullYear, Number(month) - 1, Number(day));
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const normalizePhone = (value) => (value || "").toString().replace(/[^\d]/g, "");
const normalizeText = (value) =>
  (value || "")
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .trim();

const getCustomerDedupKey = (customer) => {
  const phoneKey = normalizePhone(customer.phoneNumber);
  if (phoneKey) return `phone:${phoneKey}`;

  const nameKey = normalizeText(customer.name);
  const addressKey = normalizeText(customer.address);
  return `name:${nameKey}|address:${addressKey}`;
};

const parseDateValue = (value) => {
  if (!value) return 0;
  if (typeof value?.toDate === "function") {
    return value.toDate().getTime();
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime();
};

const Dashboard = () => {
  const { user } = useAuth();
  const [bills, setBills] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loadingBills, setLoadingBills] = useState(true);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedBill, setSelectedBill] = useState(null);
  const [activeTab, setActiveTab] = useState("bills");
  const [customerTabLoading, setCustomerTabLoading] = useState(false);
  const [dateFilter, setDateFilter] = useState("today");
  const [customerRecentFilter, setCustomerRecentFilter] = useState("all");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const dashboardStatsStorageKey = `dashboard-show-stats-${user?.uid || "guest"}`;
  const [showStats, setShowStats] = useState(() => {
    const savedValue = localStorage.getItem(dashboardStatsStorageKey);
    return savedValue ? JSON.parse(savedValue) : true;
  });

  const [editingBill, setEditingBill] = useState(null);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [viewingCustomer, setViewingCustomer] = useState(null);
  const [confirmState, setConfirmState] = useState({
    open: false,
    type: "",
    payload: null,
  });
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const { activeShopId, shop } = useShop();
  const theme = useTheme();

  const openToast = (message, severity = "success") => {
    setToast({ open: true, message, severity });
  };

  const cleanPhone = (value) => (value || "").toString().replace(/[^\d]/g, "");

  const handleSendBillWhatsApp = (bill) => {
    const rawPhone = (bill?.phoneNumber || "").toString().trim();
    const cleanedDigits = rawPhone.replace(/[^\d]/g, "");

    if (!cleanedDigits) {
      openToast("Customer phone number is missing", "error");
      return;
    }

    const shareMode = shop.whatsappBillShareMode || WHATSAPP_BILL_SHARE_MODES.TOTAL_TEXT;
    const message = buildWhatsAppMessage({
      template: shop.whatsappMessage,
      customerName: bill?.name || "Customer",
      customerPhone: bill?.phoneNumber || "",
      shopName: shop.name || bill?.shopName || "Shop",
      totalAmount: bill?.totalAmount,
      billDate: bill?.date || "",
      includeTotal: shareMode === WHATSAPP_BILL_SHARE_MODES.TOTAL_TEXT,
    });

    if (shareMode === WHATSAPP_BILL_SHARE_MODES.PDF_BILL) {
      saveBillPdf(bill, shop);
      openToast("PDF bill downloaded. Attach it in WhatsApp after the chat opens.", "info");
    }

    openWhatsAppMessage(cleanedDigits, message);
  };

  useEffect(() => {
    if (!user?.uid) {
      setBills([]);
      setLoadingBills(false);
      return () => {};
    }

    const unsubscribe = subscribeToShopBills(
      activeShopId,
      user.uid,
      (data) => {
        setBills(data);
        setLoadingBills(false);
      },
      () => {
        setLoadingBills(false);
        openToast("Failed to load bills", "error");
      }
    );

    return () => unsubscribe();
  }, [activeShopId, user?.uid]);

  useEffect(() => {
    const unsubscribe = subscribeToShopCustomers(
      activeShopId,
      (data) => {
        setCustomers(data);
        setLoadingCustomers(false);
      },
      () => {
        setLoadingCustomers(false);
        openToast("Failed to load customers", "error");
      }
    );

    return () => unsubscribe();
  }, [activeShopId]);

  useEffect(() => {
    localStorage.setItem(dashboardStatsStorageKey, JSON.stringify(showStats));
  }, [dashboardStatsStorageKey, showStats]);

  useEffect(() => {
    if (activeTab !== "customers") return undefined;
    setCustomerTabLoading(true);
    const timer = setTimeout(() => setCustomerTabLoading(false), 450);
    return () => clearTimeout(timer);
  }, [activeTab]);

  const normalizedSearch = search.trim();
  const deferredSearch = useDeferredValue(normalizedSearch);
  const numericSearch = normalizedSearch.replace(/[^\d+]/g, "");
  const isPhoneSearch =
    activeTab === "bills" &&
    normalizedSearch.length > 0 &&
    /^\+?\d+$/.test(numericSearch);

  const filteredByDateBills = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59,
      999
    );

    return bills.filter((bill) => {
      const billDate = getBillDate(bill);
      if (!billDate) return false;

      if (dateFilter === "today") return billDate >= todayStart && billDate <= todayEnd;

      if (dateFilter === "custom") {
        if (!customStartDate || !customEndDate) return true;
        const start = new Date(`${customStartDate}T00:00:00`);
        const end = new Date(`${customEndDate}T23:59:59`);
        return billDate >= start && billDate <= end;
      }

      const days = Number(dateFilter);
      const start = new Date(todayStart);
      start.setDate(start.getDate() - (days - 1));
      return billDate >= start && billDate <= todayEnd;
    });
  }, [bills, customEndDate, customStartDate, dateFilter]);

  const filteredBills = useMemo(() => {
    if (!deferredSearch) return filteredByDateBills;

    if (isPhoneSearch) {
      return filteredByDateBills.filter((bill) =>
        (bill.phoneNumber || "").replace(/[^\d+]/g, "").includes(numericSearch)
      );
    }

    const fuse = new Fuse(filteredByDateBills, {
      includeScore: true,
      threshold: 0.35,
      ignoreLocation: true,
      keys: [
        { name: "name", weight: 0.65 },
        { name: "phoneNumber", weight: 0.25 },
        { name: "address", weight: 0.1 },
      ],
    });
    return fuse.search(deferredSearch).map((result) => result.item);
  }, [deferredSearch, filteredByDateBills, isPhoneSearch, numericSearch]);

  const mergedCustomers = useMemo(() => {
    const fromCustomers = new Map();

    customers.forEach((customer) => {
      const key = customer.id || `${customer.name}-${customer.phoneNumber || ""}`;
      fromCustomers.set(key, customer);
    });

    bills.forEach((bill) => {
      if (!bill.name) return;
      const key = `bill-${bill.name}-${bill.phoneNumber || ""}`;
      if (!fromCustomers.has(key)) {
        fromCustomers.set(key, {
          id: key,
          name: bill.name,
          phoneNumber: bill.phoneNumber || "",
          address: bill.address || "",
        });
      }
    });

    return Array.from(fromCustomers.values());
  }, [bills, customers]);

  const customersWithStats = useMemo(() => {
    const statsByKey = new Map();

    bills.forEach((bill) => {
      const phone = cleanPhone(bill.phoneNumber);
      const name = normalizeText(bill.name);
      const key = phone ? `phone:${phone}` : `name:${name}`;
      const current = statsByKey.get(key) || {
        totalBills: 0,
        totalSpend: 0,
        lastBillTs: 0,
      };
      current.totalBills += 1;
      current.totalSpend += Number(bill.totalAmount || 0);
      current.lastBillTs = Math.max(
        current.lastBillTs,
        parseDateValue(bill.createdAt || bill.date),
      );
      statsByKey.set(key, current);
    });

    return mergedCustomers.map((customer) => {
      const key = cleanPhone(customer.phoneNumber)
        ? `phone:${cleanPhone(customer.phoneNumber)}`
        : `name:${normalizeText(customer.name)}`;
      const stats = statsByKey.get(key) || {
        totalBills: 0,
        totalSpend: 0,
        lastBillTs: 0,
      };

      return {
        ...customer,
        totalBills: stats.totalBills,
        totalSpend: stats.totalSpend,
        lastBillTs: stats.lastBillTs,
        lastBillDate: stats.lastBillTs
          ? new Date(stats.lastBillTs).toLocaleDateString("en-IN")
          : "-",
      };
    });
  }, [bills, mergedCustomers]);

  const filteredCustomers = useMemo(() => {
    const byRecency =
      customerRecentFilter === "all"
        ? customersWithStats
        : customersWithStats.filter((customer) => {
            if (!customer.lastBillTs) return false;
            const days = Number(customerRecentFilter);
            const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
            return customer.lastBillTs >= cutoff;
          });

    if (!deferredSearch) return byRecency;

    const deferredPhoneSearch = deferredSearch.replace(/[^\d]/g, "");
    const isCustomerPhoneSearch =
      deferredPhoneSearch.length >= 3 && /^\d+$/.test(deferredPhoneSearch);
    if (isCustomerPhoneSearch) {
      return byRecency.filter((customer) =>
        cleanPhone(customer.phoneNumber).includes(deferredPhoneSearch),
      );
    }

    const fuse = new Fuse(byRecency, {
      includeScore: true,
      threshold: 0.35,
      ignoreLocation: true,
      minMatchCharLength: 2,
      keys: [
        { name: "name", weight: 0.55 },
        { name: "phoneNumber", weight: 0.35 },
        { name: "address", weight: 0.1 },
      ],
    });
    return fuse.search(deferredSearch, { limit: 200 }).map((result) => result.item);
  }, [customerRecentFilter, customersWithStats, deferredSearch]);

  const smartCustomerOptions = useMemo(() => {
    if (activeTab !== "bills") return mergedCustomers.slice(0, 120);
    if (!deferredSearch) return mergedCustomers.slice(0, 120);

    if (isPhoneSearch) {
      return mergedCustomers.filter((customer) =>
        (customer.phoneNumber || "").replace(/[^\d+]/g, "").includes(numericSearch)
      );
    }

    const fuse = new Fuse(mergedCustomers, {
      includeScore: true,
      threshold: 0.35,
      ignoreLocation: true,
      keys: [{ name: "name", weight: 1 }],
    });
    return fuse.search(deferredSearch).map((result) => result.item).slice(0, 120);
  }, [activeTab, deferredSearch, mergedCustomers, isPhoneSearch, numericSearch]);

  const customerTabTypoSuggestions = useMemo(() => {
    if (activeTab !== "customers") return [];
    if (!normalizedSearch || normalizedSearch.length < 3) return [];
    if (!filteredCustomers.length) return [];

    const lowerQuery = normalizedSearch.toLowerCase();
    const hasDirectNameMatch = filteredCustomers.some((customer) => {
      const name = (customer.name || "").toLowerCase();
      return name === lowerQuery || name.startsWith(lowerQuery);
    });
    if (hasDirectNameMatch) return [];

    return filteredCustomers
      .map((customer) => customer.name)
      .filter(Boolean)
      .filter((name, index, list) => list.indexOf(name) === index)
      .slice(0, 3);
  }, [activeTab, filteredCustomers, normalizedSearch]);

  const handleDownloadDateRangeBills = () => {
    if (!filteredByDateBills.length) {
      openToast("No bills found for selected date range", "warning");
      return;
    }

    const doc = new jsPDF("p", "mm", "a4");
    filteredByDateBills.forEach((bill, billIndex) => {
      if (billIndex > 0) doc.addPage();

      const safeDate = bill.date || "-";
      const safeName = bill.name || "-";
      const safePhone = bill.phoneNumber || "-";
      const safeAddress = bill.address || "-";

      doc.setFontSize(15);
      doc.text("Invoice", 14, 14);
      doc.setFontSize(10);
      doc.text(`Date: ${safeDate}`, 14, 20);
      doc.text(`Customer: ${safeName}`, 14, 25);
      doc.text(`Phone: ${safePhone}`, 14, 30);
      doc.text(`Address: ${safeAddress}`, 14, 35);

      const itemRows = (bill.items || []).map((item, index) => [
        String(index + 1),
        item.name || "-",
        `${item.quantity || 0} ${item.quantityUnit || "piece"}`,
        `${item.price || 0} ${item.priceUnit || "piece"}`,
        `Rs. ${Number(item.totalPrice || 0).toFixed(2)}`,
      ]);

      const extraRows = bill?.extraCharges
        ? [
                      { label: "Colie", value: Number(bill.extraCharges.rickshaw || 0) },
            { label: "Bus", value: Number(bill.extraCharges.bus || 0) },
            { label: "Other", value: Number(bill.extraCharges.other || 0) },
          ]
            .filter((entry) => entry.value > 0)
            .map((entry, index) => [
              `E${index + 1}`,
              `${entry.label} Cost`,
              "-",
              "-",
              `Rs. ${entry.value.toFixed(2)}`,
            ])
        : [];

      const allRows = [...itemRows, ...extraRows];

      doc.autoTable({
        head: [["No.", "Item", "Qty", "Price", "Total"]],
        body: allRows,
        startY: 42,
        styles: { fontSize: 9 },
        headStyles: { fillColor: [29, 78, 216] },
      });

      const subtotal = Number(
        bill?.subtotalAmount ||
          (bill.items || []).reduce((sum, item) => sum + Number(item.totalPrice || 0), 0)
      );
      const extraTotal = Number(bill?.extraCharges?.total || 0);
      const total = Number(bill.totalAmount || 0);
      const finalY = doc.lastAutoTable?.finalY || 42;

      doc.setFontSize(10);
      doc.text(`Subtotal: Rs. ${subtotal.toFixed(2)}`, 14, finalY + 8);
      doc.text(`Extra Cost: Rs. ${extraTotal.toFixed(2)}`, 14, finalY + 13);
      doc.setFontSize(12);
      doc.text(`Grand Total: Rs. ${total.toFixed(2)}`, 14, finalY + 20);
    });

    doc.save(`bills_report_${dateFilter}_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const handlePrintDateRangeBills = () => {
    if (!filteredByDateBills.length) {
      openToast("No bills found for selected date range", "warning");
      return;
    }

    const printWindow = window.open("", "_blank", "width=420,height=760");
    if (!printWindow) {
      openToast("Allow popups to print bills", "error");
      return;
    }

    const sections = filteredByDateBills
      .map((bill, index) => {
        const extraChargeEntries = bill?.extraCharges
          ? [
              { label: "Colie", value: Number(bill.extraCharges.rickshaw || 0) },
              { label: "Bus", value: Number(bill.extraCharges.bus || 0) },
              { label: "Other", value: Number(bill.extraCharges.other || 0) },
            ].filter((entry) => entry.value > 0)
          : [];

        const thermalHtml = buildThermalBillHtml({
          heading: "Duplicate Copy",
          printerWidth: "80mm",
          billDate: bill.date || "",
          billTime: bill.time || "",
          customerName: bill.name || "",
          customerPhone: bill.phoneNumber || "",
          customerAddress: bill.address || "",
          items: bill.items || [],
          extraChargeEntries,
          subtotal:
            bill?.subtotalAmount ||
            (bill.items || []).reduce((sum, item) => sum + Number(item.totalPrice || 0), 0),
          extraTotal: bill?.extraCharges?.total || 0,
          grandTotal: bill.totalAmount || 0,
          showCustomerDetails: true,
        });

        const thermalBody = thermalHtml
          .replace(/<html[^>]*>/i, "")
          .replace(/<\/html>/i, "")
          .replace(/<head>[\s\S]*?<\/head>/i, "");

        return `
          <section class="bill ${index < filteredByDateBills.length - 1 ? "page-break" : ""}">
            ${thermalBody}
          </section>
        `;
      })
      .join("");

    printWindow.document.write(`
      <html>
        <head>
          <title>Print Bills</title>
          <meta charset="UTF-8" />
          <style>
            @page { size: 80mm auto; margin: 0; }
            body {
              font-family: Arial, sans-serif;
              width: 100%;
              max-width: 72mm;
              margin: 0 auto;
              padding: 1mm;
              color: #000;
              font-size: 11px;
            }
            .copy-heading {
              text-align: center;
              font-size: 13px;
              font-weight: 700;
              margin-bottom: 4px;
              letter-spacing: 0.4px;
            }
            .meta-row {
              display: flex;
              justify-content: space-between;
              font-size: 13px;
              margin: 2px 0;
              margin-bottom: 6px;
            }
            .meta-left { text-align: left; }
            .meta-right { text-align: right; }
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
            th { text-align: left; font-weight: bold; }
            th:nth-child(1), td:nth-child(1) { width: 8%; }
            th:nth-child(2), td:nth-child(2) { width: 36%; }
            th:nth-child(3), td:nth-child(3) { width: 18%; }
            th:nth-child(4), td:nth-child(4) { width: 14%; }
            th:nth-child(5), td:nth-child(5) { width: 24%; }
            .right { text-align: right; }
            .summary { margin-top: 4px; }
            .summary div { font-size: 11px; margin: 1px 0; }
            .total {
              font-weight: 900;
              text-align: center;
              font-size: 18px;
              margin-top: 6px;
              border-top: 2px solid #000;
              padding-top: 5px;
            }
            .footer { text-align: center; margin-top: 6px; font-size: 10px; }
            .bill { width: 100%; max-width: 72mm; margin: 0 auto 8px auto; }
            .page-break { page-break-after: always; }
          </style>
        </head>
        <body>
          ${sections}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const openConfirm = (type, payload) => {
    setConfirmState({ open: true, type, payload });
  };

  const closeConfirm = () => {
    setConfirmState({ open: false, type: "", payload: null });
  };

  const handleConfirm = async () => {
    const { type, payload } = confirmState;
    closeConfirm();
    setActionLoading(true);

    try {
      if (type === "deleteBill") {
        await deleteBillForShop(activeShopId, payload.id);
        openToast("Bill deleted");
      } else if (type === "saveBillEdit") {
        await updateBillForShop(activeShopId, payload.id, {
          name: payload.name?.trim(),
          phoneNumber: payload.phoneNumber?.trim(),
          address: payload.address?.trim(),
          date: payload.date?.trim(),
        });
        setEditingBill(null);
        openToast("Bill updated");
      } else if (type === "deleteCustomer") {
        await deleteCustomerForShop(activeShopId, payload.id);
        openToast("Customer deleted");
      } else if (type === "mergeCustomerDuplicates") {
        const duplicateGroups = findDuplicateCustomerGroups(mergedCustomers);
        const deletedCount = await mergeDuplicateCustomerGroups(duplicateGroups);
        if (deletedCount > 0) {
          openToast(`Removed ${deletedCount} duplicate customer record(s)`);
        } else {
          openToast("No duplicate customer records were merged", "warning");
        }
      } else if (type === "saveCustomerEdit") {
        await updateCustomerForShop(activeShopId, payload.id, {
          name: payload.name?.trim(),
          phoneNumber: payload.phoneNumber?.trim(),
          address: payload.address?.trim(),
        });
        setEditingCustomer(null);
        openToast("Customer updated");
      }
    } catch {
      openToast("Action failed. Please try again.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCallCustomer = (customer) => {
    const phone = cleanPhone(customer.phoneNumber);
    if (!phone) {
      openToast("Customer phone number is missing", "error");
      return;
    }
    window.open(`tel:${phone}`, "_self");
  };

  const handleCustomerWhatsApp = (customer) => {
    const phone = cleanPhone(customer.phoneNumber);
    if (!phone) {
      openToast("Customer phone number is missing", "error");
      return;
    }
    const message = buildWhatsAppMessage({
      template: shop.whatsappMessage,
      customerName: customer.name || "Customer",
      customerPhone: customer.phoneNumber || "",
      shopName: shop.name || "Shop",
    });
    openWhatsAppMessage(phone, message);
  };

  const handleCopyPhone = async (customer) => {
    const phone = customer.phoneNumber || "";
    if (!phone) {
      openToast("No phone number to copy", "error");
      return;
    }
    try {
      await navigator.clipboard.writeText(phone);
      openToast("Phone number copied");
    } catch {
      openToast("Could not copy phone number", "error");
    }
  };

  const handleExportCustomersCsv = () => {
    if (!filteredCustomers.length) {
      openToast("No customers found to export", "warning");
      return;
    }

    const rows = [
      ["Name", "Phone", "Address", "Total Bills", "Total Spend", "Last Bill Date"],
      ...filteredCustomers.map((customer) => [
        customer.name || "",
        customer.phoneNumber || "",
        customer.address || "",
        String(customer.totalBills || 0),
        Number(customer.totalSpend || 0).toFixed(2),
        customer.lastBillDate || "",
      ]),
    ];
    const csvText = rows
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csvText], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `customers-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    openToast("Customer CSV exported");
  };

  const handleExportCustomersPdf = () => {
    if (!filteredCustomers.length) {
      openToast("No customers found to export", "warning");
      return;
    }
    const doc = new jsPDF("p", "mm", "a4");
    doc.setFontSize(15);
    doc.text("Customer List", 14, 14);
    doc.setFontSize(10);
    doc.text(`Date: ${new Date().toLocaleDateString("en-IN")}`, 14, 20);

    const body = filteredCustomers.map((customer, index) => [
      String(index + 1),
      customer.name || "-",
      customer.phoneNumber || "-",
      customer.address || "-",
      String(customer.totalBills || 0),
      `Rs. ${Number(customer.totalSpend || 0).toFixed(2)}`,
      customer.lastBillDate || "-",
    ]);

    doc.autoTable({
      head: [["No.", "Name", "Phone", "Address", "Bills", "Spend", "Last Bill"]],
      body,
      startY: 26,
      styles: { fontSize: 8.5 },
      headStyles: { fillColor: [29, 78, 216] },
    });
    doc.save(`customers-${new Date().toISOString().slice(0, 10)}.pdf`);
    openToast("Customer PDF exported");
  };

  const findDuplicateCustomerGroups = (sourceCustomers) => {
    const groups = sourceCustomers.reduce((acc, customer) => {
      const key = getCustomerDedupKey(customer);
      if (!acc.has(key)) acc.set(key, []);
      acc.get(key).push(customer);
      return acc;
    }, new Map());

    return Array.from(groups.values()).filter((group) => group.length > 1);
  };

  const prepareDuplicateCustomerMerge = () => {
    const duplicateGroups = findDuplicateCustomerGroups(mergedCustomers);
    if (!duplicateGroups.length) {
      openToast("No duplicate customers found");
      return;
    }

    openConfirm("mergeCustomerDuplicates", {
      groupsCount: duplicateGroups.length,
      duplicatesCount: duplicateGroups.reduce((sum, group) => sum + group.length, 0),
    });
  };

  const mergeDuplicateCustomerGroups = async (duplicateGroups) => {
    let deletedCount = 0;

    for (const group of duplicateGroups) {
      const sorted = [...group].sort((a, b) => {
        const aTime = Math.max(
          parseDateValue(a.updatedAt),
          parseDateValue(a.lastBilledAt),
          parseDateValue(a.createdAt)
        );
        const bTime = Math.max(
          parseDateValue(b.updatedAt),
          parseDateValue(b.lastBilledAt),
          parseDateValue(b.createdAt)
        );
        return bTime - aTime;
      });

      const keeper = sorted.find((entry) => entry.id && !entry.id.startsWith("bill-")) || sorted[0];
      const duplicates = sorted.filter((entry) => entry !== keeper && entry.id && !entry.id.startsWith("bill-"));

      if (!keeper.id || keeper.id.startsWith("bill-")) {
        continue;
      }

      const mergedName =
        keeper.name || sorted.find((entry) => entry.name)?.name || "";
      const mergedPhone =
        keeper.phoneNumber || sorted.find((entry) => entry.phoneNumber)?.phoneNumber || "";
      const mergedAddress =
        keeper.address || sorted.find((entry) => entry.address)?.address || "";

      if (
        mergedName !== (keeper.name || "") ||
        mergedPhone !== (keeper.phoneNumber || "") ||
        mergedAddress !== (keeper.address || "")
      ) {
        await updateCustomerForShop(activeShopId, keeper.id, {
          name: mergedName,
          phoneNumber: mergedPhone,
          address: mergedAddress,
        });
      }

      for (const duplicate of duplicates) {
        await deleteCustomerForShop(activeShopId, duplicate.id);
        deletedCount += 1;
      }
    }

    return deletedCount;
  };

  const confirmTitle =
    confirmState.type === "deleteBill" || confirmState.type === "deleteCustomer"
      ? "Delete"
      : confirmState.type === "mergeCustomerDuplicates"
        ? "Merge Duplicate Customers"
        : "Save Changes";

  const confirmDescription =
    confirmState.type === "deleteBill"
      ? "Are you sure? This bill will be deleted."
      : confirmState.type === "deleteCustomer"
        ? "Are you sure? This customer will be deleted."
        : confirmState.type === "mergeCustomerDuplicates"
          ? `Found ${confirmState.payload?.groupsCount || 0} duplicate group(s). Confirm to merge duplicate customer records.`
          : "Are you sure? Changes will be saved.";

  const loading = loadingBills || loadingCustomers;

  return (
    <Stack spacing={3}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 3.5 },
          borderRadius: 4,
          background: theme.palette.mode === "dark"
              ? `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)} 0%, ${alpha(theme.palette.background.paper, 0.4)} 100%)`
              : `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.05)} 0%, ${alpha(theme.palette.background.paper, 0.8)} 100%)`,
          backdropFilter: "blur(12px)",
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: theme.palette.mode === "dark" 
              ? `0 8px 32px 0 ${alpha('#000', 0.3)}` 
              : `0 8px 32px 0 ${alpha(theme.palette.primary.main, 0.05)}`,
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", md: "center" }}
          spacing={2}
        >
          <Box>
            <Typography variant="h4" fontWeight="700" sx={{ mb: 0.5, letterSpacing: '-0.02em' }}>
              Sales Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Track shop performance, customer activity, and billing history for{" "}
              <Box component="span" fontWeight="600" color="text.primary">
                {shop.name || "your active shop"}
              </Box>.
            </Typography>
          </Box>
          <Tooltip title={showStats ? "Hide analytical summary" : "Show analytical summary"}>
            <Button
              variant="contained"
              color={showStats ? "secondary" : "primary"}
              startIcon={showStats ? <VisibilityOffRoundedIcon /> : <VisibilityRoundedIcon />}
              onClick={() => setShowStats((current) => !current)}
              sx={{
                borderRadius: 3,
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
                boxShadow: `0 4px 14px 0 ${alpha(theme.palette[showStats ? 'secondary' : 'primary'].main, 0.4)}`,
                '&:hover': {
                  boxShadow: `0 6px 20px 0 ${alpha(theme.palette[showStats ? 'secondary' : 'primary'].main, 0.6)}`,
                }
              }}
            >
              {showStats ? "Hide Summary" : "Show Summary"}
            </Button>
          </Tooltip>
        </Stack>
      </Paper>

      {activeTab === "bills" && showStats && (
        <Box sx={{ animation: 'fadeIn 0.5s ease-in-out' }}>
          <StatsCards bills={filteredByDateBills} />
        </Box>
      )}

      <Card>
        <CardContent sx={{ p: { xs: 2, md: 3 }, '&:last-child': { pb: { xs: 2, md: 3 } } }}>
          <Stack spacing={3}>
            <Tabs
              value={activeTab}
              onChange={(_, value) => setActiveTab(value)}
              variant="scrollable"
              allowScrollButtonsMobile
              sx={{
                minHeight: 48,
                '& .MuiTabs-indicator': {
                  height: 3,
                  borderRadius: '3px 3px 0 0',
                },
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '1rem',
                  minHeight: 48,
                  color: 'text.secondary',
                  '&.Mui-selected': {
                    color: 'primary.main',
                  },
                },
                borderBottom: 1,
                borderColor: 'divider'
              }}
            >
              <Tab label="Bills & Invoices" value="bills" />
              <Tab label="Customer Directory" value="customers" />
            </Tabs>

            {activeTab === "bills" ? (
              <Stack
                direction={{ xs: "column", xl: "row" }}
                spacing={2}
                alignItems={{ xs: "stretch", xl: "center" }}
              >
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ flexGrow: 1 }}>
                   <Autocomplete
                    freeSolo
                    fullWidth
                    options={smartCustomerOptions}
                    inputValue={search}
                    getOptionLabel={(option) =>
                      typeof option === "string"
                        ? option
                        : isPhoneSearch
                          ? option.phoneNumber || option.name || ""
                          : option.name || option.phoneNumber || ""
                    }
                    onInputChange={(_, value) => setSearch(value)}
                    onChange={(_, value) => {
                      if (typeof value === "string") {
                        setSearch(value);
                        return;
                      }
                      if (value) {
                        setSearch(
                          isPhoneSearch
                            ? value.phoneNumber || value.name || ""
                            : value.name || value.phoneNumber || ""
                        );
                      }
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder="Search bills by customer or phone..."
                        variant="outlined"
                        InputProps={{
                          ...params.InputProps,
                          startAdornment: (
                            <>
                              <InputAdornment position="start" sx={{ pl: 1 }}>
                                <SearchRoundedIcon color="action" />
                              </InputAdornment>
                              {params.InputProps.startAdornment}
                            </>
                          ),
                          sx: { borderRadius: 3, backgroundColor: 'background.paper' }
                        }}
                      />
                    )}
                  />

                  <TextField
                    select
                    label="Date Filter"
                    value={dateFilter}
                    onChange={(event) => setDateFilter(event.target.value)}
                    sx={{ minWidth: { sm: 200 }, '& .MuiOutlinedInput-root': { borderRadius: 3, backgroundColor: 'background.paper' } }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <FilterAltRoundedIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  >
                    {filterOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Stack>

                {dateFilter === "custom" && (
                  <Stack direction="row" spacing={2}>
                    <TextField
                      label="Start Date"
                      type="date"
                      value={customStartDate}
                      onChange={(event) => setCustomStartDate(event.target.value)}
                      InputLabelProps={{ shrink: true }}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, backgroundColor: 'background.paper' } }}
                    />
                    <TextField
                      label="End Date"
                      type="date"
                      value={customEndDate}
                      onChange={(event) => setCustomEndDate(event.target.value)}
                      InputLabelProps={{ shrink: true }}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, backgroundColor: 'background.paper' } }}
                    />
                  </Stack>
                )}

                <Stack direction="row" spacing={1} sx={{ ml: { xl: "auto" }, justifyContent: { xs: 'flex-start', xl: 'flex-end' } }}>
                  <Tooltip title="Download Bills PDF">
                    <span>
                      <Button
                        variant="outlined"
                        color="inherit"
                        onClick={handleDownloadDateRangeBills}
                        disabled={actionLoading || !filteredByDateBills.length}
                        sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 600, minWidth: 48, width: { xs: '100%', sm: 'auto' }, px: { xs: 2, sm: 2 } }}
                        startIcon={<DownloadRoundedIcon />}
                      >
                         <Box sx={{ display: { xs: 'block', sm: 'none', md: 'block' } }}>Download</Box>
                      </Button>
                    </span>
                  </Tooltip>
                  <Tooltip title="Print Bills">
                    <span>
                      <Button
                        variant="outlined"
                        color="inherit"
                        onClick={handlePrintDateRangeBills}
                        disabled={actionLoading || !filteredByDateBills.length}
                        sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 600, minWidth: 48, width: { xs: '100%', sm: 'auto' }, px: { xs: 2, sm: 2 } }}
                        startIcon={<PrintRoundedIcon />}
                      >
                        <Box sx={{ display: { xs: 'block', sm: 'none', md: 'block' } }}>Print</Box>
                      </Button>
                    </span>
                  </Tooltip>
                </Stack>
              </Stack>
            ) : (
              <Stack spacing={2}>
                <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems="center">
                  <TextField
                    fullWidth
                    placeholder="Search customer, mobile or address..."
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchRoundedIcon color="action" />
                        </InputAdornment>
                      ),
                      sx: { borderRadius: 3, backgroundColor: 'background.paper' }
                    }}
                  />
                  <Stack direction="row" spacing={1} sx={{ width: { xs: '100%', md: 'auto' } }}>
                    <TextField
                      select
                      size="medium"
                      value={customerRecentFilter}
                      onChange={(event) => setCustomerRecentFilter(event.target.value)}
                      sx={{ minWidth: 180, '& .MuiOutlinedInput-root': { borderRadius: 3, backgroundColor: 'background.paper' } }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <FilterAltRoundedIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    >
                      <MenuItem value="all">All Customers</MenuItem>
                      <MenuItem value="30">Active (30d)</MenuItem>
                      <MenuItem value="90">Active (90d)</MenuItem>
                    </TextField>

                    <Tooltip title="Export as CSV">
                      <span>
                        <IconButton
                          color="primary"
                          onClick={handleExportCustomersCsv}
                          disabled={!filteredCustomers.length}
                          sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 3, p: 1.5, backgroundColor: 'background.paper' }}
                        >
                          <FileDownloadRoundedIcon />
                        </IconButton>
                      </span>
                    </Tooltip>
                    
                    <Tooltip title="Export as PDF">
                      <span>
                        <IconButton
                          color="secondary"
                          onClick={handleExportCustomersPdf}
                          disabled={!filteredCustomers.length}
                          sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 3, p: 1.5, backgroundColor: 'background.paper' }}
                        >
                          <DownloadRoundedIcon />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Stack>
                </Stack>
                
                <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} sx={{ flexWrap: 'wrap', gap: 2 }}>
                  <Box>
                    {customerTabTypoSuggestions.length > 0 && (
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: "wrap", rowGap: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          Did you mean:
                        </Typography>
                        {customerTabTypoSuggestions.map((name) => (
                          <Button
                            key={`cust-typo-${name}`}
                            size="small"
                            variant="outlined"
                            onClick={() => setSearch(name)}
                            sx={{ borderRadius: 4, textTransform: 'none', py: 0 }}
                          >
                            {name}
                          </Button>
                        ))}
                      </Stack>
                    )}
                  </Box>

                  <Tooltip title="Merge duplicate customer records into single profiles">
                    <span>
                      <Button
                        variant="outlined"
                        color="warning"
                        startIcon={<MergeTypeRoundedIcon />}
                        onClick={prepareDuplicateCustomerMerge}
                        disabled={actionLoading || !mergedCustomers.length}
                        sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 600, width: { xs: '100%', sm: 'auto' } }}
                      >
                        Merge Duplicates
                      </Button>
                    </span>
                  </Tooltip>
                </Stack>
              </Stack>
            )}
          </Stack>
        </CardContent>
      </Card>

      {/* Tables Section */}
      <Box sx={{ animation: 'fadeIn 0.4s ease-in-out' }}>
        {loading ? (
          <Paper elevation={0} sx={{ p: 8, textAlign: "center", borderRadius: 4, border: `1px dashed ${theme.palette.divider}`, background: 'transparent' }}>
            <CircularProgress size={48} thickness={4} />
            <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
              Loading your data...
            </Typography>
          </Paper>
        ) : activeTab === "customers" && customerTabLoading ? (
          <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: `1px solid ${theme.palette.divider}`, background: 'transparent' }}>
            <Stack spacing={2.5}>
              {Array.from({ length: 6 }).map((_, index) => (
                <Box key={`customer-skeleton-${index}`} sx={{ display: "grid", gap: 1 }}>
                  <Skeleton variant="rounded" height={24} width="30%" />
                  <Skeleton variant="rounded" height={16} width="20%" />
                  <Skeleton variant="rounded" height={16} width="40%" />
                  <Skeleton variant="rounded" height={2} width="100%" sx={{ mt: 1 }} />
                </Box>
              ))}
            </Stack>
          </Paper>
        ) : activeTab === "bills" ? (
          <BillsTable
            bills={filteredBills}
            onPreview={setSelectedBill}
            onEdit={(bill) => setEditingBill({ ...bill })}
            onDelete={(bill) => openConfirm("deleteBill", bill)}
            onWhatsApp={handleSendBillWhatsApp}
          />
        ) : (
          <CustomerInfoTable
            customers={filteredCustomers}
            onView={setViewingCustomer}
            onEdit={(customer) => setEditingCustomer({ ...customer })}
            onDelete={(customer) => openConfirm("deleteCustomer", customer)}
            onCall={handleCallCustomer}
            onWhatsApp={handleCustomerWhatsApp}
            onCopyPhone={handleCopyPhone}
          />
        )}
      </Box>

      <BillDialog bill={selectedBill} onClose={() => setSelectedBill(null)} />

      <Dialog 
        open={Boolean(viewingCustomer)} 
        onClose={() => setViewingCustomer(null)} 
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Customer Details</DialogTitle>
        <DialogContent>
          {viewingCustomer ? (
            <Stack spacing={1.5} sx={{ mt: 1 }}>
              <Typography><strong>Name:</strong> {viewingCustomer.name || "-"}</Typography>
              <Typography><strong>Phone:</strong> {viewingCustomer.phoneNumber || "-"}</Typography>
              <Typography><strong>Address:</strong> {viewingCustomer.address || "-"}</Typography>
            </Stack>
          ) : null}
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setViewingCustomer(null)} sx={{ borderRadius: 2, textTransform: 'none' }}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog 
        open={Boolean(editingBill)} 
        onClose={() => setEditingBill(null)} 
        fullWidth 
        maxWidth="sm"
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Edit Bill</DialogTitle>
        <DialogContent>
          {editingBill ? (
            <Stack spacing={2} sx={{ mt: 2 }}>
              <TextField
                label="Customer Name"
                value={editingBill.name || ""}
                onChange={(event) =>
                  setEditingBill((current) => ({ ...current, name: event.target.value }))
                }
                fullWidth
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
              <TextField
                label="Phone Number"
                value={editingBill.phoneNumber || ""}
                onChange={(event) =>
                  setEditingBill((current) => ({ ...current, phoneNumber: event.target.value }))
                }
                fullWidth
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
              <TextField
                label="Address"
                value={editingBill.address || ""}
                onChange={(event) =>
                  setEditingBill((current) => ({ ...current, address: event.target.value }))
                }
                fullWidth
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
              <TextField
                label="Date"
                value={editingBill.date || ""}
                onChange={(event) =>
                  setEditingBill((current) => ({ ...current, date: event.target.value }))
                }
                fullWidth
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Stack>
          ) : null}
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setEditingBill(null)} sx={{ borderRadius: 2, textTransform: 'none' }}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => openConfirm("saveBillEdit", editingBill)}
            disabled={!editingBill?.name || !editingBill?.phoneNumber}
            sx={{ borderRadius: 2, textTransform: 'none' }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(editingCustomer)}
        onClose={() => setEditingCustomer(null)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Edit Customer</DialogTitle>
        <DialogContent>
          {editingCustomer ? (
            <Stack spacing={2} sx={{ mt: 2 }}>
              <TextField
                label="Name"
                value={editingCustomer.name || ""}
                onChange={(event) =>
                  setEditingCustomer((current) => ({ ...current, name: event.target.value }))
                }
                fullWidth
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
              <TextField
                label="Phone Number"
                value={editingCustomer.phoneNumber || ""}
                onChange={(event) =>
                  setEditingCustomer((current) => ({
                    ...current,
                    phoneNumber: event.target.value,
                  }))
                }
                fullWidth
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
              <TextField
                label="Address"
                value={editingCustomer.address || ""}
                onChange={(event) =>
                  setEditingCustomer((current) => ({ ...current, address: event.target.value }))
                }
                fullWidth
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Stack>
          ) : null}
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setEditingCustomer(null)} sx={{ borderRadius: 2, textTransform: 'none' }}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => openConfirm("saveCustomerEdit", editingCustomer)}
            disabled={
              !editingCustomer?.name?.trim() ||
              (editingCustomer?.phoneNumber &&
                cleanPhone(editingCustomer.phoneNumber).length < 10)
            }
            sx={{ borderRadius: 2, textTransform: 'none' }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog 
        open={confirmState.open} 
        onClose={closeConfirm}
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>{confirmTitle}</DialogTitle>
        <DialogContent>
          <Typography>{confirmDescription}</Typography>
          <Typography sx={{ mt: 1, fontWeight: 600 }}>Are you sure you want to proceed?</Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={closeConfirm} sx={{ borderRadius: 2, textTransform: 'none' }}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleConfirm} disabled={actionLoading} sx={{ borderRadius: 2, textTransform: 'none' }}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast((current) => ({ ...current, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={toast.severity}
          onClose={() => setToast((current) => ({ ...current, open: false }))}
          sx={{ borderRadius: 2, boxShadow: `0 4px 12px ${alpha('#000', 0.1)}` }}
          variant="filled"
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Stack>
  );
};

export default Dashboard;
