import { Box, Typography, Paper, alpha } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import PropTypes from "prop-types";

const StatCard = ({ label, value, description, icon, iconColor = "primary.main", sx = {}, onClick }) => {
  const theme = useTheme();

  // Resolve direct MUI palette colors or fall back to raw strings
  const getResolvedColor = (colorName) => {
    if (colorName.includes(".")) {
      const [paletteKey, subKey] = colorName.split(".");
      return theme.palette[paletteKey]?.[subKey] || theme.palette.primary.main;
    }
    return theme.palette[colorName]?.main || colorName;
  };

  const activeColor = getResolvedColor(iconColor);

  return (
    <Paper
      onClick={onClick}
      sx={{
        p: 3,
        minHeight: 140,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        bgcolor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 4,
        boxShadow: theme.palette.mode === "dark" 
          ? "0 8px 30px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255,255,255,0.02)"
          : "0 8px 24px rgba(15,23,42,0.03), inset 0 1px 0 rgba(255,255,255,0.5)",
        cursor: onClick ? "pointer" : "default",
        transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "3px",
          background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.success.main} 100%)`,
          opacity: 0,
          transition: "opacity 0.3s ease",
        },
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: theme.palette.mode === "dark"
            ? `0 16px 36px rgba(0, 0, 0, 0.35), 0 0 15px ${alpha(theme.palette.primary.main, 0.15)}`
            : `0 12px 28px rgba(15, 23, 42, 0.08), 0 0 12px ${alpha(theme.palette.primary.main, 0.1)}`,
          borderColor: theme.palette.primary.main,
          "&::before": {
            opacity: 1,
          }
        },
        ...sx,
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", width: "100%" }}>
        <Box sx={{ flexGrow: 1, pr: 1.5 }}>
          <Typography color="text.secondary" variant="subtitle2" sx={{ fontWeight: 700, fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.04em" }}>
            {label}
          </Typography>
          <Typography variant="h5" sx={{ mt: 1.25, fontWeight: 900, fontSize: "1.6rem", letterSpacing: "-0.02em", color: "text.primary" }}>
            {value}
          </Typography>
        </Box>

        {icon ? (
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: alpha(activeColor, 0.08),
              border: `1px solid ${alpha(activeColor, 0.16)}`,
              color: activeColor,
              flexShrink: 0,
              boxShadow: `0 0 10px ${alpha(activeColor, 0.05)}`,
              transition: "transform 0.3s ease",
              "& svg": { fontSize: 20 },
              "&:hover": {
                transform: "scale(1.1) rotate(6deg)",
              }
            }}
          >
            {icon}
          </Box>
        ) : null}
      </Box>

      {description ? (
        <Typography color="text.secondary" variant="caption" sx={{ mt: 1.5, fontWeight: 600, display: "block" }}>
          {description}
        </Typography>
      ) : null}
    </Paper>
  );
};

export default StatCard;

StatCard.propTypes = {
  label: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  description: PropTypes.string,
  icon: PropTypes.node,
  iconColor: PropTypes.string,
  sx: PropTypes.object,
  onClick: PropTypes.func,
};
