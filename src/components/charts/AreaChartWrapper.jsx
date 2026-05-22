import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";
import PropTypes from "prop-types";

const AreaChartWrapper = ({ data, dataKey = "value", name = "Value", xKey = "label", color = "#2563eb", onPointClick }) => {
  if (!data || !data.length) return <div>No data</div>;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xKey} />
        <YAxis />
        <Tooltip />
        <Legend />
        <Area
          type="monotone"
          dataKey={dataKey}
          name={name}
          stroke={color}
          fill={color}
          fillOpacity={0.25}
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
  onPointClick: PropTypes.func,
};
