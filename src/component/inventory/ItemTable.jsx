import { useMemo, useState } from "react";
import {
  Avatar,
  Box,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";

const formatCreatedAt = (value) => {
  if (!value) return "-";
  if (typeof value?.toDate === "function") {
    return value.toDate().toLocaleDateString("en-IN");
  }
  const dateValue = new Date(value);
  if (Number.isNaN(dateValue.getTime())) return "-";
  return dateValue.toLocaleDateString("en-IN");
};

const ItemTable = ({
  items,
  categoriesById,
  subcategoriesById,
  onEditItem,
  onDeleteItem,
}) => {
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [activeItem, setActiveItem] = useState(null);

  const openMenu = (event, item) => {
    setMenuAnchor(event.currentTarget);
    setActiveItem(item);
  };

  const closeMenu = () => {
    setMenuAnchor(null);
    setActiveItem(null);
  };

  const resolvedItems = useMemo(
    () =>
      items.map((item) => ({
        ...item,
        categoryName: categoriesById[item.categoryId]?.name || "Uncategorized",
        subcategoryName: subcategoriesById[item.subcategoryId]?.name || "",
      })),
    [categoriesById, items, subcategoriesById]
  );

  if (!items.length) {
    return (
      <Paper
        variant="outlined"
        sx={{ p: 5, textAlign: "center", borderStyle: "dashed", borderRadius: 1 }}
      >
        <Typography variant="h6">No items yet</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Add your first inventory item to start billing faster.
        </Typography>
      </Paper>
    );
  }

  return (
    <>
      {/* Desktop View: Show classic Table */}
      <TableContainer
        component={Paper}
        sx={{
          display: { xs: "none", md: "block" },
          overflow: "hidden",
        }}
      >
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Item</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Stock</TableCell>
              <TableCell align="right">Price</TableCell>
              <TableCell>Created</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {resolvedItems.map((item) => (
              <TableRow
                key={item.id}
                hover
                sx={{
                  transition: "background-color 0.2s ease",
                  "&:hover": { backgroundColor: "rgba(59, 130, 246, 0.05)" },
                }}
              >
                <TableCell>
                  <Stack direction="row" spacing={1.25} alignItems="center">
                    <Avatar
                      variant="rounded"
                      src={item.imageUrl || ""}
                      alt={item.name}
                      sx={{ width: 42, height: 42, borderRadius: 2 }}
                    />
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        {item.name}
                      </Typography>
                      <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }}>
                        {item.code ? <Chip label={item.code} size="small" /> : null}
                        {item.subcategoryName ? (
                          <Chip label={item.subcategoryName} size="small" variant="outlined" />
                        ) : null}
                      </Stack>
                    </Box>
                  </Stack>
                </TableCell>
                <TableCell>{item.categoryName}</TableCell>
                <TableCell>
                  <Stack direction="row" spacing={0.75} alignItems="center">
                    <Typography variant="body2">
                      {Number(item.stockQty || 0).toFixed(2)} {item.stockUnit || "piece"}
                    </Typography>
                    {Number(item.lowStockThreshold || 0) > 0 &&
                    Number(item.stockQty || 0) <= Number(item.lowStockThreshold || 0) ? (
                      <Chip size="small" color="warning" label="Low" />
                    ) : null}
                  </Stack>
                </TableCell>
                <TableCell align="right">Rs. {Number(item.price || 0).toFixed(2)}</TableCell>
                <TableCell>{formatCreatedAt(item.createdAt)}</TableCell>
                <TableCell align="right">
                  <IconButton onClick={(event) => openMenu(event, item)} size="small">
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Mobile View: Show native APK-style Product Cards */}
      <Stack
        spacing={1.75}
        sx={{
          display: { xs: "flex", md: "none" },
          mt: 1,
        }}
      >
        {resolvedItems.map((item) => (
          <Paper
            key={item.id}
            sx={{
              p: 2,
              borderRadius: 3,
              background: "rgba(255, 255, 255, 0.03)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              position: "relative",
              transition: "transform 0.2s, box-shadow 0.2s",
              "&:active": {
                transform: "scale(0.98)",
              }
            }}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar
                variant="rounded"
                src={item.imageUrl || ""}
                alt={item.name}
                sx={{ width: 54, height: 54, borderRadius: 2 }}
              />
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Typography variant="body1" fontWeight={750} noWrap sx={{ pr: 3 }}>
                    {item.name}
                  </Typography>
                  <IconButton
                    onClick={(event) => openMenu(event, item)}
                    size="small"
                    sx={{ position: "absolute", top: 12, right: 12 }}
                  >
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                </Stack>
                
                <Stack direction="row" spacing={0.5} sx={{ my: 0.5, flexWrap: "wrap", gap: 0.5 }}>
                  {item.code ? <Chip label={item.code} size="small" sx={{ height: 18, fontSize: "0.65rem" }} /> : null}
                  <Chip
                    label={item.categoryName}
                    size="small"
                    variant="outlined"
                    sx={{ height: 18, fontSize: "0.65rem", borderColor: "rgba(255,255,255,0.2)" }}
                  />
                  {item.subcategoryName ? (
                    <Chip label={item.subcategoryName} size="small" variant="outlined" sx={{ height: 18, fontSize: "0.65rem", borderColor: "rgba(255,255,255,0.1)" }} />
                  ) : null}
                </Stack>

                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 1.5 }}>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <Typography variant="caption" color="text.secondary">
                      Stock:
                    </Typography>
                    <Typography 
                      variant="body2" 
                      fontWeight={800} 
                      color={
                        Number(item.lowStockThreshold || 0) > 0 && Number(item.stockQty || 0) <= Number(item.lowStockThreshold || 0) 
                          ? "warning.main" 
                          : "text.primary"
                      }
                    >
                      {Number(item.stockQty || 0).toLocaleString("en-IN")} {item.stockUnit || "piece"}
                    </Typography>
                    {Number(item.lowStockThreshold || 0) > 0 &&
                    Number(item.stockQty || 0) <= Number(item.lowStockThreshold || 0) ? (
                      <Chip size="small" color="warning" label="Low" sx={{ height: 16, fontSize: "0.58rem" }} />
                    ) : null}
                  </Stack>
                  <Typography variant="subtitle2" fontWeight={900} color="primary.main">
                    Rs. {Number(item.price || 0).toFixed(2)}
                  </Typography>
                </Stack>
              </Box>
            </Stack>
          </Paper>
        ))}
      </Stack>

      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={closeMenu}>
        <MenuItem
          onClick={() => {
            if (activeItem) onEditItem(activeItem);
            closeMenu();
          }}
        >
          Edit
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (activeItem) onDeleteItem(activeItem);
            closeMenu();
          }}
          sx={{ color: "error.main" }}
        >
          Delete
        </MenuItem>
      </Menu>
    </>
  );
};

export default ItemTable;

