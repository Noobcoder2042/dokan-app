import {
  Card,
  CardContent,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import CurrencyRupeeRoundedIcon from "@mui/icons-material/CurrencyRupeeRounded";
import ReceiptRoundedIcon from "@mui/icons-material/ReceiptRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";

const StatsCards = ({ bills }) => {
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
      value: `Rs. ${totalSales.toFixed(2)}`,
      caption: "Live from bills created today",
      icon: <CurrencyRupeeRoundedIcon />,
      accent: "linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)",
    },
    {
      title: "Total Bills",
      value: bills.length,
      caption: "Bills inside the active filter",
      icon: <ReceiptRoundedIcon />,
      accent: "linear-gradient(135deg, #0f766e 0%, #14b8a6 100%)",
    },
    {
      title: "Customers",
      value: new Set(bills.map((bill) => bill.phoneNumber)).size,
      caption: "Unique customer numbers",
      icon: <PeopleAltRoundedIcon />,
      accent: "linear-gradient(135deg, #f59e0b 0%, #f97316 100%)",
    },
  ];

  return (
    <Grid container spacing={2.5}>
      {stats.map((stat) => (
        <Grid item xs={12} md={4} key={stat.title}>
          <Card
            sx={{
              height: "100%",
              border: "1px solid rgba(148, 163, 184, 0.12)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="flex-start"
                spacing={2}
              >
                <Stack spacing={0.8}>
                  <Typography variant="body2" color="text.secondary">
                    {stat.title}
                  </Typography>
                  <Typography variant="h4">{stat.value}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stat.caption}
                  </Typography>
                </Stack>
                <Stack
                  sx={{
                    width: 52,
                    height: 52,
                    borderRadius: 4,
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    background: stat.accent,
                    boxShadow: "0 12px 24px rgba(15, 23, 42, 0.18)",
                  }}
                >
                  {stat.icon}
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default StatsCards;
