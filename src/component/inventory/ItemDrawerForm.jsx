import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  Divider,
  Drawer,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

const ItemDrawerForm = ({
  open,
  mode,
  loading,
  categories,
  subcategories,
  formData,
  errors,
  onClose,
  onFieldChange,
  onImageFileChange,
  onSubmit,
}) => {
  const subcategoryOptions = subcategories.filter(
    (entry) => entry.categoryId === formData.categoryId
  );

  return (
    <Drawer anchor="right" open={open} onClose={loading ? undefined : onClose}>
      <Box sx={{ width: { xs: "100vw", sm: 440 }, p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            {mode === "edit" ? "Edit Inventory Item" : "Add New Item"}
          </Typography>
          {loading ? <CircularProgress size={22} /> : null}
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
          Keep your pricing and catalog accurate for fast billing.
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              label="Item Name"
              value={formData.name}
              onChange={(event) => onFieldChange("name", event.target.value)}
              error={Boolean(errors.name)}
              helperText={errors.name}
              fullWidth
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Price"
              type="number"
              value={formData.price}
              onChange={(event) => onFieldChange("price", event.target.value)}
              error={Boolean(errors.price)}
              helperText={errors.price}
              fullWidth
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Stock Unit</InputLabel>
              <Select
                label="Stock Unit"
                value={formData.stockUnit}
                onChange={(event) => onFieldChange("stockUnit", event.target.value)}
              >
                <MenuItem value="piece">Piece</MenuItem>
                <MenuItem value="dozen">Dozen</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Stock Quantity"
              type="number"
              value={formData.stockQty}
              onChange={(event) => onFieldChange("stockQty", event.target.value)}
              error={Boolean(errors.stockQty)}
              helperText={errors.stockQty}
              fullWidth
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Low Stock Alert At"
              type="number"
              value={formData.lowStockThreshold}
              onChange={(event) => onFieldChange("lowStockThreshold", event.target.value)}
              error={Boolean(errors.lowStockThreshold)}
              helperText={errors.lowStockThreshold}
              fullWidth
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Code (Optional)"
              value={formData.code}
              onChange={(event) => onFieldChange("code", event.target.value)}
              fullWidth
            />
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth error={Boolean(errors.categoryId)}>
              <InputLabel>Category</InputLabel>
              <Select
                label="Category"
                value={formData.categoryId}
                onChange={(event) => onFieldChange("categoryId", event.target.value)}
              >
                {categories.map((entry) => (
                  <MenuItem key={entry.id} value={entry.id}>
                    {entry.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {errors.categoryId ? (
              <Typography variant="caption" color="error">
                {errors.categoryId}
              </Typography>
            ) : null}
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Subcategory (Optional)</InputLabel>
              <Select
                label="Subcategory (Optional)"
                value={formData.subcategoryId}
                onChange={(event) => onFieldChange("subcategoryId", event.target.value)}
              >
                <MenuItem value="">None</MenuItem>
                {subcategoryOptions.map((entry) => (
                  <MenuItem key={entry.id} value={entry.id}>
                    {entry.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <Button variant="outlined" component="label" fullWidth>
              Upload Item Image (Optional)
              <input
                hidden
                accept="image/*"
                type="file"
                onChange={(event) => onImageFileChange(event.target.files?.[0] || null)}
              />
            </Button>
            {errors.imageFile ? (
              <Typography variant="caption" color="error">
                {errors.imageFile}
              </Typography>
            ) : null}
            {formData.imagePreview ? (
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1.25 }}>
                <Avatar
                  src={formData.imagePreview}
                  variant="rounded"
                  sx={{ width: 56, height: 56, borderRadius: 2 }}
                />
                <Typography variant="body2" color="text.secondary">
                  {formData.imageFile?.name || "Current image"}
                </Typography>
              </Stack>
            ) : null}
          </Grid>
        </Grid>

        <Stack direction="row" spacing={1.5} sx={{ mt: 3 }}>
          <Button onClick={onClose} color="inherit" fullWidth disabled={loading}>
            Cancel
          </Button>
          <Button onClick={onSubmit} variant="contained" fullWidth disabled={loading}>
            {mode === "edit" ? "Save Changes" : "Add Item"}
          </Button>
        </Stack>
      </Box>
    </Drawer>
  );
};

export default ItemDrawerForm;
