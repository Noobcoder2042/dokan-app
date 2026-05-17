import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Grid,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { useShop } from "../context/ShopContext";
import { subscribeToShopBills } from "../services/shopData";

const dateFilters = [
  { label: "This Week", value: "week" },
  { label: "Last 30 Days", value: "30" },
  { label: "This Month", value: "month" },
  { label: "This Year", value: "year" },
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

const Analysis = () => {
  const { user } = useAuth();
  const { activeShopId } = useShop();
  const [bills, setBills] = useState([]);
  const [dateFilter, setDateFilter] = useState("week");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  useEffect(() => {
    if (!user?.uid) {
      setBills([]);
      return () => {};
    }

    const unsubscribe = subscribeToShopBills(
      activeShopId,
      user.uid,
      (data) => setBills(data),
      () => setBills([])
    );

    return () => unsubscribe();
  }, [activeShopId, user?.uid]);

  const filteredBills = useMemo(() => {
    const now = new Date();
    const todayEnd = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59,
      999
    );
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart);
    weekStart.setDate(todayStart.getDate() - todayStart.getDay());

    return bills.filter((bill) => {
      const billDate = getBillDate(bill);
      if (!billDate) return false;

      if (dateFilter === "week") {
        return billDate >= weekStart && billDate <= todayEnd;
      }

      if (dateFilter === "30") {
        const start = new Date(todayStart);
        start.setDate(start.getDate() - 29);
        return billDate >= start && billDate <= todayEnd;
      }

      if (dateFilter === "month") {
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        return billDate >= monthStart && billDate <= todayEnd;
      }

      if (dateFilter === "year") {
        const yearStart = new Date(now.getFullYear(), 0, 1);
        return billDate >= yearStart && billDate <= todayEnd;
      }

      if (!customStartDate || !customEndDate) return true;
      const start = new Date(`${customStartDate}T00:00:00`);
      const end = new Date(`${customEndDate}T23:59:59`);
      return billDate >= start && billDate <= end;
    });
  }, [bills, customEndDate, customStartDate, dateFilter]);

  const summary = useMemo(() => {
    const totalSales = filteredBills.reduce(
      (sum, bill) => sum + Number(bill.totalAmount || 0),
      0
    );
    const totalBills = filteredBills.length;
    const avgBill = totalBills ? totalSales / totalBills : 0;
    return {
      totalSales,
      totalBills,
      avgBill,
    };
  }, [filteredBills]);

  const topItems = useMemo(() => {
    const map = new Map();

    filteredBills.forEach((bill) => {
      (bill.items || []).forEach((item) => {
        const key = (item.name || "Unnamed item").trim().toLowerCase();
        const current = map.get(key) || {
          name: item.name || "Unnamed item",
          qty: 0,
          sales: 0,
        };
        current.qty += Number(item.quantity || 0);
        current.sales += Number(item.totalPrice || 0);
        map.set(key, current);
      });
    });

    return Array.from(map.values())
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 10);
  }, [filteredBills]);

  const topCustomers = useMemo(() => {
    const map = new Map();

    filteredBills.forEach((bill) => {
      const phone = (bill.phoneNumber || "").trim();
      const name = (bill.name || "Unknown customer").trim();
      const key = phone || name.toLowerCase();
      const current = map.get(key) || {
        name,
        phone: phone || "-",
        bills: 0,
        amount: 0,
      };
      current.bills += 1;
      current.amount += Number(bill.totalAmount || 0);
      map.set(key, current);
    });

    return Array.from(map.values())
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10);
  }, [filteredBills]);

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
        <Typography variant="h4">Sales Analysis</Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
          Monitor top selling items, best customers, and full business performance.
        </Typography>
      </Paper>

      <Card>
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <TextField
              select
              label="Date Filter"
              value={dateFilter}
              onChange={(event) => setDateFilter(event.target.value)}
              sx={{ minWidth: { md: 220 } }}
            >
              {dateFilters.map((option) => (
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
        </CardContent>
      </Card>

      <Grid container spacing={2.5}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary">Total Sales</Typography>
              <Typography variant="h4" sx={{ mt: 1 }}>
                {summary.totalSales.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary">Total Bills</Typography>
              <Typography variant="h4" sx={{ mt: 1 }}>
                {summary.totalBills}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary">Average Bill</Typography>
              <Typography variant="h4" sx={{ mt: 1 }}>
                {summary.avgBill.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={2.5}>
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1.5 }}>
                Top 10 Selling Items
              </Typography>
              {topItems.length ? (
                <Stack spacing={1.25}>
                  {topItems.map((item, index) => (
                    <Box
                      key={`${item.name}-${index}`}
                      sx={{
                        p: 1.25,
                        borderRadius: 2,
                        border: "1px solid rgba(148, 163, 184, 0.2)",
                      }}
                    >
                      <Typography sx={{ fontWeight: 600 }}>{item.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Qty: {item.qty.toFixed(2)} | Sales: {item.sales.toFixed(2)}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Typography color="text.secondary">No sales data in this range.</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1.5 }}>
                Top Customers
              </Typography>
              {topCustomers.length ? (
                <Stack spacing={1.25}>
                  {topCustomers.map((customer, index) => (
                    <Box
                      key={`${customer.phone}-${customer.name}-${index}`}
                      sx={{
                        p: 1.25,
                        borderRadius: 2,
                        border: "1px solid rgba(148, 163, 184, 0.2)",
                      }}
                    >
                      <Typography sx={{ fontWeight: 600 }}>{customer.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Phone: {customer.phone} | Bills: {customer.bills} | Spend:{" "}
                        {customer.amount.toFixed(2)}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Typography color="text.secondary">No customer data in this range.</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Stack>
  );
};

export default Analysis;
