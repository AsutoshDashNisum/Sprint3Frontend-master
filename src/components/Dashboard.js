import React, { useEffect, useRef, useState } from "react";
import ProductTable from "./ProductTable";
import AddProductModal from "./AddProduct/AddProductModal";
import Loader from "./Loader";
import {
  Typography,
  Box,
  Paper,
  Alert,
  Divider,
  Modal,
  Snackbar,
  TextField,
  Pagination,
  MenuItem,
  Stack,
  Fade,
  Fab,
  Button,
} from "@mui/material";
import MuiAlert from "@mui/material/Alert";
import { styled } from "@mui/system";
import Lottie from "lottie-react";
import deleteAnim from "../animations/DeleteAnimation.json";
import * as XLSX from "xlsx";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

const PageWrapper = styled("div")(() => ({
  display: "flex",
  flexDirection: "column",
  minHeight: "100vh",
  background: "linear-gradient(135deg, #e3f0ff 0%, #fafcff 100%)",
}));

const MainContent = styled("main")({
  flex: 1,
  paddingBottom: "80px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: "0 8px 32px rgba(60,60,100,0.10)",
  maxWidth: 1100,
  width: "100%",
  paddingBottom: theme.spacing(12),
}));

const FixedFooter = styled("footer")({
  position: "fixed",
  bottom: 0,
  left: 0,
  right: 0,
  width: "100%",
  background: "linear-gradient(90deg, #1e2d3b 60%, #3a5068 100%)",
  color: "#fff",
  textAlign: "center",
  padding: "18px 0",
  fontSize: "15px",
  letterSpacing: 1,
  zIndex: 10,
  boxShadow: "0 -2px 16px rgba(30,45,59,0.10)",
});

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [error, setError] = useState(null);
  const [showDeleteAnimation, setShowDeleteAnimation] = useState(false);
  const [modalOrigin, setModalOrigin] = useState({ x: 0, y: 0 });
  const [snackBarOpen, setSnackBarOpen] = useState(false);
  const [snackBarMessage, setSnackBarMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");

  const handleSnackbarClose = () => setSnackBarOpen(false);
  const itemsPerPage = 4;
  const addButtonRef = useRef(null);

  useEffect(() => {
    loadProducts();
  }, []);
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterCategory, products.length]);

  const loadProducts = () => {
    setLoading(true);
    fetch("http://localhost:8080/api/products")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load products. Try again.");
        setLoading(false);
      });
  };

  const uniqueCategories = [...new Set(products.map((p) => p.categoryName).filter(Boolean))];

  const handleExport = () => {
    const ws = XLSX.utils.json_to_sheet(products);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Products");
    XLSX.writeFile(wb, "products.xlsx");
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const wb = XLSX.read(evt.target.result, { type: "binary" });
      const data = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
      fetch("http://localhost:8080/api/products/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then(() => loadProducts());
    };
    reader.readAsBinaryString(file);
  };

  const handleAddClick = () => {
    const rect = addButtonRef.current?.getBoundingClientRect() || { left: 0, top: 0 };
    setModalOrigin({ x: rect.left, y: rect.top });
    setEditMode(false);
    setSelectedProducts([]);
    setShowModal(true);
  };

  const handleEditClick = () => {
    if (selectedProducts.length === 1) {
      setEditMode(true);
      setShowModal(true);
    }
  };

  const handleDeleteClick = () => {
    if (selectedProducts.length === 0) return;
    if (!window.confirm("Delete selected product(s)?")) return;
    setShowDeleteAnimation(true);
    Promise.all(
      selectedProducts.map((p) =>
        fetch(`http://localhost:8080/api/products/sku/${p.sku}`, { method: "DELETE" })
      )
    )
      .then(() => {
        setTimeout(() => {
          setShowDeleteAnimation(false);
          loadProducts();
          setSelectedProducts([]);
        }, 1200);
      })
      .catch(() => {
        setShowDeleteAnimation(false);
        setSnackBarMessage("Failed to delete product(s)");
        setSnackBarOpen(true);
      });
  };

  const filteredProducts = products.filter((product) => {
    const matchQuery =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.categoryName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = filterCategory
      ? product.categoryName.toLowerCase() === filterCategory.toLowerCase()
      : true;
    return matchQuery && matchCategory;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (!sortField) return 0;
    const aVal = a[sortField];
    const bVal = b[sortField];
    return typeof aVal === "string"
      ? sortOrder === "asc"
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal)
      : sortOrder === "asc"
      ? aVal - bVal
      : bVal - aVal;
  });

  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  const paginatedProducts = sortedProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <PageWrapper>
      <MainContent>
        <StyledPaper elevation={4}>
          <Typography
            variant="h4"
            align="center"
            sx={{ fontWeight: "bold", letterSpacing: 2, mb: 3, color: "#1e2d3b" }}
          >
            CATALOG DASHBOARD
          </Typography>

          {error && (
            <Fade in={!!error}>
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            </Fade>
          )}

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            mb={3}
            justifyContent="space-between"
            alignItems="center"
          >
            <Stack direction="row" spacing={2}>
              <TextField
                size="small"
                label="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ minWidth: 200, background: "#fff" }}
              />
              <TextField
                select
                label="Category"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                sx={{ minWidth: 200, background: "#fff" }}
                size="small"
              >
                <MenuItem value="">All</MenuItem>
                {uniqueCategories.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
            <Stack direction="row" spacing={2} alignItems="center">
              <label htmlFor="import-file">
                <input
                  id="import-file"
                  type="file"
                  accept=".xlsx, .xls"
                  hidden
                  onChange={handleImport}
                />
                <Button
                  variant="outlined"
                  component="span"
                  sx={{ textTransform: "none", fontWeight: 500 }}
                >
                  IMPORT EXCEL
                </Button>
              </label>
              <Button
                variant="outlined"
                color="primary"
                onClick={handleExport}
                sx={{ textTransform: "none", fontWeight: 500 }}
              >
                EXPORT TO EXCEL
              </Button>
            </Stack>
          </Stack>

          <Divider sx={{ my: 2 }} />

          {loading ? (
            <Box display="flex" alignItems="center" justifyContent="center" minHeight={240}>
              <Loader />
            </Box>
          ) : paginatedProducts.length === 0 ? (
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              minHeight={180}
              sx={{ color: "#bbb" }}
            >
              <Typography variant="h6" sx={{ mb: 1 }}>
                No products found.
              </Typography>
              <Typography variant="body2">Try adjusting your search or filters.</Typography>
            </Box>
          ) : (
            <>
              <ProductTable
                products={paginatedProducts}
                selectedProducts={selectedProducts}
                onSelect={(product) =>
                  setSelectedProducts((prev) =>
                    prev.find((p) => p.sku === product.sku)
                      ? prev.filter((p) => p.sku !== product.sku)
                      : [...prev, product]
                  )
                }
                onSelectAll={(visibleProducts) => {
                  const allSelected = visibleProducts.every((p) =>
                    selectedProducts.some((sp) => sp.sku === p.sku)
                  );
                  if (allSelected) {
                    setSelectedProducts((prev) =>
                      prev.filter((p) => !visibleProducts.some((vp) => vp.sku === p.sku))
                    );
                  } else {
                    const newSelections = visibleProducts.filter(
                      (p) => !selectedProducts.find((sp) => sp.sku === p.sku)
                    );
                    setSelectedProducts((prev) => [...prev, ...newSelections]);
                  }
                }}
                onSort={(field) => {
                  if (sortField === field) {
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                  } else {
                    setSortField(field);
                    setSortOrder("asc");
                  }
                }}
                sortField={sortField}
                sortOrder={sortOrder}
              />
              <Box mt={3} display="flex" justifyContent="center">
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={(_, value) => setCurrentPage(value)}
                  color="primary"
                  shape="rounded"
                  size="large"
                />
              </Box>
            </>
          )}

          <AddProductModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            product={editMode ? selectedProducts[0] : null}
            origin={modalOrigin}
            onSave={(data) => {
              const product = {
                name: data.name,
                sku: data.sku,
                categoryName: data.category,
                size: data.size,
                price: parseFloat(data.price),
                discount: parseInt(data.discount),
                discountPrice: parseFloat(data.price) * (1 - parseInt(data.discount) / 100),
              };
              const url = editMode
                ? `http://localhost:8080/api/products/sku/${selectedProducts[0].sku}`
                : "http://localhost:8080/api/products";
              fetch(url, {
                method: editMode ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(product),
              })
                .then((res) => {
                  if (!res.ok) throw new Error("Failed to save product");
                  return res.json();
                })
                .then(() => {
                  setShowModal(false);
                  loadProducts();
                  setSelectedProducts([]);
                })
                .catch((err) => {
                  setSnackBarMessage(err.message || "Error saving product");
                  setSnackBarOpen(true);
                });
            }}
          />
        </StyledPaper>

        <Fab
          color="primary"
          aria-label="add"
          sx={{ position: "fixed", bottom: 90, right: 40 }}
          onClick={handleAddClick}
          ref={addButtonRef}
        >
          <AddIcon />
        </Fab>
        <Fab
          color="secondary"
          aria-label="edit"
          sx={{ position: "fixed", bottom: 160, right: 40 }}
          onClick={handleEditClick}
          disabled={selectedProducts.length !== 1}
        >
          <EditIcon />
        </Fab>
        <Fab
          color="error"
          aria-label="delete"
          sx={{ position: "fixed", bottom: 230, right: 40 }}
          onClick={handleDeleteClick}
          disabled={selectedProducts.length === 0}
        >
          <DeleteIcon />
        </Fab>
      </MainContent>

      <FixedFooter>
        © 2025 ASCEND Catalog Management System | Powered by Nisum
      </FixedFooter>

      <Modal
        open={showDeleteAnimation}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backdropFilter: "blur(2px)",
        }}
      >
        <Box
          sx={{
            width: 260,
            textAlign: "center",
            bgcolor: "white",
            p: 3,
            borderRadius: 3,
            boxShadow: 4,
          }}
        >
          <Lottie animationData={deleteAnim} loop={false} />
          <Typography fontWeight="bold" color="error">
            Deleting...
          </Typography>
        </Box>
      </Modal>

      <Snackbar
        open={snackBarOpen}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <MuiAlert
          onClose={handleSnackbarClose}
          severity="error"
          sx={{ width: "100%" }}
          elevation={6}
          variant="filled"
        >
          {snackBarMessage}
        </MuiAlert>
      </Snackbar>
    </PageWrapper>
  );
}
