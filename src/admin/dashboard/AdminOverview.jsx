import React from "react";
import { Grid, Card, CardContent, Typography, Box, useTheme, alpha, Stack, Avatar } from "@mui/material";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import MemoryRoundedIcon from "@mui/icons-material/MemoryRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";

const mockOverviewData = [
  { month: "Jan", mrr: 45000, shops: 120, reads: 120000 },
  { month: "Feb", mrr: 58000, shops: 135, reads: 145000 },
  { month: "Mar", mrr: 72000, shops: 150, reads: 190000 },
  { month: "Apr", mrr: 89000, shops: 168, reads: 240000 },
  { month: "May", mrr: 110000, shops: 186, reads: 310000 },
];

export const AdminOverview = ({ stats = {} }) => {
  const theme = useTheme();

  const kpiCards = [
    {
      title: "Monthly Recurring Revenue (MRR)",
      value: `Rs. ${(stats.totalMerchants * 2999 + 45000).toLocaleString()}`,
      change: "+28.4% this month",
      icon: <PaymentsRoundedIcon sx={{ color: "primary.main" }} />,
      color: theme.palette.primary.main,
    },
    {
      title: "Active POS Merchants",
      value: stats.totalMerchants || 0,
      change: `+${stats.totalMerchants - stats.blockedMerchants} Active now`,
      icon: <StorefrontRoundedIcon sx={{ color: "success.main" }} />,
      color: theme.palette.success.main,
    },
    {
      title: "Active Staff & Operators",
      value: (stats.totalMerchants * 2.4).toFixed(0),
      change: "Average 2.4 staff per shop",
      icon: <PeopleAltRoundedIcon sx={{ color: "warning.main" }} />,
      color: theme.palette.warning.main,
    },
    {
      title: "Infrastructure Load (Firestore)",
      value: `${((stats.totalMerchants * 12500) / 1000).toFixed(1)}k ops`,
      change: "0.08ms average response time",
      icon: <MemoryRoundedIcon sx={{ color: "error.main" }} />,
      color: theme.palette.error.main,
    },
  ];

  return (
    <Box>
      {/* Dynamic KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {kpiCards.map((kpi, idx) => (
          <Grid item xs={12} sm={6} md={3} key={idx}>
            <Card
              sx={{
                position: "relative",
                overflow: "hidden",
                border: `1px solid ${theme.palette.divider}`,
                background: theme.palette.background.paper,
                "&:hover": {
                  boxShadow: `0 0 24px ${alpha(kpi.color, 0.15)}`,
                  borderColor: kpi.color,
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", fontWeight: 800, letterSpacing: "0.05em" }}>
                    {kpi.title}
                  </Typography>
                  <Avatar sx={{ bgcolor: alpha(kpi.color, 0.1), width: 42, height: 42 }}>
                    {kpi.icon}
                  </Avatar>
                </Stack>
                <Typography variant="h4" sx={{ fontWeight: 900, mb: 0.5 }}>
                  {kpi.value}
                </Typography>
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <TrendingUpRoundedIcon sx={{ fontSize: 16, color: "success.main" }} />
                  <Typography variant="caption" color="success.main" sx={{ fontWeight: 700 }}>
                    {kpi.change}
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Main Charts Row */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ border: `1px solid ${theme.palette.divider}`, background: theme.palette.background.paper, p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>
              SaaS MRR Growth Trajectory
            </Typography>
            <Box sx={{ width: "100%", height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockOverviewData}>
                  <defs>
                    <linearGradient id="colorMrr" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.4} />
                      <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0.01} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" stroke={theme.palette.text.secondary} fontSize={12} />
                  <YAxis stroke={theme.palette.text.secondary} fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: theme.palette.background.paper,
                      borderColor: theme.palette.divider,
                      borderRadius: 8,
                      color: theme.palette.text.primary,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="mrr"
                    stroke={theme.palette.primary.main}
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorMrr)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ border: `1px solid ${theme.palette.divider}`, background: theme.palette.background.paper, p: 3, height: "100%" }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>
              Active Merchant Onboarding
            </Typography>
            <Box sx={{ width: "100%", height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockOverviewData}>
                  <XAxis dataKey="month" stroke={theme.palette.text.secondary} fontSize={12} />
                  <YAxis stroke={theme.palette.text.secondary} fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: theme.palette.background.paper,
                      borderColor: theme.palette.divider,
                      borderRadius: 8,
                      color: theme.palette.text.primary,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="shops"
                    stroke={theme.palette.success.main}
                    strokeWidth={4}
                    dot={{ r: 4, strokeWidth: 2 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
            <Stack direction="row" justifyContent="space-between" sx={{ mt: 3, pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                  Merchant Run Rate
                </Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  +{mockOverviewData[mockOverviewData.length - 1].shops - mockOverviewData[mockOverviewData.length - 2].shops} new / mo
                </Typography>
              </Box>
              <Box align="right">
                <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                  System Availability
                </Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "success.main" }}>
                  99.998%
                </Typography>
              </Box>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
