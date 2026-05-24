import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { Box, Stack, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import PropTypes from "prop-types";
import ChartEmpty from "./ChartEmpty";
import { CHART_PRIMARY, getChartTheme, formatChartValue } from "./chartTheme";

const DailyGrowthTooltip = ({ active, payload, label }) => {
  const theme = useTheme();
  const chartTheme = getChartTheme(theme.palette.mode);

  if (!active || !payload?.length) return null;

  const revenue = payload.find((p) => p.dataKey === "value");
  const growth = payload.find((p) => p.dataKey === "growthChart");

  return (
    <Box
      sx={{
        bgcolor: chartTheme.tooltipBg,
        border: `1px solid ${chartTheme.tooltipBorder}`,
        borderRadius: 2,
        px: 1.75,
        py: 1.25,
        boxShadow: theme.palette.mode === "dark" ? "0 12px 32px rgba(0,0,0,0.45)" : "0 12px 28px rgba(15,23,42,0.12)",
      }}
    >
      <Typography variant="caption" sx={{ color: chartTheme.tooltipMuted, fontWeight: 600 }}>
        {label}
      </Typography>
      <Stack spacing={0.35} sx={{ mt: 0.75 }}>
        {revenue ? (
          <Typography variant="body2" sx={{ color: chartTheme.tooltipText, fontWeight: 700 }}>
            Sales: {formatChartValue(revenue.value)}
          </Typography>
        ) : null}
        {growth ? (
          <Typography variant="body2" sx={{ color: chartTheme.tooltipText, fontWeight: 700 }}>
            vs yesterday: {Number(growth.value) >= 0 ? "+" : ""}
            {Number(growth.value).toFixed(1)}%
          </Typography>
        ) : null}
      </Stack>
    </Box>
  );
};

DailyGrowthTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.array,
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

const DailyGrowthChart = ({ data, height = 320, onPointClick }) => {
  const theme = useTheme();
  const chartTheme = getChartTheme(theme.palette.mode);
  const gradientId = "daily-growth-bar";

  if (!data || !data.length) return <ChartEmpty message="No daily sales in this date range" />;

  const axisTick = { fill: chartTheme.axis, fontSize: 11 };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={data} margin={{ top: 8, right: 8, left: 4, bottom: 4 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={CHART_PRIMARY} stopOpacity={0.95} />
            <stop offset="100%" stopColor="#4ade80" stopOpacity={0.75} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={chartTheme.grid} strokeDasharray="4 4" vertical={false} />
        <XAxis dataKey="label" tick={axisTick} axisLine={false} tickLine={false} dy={8} interval="preserveStartEnd" />
        <YAxis
          yAxisId="left"
          tick={axisTick}
          axisLine={false}
          tickLine={false}
          width={48}
          tickFormatter={(v) => (Number(v) >= 1000 ? `${(v / 1000).toFixed(0)}k` : v)}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          tick={axisTick}
          axisLine={false}
          tickLine={false}
          width={44}
          tickFormatter={(v) => `${v}%`}
        />
        <Tooltip content={<DailyGrowthTooltip />} cursor={{ fill: chartTheme.cursor }} />
        <Legend
          wrapperStyle={{ fontSize: 12, color: chartTheme.axis, paddingTop: 8 }}
          formatter={(value) => <span style={{ color: chartTheme.axis }}>{value}</span>}
        />
        <Bar
          yAxisId="left"
          dataKey="value"
          name="Daily sales"
          fill={`url(#${gradientId})`}
          radius={[6, 6, 0, 0]}
          maxBarSize={36}
          onClick={(payload) => onPointClick && onPointClick(payload?.payload || payload)}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="growthChart"
          name="Growth %"
          stroke="#fbbf24"
          strokeWidth={2.5}
          dot={{ r: 3, fill: "#fbbf24", strokeWidth: 0 }}
          activeDot={{ r: 5 }}
          connectNulls
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
};

DailyGrowthChart.propTypes = {
  data: PropTypes.array.isRequired,
  height: PropTypes.number,
  onPointClick: PropTypes.func,
};

export default DailyGrowthChart;
