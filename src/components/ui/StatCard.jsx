import { Box, Typography, Paper } from "@mui/material";
import PropTypes from "prop-types";

const StatCard = ({ label, value, description, icon, sx = {}, onClick }) => (
  <Paper
    onClick={onClick}
    sx={{
      p: 2.5,
      minHeight: 140,
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      background: (theme) =>
        theme.palette.mode === "dark"
          ? "rgba(15,23,42,0.9)"
          : "rgba(255,255,255,0.64)",
      backdropFilter: "blur(16px)",
      border: (theme) =>
        theme.palette.mode === "dark"
          ? "1px solid rgba(255,255,255,0.10)"
          : "1px solid rgba(255,255,255,0.72)",
      boxShadow: (theme) =>
        theme.palette.mode === "dark"
          ? "0 20px 46px rgba(2,6,23,0.48)"
          : "0 24px 60px rgba(15, 23, 42, 0.08)",
      cursor: onClick ? "pointer" : "default",
      transition: "transform .2s ease, box-shadow .2s ease",
      "&:hover": onClick
        ? {
            transform: "translateY(-2px)",
            boxShadow: "0 28px 72px rgba(15, 23, 42, 0.14)",
          }
        : undefined,
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
  onClick: PropTypes.func,
};
