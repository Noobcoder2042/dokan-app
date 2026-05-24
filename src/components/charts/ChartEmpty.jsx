import { Box, Typography } from "@mui/material";
import PropTypes from "prop-types";

const ChartEmpty = ({ message = "No data for this period" }) => (
  <Box
    sx={{
      height: 280,
      display: "grid",
      placeItems: "center",
      borderRadius: 2,
      border: "1px dashed",
      borderColor: "divider",
      bgcolor: (theme) =>
        theme.palette.mode === "dark" ? "rgba(255,255,255,0.02)" : "rgba(15,23,42,0.02)",
    }}
  >
    <Typography variant="body2" color="text.secondary">
      {message}
    </Typography>
  </Box>
);

ChartEmpty.propTypes = {
  message: PropTypes.string,
};

export default ChartEmpty;
