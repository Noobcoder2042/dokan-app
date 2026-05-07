import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";

const formatRupee = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

const ItemPanel = ({
  selectedSubcategoryName,
  isDisabled,
  itemForm,
  isSaving,
  items,
  onFormChange,
  onImageUpload,
  onSubmit,
  onStartEdit,
  onDelete,
  isEditing,
}) => {
  const [viewTab, setViewTab] = useState("manage");
  const [search, setSearch] = useState("");
  const [menuState, setMenuState] = useState({
    anchorEl: null,
    item: null,
  });

  const filteredItems = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return items;

    return items.filter((item) => {
      const name = (item.name || "").toLowerCase();
      const code = (item.code || "").toLowerCase();
      return name.includes(keyword) || code.includes(keyword);
    });
  }, [items, search]);

  const openMenu = (event, item) => {
    setMenuState({ anchorEl: event.currentTarget, item });
  };

  const closeMenu = () => setMenuState({ anchorEl: null, item: null });

  return (
    <Card sx={{ borderRadius: 4 }}>
      <CardContent sx={{ p: { xs: 2, md: 3 } }}>
        <Stack spacing={2}>
          <Typography variant="h6">
            Items {selectedSubcategoryName ? `- ${selectedSubcategoryName}` : ""}
          </Typography>

          <Tabs
            value={viewTab}
            onChange={(_, value) => setViewTab(value)}
            variant="fullWidth"
          >
            <Tab label="Manage Item" value="manage" />
            <Tab label="Items List" value="list" />
          </Tabs>

          {viewTab === "manage" ? (
            <>
              <TextField
                label="Item Name"
                value={itemForm.name}
                onChange={(event) => onFormChange("name", event.target.value)}
                disabled={isDisabled}
                fullWidth
                required
              />

              <TextField
                label="Price"
                type="number"
                value={itemForm.price}
                onChange={(event) => onFormChange("price", event.target.value)}
                disabled={isDisabled}
                fullWidth
                required
              />

              <Stack spacing={1}>
                <Button variant="outlined" component="label" disabled={isDisabled}>
                  Upload Item Image
                  <input
                    hidden
                    type="file"
                    accept="image/*"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      onImageUpload(file || null);
                      event.target.value = "";
                    }}
                  />
                </Button>
                {itemForm.photoDataUrl ? (
                  <Box
                    component="img"
                    src={itemForm.photoDataUrl}
                    alt="Item Preview"
                    sx={{
                      width: 96,
                      height: 96,
                      borderRadius: 2,
                      objectFit: "cover",
                      border: "1px solid rgba(148,163,184,0.35)",
                    }}
                  />
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No image selected
                  </Typography>
                )}
              </Stack>

              <TextField
                label="Code (Optional)"
                value={itemForm.code}
                onChange={(event) => onFormChange("code", event.target.value)}
                disabled={isDisabled}
                fullWidth
              />

              <Button
                variant="contained"
                fullWidth
                onClick={onSubmit}
                disabled={isDisabled || isSaving}
              >
                {isSaving ? "Saving..." : isEditing ? "Update Item" : "Add Item"}
              </Button>
            </>
          ) : (
            <>
              <TextField
                label="Search Items"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                disabled={isDisabled}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRoundedIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />

              <Stack spacing={1.2}>
                {filteredItems.length ? (
                  filteredItems.map((item) => (
                    <Card
                      key={item.id}
                      variant="outlined"
                      sx={{
                        borderRadius: 3,
                        transition: "all 0.2s ease",
                        "&:hover": {
                          boxShadow: "0 14px 28px rgba(15, 23, 42, 0.13)",
                          transform: "translateY(-1px)",
                        },
                      }}
                    >
                      <CardContent sx={{ p: 1.5 }}>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Box
                            component="img"
                            src={
                              item.photoDataUrl ||
                              item.photoUrl ||
                              "https://dummyimage.com/96x96/f1f5f9/64748b&text=No+Photo"
                            }
                            alt={item.name}
                            sx={{
                              width: 62,
                              height: 62,
                              borderRadius: 2,
                              objectFit: "cover",
                              border: "1px solid rgba(148,163,184,0.3)",
                            }}
                          />

                          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                            <Typography sx={{ fontWeight: 700 }} noWrap>
                              {item.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {formatRupee(item.price)}
                            </Typography>
                            {item.code ? (
                              <Typography variant="caption" color="text.secondary">
                                Code: {item.code}
                              </Typography>
                            ) : null}
                          </Box>

                          <IconButton
                            size="small"
                            onClick={(event) => openMenu(event, item)}
                          >
                            <MoreVertRoundedIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Box sx={{ py: 2 }}>
                    <Typography color="text.secondary">No items yet</Typography>
                  </Box>
                )}
              </Stack>
            </>
          )}
        </Stack>
      </CardContent>

      <Menu
        anchorEl={menuState.anchorEl}
        open={Boolean(menuState.anchorEl)}
        onClose={closeMenu}
      >
        <MenuItem
          onClick={() => {
            setViewTab("manage");
            onStartEdit(menuState.item);
            closeMenu();
          }}
        >
          Edit
        </MenuItem>
        <MenuItem
          onClick={() => {
            onDelete(menuState.item);
            closeMenu();
          }}
          sx={{ color: "error.main" }}
        >
          Delete
        </MenuItem>
      </Menu>
    </Card>
  );
};

export default ItemPanel;
