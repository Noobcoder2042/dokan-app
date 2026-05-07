import { useMemo, useState } from "react";
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

const CategoryFilter = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
  onAddCategory,
  onUpdateCategory,
  onRequestDeleteCategory,
  loading = false,
}) => {
  const [open, setOpen] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [editingId, setEditingId] = useState("");

  const categoryLabel = useMemo(() => {
    const selected = categories.find((entry) => entry.id === selectedCategoryId);
    return selected?.name || "All Categories";
  }, [categories, selectedCategoryId]);

  const handleSave = async () => {
    if (!draftName.trim()) return;
    if (editingId) {
      await onUpdateCategory(editingId, draftName);
    } else {
      await onAddCategory(draftName);
    }
    setDraftName("");
    setEditingId("");
  };

  return (
    <>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.5}
        sx={{ width: { xs: "100%", md: "auto" } }}
      >
        <FormControl
          size="small"
          sx={{
            width: { xs: "100%", md: 260 },
            minWidth: { md: 220 },
          }}
        >
          <InputLabel>Category</InputLabel>
          <Select
            value={selectedCategoryId}
            label="Category"
            onChange={(event) => onSelectCategory(event.target.value)}
          >
            <MenuItem value="">All Categories</MenuItem>
            {categories.map((category) => (
              <MenuItem key={category.id} value={category.id}>
                {category.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button variant="outlined" onClick={() => setOpen(true)}>
          Manage Categories
        </Button>
      </Stack>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Manage Categories</DialogTitle>
        <DialogContent>
          <Stack direction="row" spacing={1.5} sx={{ mt: 1 }}>
            <TextField
              size="small"
              label={editingId ? "Edit category" : "New category"}
              value={draftName}
              onChange={(event) => setDraftName(event.target.value)}
              fullWidth
            />
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              disabled={!draftName.trim() || loading}
              onClick={handleSave}
            >
              {editingId ? "Save" : "Add"}
            </Button>
          </Stack>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Active filter: {categoryLabel}
          </Typography>

          <List sx={{ mt: 1 }}>
            {categories.length ? (
              categories.map((category) => (
                <ListItem
                  key={category.id}
                  divider
                  secondaryAction={
                    <Box>
                      <IconButton
                        edge="end"
                        onClick={() => {
                          setEditingId(category.id);
                          setDraftName(category.name || "");
                        }}
                        size="small"
                      >
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        edge="end"
                        onClick={() => onRequestDeleteCategory(category)}
                        size="small"
                        color="error"
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  }
                >
                  <ListItemText primary={category.name} />
                </ListItem>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                No categories yet.
              </Typography>
            )}
          </List>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setOpen(false)} color="inherit">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CategoryFilter;
