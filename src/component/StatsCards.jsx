import {
  Card,
  CardContent,
  Grid,
  Stack,
  Typography,
  useTheme,
  Box,
  alpha,
} from "@mui/material";
import CurrencyRupeeRoundedIcon from "@mui/icons-material/CurrencyRupeeRounded";
import ReceiptRoundedIcon from "@mui/icons-material/ReceiptRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";

const StatsCards = ({ bills }) => {
  const theme = useTheme();
  const today = new Date();

  const getBillDate = (bill) => {
    if (bill.createdAt) {
      const parsed = new Date(bill.createdAt);
      if (!Number.isNaN(parsed.getTime())) {
        return parsed;
      }
    }

    if (!bill.date) return null;

    const [day, month, year] = bill.date.split("/");
    const fullYear = year?.length === 2 ? Number(`20${year}`) : Number(year);
    const parsed = new Date(fullYear, Number(month) - 1, Number(day));

    return Number.isNaN(parsed.getTime()) ? null : parsed;
  };

  const todayBills = bills.filter((bill) => {
    const billDate = getBillDate(bill);
    if (!billDate) return false;

    return (
      billDate.getDate() === today.getDate() &&
      billDate.getMonth() === today.getMonth() &&
      billDate.getFullYear() === today.getFullYear()
    );
  });

  const totalSales = todayBills.reduce(
    (sum, bill) => sum + Number(bill.totalAmount || 0),
    0
  );

  const stats = [
    {
      title: "Today's Sales",
      value: `Rs. ${totalSales.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      caption: "Live from bills created today",
      icon: <CurrencyRupeeRoundedIcon sx={{ fontSize: "7rem" }} />,
      color: theme.palette.success.main,
    },
    {
      title: "Total Bills",
      value: bills.length,
      caption: "Bills inside the active filter",
      icon: <ReceiptRoundedIcon sx={{ fontSize: "7rem" }} />,
      color: theme.palette.primary.main,
    },
    {
      title: "Customers",
      value: new Set(bills.map((bill) => bill.phoneNumber).filter(Boolean)).size,
      caption: "Unique customer numbers",
      icon: <PeopleAltRoundedIcon sx={{ fontSize: "7rem" }} />,
      color: theme.palette.warning.main,
    },
  ];

  return (
    <Grid container spacing={2.5}>
      {stats.map((stat) => (
        <Grid item xs={12} md={4} key={stat.title}>
          <Card
            sx={{
              height: "100%",
              borderRadius: 3,
              bgcolor: alpha(stat.color, 0.05),
              border: `1px solid ${alpha(stat.color, 0.15)}`,
              position: "relative",
              overflow: "hidden",
              boxShadow: "none",
              transition: "transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease",
              "&:hover": {
                transform: "translateY(-4px)",
                borderColor: alpha(stat.color, 0.35),
                boxShadow: `0 12px 28px ${alpha(stat.color, 0.1)}`,
              },
            }}
          >
            <CardContent sx={{ p: 3, position: "relative", zIndex: 2 }}>
              <Stack spacing={1}>
                <Typography
                  sx={{
                    color: stat.color,
                    fontWeight: 600,
                    fontSize: "0.85rem",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                  }}
                >
                  {stat.title}
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color: theme.palette.text.primary }}>
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {stat.caption}
                </Typography>
              </Stack>
            </CardContent>
            <Box
              sx={{
                position: "absolute",
                right: -10,
                bottom: -10,
                color: alpha(stat.color, 0.06),
                transform: "rotate(-15deg)",
                pointerEvents: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {stat.icon}
            </Box>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default StatsCards;
