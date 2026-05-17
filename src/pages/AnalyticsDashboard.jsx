import { Box, Container } from "@mui/material";
import CustomerAnalytics from "../analytics/CustomerAnalytics";

const AnalyticsDashboard = () => {
  return (
    <Box>
      <Container maxWidth="xl">
        <CustomerAnalytics />
      </Container>
    </Box>
  );
};

export default AnalyticsDashboard;
