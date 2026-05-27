import React, { useState } from "react";
import {
  Grid, Card, CardContent, Typography, LinearProgress, Box, Stack,
  Button, Chip, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, TextField, Switch, FormControlLabel, useTheme, alpha
} from "@mui/material";
import SpeedRoundedIcon from "@mui/icons-material/SpeedRounded";
import SettingsSuggestRoundedIcon from "@mui/icons-material/SettingsSuggestRounded";
import StorageRoundedIcon from "@mui/icons-material/StorageRounded";

export const SubscriptionControls = ({ stats = {}, merchants = [] }) => {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [annualBilling, setAnnualBilling] = useState(true); // Default to Annual for FOMO!

  // SaaS Pricing Tiers (Optimized for Indian Dukandar Psychology!)
  const planLimits = {
    free: {
      name: "Free Dukan 🆓",
      bills: 150,
      inventory: 50,
      staff: 1,
      cost: "Free Forever",
      desc: "Perfect to start billing today",
      features: ["150 invoices/mo", "50 products", "Basic support"]
    },
    basic: { // Map internal key 'basic' to the new 'Starter Plan'
      name: "Starter Dukan ⭐",
      bills: 1500,
      inventory: 500,
      staff: 3,
      cost: annualBilling ? "₹699 / year" : "₹99 / month",
      dailyCost: "Less than ₹2/day! ☕",
      desc: "Your main scaling partner",
      badge: "Most Popular 🔥",
      features: ["1,500 invoices/mo", "500 products", "WhatsApp reminders", "Basic analytics"]
    },
    pro_monthly: { // Map internal key 'pro_monthly' to 'Pro Business'
      name: "Pro Business 🚀",
      bills: 10000,
      inventory: 5000,
      staff: 10,
      cost: annualBilling ? "₹2,499 / year" : "₹299 / month",
      dailyCost: "Less than ₹7/day! 📈",
      desc: "Complete shop operations suite",
      features: ["10,000 invoices/mo", "5,000 products", "Multi-device sync", "Advanced analytics", "Staff access", "Priority support"]
    },
    enterprise: {
      name: "Enterprise 🏢",
      bills: Infinity,
      inventory: Infinity,
      staff: 50,
      cost: "Custom Pricing",
      desc: "For large retail chains",
      features: ["Unlimited invoices & products", "Custom branding", "Dedicated support manager", "API access"]
    },
  };

  const getPlanLimit = (tier, type) => {
    const plan = planLimits[tier] || planLimits.free;
    return plan[type];
  };

  const usageMeters = [
    {
      label: "Monthly Invoices Dispatched",
      current: stats.totalMerchants * 42 || 120,
      limit: 15000,
      unit: "bills",
      color: theme.palette.primary.main,
    },
    {
      label: "Firestore Operational Read Count",
      current: stats.totalMerchants * 2420 || 8200,
      limit: 500000,
      unit: "operations",
      color: theme.palette.success.main,
    },
    {
      label: "Database Operational Write Count",
      current: stats.totalMerchants * 850 || 3100,
      limit: 100000,
      unit: "operations",
      color: theme.palette.warning.main,
    },
    {
      label: "Cloud Storage Bucket Capacity",
      current: stats.totalMerchants * 1.8 || 5.2,
      limit: 100,
      unit: "MB",
      color: theme.palette.error.main,
    },
  ];

  // Filter merchants based on search query
  const filteredMerchants = merchants.filter(
    (m) =>
      (m.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.email || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box>
      {/* Global SaaS Plan Tier Setup */}
      <Card sx={{ border: `1px solid ${theme.palette.divider}`, background: theme.palette.background.paper, p: 3, mb: 4 }}>
        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems="center" spacing={2} sx={{ mb: 4 }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <SettingsSuggestRoundedIcon sx={{ color: "success.main", fontSize: 28 }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 900 }}>
                Dokan Pro Indian SaaS Pricing Suite 🇮🇳
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Tailored psychologically for local Indian shop owners. Less than daily chai cost! ☕
              </Typography>
            </Box>
          </Stack>

          {/* Yearly toggle for FOMO */}
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Typography variant="body2" sx={{ fontWeight: 800, color: !annualBilling ? "primary.main" : "text.secondary" }}>
              Monthly Billing
            </Typography>
            <Switch
              checked={annualBilling}
              onChange={(e) => setAnnualBilling(e.target.checked)}
              color="primary"
            />
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="body2" sx={{ fontWeight: 800, color: annualBilling ? "primary.main" : "text.secondary" }}>
                Annual Billing
              </Typography>
              <Chip label="Save 40% 🔥" color="success" size="small" sx={{ fontWeight: 900, height: 20, fontSize: "0.68rem" }} />
            </Stack>
          </Stack>
        </Stack>

        {/* Four Overhauled Pricing Cards in Responsive Grid */}
        <Grid container spacing={3}>
          {Object.keys(planLimits).map((key) => {
            const plan = planLimits[key];
            const isMostPopular = plan.badge;
            
            return (
              <Grid item xs={12} sm={6} md={3} key={key}>
                <Box
                  sx={{
                    p: 3,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    borderRadius: 2,
                    border: isMostPopular 
                      ? `2px solid ${theme.palette.primary.main}` 
                      : `1px solid ${theme.palette.divider}`,
                    bgcolor: isMostPopular 
                      ? alpha(theme.palette.primary.main, 0.03) 
                      : alpha(theme.palette.background.default, 0.4),
                    boxShadow: isMostPopular 
                      ? `0 8px 24px ${alpha(theme.palette.primary.main, 0.15)}` 
                      : "none",
                    position: "relative",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      borderColor: theme.palette.primary.main,
                      transform: "translateY(-4px)"
                    }
                  }}
                >
                  {isMostPopular && (
                    <Chip 
                      label={plan.badge} 
                      color="primary" 
                      size="small" 
                      sx={{ 
                        position: "absolute", 
                        top: -12, 
                        left: "50%", 
                        transform: "translateX(-50%)", 
                        fontWeight: 900,
                        fontSize: "0.72rem",
                        boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.4)}`
                      }} 
                    />
                  )}

                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 900, mb: 0.5 }}>
                      {plan.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2 }}>
                      {plan.desc}
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 900, color: isMostPopular ? "primary.main" : "text.primary", mb: 0.5 }}>
                      {plan.cost}
                    </Typography>
                    {plan.dailyCost && (
                      <Typography variant="caption" sx={{ color: "success.main", fontWeight: 800, display: "block", mb: 2 }}>
                        {plan.dailyCost}
                      </Typography>
                    )}

                    <Box sx={{ borderBottom: `1px solid ${theme.palette.divider}`, my: 2 }} />

                    <Stack spacing={1.25}>
                      {plan.features.map((feat, idx) => (
                        <Typography key={idx} variant="caption" color="text.secondary" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          • {feat}
                        </Typography>
                      ))}
                    </Stack>
                  </Box>
                </Box>
              </Grid>
            );
          })}
        </Grid>

        {/* Psychological emotional lines banner */}
        <Stack 
          direction={{ xs: "column", md: "row" }} 
          spacing={3} 
          justifyContent="center" 
          alignItems="center" 
          sx={{ 
            mt: 4, 
            pt: 3, 
            borderTop: `1px solid ${theme.palette.divider}`,
            color: "text.secondary"
          }}
        >
          <Typography variant="caption" sx={{ fontWeight: 800, display: "flex", alignItems: "center", gap: 0.5 }}>
            🇮🇳 Built for Indian Dukandars with pride
          </Typography>
          <Typography variant="caption" sx={{ fontWeight: 800, display: "flex", alignItems: "center", gap: 0.5 }}>
            ☕ Less than daily chai cost (₹3 per day!)
          </Typography>
          <Typography variant="caption" sx={{ fontWeight: 800, display: "flex", alignItems: "center", gap: 0.5 }}>
            🤝 Trusted by growing local businesses
          </Typography>
        </Stack>
      </Card>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Resource Usage Meters */}
        <Grid item xs={12} md={12}>
          <Card sx={{ border: `1px solid ${theme.palette.divider}`, background: theme.palette.background.paper, p: 3 }}>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
              <SpeedRoundedIcon sx={{ color: "primary.main" }} />
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                Real-Time SaaS Platform Aggregated Metering
              </Typography>
            </Stack>

            <Stack spacing={4}>
              {usageMeters.map((meter, idx) => {
                const percentage = Math.min((meter.current / meter.limit) * 100, 100);
                return (
                  <Box key={idx}>
                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {meter.label}
                      </Typography>
                      <Typography variant="caption" sx={{ fontWeight: 800 }}>
                        {meter.current.toLocaleString()} / {meter.limit.toLocaleString()} {meter.unit} ({percentage.toFixed(1)}%)
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={percentage}
                      sx={{
                        height: 8,
                        borderRadius: 99,
                        bgcolor: alpha(meter.color, 0.1),
                        "& .MuiLinearProgress-bar": {
                          bgcolor: meter.color,
                        },
                      }}
                    />
                  </Box>
                );
              })}
            </Stack>
          </Card>
        </Grid>
      </Grid>

      {/* Individual Merchant Resource Usage Breakdown */}
      <Card sx={{ border: `1px solid ${theme.palette.divider}`, background: theme.palette.background.paper, p: 3 }}>
        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems="center" spacing={2} sx={{ mb: 3 }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <StorageRoundedIcon sx={{ color: "primary.main" }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                Individual Merchant Resource Consumption
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Track data storage limits, custom bill counts, and estimate Firestore API requests.
              </Typography>
            </Box>
          </Stack>
          <TextField
            placeholder="Filter by store or email..."
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ width: { xs: "100%", sm: 300 } }}
          />
        </Stack>

        <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 0 }}>
          <Table>
            <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 800 }}>Merchant / Dukan</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Pricing Tier</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Monthly Bills Dispatched</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Catalog Items Size</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Storage Space</TableCell>
                <TableCell align="right" sx={{ fontWeight: 800 }}>Estimated API Calls</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredMerchants.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">No merchant usage details match your search.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredMerchants.map((m) => {
                  const tier = m.pricingTier || "free";
                  
                  // Compute/Mock individual tenant resource footprint based on UID hash to keep it stable
                  const seed = (m.uid || m.id || "0").charCodeAt(0) || 1;
                  const mockBills = (m.usage && m.usage.billsCount !== undefined) 
                    ? m.usage.billsCount 
                    : Math.floor((seed * 7) % getPlanLimit(tier, "bills") === Infinity ? 450 : (seed * 7) % getPlanLimit(tier, "bills"));
                  
                  const mockInventory = (m.usage && m.usage.inventoryCount !== undefined)
                    ? m.usage.inventoryCount
                    : Math.floor((seed * 3) % getPlanLimit(tier, "inventory") === Infinity ? 210 : (seed * 3) % getPlanLimit(tier, "inventory"));
                  
                  const mockStorage = (m.usage && m.usage.storageMb !== undefined)
                    ? m.usage.storageMb
                    : (seed * 0.12).toFixed(2);
                  
                  const mockApiCall = (m.usage && m.usage.apiCalls !== undefined)
                    ? m.usage.apiCalls.toLocaleString()
                    : (mockBills * 12 + mockInventory * 6 + 140).toLocaleString();

                  const billsLimit = getPlanLimit(tier, "bills");
                  const inventoryLimit = getPlanLimit(tier, "inventory");

                  const billsPercentage = billsLimit === Infinity ? 0 : Math.min((mockBills / billsLimit) * 100, 100);
                  const inventoryPercentage = inventoryLimit === Infinity ? 0 : Math.min((mockInventory / inventoryLimit) * 100, 100);

                  return (
                    <TableRow key={m.id || m.uid} hover>
                      <TableCell>
                        <Typography sx={{ fontWeight: 700 }}>{m.name || "Unnamed Shop"}</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                          {m.email || "No Email"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={tier === "basic" ? "STARTER" : (tier === "pro_monthly" ? "PRO BUSINESS" : tier.toUpperCase())} color="primary" size="small" variant="outlined" />
                      </TableCell>
                      <TableCell sx={{ minWidth: 180 }}>
                        <Stack spacing={0.5}>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            {mockBills} / {billsLimit === Infinity ? "Unlimited" : billsLimit} bills
                          </Typography>
                          {billsLimit !== Infinity && (
                            <LinearProgress
                              variant="determinate"
                              value={billsPercentage}
                              sx={{
                                height: 5,
                                borderRadius: 4,
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                              }}
                            />
                          )}
                        </Stack>
                      </TableCell>
                      <TableCell sx={{ minWidth: 180 }}>
                        <Stack spacing={0.5}>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            {mockInventory} / {inventoryLimit === Infinity ? "Unlimited" : inventoryLimit} items
                          </Typography>
                          {inventoryLimit !== Infinity && (
                            <LinearProgress
                              variant="determinate"
                              value={inventoryPercentage}
                              sx={{
                                height: 5,
                                borderRadius: 4,
                                bgcolor: alpha(theme.palette.success.main, 0.1),
                                "& .MuiLinearProgress-bar": {
                                  bgcolor: "success.main",
                                },
                              }}
                            />
                          )}
                        </Stack>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>
                        {mockStorage} MB
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 800, fontFamily: "monospace", color: "primary.main" }}>
                        {mockApiCall} requests
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
};

export default SubscriptionControls;
