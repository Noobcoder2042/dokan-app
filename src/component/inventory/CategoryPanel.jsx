import {
  Box,
  Button,
  Card,
  CardContent,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";

const CategoryPanel = ({
  categories,
  selectedCategoryId,
  draftName,
  isSaving,
  onDraftChange,
  onSave,
  onSelect,
  onEdit,
  onDelete,
}) => {
  return (
    <Card sx={{ borderRadius: 4 }}>
      <CardContent sx={{ p: { xs: 2, md: 3 } }}>
        <Stack spacing={2}>
          <Typography variant="h6">Categories</Typography>
          <Stack direction="row" spacing={1}>
            <TextField
              label="Category Name"
              value={draftName}
              onChange={(event) => onDraftChange(event.target.value)}
              fullWidth
            />
            <Button variant="contained" onClick={onSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </Stack>

          {categories.length ? (
            <List sx={{ p: 0 }}>
              {categories.map((category) => (
                <ListItemButton
                  key={category.id}
                  selected={selectedCategoryId === category.id}
                  onClick={() => onSelect(category.id)}
                  sx={{
                    borderRadius: 2,
                    mb: 0.5,
                    border:
                      selectedCategoryId === category.id
                        ? "1px solid rgba(37,99,235,0.45)"
                        : "1px solid transparent",
                  }}
                >
                  <ListItemText primary={category.name} />
                  <IconButton
                    size="small"
                    onClick={(event) => {
                      event.stopPropagation();
                      onEdit(category);
                    }}
                  >
                    <EditRoundedIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={(event) => {
                      event.stopPropagation();
                      onDelete(category);
                    }}
                  >
                    <DeleteRoundedIcon fontSize="small" />
                  </IconButton>
                </ListItemButton>
              ))}
            </List>
          ) : (
            <Box sx={{ py: 2 }}>
              <Typography color="text.secondary">No categories yet</Typography>
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default CategoryPanel;
