import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { useTheme } from "@mui/material/styles";
import PropTypes from "prop-types";
import ChartTooltip from "./ChartTooltip";
import ChartEmpty from "./ChartEmpty";
import { CHART_PRIMARY, getChartTheme } from "./chartTheme";

const AreaChartWrapper = ({
  data,
  dataKey = "value",
  name = "Value",
  xKey = "label",
  color = CHART_PRIMARY,
  height = 300,
  onPointClick,
}) => {
  const theme = useTheme();
  const chartTheme = getChartTheme(theme.palette.mode);
  const gradientId = `area-fill-${dataKey}`;

  if (!data || !data.length) return <ChartEmpty />;

  const axisTick = { fill: chartTheme.axis, fontSize: 12 };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 12, left: 4, bottom: 4 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.4} />
            <stop offset="100%" stopColor={color} stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={chartTheme.grid} strokeDasharray="4 4" vertical={false} />
        <XAxis dataKey={xKey} tick={axisTick} axisLine={false} tickLine={false} dy={8} />
        <YAxis tick={axisTick} axisLine={false} tickLine={false} width={52} />
        <Tooltip content={<ChartTooltip />} cursor={{ stroke: chartTheme.grid }} />
        <Area
          type="monotone"
          dataKey={dataKey}
          name={name}
          stroke={color}
          strokeWidth={2.5}
          fill={`url(#${gradientId})`}
          activeDot={{
            r: 5,
            fill: color,
            stroke: theme.palette.mode === "dark" ? "#0a0f0d" : "#fff",
            strokeWidth: 2,
          }}
          onClick={(payload) => onPointClick && onPointClick(payload?.payload || payload)}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default AreaChartWrapper;

AreaChartWrapper.propTypes = {
  data: PropTypes.array.isRequired,
  dataKey: PropTypes.string,
  name: PropTypes.string,
  xKey: PropTypes.string,
  color: PropTypes.string,
  height: PropTypes.number,
  onPointClick: PropTypes.func,
};
