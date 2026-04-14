import { useEffect, useMemo, useState } from "react";
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
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import FilterAltRoundedIcon from "@mui/icons-material/FilterAltRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
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
  const [dateFilter, setDateFilter] = useState("today");
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

  const openToast = (message, severity = "success") => {
    setToast({ open: true, message, severity });
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
    const savedValue = localStorage.getItem(dashboardStatsStorageKey);
    setShowStats(savedValue ? JSON.parse(savedValue) : true);
  }, [dashboardStatsStorageKey]);

  const normalizedSearch = search.trim();
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
    if (!normalizedSearch) return filteredByDateBills;

    if (isPhoneSearch) {
      return filteredByDateBills.filter((bill) =>
        (bill.phoneNumber || "").replace(/[^\d+]/g, "").includes(numericSearch)
      );
    }

    return filteredByDateBills.filter((bill) =>
      bill.name?.toLowerCase().includes(normalizedSearch.toLowerCase())
    );
  }, [filteredByDateBills, isPhoneSearch, normalizedSearch, numericSearch]);

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

  const filteredCustomers = useMemo(() => {
    if (!normalizedSearch) return mergedCustomers;

    return mergedCustomers.filter(
      (customer) =>
        customer.name?.toLowerCase().includes(normalizedSearch.toLowerCase()) ||
        customer.phoneNumber?.includes(normalizedSearch) ||
        customer.address?.toLowerCase().includes(normalizedSearch.toLowerCase())
    );
  }, [mergedCustomers, normalizedSearch]);

  const smartCustomerOptions = useMemo(() => {
    if (activeTab !== "bills") return mergedCustomers;
    if (!normalizedSearch) return mergedCustomers;

    if (isPhoneSearch) {
      return mergedCustomers.filter((customer) =>
        (customer.phoneNumber || "").replace(/[^\d+]/g, "").includes(numericSearch)
      );
    }

    return mergedCustomers.filter((customer) =>
      customer.name?.toLowerCase().includes(normalizedSearch.toLowerCase())
    );
  }, [activeTab, mergedCustomers, isPhoneSearch, normalizedSearch, numericSearch]);

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

  const confirmTitle =
    confirmState.type === "deleteBill" || confirmState.type === "deleteCustomer"
      ? "Delete"
      : "Save Changes";

  const confirmDescription =
    confirmState.type === "deleteBill"
      ? "Are you sure? This bill will be deleted."
      : confirmState.type === "deleteCustomer"
        ? "Are you sure? This customer will be deleted."
        : "Are you sure? Changes will be saved.";

  const loading = loadingBills || loadingCustomers;

  return (
    <Stack spacing={3}>
      <Paper
        sx={{
          p: { xs: 2.5, md: 3.5 },
          borderRadius: 6,
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.96) 0%, rgba(239,246,255,0.98) 52%, rgba(236,253,245,0.96) 100%)",
          border: "1px solid rgba(148, 163, 184, 0.12)",
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          spacing={2}
        >
          <Box>
            <Typography variant="h4">Sales Dashboard</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
              Track shop performance, customer activity, and billing history for{" "}
              {shop.name || "your active shop"}.
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} alignItems="center">
            <Button
              variant="outlined"
              startIcon={
                showStats ? <VisibilityOffRoundedIcon /> : <VisibilityRoundedIcon />
              }
              onClick={() => setShowStats((current) => !current)}
            >
              {showStats ? "Hide Summary" : "Show Summary"}
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <Card>
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          <Stack spacing={2.5}>
            <Tabs
              value={activeTab}
              onChange={(_, value) => setActiveTab(value)}
              variant="scrollable"
              allowScrollButtonsMobile
            >
              <Tab label="Bills" value="bills" />
              <Tab label="Customer Info" value="customers" />
            </Tabs>

            {activeTab === "bills" ? (
              <Stack
                direction={{ xs: "column", xl: "row" }}
                spacing={2}
                alignItems={{ xs: "stretch", xl: "center" }}
              >
                <TextField
                  select
                  label="Date Filter"
                  value={dateFilter}
                  onChange={(event) => setDateFilter(event.target.value)}
                  sx={{ minWidth: { xl: 180 } }}
                  InputProps={{
                    startAdornment: (
                      <FilterAltRoundedIcon sx={{ mr: 1, color: "text.secondary" }} />
                    ),
                  }}
                >
                  {filterOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>

                {dateFilter === "custom" ? (
                  <>
                    <TextField
                      label="Start Date"
                      type="date"
                      value={customStartDate}
                      onChange={(event) => setCustomStartDate(event.target.value)}
                      InputLabelProps={{ shrink: true }}
                    />
                    <TextField
                      label="End Date"
                      type="date"
                      value={customEndDate}
                      onChange={(event) => setCustomEndDate(event.target.value)}
                      InputLabelProps={{ shrink: true }}
                    />
                  </>
                ) : null}
              </Stack>
            ) : null}

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
                  label={
                    activeTab === "bills"
                      ? "Search by customer or phone"
                      : "Search customer, mobile or address"
                  }
                />
              )}
            />
          </Stack>
        </CardContent>
      </Card>

      {activeTab === "bills" && showStats ? <StatsCards bills={filteredByDateBills} /> : null}

      {loading ? (
        <Paper sx={{ p: 5, textAlign: "center" }}>
          <CircularProgress />
        </Paper>
      ) : activeTab === "bills" ? (
        <BillsTable
          bills={filteredBills}
          onPreview={setSelectedBill}
          onEdit={(bill) => setEditingBill({ ...bill })}
          onDelete={(bill) => openConfirm("deleteBill", bill)}
        />
      ) : (
        <CustomerInfoTable
          customers={filteredCustomers}
          onView={setViewingCustomer}
          onEdit={(customer) => setEditingCustomer({ ...customer })}
          onDelete={(customer) => openConfirm("deleteCustomer", customer)}
        />
      )}

      <BillDialog bill={selectedBill} onClose={() => setSelectedBill(null)} />

      <Dialog open={Boolean(viewingCustomer)} onClose={() => setViewingCustomer(null)} fullWidth>
        <DialogTitle>Customer Details</DialogTitle>
        <DialogContent>
          {viewingCustomer ? (
            <Stack spacing={1}>
              <Typography><strong>Name:</strong> {viewingCustomer.name || "-"}</Typography>
              <Typography><strong>Phone:</strong> {viewingCustomer.phoneNumber || "-"}</Typography>
              <Typography><strong>Address:</strong> {viewingCustomer.address || "-"}</Typography>
            </Stack>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewingCustomer(null)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(editingBill)} onClose={() => setEditingBill(null)} fullWidth maxWidth="sm">
        <DialogTitle>Edit Bill</DialogTitle>
        <DialogContent>
          {editingBill ? (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                label="Customer Name"
                value={editingBill.name || ""}
                onChange={(event) =>
                  setEditingBill((current) => ({ ...current, name: event.target.value }))
                }
                fullWidth
              />
              <TextField
                label="Phone Number"
                value={editingBill.phoneNumber || ""}
                onChange={(event) =>
                  setEditingBill((current) => ({ ...current, phoneNumber: event.target.value }))
                }
                fullWidth
              />
              <TextField
                label="Address"
                value={editingBill.address || ""}
                onChange={(event) =>
                  setEditingBill((current) => ({ ...current, address: event.target.value }))
                }
                fullWidth
              />
              <TextField
                label="Date"
                value={editingBill.date || ""}
                onChange={(event) =>
                  setEditingBill((current) => ({ ...current, date: event.target.value }))
                }
                fullWidth
              />
            </Stack>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditingBill(null)}>Cancel</Button>
          <Button
            onClick={() => openConfirm("saveBillEdit", editingBill)}
            disabled={!editingBill?.name || !editingBill?.phoneNumber}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(editingCustomer)}
        onClose={() => setEditingCustomer(null)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Edit Customer</DialogTitle>
        <DialogContent>
          {editingCustomer ? (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                label="Name"
                value={editingCustomer.name || ""}
                onChange={(event) =>
                  setEditingCustomer((current) => ({ ...current, name: event.target.value }))
                }
                fullWidth
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
              />
              <TextField
                label="Address"
                value={editingCustomer.address || ""}
                onChange={(event) =>
                  setEditingCustomer((current) => ({ ...current, address: event.target.value }))
                }
                fullWidth
              />
            </Stack>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditingCustomer(null)}>Cancel</Button>
          <Button
            onClick={() => openConfirm("saveCustomerEdit", editingCustomer)}
            disabled={!editingCustomer?.name}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={confirmState.open} onClose={closeConfirm}>
        <DialogTitle>{confirmTitle}</DialogTitle>
        <DialogContent>
          <Typography>{confirmDescription}</Typography>
          <Typography sx={{ mt: 1, fontWeight: 600 }}>Are you sure?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeConfirm}>Cancel</Button>
          <Button color="error" onClick={handleConfirm} disabled={actionLoading}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast((current) => ({ ...current, open: false }))}
      >
        <Alert
          severity={toast.severity}
          onClose={() => setToast((current) => ({ ...current, open: false }))}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Stack>
  );
};

export default Dashboard;
