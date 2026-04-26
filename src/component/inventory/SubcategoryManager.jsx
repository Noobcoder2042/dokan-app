import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";

const SubcategoryManager = ({
  categories,
  subcategories,
  selectedCategoryId,
  onAddSubcategory,
  onUpdateSubcategory,
  onRequestDeleteSubcategory,
  loading = false,
}) => {
  const [open, setOpen] = useState(false);
  const [activeCategoryId, setActiveCategoryId] = useState("");
  const [draftName, setDraftName] = useState("");
  const [editingId, setEditingId] = useState("");

  useEffect(() => {
    if (!open) return;
    setActiveCategoryId(selectedCategoryId || categories[0]?.id || "");
  }, [categories, open, selectedCategoryId]);

  const filteredSubcategories = subcategories.filter(
    (entry) => entry.categoryId === activeCategoryId
  );

  const resetDraft = () => {
    setDraftName("");
    setEditingId("");
  };

  const handleSave = async () => {
    if (!activeCategoryId || !draftName.trim()) return;

    if (editingId) {
      await onUpdateSubcategory(editingId, draftName, activeCategoryId);
    } else {
      await onAddSubcategory(draftName, activeCategoryId);
    }

    resetDraft();
  };

  const handleClose = () => {
    setOpen(false);
    resetDraft();
  };

  return (
    <>
      <Button variant="outlined" onClick={() => setOpen(true)} disabled={!categories.length}>
        Manage Subcategories
      </Button>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>Manage Subcategories</DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} sx={{ mt: 1 }}>
            <FormControl size="small" fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={activeCategoryId}
                label="Category"
                onChange={(event) => {
                  setActiveCategoryId(event.target.value);
                  resetDraft();
                }}
              >
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Stack direction="row" spacing={1.5}>
              <TextField
                size="small"
                label={editingId ? "Edit subcategory" : "New subcategory"}
                value={draftName}
                onChange={(event) => setDraftName(event.target.value)}
                fullWidth
              />
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                disabled={!activeCategoryId || !draftName.trim() || loading}
                onClick={handleSave}
              >
                {editingId ? "Save" : "Add"}
              </Button>
            </Stack>
          </Stack>

          <List sx={{ mt: 1 }}>
            {filteredSubcategories.length ? (
              filteredSubcategories.map((subcategory) => (
                <ListItem
                  key={subcategory.id}
                  divider
                  secondaryAction={
                    <Box>
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={() => {
                          setEditingId(subcategory.id);
                          setDraftName(subcategory.name || "");
                        }}
                      >
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        edge="end"
                        size="small"
                        color="error"
                        onClick={() => onRequestDeleteSubcategory(subcategory)}
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  }
                >
                  <ListItemText primary={subcategory.name} />
                </ListItem>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                No subcategories in this category yet.
              </Typography>
            )}
          </List>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={handleClose} color="inherit">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SubcategoryManager;
