import { Box, Stack, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import PropTypes from "prop-types";
import { CHART_PRIMARY, getChartTheme, formatChartValue } from "./chartTheme";

const ChartTooltip = ({ active, payload, label, valueFormatter }) => {
  const theme = useTheme();
  const chartTheme = getChartTheme(theme.palette.mode);

  if (!active || !payload?.length) return null;

  const format = valueFormatter || formatChartValue;

  return (
    <Box
      sx={{
        bgcolor: chartTheme.tooltipBg,
        border: `1px solid ${chartTheme.tooltipBorder}`,
        borderRadius: 2,
        px: 1.75,
        py: 1.25,
        boxShadow:
          theme.palette.mode === "dark"
            ? "0 12px 32px rgba(0,0,0,0.45)"
            : "0 12px 28px rgba(15,23,42,0.12)",
        minWidth: 140,
      }}
    >
      {label ? (
        <Typography variant="caption" sx={{ color: chartTheme.tooltipMuted, fontWeight: 600 }}>
          {label}
        </Typography>
      ) : null}
      <Stack spacing={0.5} sx={{ mt: label ? 0.75 : 0 }}>
        {payload.map((entry) => (
          <Stack key={entry.name || entry.dataKey} direction="row" spacing={1} alignItems="center">
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                bgcolor: entry.color || CHART_PRIMARY,
                flexShrink: 0,
              }}
            />
            <Typography variant="body2" sx={{ color: chartTheme.tooltipText, fontWeight: 700 }}>
              {entry.name ? `${entry.name}: ` : ""}
              {format(entry.value)}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Box>
  );
};

ChartTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.array,
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  valueFormatter: PropTypes.func,
};

export default ChartTooltip;
