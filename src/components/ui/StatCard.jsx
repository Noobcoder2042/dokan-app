import { Box, Typography, Paper } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import PropTypes from "prop-types";

const StatCard = ({ label, value, description, icon, sx = {}, onClick }) => {
  const theme = useTheme();

  return (
    <Paper
      onClick={onClick}
      sx={{
        p: 2.5,
        minHeight: 132,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        bgcolor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        boxShadow: "none",
        cursor: onClick ? "pointer" : "default",
        transition: "border-color .2s ease, transform .2s ease",
        "&:hover": onClick
          ? {
              transform: "translateY(-2px)",
              borderColor: theme.palette.mode === "dark" ? "rgba(74,222,128,0.35)" : "rgba(22,163,74,0.35)",
            }
          : undefined,
        ...sx,
      }}
    >
      <Box>
        <Typography color="text.secondary" variant="subtitle2">
          {label}
        </Typography>
        <Typography variant="h5" sx={{ mt: 1, fontWeight: 700 }}>
          {value}
        </Typography>
      </Box>

      {description ? (
        <Typography color="text.secondary" variant="body2" sx={{ mt: 1 }}>
          {description}
        </Typography>
      ) : null}
      {icon ? <Box sx={{ mt: 1.5, color: "primary.main" }}>{icon}</Box> : null}
    </Paper>
  );
};

export default StatCard;

StatCard.propTypes = {
  label: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  description: PropTypes.string,
  icon: PropTypes.node,
  sx: PropTypes.object,
  onClick: PropTypes.func,
};
