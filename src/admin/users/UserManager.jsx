import React, { useState } from "react";
import {
  Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button, TextField, Chip, Stack, Dialog, DialogTitle,
  DialogContent, DialogActions, IconButton, Tooltip, Checkbox,
  MenuItem, Select, InputLabel, FormControl, Typography, useTheme, alpha
} from "@mui/material";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import BlockRoundedIcon from "@mui/icons-material/BlockRounded";
import LockOpenRoundedIcon from "@mui/icons-material/LockOpenRounded";
import FileDownloadRoundedIcon from "@mui/icons-material/FileDownloadRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import RestoreFromTrashRoundedIcon from "@mui/icons-material/RestoreFromTrashRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import { useUIExperience } from "../../context/UIExperienceContext";

export const UserManager = ({ merchants = [], onUpdateMerchant, onBlockToggle }) => {
  const theme = useTheme();
  const { playSound } = useUIExperience();

  // Search, Filters & Selection States
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState([]);
  
  // Modals & Forms State
  const [editDialog, setEditDialog] = useState({ open: false, merchant: null });
  const [createDialog, setCreateDialog] = useState(false);
  const [newUserData, setNewUserData] = useState({ name: "", email: "", role: "shop_owner", pricingTier: "free" });

  // 1. Client-side Search and Filters (Soft-delete aware)
  const filteredList = merchants.filter((m) => {
    const matchesSearch =
      (m.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.email || "").toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = roleFilter === "all" || m.role === roleFilter;
    
    // Status Filter Check: Active, Blocked, Soft Deleted (isDeleted)
    let matchesStatus = true;
    if (statusFilter === "active") matchesStatus = !m.isBlocked && !m.isDeleted;
    else if (statusFilter === "blocked") matchesStatus = !!m.isBlocked && !m.isDeleted;
    else if (statusFilter === "deleted") matchesStatus = !!m.isDeleted;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // 2. Select All / Selection Handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredList.map((m) => m.id || m.uid));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // 3. Native CSV Export
  const handleExportCSV = () => {
    playSound?.("click");
    const headers = ["User ID", "Name", "Email Address", "Pricing Tier", "Role", "Blocked", "Deleted"];
    const rows = filteredList.map((m) => [
      m.uid || m.id || "",
      m.name || "",
      m.email || "",
      m.pricingTier || "free",
      m.role || "shop_owner",
      m.isBlocked ? "YES" : "NO",
      m.isDeleted ? "YES" : "NO"
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.map(val => `"${val}"`).join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Dokan_Pro_Merchants_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 4. CRUD Event Handlers
  const handleEditClick = (merchant) => {
    playSound?.("modal");
    setEditDialog({ open: true, merchant: { ...merchant } });
  };

  const handleSaveEdit = async () => {
    playSound?.("click");
    await onUpdateMerchant(editDialog.merchant.id || editDialog.merchant.uid, editDialog.merchant);
    setEditDialog({ open: false, merchant: null });
  };

  const handleCreateUser = async () => {
    playSound?.("click");
    // Creates user locally / prompts sync
    await onUpdateMerchant(Math.random().toString(36).substring(7), {
      ...newUserData,
      uid: Math.random().toString(36).substring(7),
      isBlocked: false,
      isDeleted: false,
      createdAt: new Date()
    });
    setCreateDialog(false);
    setNewUserData({ name: "", email: "", role: "shop_owner", pricingTier: "free" });
  };

  const toggleSoftDelete = async (merchant) => {
    playSound?.("click");
    const nextDeletedState = !merchant.isDeleted;
    await onUpdateMerchant(merchant.id || merchant.uid, {
      isDeleted: nextDeletedState,
      deletedAt: nextDeletedState ? new Date() : null
    });
  };

  return (
    <Box>
      {/* Table Action Controls */}
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mb: 3 }} justifyContent="space-between" alignItems="center">
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ width: "100%" }}>
          <TextField
            placeholder="Search merchant name or email..."
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ flexGrow: 1 }}
          />

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Role</InputLabel>
            <Select value={roleFilter} label="Role" onChange={(e) => setRoleFilter(e.target.value)}>
              <MenuItem value="all">All Roles</MenuItem>
              <MenuItem value="admin">System Admin</MenuItem>
              <MenuItem value="shop_owner">Shop Owner</MenuItem>
              <MenuItem value="staff">Staff Assistant</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Status</InputLabel>
            <Select value={statusFilter} label="Status" onChange={(e) => setStatusFilter(e.target.value)}>
              <MenuItem value="all">All States</MenuItem>
              <MenuItem value="active">Active Accounts</MenuItem>
              <MenuItem value="blocked">Suspended</MenuItem>
              <MenuItem value="deleted">Trash (Soft Deleted)</MenuItem>
            </Select>
          </FormControl>
        </Stack>

        <Stack direction="row" spacing={1.5} sx={{ flexShrink: 0 }}>
          <Button variant="outlined" startIcon={<FileDownloadRoundedIcon />} onClick={handleExportCSV}>
            Export CSV
          </Button>
          <Button variant="contained" color="primary" startIcon={<AddRoundedIcon />} onClick={() => setCreateDialog(true)}>
            Add Merchant
          </Button>
        </Stack>
      </Stack>

      {/* Bulk Action Controls */}
      {selectedIds.length > 0 && (
        <Paper sx={{ p: 2, mb: 3, bgcolor: alpha(theme.palette.primary.main, 0.08), display: "flex", gap: 2, alignItems: "center" }}>
          <Typography variant="body2" sx={{ fontWeight: 800 }}>
            {selectedIds.length} merchants selected for bulk actions:
          </Typography>
          <Button size="small" color="error" variant="outlined" startIcon={<BlockRoundedIcon />}>
            Suspend Bulk
          </Button>
          <Button size="small" color="primary" variant="outlined" startIcon={<RestoreFromTrashRoundedIcon />}>
            Restore Bulk
          </Button>
        </Paper>
      )}

      {/* Responsive Registry Data Table */}
      <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 0 }}>
        <Table>
          <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={selectedIds.length > 0 && selectedIds.length < filteredList.length}
                  checked={filteredList.length > 0 && selectedIds.length === filteredList.length}
                  onChange={handleSelectAll}
                />
              </TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Merchant Profile</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Email Address</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Tier Level</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Assigned Role</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Access Bounds</TableCell>
              <TableCell align="right" sx={{ fontWeight: 800 }}>Action Keys</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                  <Typography variant="body2" color="text.secondary">No merchants matched your active queries.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredList.map((m) => {
                const id = m.id || m.uid;
                const isSelected = selectedIds.includes(id);
                return (
                  <TableRow key={id} selected={isSelected} hover>
                    <TableCell padding="checkbox">
                      <Checkbox checked={isSelected} onChange={() => handleSelectOne(id)} />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={1.5}>
                        <Typography sx={{ fontWeight: 700 }}>{m.name || "Unnamed Store"}</Typography>
                        {m.isDeleted && <Chip label="TRASHED" color="error" size="small" variant="outlined" sx={{ height: 18, fontSize: "0.65rem" }} />}
                      </Stack>
                    </TableCell>
                    <TableCell>{m.email || "No Email"}</TableCell>
                    <TableCell>
                      <Chip label={(m.pricingTier || "free").toUpperCase()} color="primary" size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Chip label={m.role || "shop_owner"} size="small" />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={m.isBlocked ? "SUSPENDED" : "AUTHORIZED"}
                        color={m.isBlocked ? "error" : "success"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Tooltip title="Modify Account details">
                          <IconButton size="small" onClick={() => handleEditClick(m)} color="primary">
                            <EditRoundedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={m.isBlocked ? "Grant access token" : "Revoke account token"}>
                          <IconButton size="small" onClick={() => onBlockToggle(m)} color={m.isBlocked ? "success" : "warning"}>
                            {m.isBlocked ? <LockOpenRoundedIcon fontSize="small" /> : <BlockRoundedIcon fontSize="small" />}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={m.isDeleted ? "Restore directory account" : "Soft-delete directory account"}>
                          <IconButton size="small" onClick={() => toggleSoftDelete(m)} color={m.isDeleted ? "success" : "error"}>
                            {m.isDeleted ? <RestoreFromTrashRoundedIcon fontSize="small" /> : <DeleteRoundedIcon fontSize="small" />}
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* EDIT USER DIALOG */}
      <Dialog open={editDialog.open} onClose={() => setEditDialog({ open: false, merchant: null })} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 800 }}>Modify Merchant Profile</DialogTitle>
        <DialogContent>
          {editDialog.merchant && (
            <Stack spacing={3} sx={{ mt: 1 }}>
              <TextField
                label="Merchant Name"
                fullWidth
                value={editDialog.merchant.name || ""}
                onChange={(e) => setEditDialog(prev => ({ ...prev, merchant: { ...prev.merchant, name: e.target.value } }))}
              />
              <TextField
                label="Registered Email"
                fullWidth
                value={editDialog.merchant.email || ""}
                onChange={(e) => setEditDialog(prev => ({ ...prev, merchant: { ...prev.merchant, email: e.target.value } }))}
              />
              <FormControl fullWidth>
                <InputLabel>SaaS Pricing Tier</InputLabel>
                <Select
                  value={editDialog.merchant.pricingTier || "free"}
                  label="SaaS Pricing Tier"
                  onChange={(e) => setEditDialog(prev => ({ ...prev, merchant: { ...prev.merchant, pricingTier: e.target.value } }))}
                >
                  <MenuItem value="free">Free Dukan (Basic)</MenuItem>
                  <MenuItem value="basic">Basic Monthly (Rs. 999)</MenuItem>
                  <MenuItem value="pro_monthly">Pro Monthly (Rs. 2,999)</MenuItem>
                  <MenuItem value="enterprise">Enterprise Custom</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Access Authorization</InputLabel>
                <Select
                  value={editDialog.merchant.role || "shop_owner"}
                  label="Access Authorization"
                  onChange={(e) => setEditDialog(prev => ({ ...prev, merchant: { ...prev.merchant, role: e.target.value } }))}
                >
                  <MenuItem value="admin">System Admin</MenuItem>
                  <MenuItem value="shop_owner">Shop Owner</MenuItem>
                  <MenuItem value="staff">Staff Operator</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setEditDialog({ open: false, merchant: null })} color="inherit">Cancel</Button>
          <Button onClick={handleSaveEdit} variant="contained">Save Changes</Button>
        </DialogActions>
      </Dialog>

      {/* CREATE USER DIALOG */}
      <Dialog open={createDialog} onClose={() => setCreateDialog(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 800 }}>Create New Merchant</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Merchant Full Name"
              fullWidth
              value={newUserData.name}
              onChange={(e) => setNewUserData(prev => ({ ...prev, name: e.target.value }))}
            />
            <TextField
              label="Email Address"
              fullWidth
              value={newUserData.email}
              onChange={(e) => setNewUserData(prev => ({ ...prev, email: e.target.value }))}
            />
            <FormControl fullWidth>
              <InputLabel>Pricing Subscription Tier</InputLabel>
              <Select
                value={newUserData.pricingTier}
                label="Pricing Subscription Tier"
                onChange={(e) => setNewUserData(prev => ({ ...prev, pricingTier: e.target.value }))}
              >
                <MenuItem value="free">Free Dukan</MenuItem>
                <MenuItem value="basic">Basic Monthly (Rs. 999)</MenuItem>
                <MenuItem value="pro_monthly">Pro Monthly (Rs. 2,999)</MenuItem>
                <MenuItem value="enterprise">Enterprise Custom</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setCreateDialog(false)} color="inherit">Cancel</Button>
          <Button onClick={handleCreateUser} variant="contained">Create User</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
