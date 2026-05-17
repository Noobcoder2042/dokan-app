import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Button, Card, CardContent, Grid, Typography, Stack, TextField, MenuItem } from "@mui/material";
import CloudDownloadOutlinedIcon from "@mui/icons-material/CloudDownloadOutlined";
import LineChartWrapper from "../components/charts/LineChartWrapper";
import BarChartWrapper from "../components/charts/BarChartWrapper";
import PieChartWrapper from "../components/charts/PieChartWrapper";
import StatCard from "../components/ui/StatCard";
import ActivityFeed from "../components/ui/ActivityFeed";
import {
  aggregateCustomerSpending,
  monthlySpendingTrend,
  favoriteCategoriesForCustomer,
} from "../services/analyticsService";
import { exportOrdersAsExcel, exportOrdersAsPdf } from "../utils/exportUtils";
import dayjs from "dayjs";
import { useAuth } from "../context/AuthContext";
import { useShop } from "../context/ShopContext";
import { subscribeToShopBills } from "../services/shopData";

const CustomerAnalytics = () => {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [dateFilter, setDateFilter] = useState("30");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [selectedCustomer] = useState("");
  const [monthlyTrend, setMonthlyTrend] = useState([]);
  const [favCategories, setFavCategories] = useState([]);

  const { user } = useAuth();
  const { activeShopId } = useShop();

  useEffect(() => {
    if (!activeShopId || !user?.uid) return () => {};
    const unsub = subscribeToShopBills(
      activeShopId,
      user.uid,
      (data) => {
        setOrders(data);
        setCustomers(aggregateCustomerSpending(data));
      },
      () => {
        setOrders([]);
        setCustomers([]);
      }
    );
    return () => unsub && unsub();
  }, [activeShopId, user?.uid]);

  const filteredOrders = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (dateFilter === "week") {
      const weekStart = new Date(startOfToday);
      weekStart.setDate(startOfToday.getDate() - startOfToday.getDay());
      return (orders || []).filter((o) => {
        const d = o.createdAt ? new Date(o.createdAt) : o.date ? new Date(o.date) : null;
        return d && d >= weekStart && d <= now;
      });
    }

    if (dateFilter === "30") {
      const start = new Date(startOfToday);
      start.setDate(start.getDate() - 29);
      return (orders || []).filter((o) => {
        const d = o.createdAt ? new Date(o.createdAt) : o.date ? new Date(o.date) : null;
        return d && d >= start && d <= now;
      });
    }

    if (dateFilter === "month") {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      return (orders || []).filter((o) => {
        const d = o.createdAt ? new Date(o.createdAt) : o.date ? new Date(o.date) : null;
        return d && d >= start && d <= now;
      });
    }

    if (dateFilter === "year") {
      const start = new Date(now.getFullYear(), 0, 1);
      return (orders || []).filter((o) => {
        const d = o.createdAt ? new Date(o.createdAt) : o.date ? new Date(o.date) : null;
        return d && d >= start && d <= now;
      });
    }

    if (dateFilter === "custom") {
      if (!customStartDate || !customEndDate) return orders;
      const s = new Date(`${customStartDate}T00:00:00`);
      const e = new Date(`${customEndDate}T23:59:59`);
      return (orders || []).filter((o) => {
        const d = o.createdAt ? new Date(o.createdAt) : o.date ? new Date(o.date) : null;
        return d && d >= s && d <= e;
      });
    }

    return orders;
  }, [orders, dateFilter, customStartDate, customEndDate]);

  const handleExportExcel = () => {
    exportOrdersAsExcel(filteredOrders, `analytics-orders-${dayjs().format("YYYYMMDD-HHmm")}.xlsx`);
  };

  const handleExportPdf = () => {
    exportOrdersAsPdf(
      filteredOrders,
      {
        title: "Orders Analytics Report",
        subtitle: "Top customer spending and recent order export",
        createdAt: dayjs().format("DD MMM YYYY HH:mm"),
      },
      `analytics-orders-${dayjs().format("YYYYMMDD-HHmm")}.pdf`
    );
  };

  const totalRevenue = filteredOrders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);
  const totalDue = filteredOrders.reduce((sum, order) => sum + Number(order.dueAmount || 0), 0);
  const averageOrder = filteredOrders.length ? totalRevenue / filteredOrders.length : 0;
  const uniqueCustomers = new Set(filteredOrders.map((order) => (order.customerPhone || order.customerName || "").toString())).size;

  useEffect(() => {
    if (!selectedCustomer) return setFavCategories([]);
    setFavCategories(favoriteCategoriesForCustomer(filteredOrders, selectedCustomer));
  }, [filteredOrders, selectedCustomer]);

  useEffect(() => {
    setMonthlyTrend(monthlySpendingTrend(filteredOrders, 12));
  }, [filteredOrders]);

  return (
    <Stack component={motion.div} spacing={2} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
      <Card>
        <CardContent>
          <Typography variant="h5">Customer Analytics</Typography>
          <Typography color="text.secondary">Top spenders, monthly trends, favorite categories.</Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mt: 3 }}>
            <TextField
              select
              label="Date Range"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              sx={{ minWidth: 200 }}
            >
              <MenuItem value="week">This Week</MenuItem>
              <MenuItem value="30">Last 30 Days</MenuItem>
              <MenuItem value="month">This Month</MenuItem>
              <MenuItem value="year">This Year</MenuItem>
              <MenuItem value="custom">Custom Range</MenuItem>
            </TextField>

            {dateFilter === "custom" && (
              <>
                <TextField
                  label="Start"
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  label="End"
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </>
            )}

            <Button
              variant="contained"
              color="primary"
              startIcon={<CloudDownloadOutlinedIcon />}
              onClick={handleExportExcel}
            >
              Export Excel
            </Button>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<CloudDownloadOutlinedIcon />}
              onClick={handleExportPdf}
            >
              Export PDF
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Grid container spacing={2}>
        <Grid item xs={12} md={3}>
          <StatCard
            label="Total Revenue"
            value={`Rs. ${totalRevenue.toFixed(2)}`}
            description="Sales across all invoices."
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard
            label="Active Customers"
            value={uniqueCustomers}
            description="Unique buyers in the current dataset."
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard
            label="Average Order"
            value={`Rs. ${averageOrder.toFixed(2)}`}
            description="Average amount per bill."
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard
            label="Total Due"
            value={`Rs. ${totalDue.toFixed(2)}`}
            description="Outstanding dues from invoices."
          />
        </Grid>

        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6">Monthly Spending Trend</Typography>
              <LineChartWrapper data={monthlyTrend} xKey="month" yKey="amount" />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Top Customers</Typography>
              <BarChartWrapper data={customers} xKey="name" yKey="amount" />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">Favorite Categories</Typography>
              <PieChartWrapper data={favCategories} nameKey="category" valueKey="amount" />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <ActivityFeed items={filteredOrders.slice(0, 10)} />
        </Grid>
      </Grid>
    </Stack>
  );
};

export default CustomerAnalytics;
