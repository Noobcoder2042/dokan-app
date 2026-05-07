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

const SubcategoryPanel = ({
  selectedCategoryName,
  subcategories,
  selectedSubcategoryId,
  draftName,
  isSaving,
  isDisabled,
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
          <Typography variant="h6">
            Subcategories {selectedCategoryName ? `- ${selectedCategoryName}` : ""}
          </Typography>

          <Stack direction="row" spacing={1}>
            <TextField
              label="Subcategory Name"
              value={draftName}
              onChange={(event) => onDraftChange(event.target.value)}
              fullWidth
              disabled={isDisabled}
            />
            <Button
              variant="contained"
              onClick={onSave}
              disabled={isDisabled || isSaving}
            >
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </Stack>

          {isDisabled ? (
            <Box sx={{ py: 2 }}>
              <Typography color="text.secondary">Select a category first</Typography>
            </Box>
          ) : subcategories.length ? (
            <List sx={{ p: 0 }}>
              {subcategories.map((subcategory) => (
                <ListItemButton
                  key={subcategory.id}
                  selected={selectedSubcategoryId === subcategory.id}
                  onClick={() => onSelect(subcategory.id)}
                  sx={{
                    borderRadius: 2,
                    mb: 0.5,
                    border:
                      selectedSubcategoryId === subcategory.id
                        ? "1px solid rgba(37,99,235,0.45)"
                        : "1px solid transparent",
                  }}
                >
                  <ListItemText primary={subcategory.name} />
                  <IconButton
                    size="small"
                    onClick={(event) => {
                      event.stopPropagation();
                      onEdit(subcategory);
                    }}
                  >
                    <EditRoundedIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={(event) => {
                      event.stopPropagation();
                      onDelete(subcategory);
                    }}
                  >
                    <DeleteRoundedIcon fontSize="small" />
                  </IconButton>
                </ListItemButton>
              ))}
            </List>
          ) : (
            <Box sx={{ py: 2 }}>
              <Typography color="text.secondary">No subcategories yet</Typography>
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default SubcategoryPanel;
