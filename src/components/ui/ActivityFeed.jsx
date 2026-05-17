import { Card, CardContent, List, ListItem, ListItemText, Typography, Chip, Stack } from "@mui/material";
import PropTypes from "prop-types";
import dayjs from "dayjs";

const ActivityFeed = ({ orders = [] }) => {
  const recent = [...orders]
    .sort((a, b) => new Date(b.createdAt || b.createdAtSeconds * 1000 || b.date).getTime() - new Date(a.createdAt || a.createdAtSeconds * 1000 || a.date).getTime())
    .slice(0, 6);

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Recent Activity
        </Typography>
        <List disablePadding>
          {recent.map((order, index) => {
            const label = order.date || (order.createdAt ? dayjs(order.createdAt).format("DD MMM YYYY") : "Unknown date");
            const amount = Number(order.totalAmount || 0).toFixed(2);
            const due = Number(order.dueAmount || 0);
            return (
              <ListItem key={`${order.id || index}-${label}`} sx={{ py: 1, px: 0, borderBottom: index < recent.length - 1 ? "1px solid rgba(148, 163, 184, 0.16)" : "none" }}>
                <ListItemText
                  primary={`${order.customerName || order.name || "Customer"} — Rs. ${amount}`}
                  secondary={label}
                />
                <Stack direction="row" spacing={1} alignItems="center">
                  {due > 0 ? <Chip label={`Due Rs. ${due.toFixed(2)}`} color="warning" size="small" /> : <Chip label="Paid" color="success" size="small" />}
                </Stack>
              </ListItem>
            );
          })}
          {!recent.length ? (
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              No recent orders found.
            </Typography>
          ) : null}
        </List>
      </CardContent>
    </Card>
  );
};

export default ActivityFeed;

ActivityFeed.propTypes = {
  orders: PropTypes.array,
};
