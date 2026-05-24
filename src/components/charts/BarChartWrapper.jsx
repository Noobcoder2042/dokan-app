import {
  ResponsiveContainer,
  BarChart,
  Bar,
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

const BarChartWrapper = ({
  data,
  dataKey = "value",
  name = "Count",
  xKey = "label",
  color = CHART_PRIMARY,
  height = 300,
  orientation = "vertical",
  onPointClick,
}) => {
  const theme = useTheme();
  const chartTheme = getChartTheme(theme.palette.mode);
  const isHorizontal = orientation === "horizontal";
  const gradientId = `bar-fill-${dataKey}-${orientation}`;

  if (!data || !data.length) return <ChartEmpty />;

  const axisTick = { fill: chartTheme.axis, fontSize: 12 };
  const barRadius = isHorizontal ? [0, 8, 8, 0] : [8, 8, 0, 0];

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        layout={isHorizontal ? "vertical" : "horizontal"}
        margin={
          isHorizontal
            ? { top: 8, right: 24, left: 8, bottom: 4 }
            : { top: 8, right: 12, left: 4, bottom: 4 }
        }
        barCategoryGap={isHorizontal ? "18%" : "28%"}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={CHART_PRIMARY} stopOpacity={0.85} />
            <stop offset="100%" stopColor="#4ade80" stopOpacity={1} />
          </linearGradient>
        </defs>
        <CartesianGrid
          stroke={chartTheme.grid}
          strokeDasharray="4 4"
          horizontal={!isHorizontal}
          vertical={isHorizontal}
        />
        {isHorizontal ? (
          <>
            <XAxis type="number" tick={axisTick} axisLine={false} tickLine={false} />
            <YAxis
              type="category"
              dataKey={xKey}
              tick={axisTick}
              axisLine={false}
              tickLine={false}
              width={96}
              tickFormatter={(v) => (String(v).length > 14 ? `${String(v).slice(0, 12)}…` : v)}
            />
          </>
        ) : (
          <>
            <XAxis dataKey={xKey} tick={axisTick} axisLine={false} tickLine={false} dy={8} />
            <YAxis tick={axisTick} axisLine={false} tickLine={false} width={52} />
          </>
        )}
        <Tooltip
          content={<ChartTooltip />}
          cursor={{ fill: chartTheme.cursor }}
        />
        <Bar
          dataKey={dataKey}
          name={name}
          fill={`url(#${gradientId})`}
          radius={barRadius}
          maxBarSize={isHorizontal ? 28 : 48}
          onClick={(payload, index) => onPointClick && onPointClick(payload, index)}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default BarChartWrapper;

BarChartWrapper.propTypes = {
  data: PropTypes.array.isRequired,
  dataKey: PropTypes.string,
  name: PropTypes.string,
  xKey: PropTypes.string,
  color: PropTypes.string,
  height: PropTypes.number,
  orientation: PropTypes.oneOf(["vertical", "horizontal"]),
  onPointClick: PropTypes.func,
};
