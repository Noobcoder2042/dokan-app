import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../Firebase/firebase";
import dayjs from "dayjs";

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
    const key = (order.customerPhone || order.customerName || "unknown").toString();
    const current = map.get(key) || { name: order.customerName || "Unknown", phone: order.customerPhone || "-", total: 0, count: 0, items: new Map() };
    current.total += Number(order.totalAmount || 0);
    current.count += 1;
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
    const date = order.createdAt ? new Date(order.createdAt) : new Date(order.createdAtSeconds ? order.createdAtSeconds * 1000 : Date.now());
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
