import { Box, Typography, Paper } from "@mui/material";
import PropTypes from "prop-types";

const StatCard = ({ label, value, description, icon, sx = {} }) => (
  <Paper
    sx={{
      p: 2.5,
      minHeight: 140,
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      background: "rgba(255,255,255,0.64)",
      backdropFilter: "blur(16px)",
      border: "1px solid rgba(255,255,255,0.72)",
      boxShadow: "0 24px 60px rgba(15, 23, 42, 0.08)",
      ...sx,
    }}
  >
    <Box>
      <Typography color="text.secondary" variant="subtitle2">
        {label}
      </Typography>
      <Typography variant="h4" sx={{ mt: 1, fontWeight: 700 }}>
        {value}
      </Typography>
    </Box>

    {description ? (
      <Typography color="text.secondary" variant="body2" sx={{ mt: 1 }}>
        {description}
      </Typography>
    ) : null}
    {icon ? <Box sx={{ mt: 2 }}>{icon}</Box> : null}
  </Paper>
);

export default StatCard;

StatCard.propTypes = {
  label: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  description: PropTypes.string,
  icon: PropTypes.node,
  sx: PropTypes.object,
};
