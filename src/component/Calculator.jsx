import { useEffect, useMemo, useRef, useState } from "react";
import {
  Autocomplete,
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  ListSubheader,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ClearIcon from "@mui/icons-material/Clear";
import PrintIcon from "@mui/icons-material/Print";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import jsPDF from "jspdf";
import "jspdf-autotable";
import CustomerDetails from "./CustomerDetails";
import { buildThermalBillHtml } from "./calculator/thermalPrint";
import { useShop } from "../context/ShopContext";
import { useAuth } from "../context/AuthContext";
import {
  saveBillAndConsumeStockForShop,
  subscribeToShopBills,
  subscribeToShopCustomers,
  subscribeToShopInventoryItems,
  upsertCustomerForShop,
} from "../services/shopData";

const Calculator = () => {
  const [itemName, setItemName] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [priceUnit, setPriceUnit] = useState("piece");
  const [quantityUnit, setQuantityUnit] = useState("piece");
  const [items, setItems] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [savedBills, setSavedBills] = useState([]);
  const [customerOptions, setCustomerOptions] = useState([]);
  const [customerOptionsFromBills, setCustomerOptionsFromBills] = useState([]);
  const [historicalItemNames, setHistoricalItemNames] = useState([]);
  const [localItemNameHistory, setLocalItemNameHistory] = useState([]);
  const [inventoryItemOptions, setInventoryItemOptions] = useState([]);
  const [extraCharges, setExtraCharges] = useState({
    rickshaw: "",
    bus: "",
    other: "",
  });
  const [verifiedItems, setVerifiedItems] = useState([]);
  const { user } = useAuth();
  const { activeShopId, shop } = useShop();
  const draftsStorageKey = `savedBills-${activeShopId}-${user?.uid || "guest"}`;
  const itemHistoryStorageKey = `item-history-${activeShopId}-${user?.uid || "guest"}`;
  const offlineBillQueueStorageKey = `offline-bill-queue-${activeShopId}-${user?.uid || "guest"}`;

  const itemNameRef = useRef(null);
  const itemPriceRef = useRef(null);
  const quantityRef = useRef(null);
  const customerNameRef = useRef(null);
  const customerPhoneRef = useRef(null);
  const customerAddressRef = useRef(null);
  const lastSavedSignatureRef = useRef("");

  const handleItemNameChange = (event) => setItemName(event.target.value);
  const handleItemPriceChange = (event) => setItemPrice(event.target.value);
  const handleQuantityChange = (event) => setQuantity(event.target.value);
  const handlePriceUnitChange = (event) => setPriceUnit(event.target.value);
  const handleQuantityUnitChange = (event) =>
    setQuantityUnit(event.target.value);
  const handleCustomerNameChange = (value) => setCustomerName(value);
  const handleCustomerPhoneChange = (value) => setCustomerPhone(value);
  const handleCustomerAddressChange = (value) => setCustomerAddress(value);

  const handleCustomerSelect = (customer) => {
    setCustomerName(customer.name || "");
    setCustomerPhone(customer.phoneNumber || "");
    setCustomerAddress(customer.address || "");
  };

  // Keeps item-name suggestions alive even when old bills are deleted.
  // History is scoped per shop + user using itemHistoryStorageKey.
  const saveItemNameToLocalHistory = (value) => {
    const itemNameValue = (value || "").trim();
    if (!itemNameValue) return;

    const normalizedItemName = itemNameValue.toLowerCase();
    setLocalItemNameHistory((current) => {
      const next = [
        itemNameValue,
        ...current.filter((entry) => entry.toLowerCase() !== normalizedItemName),
      ].slice(0, 300);
      localStorage.setItem(itemHistoryStorageKey, JSON.stringify(next));
      return next;
    });
  };

  const openToast = (message, severity = "success") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const sendWhatsAppFromBilling = () => {
    const cleanDigits = (customerPhone || "").replace(/[^\d]/g, "");
    if (!cleanDigits) {
      openToast("Customer phone number is required for WhatsApp", "error");
      return;
    }

    const phoneForWhatsApp = cleanDigits.length === 10 ? `91${cleanDigits}` : cleanDigits;
    const message = `Thank you ${customerName || "Customer"} for shopping with us 🙏\nVisit again 😊`;
    const whatsappUrl = `https://wa.me/${phoneForWhatsApp}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  const resetForm = (usePreviousName = false) => {
    if (!usePreviousName) setItemName("");
    setItemPrice("");
    setQuantity("");
    setPriceUnit("piece");
    setQuantityUnit("piece");
  };

  const calculateTotalBill = () =>
    items.reduce((acc, item) => acc + item.totalPrice, 0);

  const calculateExtraChargesTotal = () =>
    ["rickshaw", "bus", "other"].reduce(
      (sum, key) => sum + Number(extraCharges[key] || 0),
      0,
    );

  const calculateGrandTotal = () =>
    calculateTotalBill() + calculateExtraChargesTotal();
  const calculateRoundedGrandTotal = () => Math.round(calculateGrandTotal());

  const normalizeValue = (value) =>
    (value || "").toString().trim().toLowerCase();

  const itemQtyToPieceQty = (qty, unit) =>
    unit === "dozen" ? Number(qty || 0) * 12 : Number(qty || 0);

  const stockToPieceQty = (stockQty, stockUnit) =>
    stockUnit === "dozen" ? Number(stockQty || 0) * 12 : Number(stockQty || 0);

  const findInventoryItemByName = (name) => {
    const normalizedName = normalizeValue(name);
    if (!normalizedName) return null;
    return (
      inventoryItemOptions.find(
        (entry) => normalizeValue(entry.name) === normalizedName,
      ) || null
    );
  };

  const findInventoryItemByCode = (code) => {
    const normalizedCode = normalizeValue(code);
    if (!normalizedCode) return null;
    return (
      inventoryItemOptions.find(
        (entry) => normalizeValue(entry.code) === normalizedCode,
      ) || null
    );
  };

  // Autofill pulls unit from inventory stockUnit so billing unit stays consistent.
  const applyInventoryAutofill = (name) => {
    setItemName(name);
    const inventoryMatch = findInventoryItemByName(name);
    if (!inventoryMatch) return;

    const matchedUnit = inventoryMatch.stockUnit === "dozen" ? "dozen" : "piece";
    if (inventoryMatch.price !== undefined && inventoryMatch.price !== null) {
      setItemPrice(String(inventoryMatch.price));
    }
    setPriceUnit(matchedUnit);
    setQuantityUnit(matchedUnit);
  };

  const buildCurrentBillSignature = () => {
    return JSON.stringify({
      shopId: activeShopId,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerAddress: customerAddress.trim(),
      items: items.map((item) => ({
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        priceUnit: item.priceUnit,
        quantityUnit: item.quantityUnit,
        totalPrice: item.totalPrice,
      })),
      extraCharges,
      totalAmount: calculateRoundedGrandTotal(),
    });
  };

  const getOfflineBillQueue = () => {
    const parsed = JSON.parse(localStorage.getItem(offlineBillQueueStorageKey) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  };

  const setOfflineBillQueue = (queue) => {
    localStorage.setItem(offlineBillQueueStorageKey, JSON.stringify(queue));
  };

  const buildStockRequests = (currentItems) =>
    currentItems.reduce((acc, entry) => {
      const itemId = entry.inventoryItemId || findInventoryItemByName(entry.name)?.id;
      if (!itemId) return acc;
      acc.push({
        itemId,
        itemName: entry.name,
        pieceQty: itemQtyToPieceQty(entry.quantity, entry.quantityUnit),
      });
      return acc;
    }, []);

  const buildBillPayload = (
    shopId,
    currentCustomerName,
    currentCustomerPhone,
    currentItems,
    totalAmount,
    createdAtIso = new Date().toISOString(),
  ) => {
    const date = new Date(createdAtIso);
    const formattedDate = date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    const formattedTime = date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    return {
      userId: user.uid,
      name: currentCustomerName,
      phoneNumber: currentCustomerPhone,
      address: customerAddress,
      shopId,
      shopName: shop.name || "Demo Shop",
      date: formattedDate,
      time: formattedTime,
      createdAt: createdAtIso,
      totalAmount: Number(totalAmount),
      subtotalAmount: Number(calculateTotalBill()),
      extraCharges: {
        ...extraCharges,
        total: Number(calculateExtraChargesTotal()),
      },
      verification: {
        totalItems: currentItems.length,
        verifiedItems: verifiedItems.filter(Boolean).length,
        completed:
          currentItems.length > 0 &&
          verifiedItems.length === currentItems.length &&
          verifiedItems.every(Boolean),
      },
      items: currentItems,
    };
  };

  const queueBillForOfflineSync = ({
    signature,
    shopId,
    currentCustomerName,
    currentCustomerPhone,
    currentItems,
    totalAmount,
  }) => {
    const createdAtIso = new Date().toISOString();
    const pendingBill = {
      signature,
      createdAtIso,
      customerName: currentCustomerName,
      customerPhone: currentCustomerPhone,
      customerAddress,
      items: currentItems,
      totalAmount,
    };

    const existingQueue = getOfflineBillQueue();
    if (existingQueue.some((entry) => entry.signature === signature)) return;
    setOfflineBillQueue([...existingQueue, pendingBill]);
    lastSavedSignatureRef.current = signature;
  };

  const addItem = (usePreviousName = false) => {
    if (itemPrice <= 0 || quantity <= 0) {
      openToast("Price and quantity must be greater than zero", "error");
      return;
    }

    const price = parseFloat(itemPrice);
    const qty = parseFloat(quantity);
    const pricePerUnit = priceUnit === "dozen" ? price / 12 : price;
    const totalQuantity = quantityUnit === "dozen" ? qty * 12 : qty;
    const totalPrice = pricePerUnit * totalQuantity;
    const inventoryMatch = findInventoryItemByName(itemName);

    if (inventoryMatch) {
      const availablePieceQty = stockToPieceQty(
        inventoryMatch.stockQty,
        inventoryMatch.stockUnit,
      );
      if (!Number.isNaN(availablePieceQty)) {
        const requestedPieceQty = itemQtyToPieceQty(qty, quantityUnit);
        if (requestedPieceQty > availablePieceQty) {
          openToast(
            `Insufficient stock. Available: ${Number(
              inventoryMatch.stockQty || 0,
            ).toFixed(2)} ${inventoryMatch.stockUnit || "piece"}`,
            "error",
          );
          return;
        }
      }
    }

    const newItem = {
      name: itemName,
      price,
      quantity: qty,
      priceUnit,
      quantityUnit,
      totalPrice,
      inventoryItemId: inventoryMatch?.id || "",
      inventoryStockUnit: inventoryMatch?.stockUnit || "piece",
    };

    setItems([...items, newItem]);
    setVerifiedItems((current) => [...current, false]);
    saveItemNameToLocalHistory(itemName);
    resetForm(usePreviousName);
    openToast("Item added successfully");
  };

  const editItem = (index) => {
    const item = items[index];
    setItemName(item.name);
    setItemPrice(item.price);
    setQuantity(item.quantity);
    setPriceUnit(item.priceUnit);
    setQuantityUnit(item.quantityUnit);
    setEditingIndex(index);
    setIsDialogOpen(true);
  };

  const updateItem = () => {
    if (itemPrice <= 0 || quantity <= 0) {
      openToast("Price and quantity must be greater than zero", "error");
      return;
    }

    const price = parseFloat(itemPrice);
    const qty = parseFloat(quantity);
    const pricePerUnit = priceUnit === "dozen" ? price / 12 : price;
    const totalQuantity = quantityUnit === "dozen" ? qty * 12 : qty;
    const totalPrice = pricePerUnit * totalQuantity;
    const inventoryMatch = findInventoryItemByName(itemName);

    if (inventoryMatch) {
      const availablePieceQty = stockToPieceQty(
        inventoryMatch.stockQty,
        inventoryMatch.stockUnit,
      );
      if (!Number.isNaN(availablePieceQty)) {
        const requestedPieceQty = itemQtyToPieceQty(qty, quantityUnit);
        if (requestedPieceQty > availablePieceQty) {
          openToast(
            `Insufficient stock. Available: ${Number(
              inventoryMatch.stockQty || 0,
            ).toFixed(2)} ${inventoryMatch.stockUnit || "piece"}`,
            "error",
          );
          return;
        }
      }
    }

    const updatedItems = [...items];
    const previousItem = updatedItems[editingIndex] || {};
    updatedItems[editingIndex] = {
      name: itemName,
      price,
      quantity: qty,
      priceUnit,
      quantityUnit,
      totalPrice,
      inventoryItemId: inventoryMatch?.id || previousItem.inventoryItemId || "",
      inventoryStockUnit:
        inventoryMatch?.stockUnit || previousItem.inventoryStockUnit || "piece",
    };

    setItems(updatedItems);
    saveItemNameToLocalHistory(itemName);
    setVerifiedItems((current) =>
      current.map((value, index) => (index === editingIndex ? false : value)),
    );
    resetForm();
    setIsDialogOpen(false);
    openToast("Item updated successfully");
  };

  const deleteItem = (index) => {
    setItems(items.filter((_, currentIndex) => currentIndex !== index));
    setVerifiedItems((current) =>
      current.filter((_, currentIndex) => currentIndex !== index),
    );
    openToast("Item deleted successfully");
  };

  const handleKeyPress = (event, ref) => {
    if (event.key === "Enter") {
      event.preventDefault();
      ref.current.focus();
    }
  };

  const handleEnterAddItem = (event) => {
    if (event.ctrlKey) return;
    if (event.key !== "Enter") return;
    event.preventDefault();
    if (!itemName || !itemPrice || !quantity) return;
    addItem(false);
  };

  // Keyboard shortcut: Ctrl + Enter adds item and keeps same item name for fast repeat billing.
  const handleAddMoreShortcut = (event) => {
    if (!(event.ctrlKey && event.key === "Enter")) return;
    event.preventDefault();
    if (!itemName || !itemPrice || !quantity) return;
    addItem(true);
  };

  // Keyboard flow: Ctrl + Right Arrow toggles both units together.
  const toggleUnit = (value) => (value === "piece" ? "dozen" : "piece");
  const handleUnitShortcut = (event) => {
    if (!(event.ctrlKey && event.key === "ArrowRight")) return;
    event.preventDefault();
    setPriceUnit((current) => toggleUnit(current));
    setQuantityUnit((current) => toggleUnit(current));
    openToast("Unit changed", "success");
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const handleExtraChargeChange = (key) => (event) => {
    setExtraCharges((current) => ({
      ...current,
      [key]: event.target.value,
    }));
  };

  const toggleVerifiedItem = (index) => {
    setVerifiedItems((current) =>
      current.map((value, currentIndex) =>
        currentIndex === index ? !value : value,
      ),
    );
  };

  const getVerifiedItemCount = () =>
    items.reduce(
      (count, _, index) => count + (verifiedItems[index] === true ? 1 : 0),
      0
    );

  const allItemsVerified = () =>
    items.length > 0 && items.every((_, index) => verifiedItems[index] === true);

  const saveBillToFirebase = async (
    shopId,
    currentCustomerName,
    currentCustomerPhone,
    currentItems,
    totalAmount,
    createdAtIso = new Date().toISOString(),
  ) => {
    const date = new Date(createdAtIso);
    const stockRequests = buildStockRequests(currentItems);
    const billPayload = buildBillPayload(
      shopId,
      currentCustomerName,
      currentCustomerPhone,
      currentItems,
      totalAmount,
      createdAtIso,
    );

    try {
      await saveBillAndConsumeStockForShop(shopId, billPayload, stockRequests);
    } catch (error) {
      console.error("Error saving bill: ", error);
      if (
        String(error?.message || "")
          .toLowerCase()
          .includes("insufficient stock")
      ) {
        openToast(error.message, "error");
      } else {
        openToast("Bill save failed. Please try again.", "error");
      }
      throw error;
    }

    try {
      await upsertCustomerForShop(shopId, {
        name: currentCustomerName,
        phoneNumber: currentCustomerPhone,
        address: customerAddress,
        lastBilledAt: createdAtIso,
      });
    } catch (error) {
      console.error("Error syncing customer: ", error);
      openToast("Bill saved, but customer info sync failed", "warning");
    }
  };

  const ensureBillSaved = async () => {
    if (!user?.uid) {
      throw new Error("User is not authenticated");
    }

    const signature = buildCurrentBillSignature();
    if (lastSavedSignatureRef.current === signature) {
      return;
    }

    await saveBillToFirebase(
      activeShopId,
      customerName,
      customerPhone,
      items,
      calculateRoundedGrandTotal(),
    );

    lastSavedSignatureRef.current = signature;
  };

  const generatePDF = async () => {
    if (!items.length) {
      openToast("Add at least one item before generating the bill", "error");
      return;
    }

    if (!allItemsVerified()) {
      openToast(
        `Verify every item before generating the bill (${getVerifiedItemCount()}/${items.length})`,
        "error"
      );
      return;
    }

    const doc = new jsPDF("landscape", "mm", [148, 210]);
    const currentDate = new Date();
    const formattedDate = `${currentDate
      .getDate()
      .toString()
      .padStart(2, "0")}/${(currentDate.getMonth() + 1)
      .toString()
      .padStart(2, "0")}/${currentDate.getFullYear().toString().slice(-2)}`;
    let hours = currentDate.getHours();
    const minutes = currentDate.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "pm" : "am";
    hours = hours % 12 || 12;
    const formattedTime = `${hours.toString().padStart(2, "0")}.${minutes}${ampm}`;

    doc.setFontSize(10);
    doc.text(`Date - ${formattedDate}`, 175, 10);
    doc.text(`Time - ${formattedTime}`, 175, 15);
    doc.text(`${shop.name || "Demo Shop"}`, 10, 10);
    doc.text(`Customer Name: ${customerName}`, 10, 15);
    doc.text(`Customer Phone: ${customerPhone}`, 10, 20);
    if (customerAddress) {
      doc.text(`Address: ${customerAddress}`, 10, 25);
    }

    const columns = [
      { header: "No.", dataKey: "no" },
      { header: "Item", dataKey: "item" },
      { header: "Price", dataKey: "price" },
      { header: "Qty", dataKey: "qty" },
      { header: "Total", dataKey: "total" },
    ];

    const rows = items.map((item, index) => ({
      no: String(index + 1),
      item: item.name,
      price: `${item.price} ${item.priceUnit}`,
      qty: `${item.quantity} ${item.quantityUnit}`,
      total: item.totalPrice.toFixed(2),
    }));

    doc.autoTable({
      head: [columns.map((col) => col.header)],
      body: rows.map((row) => columns.map((col) => row[col.dataKey])),
      startY: customerAddress ? 30 : 25,
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

    const finalY = doc.lastAutoTable.finalY || 20;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(
      `Grand Total - RS. ${Math.round(calculateGrandTotal())}`,
      140,
      finalY + 8,
    );
    doc.setFont("helvetica", "normal");
    doc.save(`invoice_${new Date().toISOString()}.pdf`);

    await ensureBillSaved();
    openToast("Bill generated successfully");
  };

  const saveBillForLaterEditing = () => {
    const bill = {
      customerName,
      customerPhone,
      customerAddress,
      extraCharges,
      verifiedItems,
      items,
    };

    const nextBills = JSON.parse(localStorage.getItem(draftsStorageKey)) || [];
    nextBills.push(bill);
    localStorage.setItem(draftsStorageKey, JSON.stringify(nextBills));
    setSavedBills(nextBills);

    openToast("Bill saved successfully for later editing");
    setCustomerName("");
    setCustomerPhone("");
    setCustomerAddress("");
    setExtraCharges({
      rickshaw: "",
      bus: "",
      other: "",
    });
    setVerifiedItems([]);
    setItems([]);
  };

  const loadBill = (index) => {
    const nextBills = JSON.parse(localStorage.getItem(draftsStorageKey)) || [];
    const bill = nextBills[index];
    setCustomerName(bill.customerName);
    setCustomerPhone(bill.customerPhone);
    setCustomerAddress(bill.customerAddress || "");
    setExtraCharges(
      bill.extraCharges || {
        rickshaw: "",
        bus: "",
        other: "",
      },
    );
    setItems(bill.items);
    setVerifiedItems(bill.verifiedItems || bill.items.map(() => false));
    openToast("Bill loaded successfully");
  };

  const deleteBill = (index) => {
    const nextBills = JSON.parse(localStorage.getItem(draftsStorageKey)) || [];
    nextBills.splice(index, 1);
    localStorage.setItem(draftsStorageKey, JSON.stringify(nextBills));
    setSavedBills(nextBills);
    openToast("Bill deleted successfully", "error");
  };

  const printThermalBill = async () => {
    if (!items.length) {
      openToast("Add at least one item before printing", "error");
      return;
    }

    if (!allItemsVerified()) {
      openToast(
        `Verify every item before printing (${getVerifiedItemCount()}/${items.length})`,
        "error"
      );
      return;
    }

    // Open popup first so user gets immediate feedback and browser popup blockers are less likely.
    const printWindow = window.open("", "_blank", "width=420,height=720");
    if (!printWindow) {
      openToast("Allow popups to print the thermal bill", "error");
      return;
    }
    printWindow.document.write(`
      <html>
        <head><title>Preparing Thermal Bill</title></head>
        <body style="font-family: Arial, sans-serif; padding: 12px;">Preparing print...</body>
      </html>
    `);
    printWindow.document.close();

    try {
      await ensureBillSaved();
    } catch (error) {
      // Allow printing when internet is down so shop workflow does not stop.
      if (!navigator.onLine) {
        queueBillForOfflineSync({
          signature: buildCurrentBillSignature(),
          shopId: activeShopId,
          currentCustomerName: customerName,
          currentCustomerPhone: customerPhone,
          currentItems: items,
          totalAmount: calculateRoundedGrandTotal(),
        });
        openToast(
          "Printed offline. Bill queued and will auto-sync when internet returns.",
          "warning"
        );
      } else {
        printWindow.close();
        openToast("Could not save bill before printing", "error");
        return;
      }
    }

    const extraChargeEntries = [
      { label: "Colie", value: Number(extraCharges.rickshaw || 0) },
      { label: "Bus", value: Number(extraCharges.bus || 0) },
      { label: "Other", value: Number(extraCharges.other || 0) },
    ].filter((entry) => entry.value > 0);

    const now = new Date();
    const billDate = now.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    const billTime = now.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    const thermalHtml = buildThermalBillHtml({
      printerWidth: shop.thermalPrinterWidth || "80mm",
      shopName: shop.name || "Shop",
      billDate,
      billTime,
      customerName,
      customerPhone,
      customerAddress,
      items,
      extraChargeEntries,
      subtotal: calculateTotalBill(),
      extraTotal: calculateExtraChargesTotal(),
      grandTotal: calculateRoundedGrandTotal(),
    });

    printWindow.document.write(thermalHtml);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  useEffect(() => {
    const nextBills = JSON.parse(localStorage.getItem(draftsStorageKey)) || [];
    setSavedBills(nextBills);
  }, [draftsStorageKey]);

  // Keep verification state aligned with current item count to avoid false
  // "verify every item" blocks when stale arrays are loaded from drafts.
  useEffect(() => {
    setVerifiedItems((current) => {
      if (current.length === items.length) return current;
      if (current.length < items.length) {
        return [...current, ...Array(items.length - current.length).fill(false)];
      }
      return current.slice(0, items.length);
    });
  }, [items.length]);

  // Load persistent item-name history once per active shop/user context.
  useEffect(() => {
    const storedHistory = JSON.parse(localStorage.getItem(itemHistoryStorageKey)) || [];
    setLocalItemNameHistory(Array.isArray(storedHistory) ? storedHistory : []);
  }, [itemHistoryStorageKey]);

  useEffect(() => {
    const unsubscribe = subscribeToShopCustomers(activeShopId, (customers) => {
      setCustomerOptions(customers);
    });

    return () => unsubscribe();
  }, [activeShopId]);

  useEffect(() => {
    if (!user?.uid || !activeShopId) return undefined;

    const syncOfflineBills = async () => {
      if (!navigator.onLine) return;
      const queue = getOfflineBillQueue();
      if (!queue.length) return;

      const remaining = [];
      let syncedCount = 0;

      for (const pending of queue) {
        try {
          await saveBillToFirebase(
            activeShopId,
            pending.customerName || "",
            pending.customerPhone || "",
            pending.items || [],
            Number(pending.totalAmount || 0),
            pending.createdAtIso,
          );
          syncedCount += 1;
        } catch (error) {
          remaining.push(pending);
        }
      }

      setOfflineBillQueue(remaining);
      if (syncedCount > 0) {
        openToast(`${syncedCount} offline bill(s) synced`, "success");
      }
    };

    syncOfflineBills();
    window.addEventListener("online", syncOfflineBills);
    return () => window.removeEventListener("online", syncOfflineBills);
  }, [activeShopId, user?.uid]);

  useEffect(() => {
    if (!user?.uid) {
      setCustomerOptionsFromBills([]);
      setHistoricalItemNames([]);
      return () => {};
    }

    const unsubscribe = subscribeToShopBills(
      activeShopId,
      user.uid,
      (bills) => {
        const uniqueCustomers = new Map();
        const uniqueItemNames = new Set();

        bills.forEach((bill) => {
          if (!bill.name) return;

          const key = `${bill.name}-${bill.phoneNumber || ""}`;
          if (!uniqueCustomers.has(key)) {
            uniqueCustomers.set(key, {
              id: key,
              name: bill.name,
              phoneNumber: bill.phoneNumber || "",
              address: bill.address || "",
            });
          }

          (bill.items || []).forEach((billItem) => {
            const normalizedItemName = (billItem.name || "").trim();
            if (normalizedItemName) uniqueItemNames.add(normalizedItemName);
          });
        });

        setCustomerOptionsFromBills(Array.from(uniqueCustomers.values()));
        setHistoricalItemNames(Array.from(uniqueItemNames));
      },
    );

    return () => unsubscribe();
  }, [activeShopId, user?.uid]);

  useEffect(() => {
    if (!user?.uid || !activeShopId) {
      setInventoryItemOptions([]);
      return () => {};
    }

    const unsubscribe = subscribeToShopInventoryItems(
      activeShopId,
      (inventoryItems) => setInventoryItemOptions(inventoryItems),
      (error) => {
        console.error("Inventory suggestions subscribe failed:", error);
        setInventoryItemOptions([]);
      },
    );

    return () => unsubscribe();
  }, [activeShopId, user?.uid]);

  const mergedCustomerOptions = useMemo(() => {
    const merged = new Map();

    customerOptionsFromBills.forEach((customer) => {
      const key = `${customer.name}-${customer.phoneNumber || ""}`;
      merged.set(key, customer);
    });

    customerOptions.forEach((customer) => {
      const key = `${customer.name}-${customer.phoneNumber || ""}`;
      merged.set(key, customer);
    });

    return Array.from(merged.values());
  }, [customerOptions, customerOptionsFromBills]);

  const itemNameOptions = useMemo(() => {
    const byName = new Map();

    inventoryItemOptions.forEach((item) => {
      const cleanedName = (item.name || "").trim();
      if (!cleanedName) return;
      byName.set(cleanedName.toLowerCase(), {
        name: cleanedName,
        code: (item.code || "").trim(),
      });
    });

    historicalItemNames.forEach((name) => {
      const cleanedName = (name || "").trim();
      if (!cleanedName) return;
      const key = cleanedName.toLowerCase();
      if (!byName.has(key)) byName.set(key, { name: cleanedName, code: "" });
    });

    localItemNameHistory.forEach((name) => {
      const cleanedName = (name || "").trim();
      if (!cleanedName) return;
      const key = cleanedName.toLowerCase();
      if (!byName.has(key)) byName.set(key, { name: cleanedName, code: "" });
    });

    return Array.from(byName.values());
  }, [historicalItemNames, inventoryItemOptions, localItemNameHistory]);

  return (
    <Stack spacing={3}>
      <Paper
        sx={{
          p: { xs: 2.5, md: 3.5 },
          borderRadius: 6,
          background:
            "linear-gradient(135deg, rgba(15, 23, 42, 0.97) 0%, rgba(29, 78, 216, 0.95) 56%, rgba(15, 118, 110, 0.92) 100%)",
          color: "white",
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          spacing={2}
        >
          <Box>
            <Typography variant="h4">Smart Billing Desk</Typography>
            <Typography sx={{ mt: 1, color: "rgba(255,255,255,0.78)" }}>
              Beautiful billing for real shop work with customer memory and fast
              printing.
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Chip
              label={`${items.length} items`}
              sx={{ bgcolor: "rgba(255,255,255,0.14)", color: "white" }}
            />
            <Chip
              label={`${mergedCustomerOptions.length} customers`}
              sx={{ bgcolor: "rgba(255,255,255,0.14)", color: "white" }}
            />
            <Chip
              label={`${verifiedItems.filter(Boolean).length}/${items.length} verified`}
              sx={{ bgcolor: "rgba(255,255,255,0.14)", color: "white" }}
            />
          </Stack>
        </Stack>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              <Stack spacing={3}>
                <Box>
                  <Typography variant="h6">Customer Details</Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.5 }}
                  >
                    Select an existing customer or create a new one in a few
                    taps.
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 0.75, display: "block" }}
                  >
                    Keyboard: Enter moves Name {"->"} Phone {"->"} Address{" "}
                    {"->"} Item Name
                  </Typography>
                </Box>

                <Grid container spacing={2}>
                  <CustomerDetails
                    customerName={customerName}
                    customerPhone={customerPhone}
                    customerAddress={customerAddress}
                    customerOptions={mergedCustomerOptions}
                    onNameChange={handleCustomerNameChange}
                    onPhoneChange={handleCustomerPhoneChange}
                    onAddressChange={handleCustomerAddressChange}
                    onCustomerSelect={handleCustomerSelect}
                    nameInputRef={customerNameRef}
                    phoneInputRef={customerPhoneRef}
                    addressInputRef={customerAddressRef}
                    onNameKeyDown={(event) =>
                      handleKeyPress(event, customerPhoneRef)
                    }
                    onPhoneKeyDown={(event) =>
                      handleKeyPress(event, customerAddressRef)
                    }
                    onAddressKeyDown={(event) =>
                      handleKeyPress(event, itemNameRef)
                    }
                  />
                </Grid>

                <Divider />

                <Box>
                  <Typography variant="h6">Item Entry</Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.5 }}
                  >
                    Add product lines quickly and keep the bill moving.
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 0.75, display: "block" }}
                  >
                    Keyboard: Enter moves fields and Enter on Quantity/Quantity
                    Unit adds item.
                  </Typography>
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Autocomplete
                      freeSolo
                      options={itemNameOptions}
                      inputValue={itemName}
                      getOptionLabel={(option) =>
                        typeof option === "string" ? option : option.name
                      }
                      filterOptions={(options, state) => {
                        const term = normalizeValue(state.inputValue);
                        if (!term) return options.slice(0, 100);
                        return options.filter((option) => {
                          const optionName = normalizeValue(option.name);
                          const optionCode = normalizeValue(option.code);
                          return optionName.includes(term) || optionCode.includes(term);
                        });
                      }}
                      onInputChange={(_, value) => {
                        setItemName(value);
                        const codeMatch = findInventoryItemByCode(value);
                        if (codeMatch) applyInventoryAutofill(codeMatch.name);
                      }}
                      onChange={(_, value) => {
                        if (typeof value === "string") {
                          applyInventoryAutofill(value);
                          return;
                        }
                        if (value?.name) applyInventoryAutofill(value.name);
                      }}
                      renderOption={(props, option) => (
                        <li {...props}>
                          {option.name}
                          {option.code ? ` (${option.code})` : ""}
                        </li>
                      )}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Item Name or Code"
                          fullWidth
                          inputRef={itemNameRef}
                          onKeyDown={(event) => {
                            if (event.key === "Enter") {
                              const codeMatch = findInventoryItemByCode(itemName);
                              if (codeMatch) {
                                applyInventoryAutofill(codeMatch.name);
                              }
                            }
                            handleAddMoreShortcut(event);
                            handleUnitShortcut(event);
                            handleKeyPress(event, itemPriceRef);
                          }}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Item Price"
                      type="number"
                      value={itemPrice}
                      onChange={handleItemPriceChange}
                      onKeyDown={(event) => {
                        handleAddMoreShortcut(event);
                        handleUnitShortcut(event);
                        handleKeyPress(event, quantityRef);
                      }}
                      fullWidth
                      inputRef={itemPriceRef}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Price Unit</InputLabel>
                      <Select
                        value={priceUnit}
                        onChange={handlePriceUnitChange}
                        onKeyDown={(event) => {
                          handleAddMoreShortcut(event);
                          handleUnitShortcut(event);
                          handleKeyPress(event, quantityRef);
                        }}
                        label="Price Unit"
                      >
                        <MenuItem value="piece">Per Piece</MenuItem>
                        <MenuItem value="dozen">Per Dozen</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Quantity"
                      type="number"
                      value={quantity}
                      onChange={handleQuantityChange}
                      onKeyDown={(event) => {
                        handleAddMoreShortcut(event);
                        handleUnitShortcut(event);
                        handleEnterAddItem(event);
                      }}
                      fullWidth
                      inputRef={quantityRef}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Quantity Unit</InputLabel>
                      <Select
                        value={quantityUnit}
                        onChange={handleQuantityUnitChange}
                        onKeyDown={(event) => {
                          handleAddMoreShortcut(event);
                          handleUnitShortcut(event);
                          handleEnterAddItem(event);
                        }}
                        label="Quantity Unit"
                      >
                        <MenuItem value="piece">Piece</MenuItem>
                        <MenuItem value="dozen">Dozen</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>

                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                  <Button
                    variant="contained"
                    onClick={() => addItem(false)}
                    disabled={!itemName || !itemPrice || !quantity}
                  >
                    Add Item
                  </Button>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() => addItem(true)}
                    disabled={!itemName || !itemPrice || !quantity}
                  >
                    Add More of Same Item
                  </Button>
                  <Button variant="text" color="inherit" onClick={resetForm}>
                    Reset Fields
                  </Button>
                </Stack>

                <Divider />

                <Box>
                  <Typography variant="h6">Extra Charges</Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.5 }}
                  >
                    Add transport or delivery charges before the final bill.
                  </Typography>
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <TextField
                      label="Colie Cost"
                      type="number"
                      value={extraCharges.rickshaw}
                      onChange={handleExtraChargeChange("rickshaw")}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      label="Bus Cost"
                      type="number"
                      value={extraCharges.bus}
                      onChange={handleExtraChargeChange("bus")}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      label="Other Charges"
                      type="number"
                      value={extraCharges.other}
                      onChange={handleExtraChargeChange("other")}
                      fullWidth
                    />
                  </Grid>
                </Grid>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Card sx={{ position: { lg: "sticky" }, top: { lg: 104 } }}>
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              <Stack spacing={2.5}>
                <Box>
                  <Typography variant="h6">Bill Summary</Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.5 }}
                  >
                    Keep the final amount and print actions within reach.
                  </Typography>
                </Box>

                <Paper
                  variant="outlined"
                  sx={{
                    p: 2.5,
                    borderRadius: 4,
                    borderColor: "rgba(148, 163, 184, 0.18)",
                    background:
                      "linear-gradient(180deg, rgba(248, 250, 252, 0.95) 0%, rgba(241, 245, 249, 0.9) 100%)",
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Subtotal
                  </Typography>
                  <Typography variant="h3" sx={{ mt: 1 }}>
                    Rs. {calculateTotalBill().toFixed(2)}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    Extra charges: Rs. {calculateExtraChargesTotal().toFixed(2)}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.5 }}
                  >
                    Grand total: Rs. {calculateRoundedGrandTotal()}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    Verified {verifiedItems.filter(Boolean).length} of{" "}
                    {items.length} items
                  </Typography>
                </Paper>

                <Paper
                  variant="outlined"
                  sx={{
                    position: "sticky",
                    bottom: 10,
                    zIndex: 5,
                    p: 1.25,
                    borderRadius: 2,
                    borderColor: "rgba(148,163,184,0.26)",
                    bgcolor: "rgba(255,255,255,0.94)",
                    backdropFilter: "blur(8px)",
                  }}
                >
                <Stack
                  direction={{ xs: "column", sm: "row", lg: "column" }}
                  spacing={1}
                >
                  <Button
                    variant="contained"
                    onClick={generatePDF}
                    disabled={
                      !customerName || !customerPhone || items.length === 0
                    }
                  >
                    Generate Bill
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<PrintIcon />}
                    onClick={printThermalBill}
                    disabled={
                      !customerName || !customerPhone || items.length === 0
                    }
                  >
                    Thermal Print
                  </Button>
                  <Button
                    variant="contained"
                    color="success"
                    onClick={saveBillForLaterEditing}
                    disabled={
                      !customerName || !customerPhone || items.length === 0
                    }
                  >
                    Save for Later
                  </Button>
                  <Button
                    variant="outlined"
                    color="success"
                    startIcon={<WhatsAppIcon />}
                    onClick={sendWhatsAppFromBilling}
                    disabled={!customerName || !customerPhone}
                  >
                    WhatsApp
                  </Button>
                </Stack>
                </Paper>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="h6">Bill Items</Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.5 }}
                  >
                    Review, edit, and remove line items before the final print.
                  </Typography>
                </Box>

                {items.length ? (
                  <List sx={{ p: 0 }}>
                    {items.map((item, index) => (
                      <ListItem
                        key={index}
                        sx={{
                          px: 0,
                          py: 1.5,
                          borderBottom:
                            index === items.length - 1
                              ? "none"
                              : "1px solid rgba(226, 232, 240, 0.9)",
                        }}
                        secondaryAction={
                          <Stack direction="row" spacing={0.5}>
                            <Checkbox
                              checked={Boolean(verifiedItems[index])}
                              onChange={() => toggleVerifiedItem(index)}
                              color="success"
                            />
                            <IconButton onClick={() => editItem(index)}>
                              <EditIcon />
                            </IconButton>
                            <IconButton onClick={() => deleteItem(index)}>
                              <DeleteIcon />
                            </IconButton>
                          </Stack>
                        }
                      >
                        <ListItemText
                          primary={`${item.name} - ${item.price} ${item.priceUnit} x ${item.quantity} ${item.quantityUnit}`}
                          secondary={`Total: Rs. ${item.totalPrice.toFixed(2)}${verifiedItems[index] ? " | Verified" : " | Pending check"}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Paper variant="outlined" sx={{ p: 3, textAlign: "center" }}>
                    <Typography variant="h6">No items added yet</Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 1 }}
                    >
                      Add your first line item to start the bill.
                    </Typography>
                  </Paper>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              <List
                sx={{ p: 0 }}
                subheader={
                  <ListSubheader
                    sx={{
                      px: 0,
                      py: 0,
                      mb: 1.5,
                      bgcolor: "transparent",
                      color: "text.primary",
                      fontSize: 18,
                      fontWeight: 700,
                    }}
                  >
                    Saved Draft Bills
                  </ListSubheader>
                }
              >
                {savedBills.length ? (
                  savedBills.map((bill, index) => (
                    <ListItem
                      key={index}
                      button
                      onClick={() => loadBill(index)}
                      sx={{
                        px: 0,
                        py: 1.5,
                        borderBottom:
                          index === savedBills.length - 1
                            ? "none"
                            : "1px solid rgba(226, 232, 240, 0.9)",
                      }}
                      secondaryAction={
                        <IconButton
                          aria-label="delete"
                          onClick={() => deleteBill(index)}
                          sx={{ color: "error.main" }}
                        >
                          <ClearIcon />
                        </IconButton>
                      }
                    >
                      <ListItemText
                        primary={`Bill for ${bill.customerName}`}
                        secondary={`Phone: ${bill.customerPhone}${bill.customerAddress ? ` | Address: ${bill.customerAddress}` : ""}`}
                      />
                    </ListItem>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Saved draft bills will appear here for quick reload.
                  </Typography>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Dialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Edit Item</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField
                label="Item Name"
                value={itemName}
                onChange={handleItemNameChange}
                onKeyPress={(event) => handleKeyPress(event, itemPriceRef)}
                fullWidth
                inputRef={itemNameRef}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Item Price"
                type="number"
                value={itemPrice}
                onChange={handleItemPriceChange}
                onKeyPress={(event) => handleKeyPress(event, quantityRef)}
                fullWidth
                inputRef={itemPriceRef}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Price Unit</InputLabel>
                <Select
                  value={priceUnit}
                  onChange={handlePriceUnitChange}
                  label="Price Unit"
                >
                  <MenuItem value="piece">Per Piece</MenuItem>
                  <MenuItem value="dozen">Per Dozen</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Quantity"
                type="number"
                value={quantity}
                onChange={handleQuantityChange}
                fullWidth
                inputRef={quantityRef}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Quantity Unit</InputLabel>
                <Select
                  value={quantityUnit}
                  onChange={handleQuantityUnitChange}
                  label="Quantity Unit"
                >
                  <MenuItem value="piece">Piece</MenuItem>
                  <MenuItem value="dozen">Dozen</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setIsDialogOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={updateItem}>Update</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Stack>
  );
};

export default Calculator;
