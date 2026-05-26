export const CHART_PRIMARY = "#06b6d4";
export const CHART_PRIMARY_DARK = "#0284c7";

export const CHART_COLORS = [
  "#06b6d4", // Electric Cyan
  "#6366f1", // Indigo Blue
  "#22c55e", // Emerald Green
  "#f43f5e", // Rose Pink
  "#f97316", // Solar Orange
  "#eab308", // Solar Yellow
  "#a855f7", // Violet
  "#ec4899", // Magenta Pink
];

export const getChartTheme = (mode = "dark") => {
  const isDark = mode === "dark";
  return {
    axis: isDark ? "#94a3b8" : "#64748b",
    grid: isDark ? "rgba(148,163,184,0.14)" : "rgba(148,163,184,0.22)",
    cursor: isDark ? "rgba(74,222,128,0.12)" : "rgba(34,197,94,0.12)",
    tooltipBg: isDark ? "#121a17" : "#ffffff",
    tooltipBorder: isDark ? "rgba(74,222,128,0.28)" : "rgba(22,163,74,0.22)",
    tooltipText: isDark ? "#f1f5f9" : "#0f172a",
    tooltipMuted: isDark ? "#94a3b8" : "#64748b",
  };
};

export const formatChartValue = (value) => {
  const num = Number(value || 0);
  if (num >= 100000) return `Rs. ${(num / 100000).toFixed(1)}L`;
  if (num >= 1000) return `Rs. ${(num / 1000).toFixed(1)}k`;
  return `Rs. ${num.toFixed(0)}`;
};
