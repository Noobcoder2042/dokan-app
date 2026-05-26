import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Paper,
  Skeleton,
  Snackbar,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
  useTheme,
  alpha,
  Tooltip,
} from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import FilterAltRoundedIcon from "@mui/icons-material/FilterAltRounded";
import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";
import TrendingDownRoundedIcon from "@mui/icons-material/TrendingDownRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import PaymentRoundedIcon from "@mui/icons-material/PaymentRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import ArrowForwardIosRoundedIcon from "@mui/icons-material/ArrowForwardIosRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";

import { useShop } from "../context/ShopContext";
import { useAuth } from "../context/AuthContext";
import { useUIExperience } from "../context/UIExperienceContext";
import { subscribeToShopBills, saveBillForShop, updateBillForShop, deleteBillForShop, subscribeToShopCustomers } from "../services/shopData";
import { recordBillPayment, recordCustomerGeneralPayment } from "../services/dueService";
import { openWhatsAppMessage } from "../utils/whatsappUtils";
import BillDialog from "./BillDialog";

export default function DueLedger() {
  const theme = useTheme();
  const { activeShopId, shop } = useShop();
  const { user } = useAuth();
  const { playSound } = useUIExperience();

  // Bills and Loading
  const [bills, setBills] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("due-desc");

  // Selection state
  const [selectedDebtorKey, setSelectedDebtorKey] = useState(null);
  const [ledgerOpen, setLedgerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("unpaid");

  // Payment Modal state
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [targetBill, setTargetBill] = useState(null); // null if general payment
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState("Cash");
  const [remarks, setRemarks] = useState("");
  const [submittingPayment, setSubmittingPayment] = useState(false);

  // Single Bill View Dialog (using local item display or mounting BillDialog)
  const [viewedBill, setViewedBill] = useState(null);

  // Manual CRUD states
  // Create Custom Due
  const [createDueOpen, setCreateDueOpen] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerPhone, setNewCustomerPhone] = useState("");
  const [newDueAmount, setNewDueAmount] = useState("");
  const [newDueRemarks, setNewDueRemarks] = useState("");
  const [submittingCreateDue, setSubmittingCreateDue] = useState(false);

  // Update Specific Bill Due
  const [editDueOpen, setEditDueOpen] = useState(false);
  const [editingBillItem, setEditingBillItem] = useState(null);
  const [editDueAmount, setEditDueAmount] = useState("");
  const [submittingEditDue, setSubmittingEditDue] = useState(false);

  // Delete Specific Bill Due
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingBillItem, setDeletingBillItem] = useState(null);
  const [submittingDeleteDue, setSubmittingDeleteDue] = useState(false);

  // Toast notifications
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const openToast = (message, severity = "success") => {
    setToast({ open: true, message, severity });
  };

  const handleToastClose = () => {
    setToast((prev) => ({ ...prev, open: false }));
  };

  // Subscribe to bills
  useEffect(() => {
    if (!user?.uid || !activeShopId) {
      setBills([]);
      setLoading(false);
      return () => {};
    }

    setLoading(true);
    const unsubscribe = subscribeToShopBills(
      activeShopId,
      user.uid,
      (data) => {
        setBills(data);
        setLoading(false);
      },
      (err) => {
        console.error("Failed to fetch bills:", err);
        setLoading(false);
        openToast("Failed to load outstanding dues", "error");
      }
    );

    return () => unsubscribe();
  }, [activeShopId, user?.uid]);

  // Subscribe to customers
  useEffect(() => {
    if (!activeShopId) {
      setCustomers([]);
      return () => {};
    }

    const unsubscribe = subscribeToShopCustomers(
      activeShopId,
      (data) => {
        setCustomers(data);
      },
      (err) => {
        console.error("Failed to load customers:", err);
      }
    );

    return () => unsubscribe();
  }, [activeShopId]);

  // Aggregation of debtors
  const debtors = useMemo(() => {
    const map = new Map();

    bills.forEach((bill) => {
      // Normalize customer identifier
      const rawPhone = (bill.phoneNumber || "").toString().trim();
      const cleanPhone = rawPhone.replace(/[^\d]/g, "");
      const name = (bill.name || "Walk-in Customer").trim();
      const address = (bill.address || "").trim();

      // We group by phone if available, else by name + address combination
      const key = cleanPhone
        ? `phone:${cleanPhone}`
        : `name:${name.toLowerCase()}|address:${address.toLowerCase()}`;

      const currentDue =
        bill.dueAmount !== undefined ? Number(bill.dueAmount) : Number(bill.totalAmount || 0);

      const current = map.get(key) || {
        key,
        name,
        phone: rawPhone,
        address,
        totalBilled: 0,
        totalDue: 0,
        bills: [],
        allBills: [],
      };

      current.totalBilled += Number(bill.totalAmount || 0);
      current.totalDue += currentDue;
      
      // Save bill details inside debtor object
      if (currentDue > 0) {
        current.bills.push({ ...bill, currentDue });
      }
      current.allBills.push({ ...bill, currentDue });

      map.set(key, current);
    });

    // Convert map to list and filter to only those who ever had/have due balances or general transactions
    return Array.from(map.values()).filter((d) => d.totalBilled > 0);
  }, [bills]);

  // Derived metrics
  const metrics = useMemo(() => {
    let totalDues = 0;
    let totalCollected = 0;
    const uniqueDebtorsSet = new Set();

    debtors.forEach((d) => {
      totalDues += d.totalDue;
      if (d.totalDue > 0) {
        uniqueDebtorsSet.add(d.key);
      }
      
      // Calculate collected dues from payments logs
      d.allBills.forEach((b) => {
        if (Array.isArray(b.payments)) {
          b.payments.forEach((p) => {
            totalCollected += Number(p.amount || 0);
          });
        }
      });
    });

    return {
      totalDues,
      debtorsCount: uniqueDebtorsSet.size,
      totalCollected,
    };
  }, [debtors]);

  // Filtered & Sorted debtors list
  const filteredDebtors = useMemo(() => {
    let list = debtors.filter((d) => d.totalDue > 0); // Only show active debtors in default ledger screen

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.phone.replace(/[^\d]/g, "").includes(q) ||
          d.phone.includes(q)
      );
    }

    list.sort((a, b) => {
      if (sortBy === "due-desc") return b.totalDue - a.totalDue;
      if (sortBy === "due-asc") return a.totalDue - b.totalDue;
      if (sortBy === "name-asc") return a.name.localeCompare(b.name);
      if (sortBy === "name-desc") return b.name.localeCompare(a.name);
      return 0;
    });

    return list;
  }, [debtors, searchQuery, sortBy]);

  // Selected debtor data
  const selectedDebtor = useMemo(() => {
    if (!selectedDebtorKey) return null;
    return debtors.find((d) => d.key === selectedDebtorKey) || null;
  }, [debtors, selectedDebtorKey]);

  // Statement payment history logs
  const paymentHistoryLogs = useMemo(() => {
    if (!selectedDebtor) return [];
    const logs = [];

    selectedDebtor.allBills.forEach((b) => {
      if (Array.isArray(b.payments)) {
        b.payments.forEach((p) => {
          logs.push({
            ...p,
            billId: b.id || b.billId || "Invoice",
            billDate: b.date || "",
            totalAmount: b.totalAmount || 0,
          });
        });
      }
    });

    // Sort by latest payment date first
    return logs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [selectedDebtor]);

  // Open statement modal
  const handleOpenLedger = (key) => {
    playSound?.("modal");
    setSelectedDebtorKey(key);
    setActiveTab("unpaid");
    setLedgerOpen(true);
  };

  // Close statement modal
  const handleCloseLedger = () => {
    playSound?.("click");
    setLedgerOpen(false);
  };

  // Open payment dialog
  const handleOpenPayment = (bill = null) => {
    playSound?.("click");
    setTargetBill(bill);
    if (bill) {
      setPaymentAmount(bill.currentDue.toString());
    } else if (selectedDebtor) {
      setPaymentAmount(selectedDebtor.totalDue.toString());
    } else {
      setPaymentAmount("");
    }
    setPaymentMode("Cash");
    setRemarks("");
    setPaymentOpen(true);
  };

  // Submit payment to Firestore
  const handleRecordPaymentSubmit = async () => {
    if (!paymentAmount || Number(paymentAmount) <= 0) {
      playSound?.("click");
      openToast("Please enter a valid positive payment amount", "warning");
      return;
    }

    if (targetBill) {
      if (Number(paymentAmount) > targetBill.currentDue) {
        playSound?.("click");
        openToast(`Entered amount Rs. ${paymentAmount} exceeds unpaid balance Rs. ${targetBill.currentDue}`, "warning");
        return;
      }
    } else if (selectedDebtor) {
      if (Number(paymentAmount) > selectedDebtor.totalDue) {
        playSound?.("click");
        openToast(`Entered amount Rs. ${paymentAmount} exceeds total customer due Rs. ${selectedDebtor.totalDue}`, "warning");
        return;
      }
    }

    setSubmittingPayment(true);
    try {
      if (targetBill) {
        // Record payment against specific invoice
        await recordBillPayment(activeShopId, targetBill.id, {
          amount: Number(paymentAmount),
          paymentMode,
          remarks: remarks.trim(),
          date: new Date().toISOString(),
        });
        playSound?.("success");
        openToast(`Successfully recorded Rs. ${paymentAmount} payment for invoice!`);
      } else if (selectedDebtor) {
        // Record general payment auto-allocated starting from oldest bills
        await recordCustomerGeneralPayment(
          activeShopId,
          user.uid,
          selectedDebtor.phone,
          Number(paymentAmount),
          paymentMode,
          remarks.trim()
        );
        playSound?.("success");
        openToast(`Successfully recorded Rs. ${paymentAmount} payment and allocated to oldest bills!`);
      }

      setPaymentOpen(false);
      // If fully paid customer due, we can close the ledger
      if (selectedDebtor && selectedDebtor.totalDue - Number(paymentAmount) <= 0) {
        setLedgerOpen(false);
      }
    } catch (err) {
      console.error("Error submitting payment:", err);
      openToast(err.message || "Payment transaction failed", "error");
    } finally {
      setSubmittingPayment(false);
    }
  };

  // Trigger WhatsApp Reminder
  const handleSendWhatsAppReminder = () => {
    playSound?.("click");
    if (!selectedDebtor || !selectedDebtor.phone) {
      openToast("No customer phone number available", "error");
      return;
    }

    const shopName = shop?.name || "our shop";
    const totalDueFormatted = selectedDebtor.totalDue.toFixed(2);
    
    // Premium formatted ledger statement reminder
    const message = `Hi ${selectedDebtor.name},\n\nThis is a friendly reminder from *${shopName}* regarding your outstanding balance of *Rs. ${totalDueFormatted}*.\n\nPlease clear your pending dues at your earliest convenience.\n\nThank you for your business! 🙏`;
    
    const rawDigits = selectedDebtor.phone.replace(/[^\d]/g, "");
    const success = openWhatsAppMessage(rawDigits, message);
    
    if (success) {
      openToast("Opening WhatsApp chat...");
    } else {
      openToast("Failed to compile WhatsApp link", "error");
    }
  };

  // Open Create Manual Due modal
  const handleOpenCreateDue = () => {
    playSound?.("click");
    setNewCustomerName("");
    setNewCustomerPhone("");
    setNewDueAmount("");
    setNewDueRemarks("");
    setCreateDueOpen(true);
  };

  // Submit Create Manual Due to Firestore
  const handleCreateDueSubmit = async () => {
    if (!newCustomerName.trim()) {
      openToast("Customer Name is required", "warning");
      return;
    }
    if (!newDueAmount || Number(newDueAmount) <= 0) {
      openToast("Please enter a valid positive due amount", "warning");
      return;
    }

    setSubmittingCreateDue(true);
    try {
      const date = new Date();
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

      const amountNum = Number(newDueAmount);
      const billPayload = {
        userId: user.uid,
        name: newCustomerName.trim(),
        phoneNumber: newCustomerPhone.trim() || "",
        address: "",
        shopId: activeShopId,
        shopName: shop.name || "Demo Shop",
        date: formattedDate,
        time: formattedTime,
        createdAt: date.toISOString(),
        totalAmount: amountNum,
        dueAmount: amountNum,
        status: "Finalized",
        version: 1,
        items: [
          {
            name: newDueRemarks.trim() || "Manual Due Entry",
            price: amountNum,
            quantity: 1,
            totalPrice: amountNum,
          },
        ],
      };

      await saveBillForShop(activeShopId, billPayload);
      playSound?.("success");
      openToast(`Successfully created Rs. ${amountNum} due entry for ${newCustomerName}!`);
      setCreateDueOpen(false);
    } catch (err) {
      console.error("Error creating manual due:", err);
      openToast(err.message || "Failed to create due entry", "error");
    } finally {
      setSubmittingCreateDue(false);
    }
  };

  // Open Edit Due Amount Dialog
  const handleOpenEditDue = (bill) => {
    playSound?.("click");
    setEditingBillItem(bill);
    setEditDueAmount(bill.currentDue.toString());
    setEditDueOpen(true);
  };

  // Submit Edit Due Amount to Firestore
  const handleEditDueSubmit = async () => {
    if (!editDueAmount || Number(editDueAmount) < 0) {
      openToast("Please enter a valid positive or zero due amount", "warning");
      return;
    }

    setSubmittingEditDue(true);
    try {
      const updatedDue = Number(editDueAmount);
      await updateBillForShop(activeShopId, editingBillItem.id, {
        dueAmount: updatedDue,
        updatedAt: new Date().toISOString(),
      });

      playSound?.("success");
      openToast(`Successfully updated due balance to Rs. ${updatedDue}`);
      setEditDueOpen(false);
    } catch (err) {
      console.error("Error updating outstanding due:", err);
      openToast(err.message || "Failed to update outstanding due", "error");
    } finally {
      setSubmittingEditDue(false);
    }
  };

  // Open Delete Due Entry Dialog
  const handleOpenDeleteDue = (bill) => {
    playSound?.("click");
    setDeletingBillItem(bill);
    setDeleteConfirmOpen(true);
  };

  // Submit Delete Due Entry to Firestore
  const handleDeleteDueSubmit = async () => {
    setSubmittingDeleteDue(true);
    try {
      await deleteBillForShop(activeShopId, deletingBillItem.id);
      playSound?.("success");
      openToast("Invoice/due entry permanently deleted");
      setDeleteConfirmOpen(false);
      
      // If we delete the last unpaid bill, close the statement modal
      if (selectedDebtor && selectedDebtor.bills.length <= 1) {
        setLedgerOpen(false);
      }
    } catch (err) {
      console.error("Error deleting due bill:", err);
      openToast("Failed to delete bill record", "error");
    } finally {
      setSubmittingDeleteDue(false);
    }
  };

  return (
    <Box sx={{ py: 3, px: { xs: 2, md: 4 } }}>
      {/* Page Title & Stats Bar */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        spacing={2}
        sx={{ mb: 4 }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: "-0.5px" }}>
            Due Payment Ledger
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage outstanding credits, customer account statements, and collect dues.
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddRoundedIcon />}
          onClick={handleOpenCreateDue}
          sx={{
            borderRadius: 2.5,
            px: 3,
            py: 1,
            textTransform: "none",
            fontWeight: 700,
            boxShadow: `0 8px 20px ${alpha(theme.palette.primary.main, 0.25)}`,
          }}
        >
          Add Manual Due
        </Button>
      </Stack>

      {/* Metric Cards Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 3,
              bgcolor: alpha(theme.palette.error.main, 0.05),
              border: `1px solid ${alpha(theme.palette.error.main, 0.15)}`,
              position: "relative",
              overflow: "hidden",
              boxShadow: "none",
              transition: "transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease",
              "&:hover": {
                transform: "translateY(-4px)",
                borderColor: alpha(theme.palette.error.main, 0.35),
                boxShadow: `0 12px 28px ${alpha(theme.palette.error.main, 0.1)}`,
              },
            }}
          >
            <Box sx={{ position: "relative", zIndex: 2 }}>
              <Typography color="error.main" sx={{ fontWeight: 600, fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "1px" }}>
                Total Pending Dues
              </Typography>
              <Typography variant="h3" sx={{ mt: 1, fontWeight: 800, color: theme.palette.text.primary }}>
                Rs. {loading ? <Skeleton width={120} sx={{ display: "inline-block" }} /> : metrics.totalDues.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Outstanding debt waiting for collection.
              </Typography>
            </Box>
            <AccountBalanceWalletRoundedIcon
              sx={{
                position: "absolute",
                right: -10,
                bottom: -10,
                fontSize: "7rem",
                color: alpha(theme.palette.error.main, 0.06),
                transform: "rotate(-15deg)",
                pointerEvents: "none",
              }}
            />
          </Paper>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 3,
              bgcolor: alpha(theme.palette.warning.main, 0.05),
              border: `1px solid ${alpha(theme.palette.warning.main, 0.15)}`,
              position: "relative",
              overflow: "hidden",
              boxShadow: "none",
              transition: "transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease",
              "&:hover": {
                transform: "translateY(-4px)",
                borderColor: alpha(theme.palette.warning.main, 0.35),
                boxShadow: `0 12px 28px ${alpha(theme.palette.warning.main, 0.1)}`,
              },
            }}
          >
            <Box sx={{ position: "relative", zIndex: 2 }}>
              <Typography color="warning.main" sx={{ fontWeight: 600, fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "1px" }}>
                Active Debtors
              </Typography>
              <Typography variant="h3" sx={{ mt: 1, fontWeight: 800, color: theme.palette.text.primary }}>
                {loading ? <Skeleton width={60} sx={{ display: "inline-block" }} /> : metrics.debtorsCount}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Store customers with outstanding invoices.
              </Typography>
            </Box>
            <PeopleAltRoundedIcon
              sx={{
                position: "absolute",
                right: -10,
                bottom: -10,
                fontSize: "7rem",
                color: alpha(theme.palette.warning.main, 0.06),
                transform: "rotate(-15deg)",
                pointerEvents: "none",
              }}
            />
          </Paper>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 3,
              bgcolor: alpha(theme.palette.success.main, 0.05),
              border: `1px solid ${alpha(theme.palette.success.main, 0.15)}`,
              position: "relative",
              overflow: "hidden",
              boxShadow: "none",
              transition: "transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease",
              "&:hover": {
                transform: "translateY(-4px)",
                borderColor: alpha(theme.palette.success.main, 0.35),
                boxShadow: `0 12px 28px ${alpha(theme.palette.success.main, 0.1)}`,
              },
            }}
          >
            <Box sx={{ position: "relative", zIndex: 2 }}>
              <Typography color="success.main" sx={{ fontWeight: 600, fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "1px" }}>
                Total Recovered Dues
              </Typography>
              <Typography variant="h3" sx={{ mt: 1, fontWeight: 800, color: theme.palette.text.primary }}>
                Rs. {loading ? <Skeleton width={120} sx={{ display: "inline-block" }} /> : metrics.totalCollected.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Historical collected balance from settlements.
              </Typography>
            </Box>
            <TrendingDownRoundedIcon
              sx={{
                position: "absolute",
                right: -10,
                bottom: -10,
                fontSize: "7rem",
                color: alpha(theme.palette.success.main, 0.06),
                transform: "rotate(-15deg)",
                pointerEvents: "none",
              }}
            />
          </Paper>
        </Grid>
      </Grid>

      {/* Main Directory Area */}
      <Card>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          {/* Controls Bar */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 3 }}
          >
            <TextField
              placeholder="Search debtor name or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ width: { xs: "100%", sm: 360 } }}
              size="small"
            />

            <Stack direction="row" spacing={2} sx={{ width: { xs: "100%", sm: "auto" } }}>
              <TextField
                select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FilterAltRoundedIcon color="action" fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                size="small"
                sx={{ minWidth: 180, flexGrow: 1 }}
              >
                <MenuItem value="due-desc">Dues: High to Low</MenuItem>
                <MenuItem value="due-asc">Dues: Low to High</MenuItem>
                <MenuItem value="name-asc">Name: A to Z</MenuItem>
                <MenuItem value="name-desc">Name: Z to A</MenuItem>
              </TextField>
            </Stack>
          </Stack>

          {/* Debtors Directory Table */}
          {loading ? (
            <Box sx={{ p: 4, textAlign: "center" }}>
              <CircularProgress size={40} sx={{ mb: 2 }} />
              <Typography color="text.secondary">Fetching store outstanding bills...</Typography>
            </Box>
          ) : filteredDebtors.length === 0 ? (
            <Paper
              sx={{
                p: 5,
                textAlign: "center",
                border: `1px dashed ${theme.palette.divider}`,
                borderRadius: 3,
                bgcolor: "transparent",
              }}
            >
              <AccountBalanceWalletRoundedIcon sx={{ fontSize: 50, color: "text.disabled", mb: 2 }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {searchQuery ? "No debtors match your search" : "No outstanding dues!"}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {searchQuery
                  ? "Try double checking the spelling or phone number."
                  : "All customers have fully settled their accounts. Excellent business health!"}
              </Typography>
            </Paper>
          ) : (
            <TableContainer component={Paper} sx={{ overflowX: "auto" }}>
              <Table>
                <TableHead sx={{ bgcolor: theme.palette.mode === "dark" ? alpha(theme.palette.background.paper, 0.4) : alpha(theme.palette.background.default, 0.5) }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Customer Detail</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Outstanding Bills</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Total Dues</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredDebtors.map((debtor) => (
                    <TableRow
                      key={debtor.key}
                      hover
                      onClick={() => handleOpenLedger(debtor.key)}
                      sx={{ cursor: "pointer", "&:last-child td, &:last-child th": { border: 0 } }}
                    >
                      <TableCell>
                        <Typography sx={{ fontWeight: 600 }}>{debtor.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {debtor.phone || "No phone linked"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={`${debtor.bills.length} unpaid bill${debtor.bills.length > 1 ? "s" : ""}`}
                          size="small"
                          color="error"
                          variant="outlined"
                          sx={{ fontWeight: 500 }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: theme.palette.error.main }}>
                        Rs. {debtor.totalDue.toFixed(2)}
                      </TableCell>
                      <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <Tooltip title="View statement ledger">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenLedger(debtor.key)}
                              color="primary"
                              sx={{ border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`, borderRadius: 1.5 }}
                            >
                              <ArrowForwardIosRoundedIcon fontSize="small" sx={{ fontSize: "0.85rem" }} />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Ledger Account Statement Dialog */}
      {selectedDebtor && (
        <Dialog
          open={ledgerOpen}
          onClose={handleCloseLedger}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              boxShadow: theme.shadows[24],
            },
          }}
        >
          <DialogTitle sx={{ m: 0, p: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                {selectedDebtor.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedDebtor.phone ? `Phone: ${selectedDebtor.phone}` : "No phone number linked"}
              </Typography>
            </Box>
            <IconButton onClick={handleCloseLedger} sx={{ color: "text.secondary" }}>
              <CloseRoundedIcon />
            </IconButton>
          </DialogTitle>

          <DialogContent dividers sx={{ p: 3 }}>
            {/* Account Summary Cards */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
              <Grid item xs={4}>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, textAlign: "center", bgcolor: "transparent" }}>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", fontWeight: 600 }}>
                    Total Billed
                  </Typography>
                  <Typography variant="h6" sx={{ mt: 0.5, fontWeight: 700 }}>
                    Rs. {selectedDebtor.totalBilled.toFixed(2)}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={4}>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, textAlign: "center", bgcolor: "transparent" }}>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", fontWeight: 600 }}>
                    Total Paid
                  </Typography>
                  <Typography variant="h6" sx={{ mt: 0.5, fontWeight: 700, color: "success.main" }}>
                    Rs. {(selectedDebtor.totalBilled - selectedDebtor.totalDue).toFixed(2)}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={4}>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, textAlign: "center", bgcolor: alpha(theme.palette.error.main, 0.03), borderColor: alpha(theme.palette.error.main, 0.15) }}>
                  <Typography variant="caption" color="error.main" sx={{ textTransform: "uppercase", fontWeight: 600 }}>
                    Remaining Due
                  </Typography>
                  <Typography variant="h6" sx={{ mt: 0.5, fontWeight: 700, color: "error.main" }}>
                    Rs. {selectedDebtor.totalDue.toFixed(2)}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            {/* Tabs for Unpaid Invoices & Payment Logs */}
            <Tabs
              value={activeTab}
              onChange={(_, val) => {
                playSound?.("click");
                setActiveTab(val);
              }}
              variant="fullWidth"
              sx={{
                mb: 3,
                borderBottom: 1,
                borderColor: "divider",
                "& .MuiTab-root": { fontWeight: 600 },
              }}
            >
              <Tab icon={<ReceiptLongRoundedIcon fontSize="small" />} iconPosition="start" label="Outstanding Invoices" value="unpaid" />
              <Tab icon={<HistoryRoundedIcon fontSize="small" />} iconPosition="start" label="Payment Settlement Logs" value="history" />
            </Tabs>

            {/* TAB CONTENTS */}
            {activeTab === "unpaid" ? (
              selectedDebtor.bills.length === 0 ? (
                <Box sx={{ p: 4, textAlign: "center" }}>
                  <Typography color="text.secondary">All invoices have been fully settled!</Typography>
                </Box>
              ) : (
                <TableContainer component={Paper} sx={{ overflowX: "auto" }}>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: theme.palette.mode === "dark" ? alpha(theme.palette.background.paper, 0.4) : alpha(theme.palette.background.default, 0.5) }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Invoice ID</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Grand Total</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Remaining Due</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedDebtor.bills.map((bill) => (
                        <TableRow key={bill.id} hover>
                          <TableCell>{bill.date || new Date(bill.createdAt).toLocaleDateString("en-IN")}</TableCell>
                          <TableCell>
                            <Typography
                              onClick={() => {
                                playSound?.("click");
                                setViewedBill(bill);
                              }}
                              variant="body2"
                              sx={{
                                textDecoration: "underline",
                                color: "primary.main",
                                cursor: "pointer",
                                fontWeight: 500,
                              }}
                            >
                              {(bill.id || "").substring(0, 8)}...
                            </Typography>
                          </TableCell>
                          <TableCell>Rs. {Number(bill.totalAmount || 0).toFixed(2)}</TableCell>
                          <TableCell sx={{ fontWeight: 700, color: "error.main" }}>
                            Rs. {bill.currentDue.toFixed(2)}
                          </TableCell>
                          <TableCell align="right">
                            <Stack direction="row" spacing={1} justifyContent="flex-end" alignItems="center">
                              <Button
                                variant="contained"
                                color="success"
                                size="small"
                                onClick={() => handleOpenPayment(bill)}
                                startIcon={<PaymentRoundedIcon sx={{ fontSize: "1rem !important" }} />}
                                sx={{ borderRadius: 1.5, py: 0.25, px: 1, textTransform: "none", fontSize: "0.75rem" }}
                              >
                                Pay Bill
                              </Button>
                              <Tooltip title="Edit due balance">
                                <IconButton
                                  size="small"
                                  onClick={() => handleOpenEditDue(bill)}
                                  color="warning"
                                  sx={{ border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`, borderRadius: 1.5 }}
                                >
                                  <EditRoundedIcon fontSize="small" sx={{ fontSize: "0.85rem" }} />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete due entry">
                                <IconButton
                                  size="small"
                                  onClick={() => handleOpenDeleteDue(bill)}
                                  color="error"
                                  sx={{ border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`, borderRadius: 1.5 }}
                                >
                                  <DeleteRoundedIcon fontSize="small" sx={{ fontSize: "0.85rem" }} />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )
            ) : paymentHistoryLogs.length === 0 ? (
              <Box sx={{ p: 4, textAlign: "center" }}>
                <Typography color="text.secondary">No payment history recorded yet.</Typography>
              </Box>
            ) : (
              <TableContainer component={Paper} sx={{ overflowX: "auto" }}>
                <Table size="small">
                  <TableHead sx={{ bgcolor: theme.palette.mode === "dark" ? alpha(theme.palette.background.paper, 0.4) : alpha(theme.palette.background.default, 0.5) }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Invoice ID Reference</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Method</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Amount Settled</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Remarks</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paymentHistoryLogs.map((log) => (
                      <TableRow key={log.id} hover>
                        <TableCell>{new Date(log.date).toLocaleDateString("en-IN")} {new Date(log.date).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontFamily: "monospace", fontSize: "0.8rem" }}>
                            {log.billId.length > 8 ? `${log.billId.substring(0, 8)}...` : log.billId}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip label={log.paymentMode} size="small" variant="outlined" sx={{ fontSize: "0.7rem", height: 20 }} />
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700, color: "success.main" }}>
                          Rs. {log.amount.toFixed(2)}
                        </TableCell>
                        <TableCell sx={{ fontSize: "0.8rem", color: "text.secondary" }}>
                          {log.remarks || "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </DialogContent>

          <DialogActions sx={{ p: 3, gap: 1.5, justifyContent: "space-between" }}>
            {selectedDebtor.phone ? (
              <Button
                variant="outlined"
                color="success"
                onClick={handleSendWhatsAppReminder}
                startIcon={<WhatsAppIcon />}
                sx={{ borderRadius: 2, textTransform: "none" }}
              >
                Send WhatsApp Reminder
              </Button>
            ) : (
              <Box />
            )}

            <Stack direction="row" spacing={1.5}>
              <Button
                variant="outlined"
                color="inherit"
                onClick={handleCloseLedger}
                sx={{ borderRadius: 2, textTransform: "none" }}
              >
                Close
              </Button>
              {selectedDebtor.totalDue > 0 && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleOpenPayment(null)}
                  startIcon={<PaymentRoundedIcon />}
                  sx={{ borderRadius: 2, textTransform: "none" }}
                >
                  Record Payment
                </Button>
              )}
            </Stack>
          </DialogActions>
        </Dialog>
      )}

      {/* Record Payment Dialog */}
      <Dialog
        open={paymentOpen}
        onClose={() => {
          playSound?.("click");
          setPaymentOpen(false);
        }}
        PaperProps={{
          sx: { borderRadius: 3, width: 400 },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          {targetBill ? "Record Invoice Payment" : "Record General Payment"}
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
            {targetBill
              ? `Entering payment for specific invoice ID ending in "...${targetBill.id.substring(targetBill.id.length - 8)}".`
              : `Entering payment for customer. Amount will be automatically distributed starting from the oldest outstanding bills first.`}
          </Typography>

          <Stack spacing={2.5}>
            <TextField
              label="Payment Amount (Rs.)"
              type="number"
              fullWidth
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start">Rs.</InputAdornment>,
              }}
              size="small"
              autoFocus
            />

            <TextField
              select
              label="Payment Mode"
              fullWidth
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value)}
              size="small"
            >
              <MenuItem value="Cash">Cash</MenuItem>
              <MenuItem value="UPI">UPI</MenuItem>
              <MenuItem value="Card">Card</MenuItem>
              <MenuItem value="Net Banking">Net Banking</MenuItem>
            </TextField>

            <TextField
              label="Remarks / Notes"
              fullWidth
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Cleared partial due balance"
              multiline
              rows={2}
              size="small"
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1.5 }}>
          <Button
            variant="outlined"
            color="inherit"
            onClick={() => {
              playSound?.("click");
              setPaymentOpen(false);
            }}
            sx={{ borderRadius: 2, textTransform: "none" }}
            disabled={submittingPayment}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleRecordPaymentSubmit}
            disabled={submittingPayment}
            startIcon={submittingPayment ? <CircularProgress size={16} /> : <SendRoundedIcon />}
            sx={{ borderRadius: 2, textTransform: "none" }}
          >
            {submittingPayment ? "Recording..." : "Record"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bill Viewer Dialog */}
      {viewedBill && (
        <BillDialog
          bill={viewedBill}
          shop={shop}
          onClose={() => {
            playSound?.("click");
            setViewedBill(null);
          }}
        />
      )}

      {/* Create Manual Due Dialog */}
      <Dialog
        open={createDueOpen}
        onClose={() => {
          playSound?.("click");
          setCreateDueOpen(false);
        }}
        PaperProps={{
          sx: { borderRadius: 3, width: 450 },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>Add Manual Due Entry</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
            Create a custom outstanding balance for a customer. This entry will be immediately tracked in the Due Ledger.
          </Typography>

          <Stack spacing={2.5}>
            <Autocomplete
              freeSolo
              options={customers}
              getOptionLabel={(option) => {
                if (typeof option === "string") return option;
                return `${option.name} (${option.phoneNumber || "No Phone"})`;
              }}
              value={newCustomerName}
              onInputChange={(_, newValue) => {
                setNewCustomerName(newValue);
              }}
              onChange={(_, newValue) => {
                if (newValue && typeof newValue === "object") {
                  setNewCustomerName(newValue.name || "");
                  setNewCustomerPhone(newValue.phoneNumber || "");
                }
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Customer Name"
                  placeholder="Type a name or pick existing customer"
                  size="small"
                  required
                  fullWidth
                />
              )}
            />

            <TextField
              label="Customer Phone Number"
              fullWidth
              value={newCustomerPhone}
              onChange={(e) => setNewCustomerPhone(e.target.value)}
              placeholder="e.g. 9876543210"
              size="small"
            />

            <TextField
              label="Due Amount (Rs.)"
              type="number"
              fullWidth
              value={newDueAmount}
              onChange={(e) => setNewDueAmount(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start">Rs.</InputAdornment>,
              }}
              size="small"
            />

            <TextField
              label="Description / Reason"
              fullWidth
              value={newDueRemarks}
              onChange={(e) => setNewDueRemarks(e.target.value)}
              placeholder="e.g. Old pending carryover balance"
              size="small"
              multiline
              rows={2}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1.5 }}>
          <Button
            variant="outlined"
            color="inherit"
            onClick={() => {
              playSound?.("click");
              setCreateDueOpen(false);
            }}
            sx={{ borderRadius: 2, textTransform: "none" }}
            disabled={submittingCreateDue}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleCreateDueSubmit}
            disabled={submittingCreateDue}
            startIcon={submittingCreateDue ? <CircularProgress size={16} /> : <SendRoundedIcon />}
            sx={{ borderRadius: 2, textTransform: "none" }}
          >
            {submittingCreateDue ? "Saving..." : "Add Entry"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Outstanding Due Dialog */}
      <Dialog
        open={editDueOpen}
        onClose={() => {
          playSound?.("click");
          setEditDueOpen(false);
        }}
        PaperProps={{
          sx: { borderRadius: 3, width: 400 },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>Edit Outstanding Due</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
            Directly adjust the remaining outstanding balance for this invoice.
          </Typography>

          <Stack spacing={2.5}>
            <TextField
              label="Remaining Due Amount (Rs.)"
              type="number"
              fullWidth
              value={editDueAmount}
              onChange={(e) => setEditDueAmount(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start">Rs.</InputAdornment>,
              }}
              size="small"
              autoFocus
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1.5 }}>
          <Button
            variant="outlined"
            color="inherit"
            onClick={() => {
              playSound?.("click");
              setEditDueOpen(false);
            }}
            sx={{ borderRadius: 2, textTransform: "none" }}
            disabled={submittingEditDue}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="warning"
            onClick={handleEditDueSubmit}
            disabled={submittingEditDue}
            startIcon={submittingEditDue ? <CircularProgress size={16} /> : <SendRoundedIcon />}
            sx={{ borderRadius: 2, textTransform: "none", color: "white" }}
          >
            {submittingEditDue ? "Saving..." : "Update"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => {
          playSound?.("click");
          setDeleteConfirmOpen(false);
        }}
        PaperProps={{
          sx: { borderRadius: 3, width: 400 },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to permanently delete this due entry/invoice?
          </Typography>
          <Typography variant="body2" color="error.main" sx={{ mt: 1, fontWeight: 600 }}>
            This action cannot be undone and will permanently remove this record from this customer's statement.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1.5 }}>
          <Button
            variant="outlined"
            color="inherit"
            onClick={() => {
              playSound?.("click");
              setDeleteConfirmOpen(false);
            }}
            sx={{ borderRadius: 2, textTransform: "none" }}
            disabled={submittingDeleteDue}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteDueSubmit}
            disabled={submittingDeleteDue}
            startIcon={submittingDeleteDue ? <CircularProgress size={16} /> : <DeleteRoundedIcon />}
            sx={{ borderRadius: 2, textTransform: "none" }}
          >
            {submittingDeleteDue ? "Deleting..." : "Permanently Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Local Toast Alert */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={handleToastClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert onClose={handleToastClose} severity={toast.severity} sx={{ width: "100%", borderRadius: 2 }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
