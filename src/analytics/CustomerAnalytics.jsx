import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Button,
  Box,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import CloudDownloadOutlinedIcon from "@mui/icons-material/CloudDownloadOutlined";
import dayjs from "dayjs";
import LineChartWrapper from "../components/charts/LineChartWrapper";
import BarChartWrapper from "../components/charts/BarChartWrapper";
import PieChartWrapper from "../components/charts/PieChartWrapper";
import AreaChartWrapper from "../components/charts/AreaChartWrapper";
import StatCard from "../components/ui/StatCard";
import ActivityFeed from "../components/ui/ActivityFeed";
import { useAuth } from "../context/AuthContext";
import { useShop } from "../context/ShopContext";
import { useUIExperience } from "../context/UIExperienceContext";
import { subscribeToShopBills } from "../services/shopData";
import {
  aggregateCustomerSpending,
  aggregateFavoriteCategories,
  aggregateProducts,
  buildSmartInsights,
  compareRangeMetrics,
  customerBuyingHabits,
  dueAnalytics,
  getBestCustomerInsight,
  monthlySpendingTrend,
  recentActivity,
  salesByWeekday,
  topAndWorstProduct,
} from "../services/analyticsService";
import { exportOrdersAsExcel, exportOrdersAsPdf } from "../utils/exportUtils";

const CustomerAnalytics = () => {
  const [orders, setOrders] = useState([]);
  const [dateFilter, setDateFilter] = useState("30");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedItem, setSelectedItem] = useState("");
  const [comparisonRange, setComparisonRange] = useState("week");
  const [loading, setLoading] = useState(true);
  const [insightDialog, setInsightDialog] = useState({
    open: false,
    title: "",
    explanation: "",
    metrics: [],
    rows: [],
  });

  const { user } = useAuth();
  const { activeShopId } = useShop();
  const { playSound } = useUIExperience();

  useEffect(() => {
    if (!activeShopId || !user?.uid) return () => {};
    setLoading(true);
    const unsub = subscribeToShopBills(
      activeShopId,
      user.uid,
      (data) => {
        setOrders(data || []);
        setLoading(false);
      },
      () => {
        setOrders([]);
        setLoading(false);
      }
    );
    return () => unsub && unsub();
  }, [activeShopId, user?.uid]);

  const parseOrderDate = (order) => {
    if (!order) return null;
    if (order.createdAt) {
      const parsed = new Date(order.createdAt);
      if (!Number.isNaN(parsed.getTime())) return parsed;
    }
    if (order.createdAtSeconds) {
      const parsed = new Date(Number(order.createdAtSeconds) * 1000);
      if (!Number.isNaN(parsed.getTime())) return parsed;
    }
    if (order.date) {
      const [day, month, year] = String(order.date).split("/");
      if (day && month && year) {
        const fullYear = year.length === 2 ? Number(`20${year}`) : Number(year);
        const parsed = new Date(fullYear, Number(month) - 1, Number(day));
        if (!Number.isNaN(parsed.getTime())) return parsed;
      }
    }
    return null;
  };

  const dateFilteredOrders = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (dateFilter === "week") {
      const weekStart = new Date(startOfToday);
      weekStart.setDate(startOfToday.getDate() - startOfToday.getDay());
      return (orders || []).filter((o) => {
        const d = parseOrderDate(o);
        return d && d >= weekStart && d <= now;
      });
    }
    if (dateFilter === "30") {
      const start = new Date(startOfToday);
      start.setDate(start.getDate() - 29);
      return (orders || []).filter((o) => {
        const d = parseOrderDate(o);
        return d && d >= start && d <= now;
      });
    }
    if (dateFilter === "month") {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      return (orders || []).filter((o) => {
        const d = parseOrderDate(o);
        return d && d >= start && d <= now;
      });
    }
    if (dateFilter === "year") {
      const start = new Date(now.getFullYear(), 0, 1);
      return (orders || []).filter((o) => {
        const d = parseOrderDate(o);
        return d && d >= start && d <= now;
      });
    }
    if (dateFilter === "custom") {
      if (!customStartDate || !customEndDate) return orders;
      const s = new Date(`${customStartDate}T00:00:00`);
      const e = new Date(`${customEndDate}T23:59:59`);
      return (orders || []).filter((o) => {
        const d = parseOrderDate(o);
        return d && d >= s && d <= e;
      });
    }
    return orders;
  }, [orders, dateFilter, customStartDate, customEndDate]);

  const filteredOrders = useMemo(
    () =>
      (dateFilteredOrders || []).filter((order) => {
        const customerKey = `${order.customerName || order.name || ""} ${order.customerPhone || order.phoneNumber || ""}`.toLowerCase();
        if (selectedCustomer && !customerKey.includes(selectedCustomer.toLowerCase())) return false;
        if (
          selectedCategory &&
          !(order.items || []).some((item) =>
            (item.category || item.categoryName || item.subcategory || item.subcategoryName || "")
              .toLowerCase()
              .includes(selectedCategory.toLowerCase())
          )
        ) {
          return false;
        }
        if (
          selectedItem &&
          !(order.items || []).some((item) => (item.itemName || item.name || "").toLowerCase().includes(selectedItem.toLowerCase()))
        ) {
          return false;
        }
        return true;
      }),
    [dateFilteredOrders, selectedCategory, selectedCustomer, selectedItem]
  );

  const customers = useMemo(() => aggregateCustomerSpending(filteredOrders), [filteredOrders]);
  const monthlyTrend = useMemo(() => monthlySpendingTrend(filteredOrders, 12), [filteredOrders]);
  const favCategories = useMemo(() => aggregateFavoriteCategories(filteredOrders), [filteredOrders]);
  const products = useMemo(() => aggregateProducts(filteredOrders), [filteredOrders]);
  const performance = useMemo(() => topAndWorstProduct(filteredOrders), [filteredOrders]);
  const bestCustomer = useMemo(() => getBestCustomerInsight(filteredOrders), [filteredOrders]);
  const habits = useMemo(() => customerBuyingHabits(filteredOrders), [filteredOrders]);
  const dueStats = useMemo(() => dueAnalytics(filteredOrders), [filteredOrders]);
  const growthStats = useMemo(() => compareRangeMetrics(filteredOrders, comparisonRange), [filteredOrders, comparisonRange]);
  const weekdayHeatmap = useMemo(() => salesByWeekday(filteredOrders), [filteredOrders]);
  const recentOrders = useMemo(() => recentActivity(filteredOrders, 6), [filteredOrders]);

  const totalRevenue = useMemo(() => filteredOrders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0), [filteredOrders]);
  const totalDue = useMemo(() => filteredOrders.reduce((sum, o) => sum + Number(o.dueAmount || 0), 0), [filteredOrders]);
  const averageOrder = filteredOrders.length ? totalRevenue / filteredOrders.length : 0;
  const uniqueCustomers = useMemo(
    () => new Set(filteredOrders.map((o) => (o.customerPhone || o.phoneNumber || o.customerName || o.name || "").toString())).size,
    [filteredOrders]
  );
  const grossProfit = useMemo(() => products.reduce((sum, item) => sum + Number(item.profit || 0), 0), [products]);
  const highestProfitItem = useMemo(() => [...products].sort((a, b) => Number(b.profit || 0) - Number(a.profit || 0))[0] || null, [products]);
  const topProductsChart = useMemo(() => products.slice(0, 8).map((item) => ({ name: item.name, revenue: Number(item.revenue || 0) })), [products]);
  const smartInsights = useMemo(
    () => buildSmartInsights({ orders: filteredOrders, products, dues: dueStats, growth: growthStats, customers }),
    [filteredOrders, products, dueStats, growthStats, customers]
  );

  const categoryOptions = useMemo(() => {
    const set = new Set();
    (dateFilteredOrders || []).forEach((order) =>
      (order.items || []).forEach((item) => set.add(item.category || item.categoryName || item.subcategory || item.subcategoryName || "Uncategorized"))
    );
    return Array.from(set).filter(Boolean);
  }, [dateFilteredOrders]);

  const itemOptions = useMemo(() => {
    const set = new Set();
    (dateFilteredOrders || []).forEach((order) => (order.items || []).forEach((item) => set.add(item.itemName || item.name || "Unnamed")));
    return Array.from(set).filter(Boolean);
  }, [dateFilteredOrders]);

  const busiestDay = useMemo(() => [...weekdayHeatmap].sort((a, b) => Number(b.sales || 0) - Number(a.sales || 0))[0] || null, [weekdayHeatmap]);
  const highestInvoice = useMemo(() => [...filteredOrders].sort((a, b) => Number(b.totalAmount || 0) - Number(a.totalAmount || 0))[0] || null, [filteredOrders]);
  const topCustomersLite = useMemo(() => customers.slice(0, 5).map((c) => ({ name: c.name, spend: Number(c.total || 0), bills: c.count || 0 })), [customers]);
  const topProductsLite = useMemo(() => products.slice(0, 5).map((p) => ({ name: p.name, qty: p.qty, revenue: p.revenue })), [products]);

  const openInsight = (title, explanation, metrics = [], rows = []) => {
    playSound("modal");
    setInsightDialog({ open: true, title, explanation, metrics, rows });
  };

  const closeInsight = () => setInsightDialog((prev) => ({ ...prev, open: false }));

  const openGrowthInsight = () => {
    openInsight(
      "Sales Growth Breakdown",
      `Growth = ((Current - Previous) / Previous) * 100. ${growthStats.growthPercent >= 0 ? "Increase" : "Drop"} driven mainly by ${topProductsLite[0]?.name || "top-selling items"} and ${topCustomersLite[0]?.name || "repeat customers"}.`,
      [
        { label: "Current Period Sales", value: `Rs. ${growthStats.currentSales.toFixed(2)}` },
        { label: "Previous Period Sales", value: `Rs. ${growthStats.previousSales.toFixed(2)}` },
        { label: "Growth", value: `${growthStats.growthPercent.toFixed(2)}%` },
        { label: "Busiest Day", value: busiestDay ? `${busiestDay.label} (Rs. ${Number(busiestDay.sales || 0).toFixed(2)})` : "-" },
      ],
      [
        ...topProductsLite.map((item) => ({ name: item.name, detailA: `${item.qty} qty`, detailB: `Rs. ${item.revenue.toFixed(2)}` })),
        ...topCustomersLite.slice(0, 2).map((c) => ({ name: c.name, detailA: `${c.bills} bills`, detailB: `Rs. ${c.spend.toFixed(2)}` })),
      ]
    );
  };

  const openTotalSalesInsight = () => {
    const salesByDate = Object.values(
      filteredOrders.reduce((acc, order) => {
        const key = parseOrderDate(order) ? dayjs(parseOrderDate(order)).format("DD MMM") : "Unknown Date";
        acc[key] = acc[key] || { name: key, amount: 0 };
        acc[key].amount += Number(order.totalAmount || 0);
        return acc;
      }, {})
    )
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 8);

    openInsight(
      "Total Sales Breakdown",
      "Total sales is the sum of all invoice totals within current filters. This helps you see invoice count, average bill, biggest bill, category-wise and day-wise contribution.",
      [
        { label: "Total Sales", value: `Rs. ${totalRevenue.toFixed(2)}` },
        { label: "Invoice Count", value: filteredOrders.length },
        { label: "Average Invoice", value: `Rs. ${averageOrder.toFixed(2)}` },
        { label: "Highest Invoice", value: highestInvoice ? `Rs. ${Number(highestInvoice.totalAmount || 0).toFixed(2)}` : "-" },
      ],
      salesByDate.map((row) => ({ name: row.name, detailA: "Sales by date", detailB: `Rs. ${row.amount.toFixed(2)}` }))
    );
  };

  const openTopProductInsight = () => {
    const top = performance.top;
    if (!top) {
      openInsight("Top Product Breakdown", "No product data yet.", [], []);
      return;
    }
    const productOrders = filteredOrders.filter((order) => (order.items || []).some((item) => (item.itemName || item.name || "") === top.name));
    const buyerMap = {};
    productOrders.forEach((order) => {
      const customer = order.customerName || order.name || "Unknown";
      buyerMap[customer] = (buyerMap[customer] || 0) + Number(order.totalAmount || 0);
    });
    const topBuyers = Object.entries(buyerMap).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const contribution = totalRevenue > 0 ? (Number(top.revenue || 0) / totalRevenue) * 100 : 0;
    openInsight(
      "Top Product Breakdown",
      `${top.name} is top because it sold ${top.qty} units and generated high revenue. Contribution = (Product Revenue / Total Revenue) * 100.`,
      [
        { label: "Product", value: top.name },
        { label: "Quantity Sold", value: top.qty },
        { label: "Revenue", value: `Rs. ${Number(top.revenue || 0).toFixed(2)}` },
        { label: "Contribution", value: `${contribution.toFixed(2)}%` },
      ],
      topBuyers.map(([name, spend]) => ({ name, detailA: "Top buyer", detailB: `Rs. ${Number(spend).toFixed(2)}` }))
    );
  };

  const openCustomerInsight = () => {
    if (!bestCustomer) {
      openInsight("Customer Insight", "No customer data yet.", [], []);
      return;
    }
    const habit = habits.find((entry) => entry.customer === bestCustomer.name) || { topCategory: "-", topItem: "-" };
    openInsight(
      "Customer Insight Breakdown",
      `${bestCustomer.name} leads due to repeat purchases. Average order value = total spend / total bills.`,
      [
        { label: "Customer", value: bestCustomer.name },
        { label: "Total Spend", value: `Rs. ${bestCustomer.total.toFixed(2)}` },
        { label: "Average Order", value: `Rs. ${bestCustomer.averagePurchase.toFixed(2)}` },
        { label: "Total Bills", value: bestCustomer.count },
        { label: "Favorite Category", value: habit.topCategory || "-" },
        { label: "Favorite Item", value: habit.topItem || "-" },
      ],
      bestCustomer.topItems.slice(0, 6).map((item) => ({ name: item.name, detailA: `${item.qty} qty`, detailB: `Rs. ${item.sales.toFixed(2)}` }))
    );
  };

  const openChartPointInsight = (title, point, source = []) => {
    if (!point) return;
    const label = point.label || point.name || "Selected Point";
    const value = Number(point.value ?? point.revenue ?? point.sales ?? point.total ?? 0);
    const related = source
      .filter((order) => {
        const date = parseOrderDate(order);
        if (!date) return false;
        return dayjs(date).format("MMM YYYY") === label || dayjs(date).format("ddd").startsWith(label);
      })
      .slice(0, 10);

    openInsight(
      `${title}: ${label}`,
      "You clicked a chart point. This shows exact value, related invoices, and the nearest business impact behind this metric.",
      [
        { label: "Point Label", value: label },
        { label: "Exact Value", value: `Rs. ${value.toFixed(2)}` },
        { label: "Related Invoices", value: related.length },
      ],
      related.map((order) => ({
        name: order.customerName || order.name || "Unknown",
        detailA: parseOrderDate(order) ? dayjs(parseOrderDate(order)).format("DD MMM YYYY") : "-",
        detailB: `Rs. ${Number(order.totalAmount || 0).toFixed(2)}`,
      }))
    );
  };

  const handleExportExcel = () => {
    exportOrdersAsExcel(filteredOrders, `analytics-orders-${dayjs().format("YYYYMMDD-HHmm")}.xlsx`);
    playSound("success");
  };
  const handleExportPdf = () => {
    exportOrdersAsPdf(
      filteredOrders,
      { title: "Orders Analytics Report", subtitle: "Top customer spending and recent order export", createdAt: dayjs().format("DD MMM YYYY HH:mm") },
      `analytics-orders-${dayjs().format("YYYYMMDD-HHmm")}.pdf`
    );
    playSound("success");
  };

  return (
    <Stack component={motion.div} spacing={2} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
      <Card
        component={motion.div}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        sx={{
          overflow: "hidden",
          background:
            "linear-gradient(120deg, rgba(37,99,235,0.2) 0%, rgba(124,58,237,0.18) 38%, rgba(20,184,166,0.16) 100%)",
          border: "1px solid rgba(96,165,250,0.28)",
        }}
      >
        <CardContent>
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
            <Box>
              <Typography variant="h5">Business Intelligence Hub</Typography>
              <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                Revenue changed {growthStats.growthPercent >= 0 ? "up" : "down"} by {Math.abs(growthStats.growthPercent).toFixed(2)}% in this comparison range.
              </Typography>
              <Chip
                sx={{ mt: 1.25 }}
                color={growthStats.growthPercent >= 0 ? "success" : "warning"}
                label={`AI Insight: ${smartInsights[0] || "Track more bills to unlock richer insights."}`}
              />
            </Box>
            <Stack direction="row" spacing={2}>
              <Box sx={{ minWidth: 130 }}>
                <Typography variant="caption" color="text.secondary">Live Revenue</Typography>
                <Typography variant="h4" sx={{ fontWeight: 800 }}>
                  Rs. {totalRevenue.toFixed(0)}
                </Typography>
              </Box>
              <Box sx={{ minWidth: 130 }}>
                <Typography variant="caption" color="text.secondary">Top Signal</Typography>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {performance.top?.name || "-"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {performance.top?.qty || 0} units
                </Typography>
              </Box>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h5">Analytics</Typography>
          <Typography color="text.secondary">Charts, trends, AI-ready insights, monthly growth, and advanced business analytics.</Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mt: 3, flexWrap: "wrap" }}>
            <TextField select label="Date Range" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} sx={{ minWidth: 180 }}>
              <MenuItem value="week">This Week</MenuItem><MenuItem value="30">Last 30 Days</MenuItem><MenuItem value="month">This Month</MenuItem><MenuItem value="year">This Year</MenuItem><MenuItem value="custom">Custom Range</MenuItem>
            </TextField>
            {dateFilter === "custom" && (<><TextField label="Start" type="date" value={customStartDate} onChange={(e) => setCustomStartDate(e.target.value)} InputLabelProps={{ shrink: true }} /><TextField label="End" type="date" value={customEndDate} onChange={(e) => setCustomEndDate(e.target.value)} InputLabelProps={{ shrink: true }} /></>)}
            <TextField label="Customer Filter" placeholder="Name or mobile" value={selectedCustomer} onChange={(e) => setSelectedCustomer(e.target.value)} />
            <TextField select label="Category Filter" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} sx={{ minWidth: 180 }}>
              <MenuItem value="">All categories</MenuItem>{categoryOptions.map((category) => <MenuItem key={category} value={category}>{category}</MenuItem>)}
            </TextField>
            <TextField select label="Item Filter" value={selectedItem} onChange={(e) => setSelectedItem(e.target.value)} sx={{ minWidth: 180 }}>
              <MenuItem value="">All items</MenuItem>{itemOptions.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
            </TextField>
            <TextField select label="Compare" value={comparisonRange} onChange={(e) => setComparisonRange(e.target.value)} sx={{ minWidth: 180 }}>
              <MenuItem value="day">Today vs Yesterday</MenuItem><MenuItem value="week">This Week vs Last Week</MenuItem><MenuItem value="month">This Month vs Last Month</MenuItem>
            </TextField>
            <Button variant="contained" startIcon={<CloudDownloadOutlinedIcon />} onClick={handleExportExcel}>Export Excel</Button>
            <Button variant="outlined" startIcon={<CloudDownloadOutlinedIcon />} onClick={handleExportPdf}>Export PDF</Button>
          </Stack>
        </CardContent>
      </Card>

      <Grid container spacing={2}>
        <Grid item xs={12} md={3}><StatCard label="Total Revenue" value={`Rs. ${totalRevenue.toFixed(2)}`} description="Click to see breakdown." onClick={openTotalSalesInsight} /></Grid>
        <Grid item xs={12} md={3}><StatCard label="Total Bills" value={filteredOrders.length} description="Bills in current filter." onClick={openTotalSalesInsight} /></Grid>
        <Grid item xs={12} md={3}><StatCard label="Pending Due" value={`Rs. ${totalDue.toFixed(2)}`} description="Outstanding dues. Click for due details." onClick={() => openInsight("Due Breakdown", "Pending due is sum of unpaid invoice amounts.", [{ label: "Total Pending", value: `Rs. ${dueStats.totalPending.toFixed(2)}` }, { label: "Overdue 30+ days", value: dueStats.overdue.length }, { label: "Highest Due", value: dueStats.highestDue ? `${dueStats.highestDue.customer} (Rs. ${dueStats.highestDue.due.toFixed(2)})` : "-" }], dueStats.dues.slice(0, 10).map((d) => ({ name: d.customer, detailA: `${d.overdueDays} days`, detailB: `Rs. ${d.due.toFixed(2)}` })))} /></Grid>
        <Grid item xs={12} md={3}><StatCard label="Top Item" value={performance.top?.name || "-"} description="Click to understand why it is top." onClick={openTopProductInsight} /></Grid>
        <Grid item xs={12} md={3}><StatCard label="Active Customers" value={uniqueCustomers} description="Unique buyers in dataset." onClick={openCustomerInsight} /></Grid>
        <Grid item xs={12} md={3}><StatCard label="Average Order" value={`Rs. ${averageOrder.toFixed(2)}`} description="Average bill amount." onClick={openTotalSalesInsight} /></Grid>
        <Grid item xs={12} md={3}><StatCard label="Growth" value={`${growthStats.growthPercent >= 0 ? "↑" : "↓"} ${Math.abs(growthStats.growthPercent)}%`} description={`Vs last ${comparisonRange}. Click for formula.`} onClick={openGrowthInsight} /></Grid>
        <Grid item xs={12} md={3}><StatCard label="Gross Profit (Est.)" value={`Rs. ${grossProfit.toFixed(2)}`} description={highestProfitItem ? `Best: ${highestProfitItem.name}` : "Add purchase price for richer profit view"} onClick={() => openInsight("Profit Estimation", "Estimated profit = selling revenue - estimated cost from purchase/cost price fields.", [{ label: "Gross Profit", value: `Rs. ${grossProfit.toFixed(2)}` }, { label: "Highest Profit Item", value: highestProfitItem ? `${highestProfitItem.name} (Rs. ${Number(highestProfitItem.profit || 0).toFixed(2)})` : "-" }], products.slice(0, 10).map((p) => ({ name: p.name, detailA: `${p.qty} qty`, detailB: `Rs. ${Number(p.profit || 0).toFixed(2)}` })))} /></Grid>

        <Grid item xs={12} md={8}><Card><CardContent><Typography variant="h6">Monthly Sales Trend</Typography>{loading ? <Typography color="text.secondary">Loading trend...</Typography> : <LineChartWrapper data={monthlyTrend} xKey="label" dataKey="value" name="Revenue" onPointClick={(p) => openChartPointInsight("Monthly Trend", p, filteredOrders)} />}</CardContent></Card></Grid>
        <Grid item xs={12} md={4}><Card><CardContent><Typography variant="h6">Top Customers</Typography>{loading ? <Typography color="text.secondary">Loading customers...</Typography> : <BarChartWrapper data={customers} xKey="name" dataKey="total" name="Spend" onPointClick={(p) => openInsight("Top Customer Point", "This bar represents total spend by this customer in selected filters.", [{ label: "Customer", value: p?.name || "-" }, { label: "Spend", value: `Rs. ${Number(p?.total || 0).toFixed(2)}` }, { label: "Bills", value: p?.count || 0 }], (p?.topItems || []).slice(0, 8).map((i) => ({ name: i.name, detailA: `${i.qty} qty`, detailB: `Rs. ${Number(i.sales || 0).toFixed(2)}` })))} />}</CardContent></Card></Grid>
        <Grid item xs={12} md={6}><Card><CardContent><Typography variant="h6">Category Share</Typography>{loading ? <Typography color="text.secondary">Loading categories...</Typography> : <PieChartWrapper data={favCategories} nameKey="name" valueKey="sales" onPointClick={(p) => openInsight("Category Contribution", "Category contribution is category sales divided by total revenue.", [{ label: "Category", value: p?.name || "-" }, { label: "Sales", value: `Rs. ${Number(p?.sales || 0).toFixed(2)}` }, { label: "Share", value: `${totalRevenue ? ((Number(p?.sales || 0) / totalRevenue) * 100).toFixed(2) : 0}%` }], products.filter((item) => item.category === p?.name).slice(0, 8).map((item) => ({ name: item.name, detailA: `${item.qty} qty`, detailB: `Rs. ${Number(item.revenue || 0).toFixed(2)}` })))} />}</CardContent></Card></Grid>
        <Grid item xs={12} md={6}><Card><CardContent><Typography variant="h6">Top Products (Revenue)</Typography>{loading ? <Typography color="text.secondary">Loading products...</Typography> : <BarChartWrapper data={topProductsChart} xKey="name" dataKey="revenue" name="Revenue" onPointClick={(p) => openChartPointInsight("Top Products", p, filteredOrders)} />}</CardContent></Card></Grid>
        <Grid item xs={12} md={6}><Card><CardContent><Typography variant="h6">Sales Heatmap (By Day)</Typography>{loading ? <Typography color="text.secondary">Loading day pattern...</Typography> : <AreaChartWrapper data={weekdayHeatmap} xKey="label" dataKey="sales" name="Sales" onPointClick={(p) => openChartPointInsight("Busy Day", p, filteredOrders)} />}</CardContent></Card></Grid>
        <Grid item xs={12} md={6}>{loading ? <Card><CardContent><Typography variant="h6">Recent Activity</Typography><Typography color="text.secondary">Loading latest invoices...</Typography></CardContent></Card> : <ActivityFeed orders={filteredOrders} />}</Grid>

        <Grid item xs={12}><Card><CardContent><Typography variant="h6">Smart Insights</Typography><Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>{smartInsights.map((insight) => <Chip key={insight} label={insight} color="primary" variant="outlined" />)}</Stack></CardContent></Card></Grid>
      </Grid>

      <Dialog open={insightDialog.open} onClose={closeInsight} fullWidth maxWidth="md">
        <DialogTitle>{insightDialog.title}</DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <Typography color="text.secondary">{insightDialog.explanation}</Typography>
            <Grid container spacing={1}>
              {insightDialog.metrics.map((m) => (
                <Grid key={m.label} item xs={12} sm={6} md={4}>
                  <Card sx={{ bgcolor: "rgba(37,99,235,0.06)" }}>
                    <CardContent sx={{ py: 1.25 }}>
                      <Typography variant="caption" color="text.secondary">{m.label}</Typography>
                      <Typography variant="h6">{m.value}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
            {insightDialog.rows.length ? (
              <Table size="small">
                <TableHead><TableRow><TableCell>Name</TableCell><TableCell>Detail</TableCell><TableCell align="right">Value</TableCell></TableRow></TableHead>
                <TableBody>
                  {insightDialog.rows.map((row, idx) => (
                    <TableRow key={`${row.name}-${idx}`}>
                      <TableCell>{row.name}</TableCell>
                      <TableCell>{row.detailA || "-"}</TableCell>
                      <TableCell align="right">{row.detailB || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : <Typography color="text.secondary">No detailed rows available for this metric yet.</Typography>}
            <Stack direction="row" justifyContent="flex-end"><Button onClick={closeInsight} variant="contained">Close</Button></Stack>
          </Stack>
        </DialogContent>
      </Dialog>
    </Stack>
  );
};

export default CustomerAnalytics;
