import { useEffect, useMemo, useState } from "react";
import {
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  MenuItem,
  Paper,
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
import { subscribeToShopBills } from "../services/shopData";

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
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  if (!bill.date) return null;

  const [day, month, year] = bill.date.split("/");
  const fullYear = year?.length === 2 ? Number(`20${year}`) : Number(year);
  const parsed = new Date(fullYear, Number(month) - 1, Number(day));

  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const Dashboard = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedBill, setSelectedBill] = useState(null);
  const [activeTab, setActiveTab] = useState("bills");
  const [dateFilter, setDateFilter] = useState("today");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [showStats, setShowStats] = useState(() => {
    const savedValue = localStorage.getItem("dashboard-show-stats");
    return savedValue ? JSON.parse(savedValue) : true;
  });
  const { activeShopId, shop } = useShop();

  useEffect(() => {
    const unsubscribe = subscribeToShopBills(activeShopId, (data) => {
      setBills(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [activeShopId]);

  useEffect(() => {
    localStorage.setItem("dashboard-show-stats", JSON.stringify(showStats));
  }, [showStats]);

  const customerOptions = useMemo(() => {
    const uniqueCustomers = new Map();

    bills.forEach((bill) => {
      if (!bill.name) return;

      const key = `${bill.name}-${bill.phoneNumber || ""}`;
      if (!uniqueCustomers.has(key)) {
        uniqueCustomers.set(key, {
          label: bill.phoneNumber
            ? `${bill.name} (${bill.phoneNumber})`
            : bill.name,
          name: bill.name,
          phoneNumber: bill.phoneNumber || "",
          address: bill.address || "",
        });
      }
    });

    return Array.from(uniqueCustomers.values());
  }, [bills]);

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

      if (dateFilter === "today") {
        return billDate >= todayStart && billDate <= todayEnd;
      }

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

  const filteredBills = useMemo(
    () =>
      filteredByDateBills.filter(
        (bill) =>
          bill.name?.toLowerCase().includes(search.toLowerCase()) ||
          bill.phoneNumber?.includes(search)
      ),
    [filteredByDateBills, search]
  );

  const filteredCustomers = useMemo(() => {
    const uniqueCustomers = new Map();

    filteredByDateBills.forEach((bill) => {
      if (!bill.name) return;

      const key = `${bill.name}-${bill.phoneNumber || ""}`;
      if (!uniqueCustomers.has(key)) {
        uniqueCustomers.set(key, {
          name: bill.name,
          phoneNumber: bill.phoneNumber || "",
          address: bill.address || "",
        });
      }
    });

    return Array.from(uniqueCustomers.values()).filter(
      (customer) =>
        customer.name?.toLowerCase().includes(search.toLowerCase()) ||
        customer.phoneNumber?.includes(search) ||
        customer.address?.toLowerCase().includes(search.toLowerCase())
    );
  }, [filteredByDateBills, search]);

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
                  startAdornment: <FilterAltRoundedIcon sx={{ mr: 1, color: "text.secondary" }} />,
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

              <Autocomplete
                freeSolo
                fullWidth
                options={customerOptions}
                inputValue={search}
                getOptionLabel={(option) =>
                  typeof option === "string" ? option : option.label
                }
                onInputChange={(_, value) => setSearch(value)}
                onChange={(_, value) => {
                  if (typeof value === "string") {
                    setSearch(value);
                    return;
                  }

                  if (value) {
                    setSearch(value.name);
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
          </Stack>
        </CardContent>
      </Card>

      {showStats ? <StatsCards bills={filteredByDateBills} /> : null}

      {loading ? (
        <Paper sx={{ p: 5, textAlign: "center" }}>
          <CircularProgress />
        </Paper>
      ) : activeTab === "bills" ? (
        <BillsTable bills={filteredBills} onPreview={setSelectedBill} />
      ) : (
        <CustomerInfoTable customers={filteredCustomers} />
      )}

      <BillDialog bill={selectedBill} onClose={() => setSelectedBill(null)} />
    </Stack>
  );
};

export default Dashboard;
