import { Box, Typography } from "@mui/material";
import PropTypes from "prop-types";

const ChartShell = ({ title, subtitle, children, height = 300 }) => (
  <Box>
    <Typography variant="h6" sx={{ fontWeight: 700 }}>
      {title}
    </Typography>
    {subtitle ? (
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>
        {subtitle}
      </Typography>
    ) : (
      <Box sx={{ mb: 2 }} />
    )}
    <Box sx={{ width: "100%", height }}>{children}</Box>
  </Box>
);

ChartShell.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  children: PropTypes.node.isRequired,
  height: PropTypes.number,
};

export default ChartShell;
