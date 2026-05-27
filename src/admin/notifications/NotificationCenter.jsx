import React, { useState, useEffect } from "react";
import { Card, CardContent, Typography, Box, Button, TextField, Stack,
         MenuItem, Select, InputLabel, FormControl, Chip, CircularProgress, useTheme, alpha } from "@mui/material";
import CampaignRoundedIcon from "@mui/icons-material/CampaignRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from "firebase/firestore";
import { db } from "../../Firebase/firebase";

export const NotificationCenter = () => {
  const theme = useTheme();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newAlert, setNewAlert] = useState({ title: "", message: "", target: "All", severity: "medium" });

  // 1. Listen for realtime broadcasts from Firestore notifications collection
  useEffect(() => {
    const q = query(collection(db, "notifications"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      setNotifications(list);
      setLoading(false);
    }, (error) => {
      console.error("Failed to sync real-time broadcasts:", error);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // 2. Write new broadcast directly to Firestore
  const handleDispatch = async () => {
    if (!newAlert.title || !newAlert.message) return;
    try {
      await addDoc(collection(db, "notifications"), {
        type: "announcement",
        title: newAlert.title,
        message: newAlert.message,
        target: newAlert.target,
        severity: newAlert.severity,
        isRead: false,
        createdAt: serverTimestamp(),
      });
      
      setNewAlert({ title: "", message: "", target: "All", severity: "medium" });
    } catch (e) {
      console.error("Failed to publish system broadcast:", e);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "high": return "error";
      case "medium": return "warning";
      default: return "primary";
    }
  };

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Broadcast Form */}
        <Grid item xs={12} md={6}>
          <Card sx={{ border: `1px solid ${theme.palette.divider}`, background: theme.palette.background.paper, p: 3 }}>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
              <CampaignRoundedIcon sx={{ color: "primary.main" }} />
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                Broadcast System-Wide Announcement
              </Typography>
            </Stack>

            <Stack spacing={3}>
              <TextField
                label="Alert Headline"
                fullWidth
                value={newAlert.title}
                onChange={(e) => setNewAlert(prev => ({ ...prev, title: e.target.value }))}
              />
              <TextField
                label="Broadcast Message / Body Content"
                fullWidth
                multiline
                rows={3}
                value={newAlert.message}
                onChange={(e) => setNewAlert(prev => ({ ...prev, message: e.target.value }))}
              />
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <InputLabel>Recipient Target Group</InputLabel>
                    <Select
                      value={newAlert.target}
                      label="Recipient Target Group"
                      onChange={(e) => setNewAlert(prev => ({ ...prev, target: e.target.value }))}
                    >
                      <MenuItem value="All">All Merchants</MenuItem>
                      <MenuItem value="Free Tier">Free Tier Only</MenuItem>
                      <MenuItem value="Pro Tier">Pro / Premium Only</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <InputLabel>Broadcast Urgency</InputLabel>
                    <Select
                      value={newAlert.severity}
                      label="Broadcast Urgency"
                      onChange={(e) => setNewAlert(prev => ({ ...prev, severity: e.target.value }))}
                    >
                      <MenuItem value="low">Info Alert (Low)</MenuItem>
                      <MenuItem value="medium">Warning Alert (Medium)</MenuItem>
                      <MenuItem value="high">Critical Alert (High)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <Button variant="contained" endIcon={<SendRoundedIcon />} onClick={handleDispatch} sx={{ py: 1.25 }}>
                Dispatch Broadcast
              </Button>
            </Stack>
          </Card>
        </Grid>

        {/* Live Broadcast Feed */}
        <Grid item xs={12} md={6}>
          <Card sx={{ border: `1px solid ${theme.palette.divider}`, background: theme.palette.background.paper, p: 3, height: "100%" }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>
              Broadcast Dispatch Registry
            </Typography>

            <Stack spacing={2} sx={{ maxHeight: "50vh", overflowY: "auto" }}>
              {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                  <CircularProgress size={30} />
                </Box>
              ) : notifications.length === 0 ? (
                <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
                  No published broadcasts in system memory.
                </Typography>
              ) : (
                notifications.map((not) => {
                  // Fallback date string format
                  const dateStr = not.createdAt?.seconds 
                    ? new Date(not.createdAt.seconds * 1000).toLocaleString() 
                    : "Just now";

                  return (
                    <Box
                      key={not.id}
                      sx={{
                        p: 2,
                        border: `1px solid ${theme.palette.divider}`,
                        background: alpha(theme.palette.background.default, 0.4),
                        borderRadius: 1,
                      }}
                    >
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Chip label={not.id.slice(-6)} size="small" variant="outlined" sx={{ fontSize: "0.65rem", height: 16 }} />
                          <Chip label={not.target} size="small" color="primary" sx={{ fontSize: "0.65rem", height: 16 }} />
                        </Stack>
                        <Chip label={not.severity.toUpperCase()} color={getSeverityColor(not.severity)} size="small" sx={{ fontSize: "0.65rem", height: 16 }} />
                      </Stack>
                      <Typography variant="body2" sx={{ fontWeight: 800, mb: 0.5 }}>
                        {not.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
                        {not.message}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontStyle: "italic" }}>
                        Sent: {dateStr}
                      </Typography>
                    </Box>
                  );
                })
              )}
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

// Imports fallback grid
import Grid from "@mui/material/Grid";
export default NotificationCenter;
