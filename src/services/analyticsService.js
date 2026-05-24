import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../Firebase/firebase";
import dayjs from "dayjs";

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

// Fetch orders collection (tries top-level 'orders' first)
export const fetchAllOrders = async (opts = {}) => {
  const { since } = opts || {};
  const ordersCol = collection(db, "orders");
  const q = since ? query(ordersCol, where("createdAt", ">=", since)) : ordersCol;
  const snap = await getDocs(q);
  // normalize docs
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const aggregateCustomerSpending = (orders) => {
  const map = new Map();
  (orders || []).forEach((order) => {
    const name = order.customerName || order.name || "Unknown";
    const phone = order.customerPhone || order.phoneNumber || "-";
    const key = (phone || name || "unknown").toString();
    const current = map.get(key) || {
      name,
      phone,
      total: 0,
      count: 0,
      items: new Map(),
      lastAt: 0,
    };
    current.total += Number(order.totalAmount || 0);
    current.count += 1;
    const at = parseOrderDate(order)?.getTime() || 0;
    current.lastAt = Math.max(current.lastAt, at);
    (order.items || []).forEach((it) => {
      const name = it.itemName || it.name || "Unnamed";
      const item = current.items.get(name) || { name, qty: 0, sales: 0 };
      item.qty += Number(it.quantity || 0);
      item.sales += Number(it.total || it.totalPrice || 0);
      current.items.set(name, item);
    });
    map.set(key, current);
  });

  return Array.from(map.values()).map((v) => ({
    name: v.name,
    phone: v.phone,
    total: v.total,
    count: v.count,
    lastAt: v.lastAt,
    topItems: Array.from(v.items.values()).sort((a, b) => b.sales - a.sales).slice(0, 10),
  })).sort((a, b) => b.total - a.total);
};

export const monthlySpendingTrend = (orders, months = 12) => {
  const now = dayjs();
  const buckets = [];
  for (let i = months - 1; i >= 0; i--) {
    const m = now.subtract(i, "month");
    buckets.push({ label: m.format("MMM YYYY"), start: m.startOf("month").toDate(), end: m.endOf("month").toDate(), total: 0 });
  }

  (orders || []).forEach((order) => {
    const date = parseOrderDate(order);
    if (!date) return;
    for (const b of buckets) {
      if (date >= b.start && date <= b.end) {
        b.total += Number(order.totalAmount || 0);
        break;
      }
    }
  });

  return buckets.map((b) => ({ label: b.label, value: Number(b.total.toFixed(2)) }));
};

export const favoriteCategoriesForCustomer = (orders, customerKey) => {
  const map = new Map();
  (orders || []).forEach((order) => {
    const key = (order.customerPhone || order.customerName || "").toString();
    if (key !== customerKey) return;
    (order.items || []).forEach((it) => {
      const cat = it.category || it.categoryId || "Uncategorized";
      const current = map.get(cat) || { name: cat, qty: 0, sales: 0 };
      current.qty += Number(it.quantity || 0);
      current.sales += Number(it.total || it.totalPrice || 0);
      map.set(cat, current);
    });
  });
  return Array.from(map.values()).sort((a, b) => b.sales - a.sales);
};

export const aggregateFavoriteCategories = (orders) => {
  const map = new Map();
  (orders || []).forEach((order) => {
    (order.items || []).forEach((it) => {
      const category =
        it.category ||
        it.categoryName ||
        it.subcategory ||
        it.subcategoryName ||
        it.itemName ||
        it.name ||
        "Uncategorized";
      const current = map.get(category) || { name: category, qty: 0, sales: 0 };
      current.qty += Number(it.quantity || 0);
      current.sales += Number(it.total || it.totalPrice || 0);
      map.set(category, current);
    });
  });
  return Array.from(map.values()).sort((a, b) => b.sales - a.sales).slice(0, 10);
};

export const getOrderTotal = (order) => Number(order?.totalAmount || 0);

export const getOrderDue = (order) => Number(order?.dueAmount || 0);

export const calculateGrowth = (currentValue, previousValue) => {
  const current = Number(currentValue || 0);
  const previous = Number(previousValue || 0);
  if (previous <= 0) {
    if (current <= 0) return 0;
    return 100;
  }
  return Number((((current - previous) / previous) * 100).toFixed(2));
};

const getItemRevenue = (item) =>
  Number(item?.totalPrice || item?.total || Number(item?.price || 0) * Number(item?.quantity || 0) || 0);

const getItemCost = (item) =>
  Number(item?.purchasePrice || item?.costPrice || item?.buyPrice || 0);

const itemCategoryKey = (item) =>
  item?.category || item?.categoryName || item?.subcategory || item?.subcategoryName || "Uncategorized";

const itemNameKey = (item) => item?.itemName || item?.name || "Unnamed";

export const aggregateProducts = (orders) => {
  const map = new Map();
  (orders || []).forEach((order) => {
    (order.items || []).forEach((item) => {
      const key = `${itemNameKey(item)}__${itemCategoryKey(item)}`;
      const current = map.get(key) || {
        key,
        name: itemNameKey(item),
        category: itemCategoryKey(item),
        qty: 0,
        revenue: 0,
        estimatedCost: 0,
      };
      const qty = Number(item.quantity || 0);
      current.qty += qty;
      current.revenue += getItemRevenue(item);
      current.estimatedCost += getItemCost(item) * qty;
      map.set(key, current);
    });
  });
  return Array.from(map.values())
    .map((entry) => ({
      ...entry,
      profit: Number((entry.revenue - entry.estimatedCost).toFixed(2)),
      revenue: Number(entry.revenue.toFixed(2)),
    }))
    .sort((a, b) => b.revenue - a.revenue);
};

export const topAndWorstProduct = (orders) => {
  const products = aggregateProducts(orders);
  if (!products.length) {
    return { top: null, worst: null, fastMoving: [], slowMoving: [], frequent: [] };
  }
  const sortedByQty = [...products].sort((a, b) => b.qty - a.qty);
  const sortedByRevenue = [...products].sort((a, b) => b.revenue - a.revenue);
  const nonZero = sortedByQty.filter((item) => item.qty > 0);
  return {
    top: sortedByRevenue[0] || null,
    worst: nonZero.length ? nonZero[nonZero.length - 1] : sortedByRevenue[sortedByRevenue.length - 1] || null,
    fastMoving: sortedByQty.slice(0, 5),
    slowMoving: sortedByQty.filter((item) => item.qty > 0).slice(-5).reverse(),
    frequent: sortedByQty.slice(0, 10),
  };
};

export const getBestCustomerInsight = (orders) => {
  const customers = aggregateCustomerSpending(orders);
  const top = customers[0] || null;
  if (!top) return null;
  return {
    ...top,
    averagePurchase: Number((top.total / Math.max(top.count, 1)).toFixed(2)),
    lastPurchaseDate: top.lastAt ? dayjs(top.lastAt).format("DD MMM YYYY") : "-",
  };
};

export const customerBuyingHabits = (orders) => {
  const customerMap = new Map();
  (orders || []).forEach((order) => {
    const key = (order.customerPhone || order.phoneNumber || order.customerName || order.name || "Unknown").toString();
    const current = customerMap.get(key) || {
      customer: order.customerName || order.name || "Unknown",
      phone: order.customerPhone || order.phoneNumber || "",
      itemMap: new Map(),
      categoryMap: new Map(),
    };
    (order.items || []).forEach((item) => {
      const itemName = itemNameKey(item);
      const category = itemCategoryKey(item);
      current.itemMap.set(itemName, (current.itemMap.get(itemName) || 0) + Number(item.quantity || 0));
      current.categoryMap.set(category, (current.categoryMap.get(category) || 0) + Number(item.quantity || 0));
    });
    customerMap.set(key, current);
  });

  return Array.from(customerMap.values()).map((entry) => {
    const topItem = Array.from(entry.itemMap.entries()).sort((a, b) => b[1] - a[1])[0];
    const topCategory = Array.from(entry.categoryMap.entries()).sort((a, b) => b[1] - a[1])[0];
    return {
      customer: entry.customer,
      phone: entry.phone,
      topItem: topItem ? topItem[0] : "-",
      topCategory: topCategory ? topCategory[0] : "-",
    };
  });
};

export const dailyGrowthTrend = (orders, options = {}) => {
  const maxDays = Number(options.maxDays) > 0 ? Number(options.maxDays) : 31;
  const dayMap = new Map();

  (orders || []).forEach((order) => {
    const date = parseOrderDate(order);
    if (!date) return;
    const key = dayjs(date).format("YYYY-MM-DD");
    const current = dayMap.get(key) || { revenue: 0, bills: 0 };
    current.revenue += getOrderTotal(order);
    current.bills += 1;
    dayMap.set(key, current);
  });

  const keys = Array.from(dayMap.keys()).sort();
  if (!keys.length) return [];

  const end = dayjs(keys[keys.length - 1]);
  let start = dayjs(keys[0]);
  const rangeDays = end.diff(start, "day") + 1;
  if (rangeDays > maxDays) {
    start = end.subtract(maxDays - 1, "day");
  }

  const rows = [];
  let cursor = start;
  while (cursor.isBefore(end.add(1, "day"), "day")) {
    const key = cursor.format("YYYY-MM-DD");
    const bucket = dayMap.get(key) || { revenue: 0, bills: 0 };
    rows.push({
      key,
      label: cursor.format("DD MMM"),
      value: Number(bucket.revenue.toFixed(2)),
      bills: bucket.bills,
    });
    cursor = cursor.add(1, "day");
  }

  return rows.map((row, index, arr) => {
    const prevValue = index > 0 ? arr[index - 1].value : null;
    const growthPercent = prevValue === null ? null : calculateGrowth(row.value, prevValue);
    const growthValue = prevValue === null ? 0 : Number((row.value - prevValue).toFixed(2));
    return {
      ...row,
      growthPercent,
      growthValue,
      growthChart: growthPercent === null ? 0 : growthPercent,
    };
  });
};

export const salesByWeekday = (orders) => {
  const labels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const map = labels.map((label) => ({ label, sales: 0, orders: 0 }));
  (orders || []).forEach((order) => {
    const date = parseOrderDate(order);
    if (!date) return;
    const dayIndex = date.getDay();
    map[dayIndex].sales += getOrderTotal(order);
    map[dayIndex].orders += 1;
  });
  return map.map((entry) => ({
    ...entry,
    sales: Number(entry.sales.toFixed(2)),
  }));
};

export const dueAnalytics = (orders) => {
  const dues = (orders || [])
    .filter((order) => getOrderDue(order) > 0)
    .map((order) => {
      const date = parseOrderDate(order);
      return {
        id: order.id,
        customer: order.customerName || order.name || "Unknown",
        phone: order.customerPhone || order.phoneNumber || "",
        due: getOrderDue(order),
        total: getOrderTotal(order),
        date,
        overdueDays: date ? Math.max(dayjs().diff(dayjs(date), "day"), 0) : 0,
      };
    });

  const totalPending = dues.reduce((sum, row) => sum + row.due, 0);
  const highestDue = [...dues].sort((a, b) => b.due - a.due)[0] || null;
  const overdue = dues.filter((row) => row.overdueDays > 30).sort((a, b) => b.overdueDays - a.overdueDays);

  return {
    totalPending: Number(totalPending.toFixed(2)),
    highestDue,
    overdue,
    dues,
  };
};

export const recentActivity = (orders, limit = 8) =>
  [...(orders || [])]
    .map((order) => ({
      ...order,
      __ts: parseOrderDate(order)?.getTime() || 0,
    }))
    .sort((a, b) => b.__ts - a.__ts)
    .slice(0, limit);

export const compareRangeMetrics = (orders, range = "week") => {
  const now = dayjs();
  let currentStart;
  let previousStart;
  let previousEnd;

  if (range === "day") {
    currentStart = now.startOf("day");
    previousStart = currentStart.subtract(1, "day");
    previousEnd = currentStart.subtract(1, "millisecond");
  } else if (range === "month") {
    currentStart = now.startOf("month");
    previousStart = currentStart.subtract(1, "month");
    previousEnd = currentStart.subtract(1, "millisecond");
  } else {
    currentStart = now.startOf("week");
    previousStart = currentStart.subtract(1, "week");
    previousEnd = currentStart.subtract(1, "millisecond");
  }

  const currentOrders = (orders || []).filter((order) => {
    const date = parseOrderDate(order);
    return date && dayjs(date).isAfter(currentStart) && dayjs(date).isBefore(now.add(1, "millisecond"));
  });
  const previousOrders = (orders || []).filter((order) => {
    const date = parseOrderDate(order);
    return date && dayjs(date).isAfter(previousStart) && dayjs(date).isBefore(previousEnd.add(1, "millisecond"));
  });

  const currentSales = currentOrders.reduce((sum, order) => sum + getOrderTotal(order), 0);
  const previousSales = previousOrders.reduce((sum, order) => sum + getOrderTotal(order), 0);

  return {
    currentSales: Number(currentSales.toFixed(2)),
    previousSales: Number(previousSales.toFixed(2)),
    growthPercent: calculateGrowth(currentSales, previousSales),
    currentBills: currentOrders.length,
    previousBills: previousOrders.length,
  };
};

export const buildSmartInsights = ({ orders = [], products = [], dues = null, growth = null, customers = [] }) => {
  const insights = [];
  if (growth) {
    if (growth.growthPercent > 0) {
      insights.push(`Sales increased by ${growth.growthPercent}% in selected comparison period.`);
    } else if (growth.growthPercent < 0) {
      insights.push(`Sales dropped by ${Math.abs(growth.growthPercent)}% in selected comparison period.`);
    }
  }

  if (products?.length) {
    const top = products[0];
    insights.push(`${top.name} is leading with ${top.qty} units and Rs. ${top.revenue.toFixed(2)} sales.`);
  }

  const bestCustomer = customers?.[0];
  if (bestCustomer) {
    insights.push(`${bestCustomer.name} is your top customer with ${bestCustomer.count} bills.`);
  }

  if (dues?.highestDue) {
    insights.push(
      `${dues.highestDue.customer} has the highest pending due: Rs. ${Number(dues.highestDue.due || 0).toFixed(2)}.`
    );
  }

  if (!insights.length && !(orders || []).length) {
    insights.push("No billing data yet. Add bills to unlock smart insights.");
  }

  return insights.slice(0, 6);
};

export const buildAIInsights = ({
  orders = [],
  products = [],
  customers = [],
  dues = null,
  growth = null,
  dailyTrend = [],
  totalRevenue = 0,
  averageOrder = 0,
}) => {
  const cards = [];
  const recentDays = (dailyTrend || []).slice(-7);
  const avgDaily =
    recentDays.length > 0
      ? recentDays.reduce((sum, row) => sum + Number(row.value || 0), 0) / recentDays.length
      : 0;
  const forecast7d = avgDaily * 7;
  const forecastConfidence = recentDays.length >= 5 ? 86 : recentDays.length >= 2 ? 68 : 45;

  let healthScore = 58;
  if ((orders || []).length >= 20) healthScore += 12;
  if ((orders || []).length >= 5) healthScore += 6;
  if (growth?.growthPercent > 0) healthScore += Math.min(18, Math.round(growth.growthPercent / 2));
  if (growth?.growthPercent < -5) healthScore -= Math.min(22, Math.abs(Math.round(growth.growthPercent / 2)));
  if (dues?.totalPending > 0 && totalRevenue > 0 && dues.totalPending / totalRevenue > 0.35) {
    healthScore -= 14;
  }
  if (dues?.overdue?.length > 0) healthScore -= 8;
  healthScore = Math.max(12, Math.min(98, healthScore));

  const bestDay = [...(dailyTrend || [])].sort((a, b) => Number(b.value || 0) - Number(a.value || 0))[0];
  const topProduct = products?.[0];
  const topCustomer = customers?.[0];

  if (!(orders || []).length) {
    return {
      healthScore: 0,
      healthLabel: "Waiting for data",
      summary: "Start billing to activate Dokan AI insights, forecasts, and smart recommendations.",
      cards: [
        {
          id: "empty",
          type: "tip",
          title: "AI is ready",
          message: "Create a few bills and come back — forecasts and alerts will appear automatically.",
          confidence: 100,
          tone: "info",
        },
      ],
    };
  }

  cards.push({
    id: "forecast",
    type: "forecast",
    title: "7-day revenue forecast",
    message: `Projected sales ~Rs. ${forecast7d.toFixed(0)} based on your recent daily average of Rs. ${avgDaily.toFixed(0)}.`,
    confidence: forecastConfidence,
    tone: "info",
  });

  if (growth?.growthPercent > 3) {
    cards.push({
      id: "growth",
      type: "insight",
      title: "Growth momentum",
      message: `Sales are up ${growth.growthPercent}% vs the previous period. Double down on ${topProduct?.name || "top sellers"} while demand is rising.`,
      confidence: 84,
      tone: "success",
    });
  } else if (growth?.growthPercent < -3) {
    cards.push({
      id: "slowdown",
      type: "alert",
      title: "Slowdown signal",
      message: `Sales dipped ${Math.abs(growth.growthPercent)}%. Try WhatsApp follow-ups with ${topCustomer?.name || "repeat customers"} and highlight ${topProduct?.name || "popular items"}.`,
      confidence: 81,
      tone: "warning",
    });
  }

  if (bestDay && Number(bestDay.value || 0) > 0) {
    cards.push({
      id: "peak-day",
      type: "insight",
      title: "Peak performance day",
      message: `${bestDay.label} was your strongest day (Rs. ${Number(bestDay.value).toFixed(0)}). Plan stock and staff for similar patterns.`,
      confidence: 79,
      tone: "success",
    });
  }

  if (dues?.highestDue && Number(dues.highestDue.due || 0) > 0) {
    cards.push({
      id: "due",
      type: "action",
      title: "Collect pending due",
      message: `${dues.highestDue.customer} owes Rs. ${Number(dues.highestDue.due).toFixed(0)} — highest in your books. A reminder today could improve cash flow.`,
      confidence: 92,
      tone: "warning",
    });
  }

  const slowMover = [...(products || [])].filter((p) => p.qty > 0).sort((a, b) => a.qty - b.qty)[0];
  if (slowMover && topProduct && slowMover.name !== topProduct.name) {
    cards.push({
      id: "inventory",
      type: "tip",
      title: "Inventory nudge",
      message: `${slowMover.name} is moving slowly (${slowMover.qty} units). Bundle it with ${topProduct.name} or run a small discount.`,
      confidence: 74,
      tone: "info",
    });
  }

  if (topCustomer) {
    cards.push({
      id: "vip",
      type: "action",
      title: "VIP customer alert",
      message: `${topCustomer.name} spent Rs. ${Number(topCustomer.total || 0).toFixed(0)} across ${topCustomer.count} bills. Reward loyalty to protect repeat revenue.`,
      confidence: 88,
      tone: "success",
    });
  }

  if (averageOrder > 0 && averageOrder < 500 && (orders || []).length > 5) {
    cards.push({
      id: "basket",
      type: "tip",
      title: "Basket size opportunity",
      message: `Average bill is Rs. ${averageOrder.toFixed(0)}. Suggest add-ons at billing to lift ticket size by 10–15%.`,
      confidence: 71,
      tone: "info",
    });
  }

  const healthLabel =
    healthScore >= 80 ? "Excellent" : healthScore >= 65 ? "Healthy" : healthScore >= 45 ? "Stable" : "Needs attention";

  const summary = growth?.growthPercent > 0
    ? `Your shop health is ${healthLabel} (${healthScore}/100). Revenue is trending up and ${topProduct?.name || "core products"} are driving sales.`
    : growth?.growthPercent < 0
      ? `Your shop health is ${healthLabel} (${healthScore}/100). Focus on collections and pushing ${topProduct?.name || "bestsellers"} to recover momentum.`
      : `Your shop health is ${healthLabel} (${healthScore}/100). ${topCustomer?.name || "Customers"} and daily billing patterns look steady.`;

  return {
    healthScore,
    healthLabel,
    summary,
    cards: cards.slice(0, 6),
  };
};
