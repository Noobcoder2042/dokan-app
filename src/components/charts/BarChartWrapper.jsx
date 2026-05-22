import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";
import PropTypes from "prop-types";

const BarChartWrapper = ({ data, dataKey = "value", name = "Count", xKey = "label", color = "#0f766e", onPointClick }) => {
  if (!data || !data.length) return <div>No data</div>;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xKey} />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey={dataKey} name={name} fill={color} onClick={(payload, index) => onPointClick && onPointClick(payload, index)} />
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
  onPointClick: PropTypes.func,
};
