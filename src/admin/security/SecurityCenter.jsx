import React, { useState } from "react";
import { Card, CardContent, Typography, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Button, TextField, Stack, useTheme, alpha } from "@mui/material";
import ShieldRoundedIcon from "@mui/icons-material/ShieldRounded";
import BlockRoundedIcon from "@mui/icons-material/BlockRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";

const initialLogs = [
  { id: "LOG-9921", action: "DELETE_ITEM", target: "Maggi Noodles 2-Min", by: "Rajesh Kirana (Staff ID 3)", time: "Just now", ip: "192.168.1.42", severity: "medium" },
  { id: "LOG-9920", action: "BLOCK_MERCHANT", target: "Gupta Garments", by: "Admin (You)", time: "10 min ago", ip: "157.48.24.12", severity: "high" },
  { id: "LOG-9919", action: "EXPORT_CUSTOMER_DATA", target: "Customer directory CSV", by: "Apna Dukan Pharmacy", time: "1 hour ago", ip: "103.88.241.9", severity: "medium" },
  { id: "LOG-9918", action: "CREATE_BILL", target: "Bill Rs. 1,420 (Order #938)", by: "Rajesh Kirana Store", time: "3 hours ago", ip: "192.168.1.42", severity: "low" },
];

export const SecurityCenter = () => {
  const theme = useTheme();
  const [logs, setLogs] = useState(initialLogs);
  const [blockedIPs, setBlockedIPs] = useState(["103.88.241.9", "182.74.221.8"]);
  const [newIP, setNewIP] = useState("");

  const handleAddIP = () => {
    if (!newIP.trim()) return;
    setBlockedIPs((prev) => [...prev, newIP.trim()]);
    setNewIP("");
  };

  const handleRemoveIP = (ip) => {
    setBlockedIPs((prev) => prev.filter((item) => item !== ip));
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "high": return "error";
      case "medium": return "warning";
      default: return "success";
    }
  };

  return (
    <Box>
      <Grid container spacing={3} sx={{ mb: 4 }} className="MuiGrid-container">
        {/* Security Controls Card */}
        <Grid item xs={12} md={8}>
          <Card sx={{ border: `1px solid ${theme.palette.divider}`, background: theme.palette.background.paper, p: 3 }}>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
              <ShieldRoundedIcon sx={{ color: "primary.main" }} />
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                Enterprise Transaction Audit Trail (Real-Time)
              </Typography>
            </Stack>

            <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 0 }}>
              <Table>
                <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 800 }}>Action Code</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>Modified Record</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>Operator Account</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>Network IP</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>Risk Severity</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id} hover>
                      <TableCell>
                        <Chip label={log.action} size="small" sx={{ fontWeight: 800, fontSize: "0.65rem" }} />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>{log.target}</TableCell>
                      <TableCell>{log.by}</TableCell>
                      <TableCell sx={{ fontFamily: "monospace" }}>{log.ip}</TableCell>
                      <TableCell>
                        <Chip label={log.severity.toUpperCase()} color={getSeverityColor(log.severity)} size="small" sx={{ fontSize: "0.6rem", height: 16 }} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Grid>

        {/* IP Access Control Shield */}
        <Grid item xs={12} md={4}>
          <Card sx={{ border: `1px solid ${theme.palette.divider}`, background: theme.palette.background.paper, p: 3, height: "100%" }}>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
              <BlockRoundedIcon sx={{ color: "error.main" }} />
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                Network IP Firewall Policy
              </Typography>
            </Stack>

            <Stack spacing={2} sx={{ mb: 3 }}>
              <Stack direction="row" spacing={1.5}>
                <TextField
                  placeholder="Block malicious IP..."
                  size="small"
                  fullWidth
                  value={newIP}
                  onChange={(e) => setNewIP(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddIP()}
                />
                <Button variant="contained" color="error" onClick={handleAddIP}>
                  Ban
                </Button>
              </Stack>

              <Divider sx={{ opacity: 0.5 }} />

              <Typography variant="body2" sx={{ fontWeight: 800 }}>
                Active Suspended Client IPs:
              </Typography>

              <Stack spacing={1.5}>
                {blockedIPs.map((ip) => (
                  <Paper
                    key={ip}
                    sx={{
                      p: 1.5,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      border: `1px solid ${theme.palette.divider}`,
                      background: alpha(theme.palette.error.main, 0.05),
                    }}
                  >
                    <Typography variant="body2" sx={{ fontFamily: "monospace", fontWeight: 700, color: "error.main" }}>
                      {ip}
                    </Typography>
                    <Button size="small" variant="text" color="primary" onClick={() => handleRemoveIP(ip)}>
                      Unban
                    </Button>
                  </Paper>
                ))}
              </Stack>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

// Fix the missing grid container reference when rendering MUI grids
import Grid from "@mui/material/Grid";
