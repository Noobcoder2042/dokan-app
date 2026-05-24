import {
  Card,
  CardContent,
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import StoreRoundedIcon from "@mui/icons-material/StoreRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import PrintRoundedIcon from "@mui/icons-material/PrintRounded";
import BackupRoundedIcon from "@mui/icons-material/BackupRounded";
import WifiOffRoundedIcon from "@mui/icons-material/WifiOffRounded";
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";
import TipsAndUpdatesRoundedIcon from "@mui/icons-material/TipsAndUpdatesRounded";

const guideCards = [
  {
    title: "First Setup",
    icon: <StoreRoundedIcon />,
    steps: [
      "Open Settings and add your shop name, phone number, and address.",
      "Save settings once so bills and backups use the right shop details.",
    ],
  },
  {
    title: "Add Inventory",
    icon: <Inventory2RoundedIcon />,
    steps: [
      "Go to Inventory and create categories, subcategories, and items.",
      "Add item code, price, stock quantity, and low-stock limit for faster billing.",
    ],
  },
  {
    title: "Make A Bill",
    icon: <ReceiptLongRoundedIcon />,
    steps: [
      "Open Billing, select or type customer details, then add items by name or code.",
      "Check every item, add transport charges if needed, then generate or print the bill.",
      "Turn on GST Mode in Settings if the shop needs GST added to the item subtotal.",
    ],
  },
  {
    title: "Print And WhatsApp",
    icon: <PrintRoundedIcon />,
    steps: [
      "Use Thermal Print for 80mm receipt printers.",
      "Open Settings to write your own WhatsApp message template.",
      "Choose whether bill WhatsApp sends the total in text or downloads a PDF bill before opening WhatsApp.",
    ],
  },
  {
    title: "Check Sales",
    icon: <InsightsRoundedIcon />,
    steps: [
      "Use Dashboard to search bills and customer records.",
      "Use Sales to see total sales, average bill value, top items, best customers, and performance summaries.",
      "Use Analytics to track charts, trends, monthly growth, and advanced business insights.",
    ],
  },
  {
    title: "Backup And Restore",
    icon: <BackupRoundedIcon />,
    steps: [
      "Use Settings Data Actions before deleting old bills, customers, or inventory.",
      "Keep the downloaded ZIP safe. Import the JSON file if you need to restore data later.",
    ],
  },
];

const upcomingUpdates = [
  "Smoother WhatsApp bill sharing flow",
  "Offline-first cache",
  "Due payment ledger",
  "Barcode scan",
  "Multi-payment split (cash + UPI)",
  "Staff roles (cashier/owner)",
  "Auto invoice numbering counter",
];

const UserGuide = () => (
  <Stack spacing={3}>
    <Paper
      sx={{
        p: { xs: 2.5, md: 3.5 },
        borderRadius: 1,
        background: (theme) =>
          theme.palette.mode === "dark"
            ? "linear-gradient(135deg, rgba(12,20,16,0.96) 0%, rgba(18,26,22,0.98) 52%, rgba(12,20,16,0.96) 100%)"
            : "linear-gradient(135deg, rgba(255,255,255,0.96) 0%, rgba(236,253,245,0.98) 52%, rgba(240,253,244,0.96) 100%)",
        border: (theme) =>
          theme.palette.mode === "dark"
            ? "1px solid rgba(255,255,255,0.10)"
            : "1px solid rgba(148, 163, 184, 0.12)",
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        spacing={1.5}
      >
        <div>
          <Typography variant="h4">User Guide</Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            A quick tour for running daily shop work from setup to backup.
          </Typography>
        </div>
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          sx={{
            px: 1.5,
            py: 1,
            borderRadius: 1,
            bgcolor: (theme) =>
              theme.palette.mode === "dark"
                ? "rgba(16,185,129,0.18)"
                : "rgba(236, 253, 245, 0.8)",
            color: (theme) =>
              theme.palette.mode === "dark"
                ? "#86efac"
                : "success.dark",
            width: "fit-content",
            height: "fit-content",
          }}
        >
          <TaskAltRoundedIcon fontSize="small" />
          <Typography variant="body2" fontWeight={700}>
            Start here
          </Typography>
        </Stack>
      </Stack>
    </Paper>

    <Grid container spacing={2}>
      {guideCards.map((entry) => (
        <Grid item xs={12} md={6} lg={4} key={entry.title}>
          <Card sx={{ height: "100%" }}>
            <CardContent sx={{ p: 2.5 }}>
              <Stack spacing={1.5}>
                <Stack direction="row" spacing={1.25} alignItems="center">
                  <Stack
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 1,
                      alignItems: "center",
                      justifyContent: "center",
                      color: "primary.main",
                      bgcolor: (theme) =>
                        theme.palette.mode === "dark"
                          ? "rgba(74,222,128,0.18)"
                          : "rgba(219, 234, 254, 0.9)",
                    }}
                  >
                    {entry.icon}
                  </Stack>
                  <Typography variant="h6">{entry.title}</Typography>
                </Stack>
                <Stack spacing={0.8}>
                  {entry.steps.map((step, index) => (
                    <Typography key={step} variant="body2" color="text.secondary">
                      {index + 1}. {step}
                    </Typography>
                  ))}
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>

    <Paper
      variant="outlined"
      sx={{
        p: 2.5,
        borderRadius: 1,
        borderColor: (theme) =>
          theme.palette.mode === "dark"
            ? "rgba(251, 191, 36, 0.34)"
            : "rgba(245, 158, 11, 0.28)",
        bgcolor: (theme) =>
          theme.palette.mode === "dark"
            ? "rgba(92, 59, 8, 0.34)"
            : "rgba(255, 251, 235, 0.75)",
      }}
    >
      <Stack direction="row" spacing={1.25} alignItems="flex-start">
        <WifiOffRoundedIcon color="warning" />
        <div>
          <Typography fontWeight={800}>Offline Tip</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.4 }}>
            If internet drops during billing, print work can continue. Keep the app open
            and reconnect later so pending bills can sync.
          </Typography>
        </div>
      </Stack>
    </Paper>

    <Paper
      variant="outlined"
      sx={{
        p: 2.5,
        borderRadius: 1,
        borderColor: (theme) =>
          theme.palette.mode === "dark"
            ? "rgba(74, 222, 128, 0.28)"
            : "rgba(22, 163, 74, 0.22)",
        bgcolor: (theme) =>
          theme.palette.mode === "dark"
            ? "rgba(20, 83, 45, 0.26)"
            : "rgba(240, 253, 244, 0.72)",
      }}
    >
      <Stack direction="row" spacing={1.25} alignItems="flex-start">
        <TipsAndUpdatesRoundedIcon color="success" />
        <div>
          <Typography fontWeight={800}>Upcoming Update</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.4 }}>
            Planned improvements for future versions:
          </Typography>
          <Stack spacing={0.6} sx={{ mt: 1 }}>
            {upcomingUpdates.map((item, index) => (
              <Typography key={item} variant="body2" color="text.secondary">
                {index + 1}. {item}
              </Typography>
            ))}
          </Stack>
        </div>
      </Stack>
    </Paper>
  </Stack>
);

export default UserGuide;

