import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";
import PropTypes from "prop-types";

const LineChartWrapper = ({ data, dataKey = "value", name = "Value", xKey = "label", color = "#1d4ed8", onPointClick }) => {
  if (!data || !data.length) return <div>No data</div>;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xKey} />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey={dataKey}
          name={name}
          stroke={color}
          strokeWidth={2}
          dot={{ r: 3, onClick: (_, index) => onPointClick && onPointClick(data[index], index) }}
          activeDot={{ r: 5, onClick: (_, index) => onPointClick && onPointClick(data[index], index) }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default LineChartWrapper;

LineChartWrapper.propTypes = {
  data: PropTypes.array.isRequired,
  dataKey: PropTypes.string,
  name: PropTypes.string,
  xKey: PropTypes.string,
  color: PropTypes.string,
  onPointClick: PropTypes.func,
};
