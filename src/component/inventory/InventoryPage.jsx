import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CategoryFilter from "./CategoryFilter";
import ConfirmDialog from "./ConfirmDialog";
import ItemDrawerForm from "./ItemDrawerForm";
import ItemTable from "./ItemTable";
import SubcategoryManager from "./SubcategoryManager";
import SnackbarProvider, { useAppSnackbar } from "./SnackbarProvider";
import { useShop } from "../../context/ShopContext";
import {
  createCategory,
  createItem,
  createSubcategory,
  removeCategory,
  removeItem,
  removeItemImageByPath,
  removeSubcategory,
  subscribeCategories,
  subscribeItems,
  subscribeSubcategories,
  updateCategory,
  updateItem,
  updateSubcategory,
  uploadItemImage,
} from "../../services/firebase";

const emptyFormState = {
  name: "",
  price: "",
  categoryId: "",
  subcategoryId: "",
  stockQty: "0",
  stockUnit: "piece",
  lowStockThreshold: "5",
  code: "",
  imageFile: null,
  imagePreview: "",
  imageUrl: "",
  imagePath: "",
};

const parseDate = (value) => {
  if (!value) return null;
  if (typeof value?.toDate === "function") return value.toDate();
  const dateValue = new Date(value);
  return Number.isNaN(dateValue.getTime()) ? null : dateValue;
};

const normalizeText = (value) => (value || "").toString().trim().toLowerCase();
const ENABLE_STORAGE_UPLOAD = import.meta.env.VITE_ENABLE_STORAGE_UPLOAD === "true";

const dataUrlSizeBytes = (dataUrl) => {
  if (!dataUrl || typeof dataUrl !== "string") return 0;
  const base64 = dataUrl.split(",")[1] || "";
  return Math.ceil((base64.length * 3) / 4);
};

const loadImage = (file) =>
  new Promise((resolve, reject) => {
    const src = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(src);
      resolve(image);
    };
    image.onerror = (error) => {
      URL.revokeObjectURL(src);
      reject(error);
    };
    image.src = src;
  });

const compressImageToDataUrl = async (file) => {
  const image = await loadImage(file);
  const maxSide = 1280;

  let targetWidth = image.naturalWidth || image.width;
  let targetHeight = image.naturalHeight || image.height;

  if (targetWidth > maxSide || targetHeight > maxSide) {
    const scale = Math.min(maxSide / targetWidth, maxSide / targetHeight);
    targetWidth = Math.max(1, Math.floor(targetWidth * scale));
    targetHeight = Math.max(1, Math.floor(targetHeight * scale));
  }

  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Could not process image");
  }

  context.drawImage(image, 0, 0, targetWidth, targetHeight);

  // Keep image payload small for Firestore document limits when Storage is disabled.
  const qualitySteps = [0.86, 0.78, 0.7, 0.62, 0.55];
  let bestDataUrl = canvas.toDataURL("image/jpeg", qualitySteps[0]);

  for (let index = 0; index < qualitySteps.length; index += 1) {
    const dataUrl = canvas.toDataURL("image/jpeg", qualitySteps[index]);
    bestDataUrl = dataUrl;
    if (dataUrlSizeBytes(dataUrl) <= 180 * 1024) {
      break;
    }
  }

  return bestDataUrl;
};

const InventoryContent = () => {
  const { activeShopId } = useShop();
  const { showSnackbar } = useAppSnackbar();

  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [items, setItems] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState("create");
  const [activeItemId, setActiveItemId] = useState("");
  const [formData, setFormData] = useState(emptyFormState);
  const [formErrors, setFormErrors] = useState({});

  const [confirmState, setConfirmState] = useState({
    open: false,
    kind: "",
    payload: null,
  });

  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeCategories(
      activeShopId,
      setCategories,
      (error) => {
        console.error("Category subscription failed:", error);
        showSnackbar(
          error?.code === "permission-denied"
            ? "Shop access denied. Switching to your default shop..."
            : "Failed to load categories",
          "error"
        );
      }
    );
    return () => unsubscribe();
  }, [activeShopId, showSnackbar]);

  useEffect(() => {
    const unsubscribe = subscribeSubcategories(
      activeShopId,
      setSubcategories,
      (error) => {
        console.error("Subcategory subscription failed:", error);
        showSnackbar(
          error?.code === "permission-denied"
            ? "Shop access denied. Switching to your default shop..."
            : "Failed to load subcategories",
          "error"
        );
      }
    );
    return () => unsubscribe();
  }, [activeShopId, showSnackbar]);

  useEffect(() => {
    const unsubscribe = subscribeItems(
      activeShopId,
      setItems,
      (error) => {
        console.error("Item subscription failed:", error);
        showSnackbar(
          error?.code === "permission-denied"
            ? "Shop access denied. Switching to your default shop..."
            : "Failed to load items",
          "error"
        );
      }
    );
    return () => unsubscribe();
  }, [activeShopId, showSnackbar]);

  const categoriesById = useMemo(
    () =>
      categories.reduce((acc, current) => {
        acc[current.id] = current;
        return acc;
      }, {}),
    [categories]
  );

  const subcategoriesById = useMemo(
    () =>
      subcategories.reduce((acc, current) => {
        acc[current.id] = current;
        return acc;
      }, {}),
    [subcategories]
  );

  const filteredItems = useMemo(() => {
    const term = normalizeText(searchTerm);
    return items.filter((item) => {
      const byCategory = selectedCategoryId
        ? item.categoryId === selectedCategoryId
        : true;
      if (!byCategory) return false;

      if (!term) return true;
      const categoryName = normalizeText(categoriesById[item.categoryId]?.name);
      const subcategoryName = normalizeText(subcategoriesById[item.subcategoryId]?.name);
      const name = normalizeText(item.name);
      const code = normalizeText(item.code);

      return (
        name.includes(term) ||
        code.includes(term) ||
        categoryName.includes(term) ||
        subcategoryName.includes(term)
      );
    });
  }, [categoriesById, items, searchTerm, selectedCategoryId, subcategoriesById]);

  const recentItems = useMemo(() => {
    return [...items]
      .sort((a, b) => {
        const aTime = parseDate(a.createdAt)?.getTime() || 0;
        const bTime = parseDate(b.createdAt)?.getTime() || 0;
        return bTime - aTime;
      })
      .slice(0, 5);
  }, [items]);

  const recentCount = useMemo(() => {
    const lastWeek = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return items.filter((item) => {
      const dateValue = parseDate(item.createdAt);
      return dateValue ? dateValue.getTime() >= lastWeek : false;
    }).length;
  }, [items]);

  const resetDrawerState = () => {
    setDrawerOpen(false);
    setDrawerMode("create");
    setActiveItemId("");
    setFormData(emptyFormState);
    setFormErrors({});
  };

  const openCreateDrawer = () => {
    const defaultCategoryId = selectedCategoryId || categories[0]?.id || "";
    setDrawerMode("create");
    setActiveItemId("");
    setFormData({
      ...emptyFormState,
      categoryId: defaultCategoryId,
    });
    setFormErrors({});
    setDrawerOpen(true);
  };

  const openEditDrawer = (item) => {
    setDrawerMode("edit");
    setActiveItemId(item.id);
    setFormData({
      name: item.name || "",
      price: item.price ?? "",
      categoryId: item.categoryId || "",
      subcategoryId: item.subcategoryId || "",
      stockQty: item.stockQty ?? "0",
      stockUnit: item.stockUnit || "piece",
      lowStockThreshold: item.lowStockThreshold ?? "5",
      code: item.code || "",
      imageFile: null,
      imagePreview: item.imageUrl || "",
      imageUrl: item.imageUrl || "",
      imagePath: item.imagePath || "",
    });
    setFormErrors({});
    setDrawerOpen(true);
  };

  const validateForm = () => {
    const nextErrors = {};
    if (!formData.name.trim()) nextErrors.name = "Name is required";

    const parsedPrice = Number(formData.price);
    if (Number.isNaN(parsedPrice) || parsedPrice <= 0) {
      nextErrors.price = "Enter a valid price";
    }
    if (!formData.categoryId) {
      nextErrors.categoryId = "Category is required";
    }
    const parsedStockQty = Number(formData.stockQty);
    if (Number.isNaN(parsedStockQty) || parsedStockQty < 0) {
      nextErrors.stockQty = "Stock must be 0 or greater";
    }
    const parsedLowStockThreshold = Number(formData.lowStockThreshold);
    if (Number.isNaN(parsedLowStockThreshold) || parsedLowStockThreshold < 0) {
      nextErrors.lowStockThreshold = "Low stock alert must be 0 or greater";
    }
    setFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleAddCategory = async (name) => {
    if (!name.trim()) return;
    try {
      await createCategory(activeShopId, name);
      showSnackbar("Category added");
    } catch (error) {
      console.error(error);
      showSnackbar("Could not add category", "error");
    }
  };

  const handleUpdateCategory = async (categoryId, name) => {
    if (!name.trim()) return;
    try {
      await updateCategory(activeShopId, categoryId, name);
      showSnackbar("Category updated");
    } catch (error) {
      console.error(error);
      showSnackbar("Could not update category", "error");
    }
  };

  const handleCategoryDeleteRequest = (category) => {
    setConfirmState({
      open: true,
      kind: "category",
      payload: category,
    });
  };

  const handleItemDeleteRequest = (item) => {
    setConfirmState({
      open: true,
      kind: "item",
      payload: item,
    });
  };

  const handleAddSubcategory = async (name, categoryId) => {
    if (!name.trim() || !categoryId) return;
    try {
      await createSubcategory(activeShopId, {
        name,
        categoryId,
      });
      showSnackbar("Subcategory added");
    } catch (error) {
      console.error(error);
      showSnackbar("Could not add subcategory", "error");
    }
  };

  const handleUpdateSubcategory = async (subcategoryId, name, categoryId) => {
    if (!name.trim() || !categoryId) return;
    try {
      await updateSubcategory(activeShopId, subcategoryId, {
        name,
        categoryId,
      });
      showSnackbar("Subcategory updated");
    } catch (error) {
      console.error(error);
      showSnackbar("Could not update subcategory", "error");
    }
  };

  const handleSubcategoryDeleteRequest = (subcategory) => {
    setConfirmState({
      open: true,
      kind: "subcategory",
      payload: subcategory,
    });
  };

  const handleConfirmDelete = async () => {
    if (!confirmState.payload) return;
    setDeleting(true);

    if (confirmState.kind === "item") {
      const item = confirmState.payload;
      const previousItems = items;
      setItems((current) => current.filter((entry) => entry.id !== item.id));
      try {
        await removeItem(activeShopId, item.id);
        await removeItemImageByPath(item.imagePath || "");
        showSnackbar("Item deleted");
      } catch (error) {
        console.error(error);
        setItems(previousItems);
        showSnackbar("Could not delete item", "error");
      } finally {
        setDeleting(false);
        setConfirmState({ open: false, kind: "", payload: null });
      }
      return;
    }

    if (confirmState.kind === "category") {
      const category = confirmState.payload;
      const linkedSubcategories = subcategories.filter(
        (subcategory) => subcategory.categoryId === category.id
      );
      const linkedSubcategoryIds = new Set(linkedSubcategories.map((entry) => entry.id));
      const linkedItems = items.filter(
        (item) =>
          item.categoryId === category.id || linkedSubcategoryIds.has(item.subcategoryId)
      );

      try {
        for (const item of linkedItems) {
          await removeItem(activeShopId, item.id);
          await removeItemImageByPath(item.imagePath || "");
        }

        for (const subcategory of linkedSubcategories) {
          await removeSubcategory(activeShopId, subcategory.id);
        }

        await removeCategory(activeShopId, category.id);

        setItems((current) =>
          current.filter(
            (item) =>
              item.categoryId !== category.id &&
              !linkedSubcategoryIds.has(item.subcategoryId)
          )
        );
        setSubcategories((current) =>
          current.filter((subcategory) => subcategory.categoryId !== category.id)
        );

        if (selectedCategoryId === category.id) {
          setSelectedCategoryId("");
        }
        showSnackbar("Category and related subcategories/items deleted");
      } catch (error) {
        console.error(error);
        showSnackbar("Could not delete category", "error");
      } finally {
        setDeleting(false);
        setConfirmState({ open: false, kind: "", payload: null });
      }
    }

    if (confirmState.kind === "subcategory") {
      const subcategory = confirmState.payload;
      const hasItems = items.some((item) => item.subcategoryId === subcategory.id);
      if (hasItems) {
        showSnackbar("Move or delete items before deleting this subcategory", "error");
        setDeleting(false);
        return;
      }

      try {
        await removeSubcategory(activeShopId, subcategory.id);
        showSnackbar("Subcategory deleted");
      } catch (error) {
        console.error(error);
        showSnackbar("Could not delete subcategory", "error");
      } finally {
        setDeleting(false);
        setConfirmState({ open: false, kind: "", payload: null });
      }
    }
  };

  const handleFormFieldChange = (field, value) => {
    setFormData((current) => {
      const next = { ...current, [field]: value };
      if (field === "categoryId" && current.categoryId !== value) {
        next.subcategoryId = "";
      }
      return next;
    });
  };

  const handleImageFileChange = (file) => {
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setFormData((current) => ({
      ...current,
      imageFile: file,
      imagePreview: preview,
    }));
  };

  const handleSubmitItem = async () => {
    if (!validateForm()) return;
    setSubmitting(true);

    let uploadedImageUrl = formData.imageUrl || "";
    let uploadedImagePath = formData.imagePath || "";

    try {
      if (formData.imageFile) {
        if (ENABLE_STORAGE_UPLOAD) {
          try {
            const uploadResult = await uploadItemImage(activeShopId, formData.imageFile);
            uploadedImageUrl = uploadResult.imageUrl;
            uploadedImagePath = uploadResult.imagePath;
          } catch (uploadError) {
            console.error("Storage upload failed, using inline fallback:", uploadError);
            uploadedImageUrl = await compressImageToDataUrl(formData.imageFile);
            uploadedImagePath = "";
            showSnackbar(
              "Storage upload failed, item saved with local image fallback",
              "warning"
            );
          }
        } else {
          uploadedImageUrl = await compressImageToDataUrl(formData.imageFile);
          uploadedImagePath = "";
        }

        if (dataUrlSizeBytes(uploadedImageUrl) > 700 * 1024) {
          showSnackbar("Image is too large. Please choose a smaller image.", "error");
          setSubmitting(false);
          return;
        }
      }

      const payload = {
        name: formData.name,
        price: formData.price,
        categoryId: formData.categoryId,
        subcategoryId: formData.subcategoryId,
        stockQty: formData.stockQty,
        stockUnit: formData.stockUnit,
        lowStockThreshold: formData.lowStockThreshold,
        imageUrl: uploadedImageUrl,
        imagePath: uploadedImagePath,
        code: formData.code,
      };

      if (drawerMode === "edit") {
        setItems((current) =>
          current.map((entry) =>
            entry.id === activeItemId
              ? {
                  ...entry,
                  ...payload,
                }
              : entry
          )
        );

        await updateItem(activeShopId, activeItemId, payload);
        if (formData.imageFile && formData.imagePath && formData.imagePath !== uploadedImagePath) {
          await removeItemImageByPath(formData.imagePath);
        }
        showSnackbar("Item updated");
      } else {
        const tempId = `temp-${Date.now()}`;
        setItems((current) => [
          {
            id: tempId,
            ...payload,
            createdAt: new Date().toISOString(),
          },
          ...current,
        ]);

        await createItem(activeShopId, payload);
        setItems((current) => current.filter((entry) => entry.id !== tempId));
        showSnackbar("Item added");
      }

      resetDrawerState();
    } catch (error) {
      console.error(error);
      showSnackbar("Could not save item", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Stack spacing={2.5}>
      <Paper
        sx={{
          p: { xs: 2, md: 2.75 },
          borderRadius: 3,
          border: "1px solid rgba(148,163,184,0.15)",
          background:
            "linear-gradient(115deg, rgba(255,255,255,0.98), rgba(239,246,255,0.95) 62%, rgba(236,253,245,0.92))",
        }}
      >
        <Typography variant="h5">Inventory Management</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Track stock with a fast, clean workflow designed for daily shop billing.
        </Typography>
      </Paper>

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Total Items
              </Typography>
              <Typography variant="h4" sx={{ mt: 0.5 }}>
                {items.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Total Categories
              </Typography>
              <Typography variant="h4" sx={{ mt: 0.5 }}>
                {categories.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Recently Added (7 days)
              </Typography>
              <Typography variant="h4" sx={{ mt: 0.5 }}>
                {recentCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper
        sx={{
          p: 2,
          borderRadius: 3,
          border: "1px solid rgba(148,163,184,0.15)",
        }}
      >
        <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} alignItems="stretch">
          <TextField
            size="small"
            label="Search items, code, category..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            sx={{ flex: 1 }}
          />
          <CategoryFilter
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={setSelectedCategoryId}
            onAddCategory={handleAddCategory}
            onUpdateCategory={handleUpdateCategory}
            onRequestDeleteCategory={handleCategoryDeleteRequest}
          />
          <SubcategoryManager
            categories={categories}
            subcategories={subcategories}
            selectedCategoryId={selectedCategoryId}
            onAddSubcategory={handleAddSubcategory}
            onUpdateSubcategory={handleUpdateSubcategory}
            onRequestDeleteSubcategory={handleSubcategoryDeleteRequest}
          />
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreateDrawer}>
            Add Item
          </Button>
        </Stack>
      </Paper>

      <ItemTable
        items={filteredItems}
        categoriesById={categoriesById}
        subcategoriesById={subcategoriesById}
        onEditItem={openEditDrawer}
        onDeleteItem={handleItemDeleteRequest}
      />

      <Paper
        sx={{
          p: 2,
          borderRadius: 3,
          border: "1px solid rgba(148,163,184,0.15)",
        }}
      >
        <Typography variant="subtitle1" fontWeight={700}>
          Recently Added Items
        </Typography>
        {recentItems.length ? (
          <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap", rowGap: 1 }}>
            {recentItems.map((entry) => (
              <Box
                key={entry.id}
                sx={{
                  px: 1.25,
                  py: 0.75,
                  borderRadius: 2,
                  border: "1px solid rgba(148,163,184,0.2)",
                  bgcolor: "rgba(248,250,252,0.9)",
                }}
              >
                <Typography variant="body2" fontWeight={600}>
                  {entry.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  ₹{Number(entry.price || 0).toFixed(2)}
                </Typography>
              </Box>
            ))}
          </Stack>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Start adding items to see recent activity here.
          </Typography>
        )}
      </Paper>

      <ItemDrawerForm
        open={drawerOpen}
        mode={drawerMode}
        loading={submitting}
        categories={categories}
        subcategories={subcategories}
        formData={formData}
        errors={formErrors}
        onClose={resetDrawerState}
        onFieldChange={handleFormFieldChange}
        onImageFileChange={handleImageFileChange}
        onSubmit={handleSubmitItem}
      />

      <ConfirmDialog
        open={confirmState.open}
        title="Are you sure?"
        message={
          confirmState.kind === "item"
            ? `Delete "${confirmState.payload?.name || "this item"}"?`
              : confirmState.kind === "subcategory"
                ? `Delete subcategory "${confirmState.payload?.name || ""}"?`
              : `Delete category "${confirmState.payload?.name || ""}" and all related subcategories/items?`
        }
        warningText={
          confirmState.kind === "category"
            ? "Warning: This will permanently delete the category, all related subcategories, and all related items. This action cannot be undone."
            : ""
        }
        loading={deleting}
        onCancel={() => setConfirmState({ open: false, kind: "", payload: null })}
        onConfirm={handleConfirmDelete}
        confirmText="Confirm"
      />
    </Stack>
  );
};

const InventoryPage = () => (
  <SnackbarProvider>
    <InventoryContent />
  </SnackbarProvider>
);

export default InventoryPage;
