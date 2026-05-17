import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import PropTypes from "prop-types";

const COLORS = ["#1d4ed8", "#0f766e", "#ef4444", "#f59e0b", "#8b5cf6", "#06b6d4"];

const PieChartWrapper = ({ data, nameKey = "name", valueKey = "value" }) => {
  if (!data || !data.length) return <div>No data</div>;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie data={data} dataKey={valueKey} nameKey={nameKey} outerRadius={100} fill="#8884d8" label />
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default PieChartWrapper;

PieChartWrapper.propTypes = {
  data: PropTypes.array.isRequired,
  nameKey: PropTypes.string,
  valueKey: PropTypes.string,
};
