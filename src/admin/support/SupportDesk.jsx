import React, { useState } from "react";
import { Grid, Card, CardContent, Typography, List, ListItemButton, ListItemText,
         Chip, Stack, Button, TextField, Divider, Paper, useTheme, alpha } from "@mui/material";
import MessageRoundedIcon from "@mui/icons-material/MessageRounded";
import DoneAllRoundedIcon from "@mui/icons-material/DoneAllRounded";
import PendingActionsRoundedIcon from "@mui/icons-material/PendingActionsRounded";

const initialTickets = [
  {
    id: "TCK-4819",
    merchant: "Rajesh Kirana Store",
    title: "Thermal printer printing extra blank lines",
    priority: "high",
    status: "open",
    messages: [
      { sender: "merchant", text: "Whenever I print a bill, the thermal printer rolls out 3 inches of blank paper. Please check.", time: "10:30 AM" },
      { sender: "system", text: "Assigned to Admin Console Desk", time: "10:31 AM" }
    ]
  },
  {
    id: "TCK-1092",
    merchant: "Gupta Garments",
    title: "Requesting help with custom CSV import",
    priority: "medium",
    status: "pending",
    messages: [
      { sender: "merchant", text: "I have 500 catalog items in an Excel sheet. How do I import them directly?", time: "Yesterday" }
    ]
  },
  {
    id: "TCK-3382",
    merchant: "Apna Dukan Pharmacy",
    title: "Payment processed but Pro features not showing",
    priority: "urgent",
    status: "open",
    messages: [
      { sender: "merchant", text: "I just paid Rs. 2,999 for the Pro subscription via UPI, but my app is still showing free mode limitations.", time: "2 hours ago" }
    ]
  }
];

export const SupportDesk = () => {
  const theme = useTheme();
  const [tickets, setTickets] = useState(initialTickets);
  const [selectedTicketId, setSelectedTicketId] = useState(initialTickets[0].id);
  const [replyText, setReplyText] = useState("");
  const [internalNote, setInternalNote] = useState("");

  const activeTicket = tickets.find((t) => t.id === selectedTicketId) || tickets[0];

  const handleSendReply = () => {
    if (!replyText.trim()) return;
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === selectedTicketId) {
          return {
            ...t,
            messages: [...t.messages, { sender: "admin", text: replyText, time: "Just now" }]
          };
        }
        return t;
      })
    );
    setReplyText("");
  };

  const handleAddNote = () => {
    if (!internalNote.trim()) return;
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === selectedTicketId) {
          return {
            ...t,
            messages: [...t.messages, { sender: "internal", text: `[INTERNAL NOTE]: ${internalNote}`, time: "Just now" }]
          };
        }
        return t;
      })
    );
    setInternalNote("");
  };

  const handleUpdateStatus = (nextStatus) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === selectedTicketId ? { ...t, status: nextStatus } : t))
    );
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "urgent": return "error";
      case "high": return "warning";
      case "medium": return "primary";
      default: return "default";
    }
  };

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Support Tickets List */}
        <Grid item xs={12} md={4}>
          <Card sx={{ border: `1px solid ${theme.palette.divider}`, background: theme.palette.background.paper, height: "80vh", overflowY: "auto" }}>
            <CardContent sx={{ p: 0 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, p: 3, borderBottom: `1px solid ${theme.palette.divider}` }}>
                Support Tickets Directory
              </Typography>
              <List sx={{ p: 0 }}>
                {tickets.map((t) => (
                  <ListItemButton
                    key={t.id}
                    selected={t.id === selectedTicketId}
                    onClick={() => setSelectedTicketId(t.id)}
                    sx={{
                      py: 2.5,
                      px: 3,
                      borderBottom: `1px solid ${theme.palette.divider}`,
                      "&.Mui-selected": {
                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                      }
                    }}
                  >
                    <ListItemText
                      primary={
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 800 }}>
                            {t.id}
                          </Typography>
                          <Chip label={t.priority.toUpperCase()} color={getPriorityColor(t.priority)} size="small" sx={{ fontSize: "0.65rem", height: 18 }} />
                        </Stack>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.5, color: "text.primary" }} noWrap>
                            {t.title}
                          </Typography>
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="caption" color="text.secondary">
                              {t.merchant}
                            </Typography>
                            <Chip label={t.status.toUpperCase()} size="small" variant="outlined" sx={{ height: 18, fontSize: "0.65rem" }} />
                          </Stack>
                        </Box>
                      }
                    />
                  </ListItemButton>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Live Support Thread */}
        <Grid item xs={12} md={8}>
          <Card sx={{ border: `1px solid ${theme.palette.divider}`, background: theme.palette.background.paper, height: "80vh", display: "flex", flexDirection: "column" }}>
            {/* Header info */}
            <Box sx={{ p: 3, borderBottom: `1px solid ${theme.palette.divider}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  {activeTicket.id}: {activeTicket.title}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Merchant Store: <strong>{activeTicket.merchant}</strong>
                </Typography>
              </Box>
              <Stack direction="row" spacing={1}>
                <Button
                  size="small"
                  variant="outlined"
                  color="warning"
                  startIcon={<PendingActionsRoundedIcon />}
                  onClick={() => handleUpdateStatus("pending")}
                >
                  Pending
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  color="success"
                  startIcon={<DoneAllRoundedIcon />}
                  onClick={() => handleUpdateStatus("resolved")}
                >
                  Resolve
                </Button>
              </Stack>
            </Box>

            {/* Conversation Area */}
            <Box sx={{ flexGrow: 1, p: 3, overflowY: "auto", display: "flex", flexDirection: "column", gap: 2.5, bgcolor: alpha(theme.palette.background.default, 0.3) }}>
              {activeTicket.messages.map((msg, idx) => {
                const isAdmin = msg.sender === "admin";
                const isSystem = msg.sender === "system";
                const isInternal = msg.sender === "internal";

                return (
                  <Box
                    key={idx}
                    sx={{
                      alignSelf: isAdmin ? "flex-end" : (isSystem || isInternal ? "center" : "flex-start"),
                      maxWidth: "75%",
                    }}
                  >
                    <Paper
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: isAdmin
                          ? theme.palette.primary.main
                          : (isInternal
                            ? alpha(theme.palette.warning.main, 0.15)
                            : (isSystem
                              ? alpha(theme.palette.divider, 0.5)
                              : theme.palette.background.paper)),
                        border: isInternal ? `1px solid ${theme.palette.warning.main}` : `1px solid ${theme.palette.divider}`,
                        color: isAdmin ? "white" : "text.primary",
                      }}
                    >
                      <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                        {msg.text}
                      </Typography>
                    </Paper>
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5, textAlign: isAdmin ? "right" : "left", px: 0.5 }}>
                      {msg.time}
                    </Typography>
                  </Box>
                );
              })}
            </Box>

            {/* Actions Box */}
            <Box sx={{ p: 2.5, borderTop: `1px solid ${theme.palette.divider}` }}>
              <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                <TextField
                  placeholder="Type official merchant response..."
                  size="small"
                  fullWidth
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendReply()}
                />
                <Button variant="contained" startIcon={<MessageRoundedIcon />} onClick={handleSendReply}>
                  Reply
                </Button>
              </Stack>

              <Stack direction="row" spacing={2}>
                <TextField
                  placeholder="Add private internal team note..."
                  size="small"
                  fullWidth
                  value={internalNote}
                  onChange={(e) => setInternalNote(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddNote()}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      color: "warning.main",
                      borderColor: "warning.main"
                    }
                  }}
                />
                <Button variant="outlined" color="warning" onClick={handleAddNote}>
                  Add Note
                </Button>
              </Stack>
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
