import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, Label } from "recharts";
import { useTheme } from "@mui/material/styles";
import PropTypes from "prop-types";
import ChartTooltip from "./ChartTooltip";
import ChartEmpty from "./ChartEmpty";
import { CHART_COLORS, getChartTheme } from "./chartTheme";

const renderLegend = (value) => (
  <span style={{ color: "inherit", fontSize: 12, fontWeight: 600 }}>{value}</span>
);

const PieChartWrapper = ({
  data,
  nameKey = "name",
  valueKey = "value",
  height = 300,
  onPointClick,
}) => {
  const theme = useTheme();
  const chartTheme = getChartTheme(theme.palette.mode);

  if (!data || !data.length) return <ChartEmpty />;

  const total = data.reduce((sum, row) => sum + Number(row[valueKey] || 0), 0);
  const centerLabel = total >= 1000 ? `${(total / 1000).toFixed(1)}k` : String(Math.round(total));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
        <Pie
          data={data}
          dataKey={valueKey}
          nameKey={nameKey}
          cx="42%"
          cy="50%"
          innerRadius={62}
          outerRadius={92}
          paddingAngle={3}
          stroke="none"
          onClick={(payload, index) => onPointClick && onPointClick(payload?.payload || payload, index)}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${entry[nameKey] || index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
          ))}
          <Label
            value={centerLabel}
            position="center"
            style={{
              fill: chartTheme.tooltipText,
              fontSize: 15,
              fontWeight: 800,
            }}
          />
        </Pie>
        <Tooltip content={<ChartTooltip />} />
        <Legend
          layout="vertical"
          verticalAlign="middle"
          align="right"
          iconType="circle"
          iconSize={8}
          formatter={renderLegend}
          wrapperStyle={{
            color: chartTheme.axis,
            paddingLeft: 8,
            maxHeight: height - 16,
            overflowY: "auto",
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default PieChartWrapper;

PieChartWrapper.propTypes = {
  data: PropTypes.array.isRequired,
  nameKey: PropTypes.string,
  valueKey: PropTypes.string,
  height: PropTypes.number,
  onPointClick: PropTypes.func,
};
