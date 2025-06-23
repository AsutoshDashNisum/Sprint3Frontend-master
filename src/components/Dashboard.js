import React, { useEffect, useRef, useState } from "react";
import ProductTable from "./ProductTable";
import AddProductModal from "./AddProduct/AddProductModal";
import Loader from "./Loader";
import {
  Button,
  Container,
  Typography,
  Box,
  Paper,
  Alert,
  Divider,
  Modal,
  Snackbar,
  TextField,
  Pagination,
} from "@mui/material";
import MuiAlert from "@mui/material/Alert";
import { styled } from "@mui/system";
import Lottie from "lottie-react";
import deleteAnim from "../animations/DeleteAnimation.json";
import * as XLSX from "xlsx";

const PageWrapper = styled("div")({
  display: "flex",
  flexDirection: "column",
  minHeight: "100vh",
  backgroundColor: "#edf1f5",
  overflow: "hidden",
});

const MainContent = styled("div")({
  flex: 1,
  paddingBottom: "80px",
});

const FixedFooter = styled("footer")({
  position: "fixed",
  bottom: 0,
  left: 0,
  right: 0,
  width: "100%",
  backgroundColor: "#1e2d3b",
  color: "#fff",
  textAlign: "center",
  padding: "16px",
  fontSize: "14px",
  zIndex: 10,
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
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");

  const itemsPerPage = 4;
  const addButtonRef = useRef(null);

  const loadProducts = () => {
    setLoading(true);
    setError(null);
    fetch("http://localhost:8080/api/products")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching products:", err);
        setLoading(false);
        setError("Failed to load products. Please try again.");
      });
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleExport = () => {
    const worksheet = XLSX.utils.json_to_sheet(products);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Products");
    XLSX.writeFile(workbook, "products.xlsx");
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        fetch("http://localhost:8080/api/products/bulk", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        })
          .then((res) => res.json())
          .then(() => loadProducts());
      };
      reader.readAsBinaryString(file);
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const handleAddClick = () => {
    const rect = addButtonRef.current.getBoundingClientRect();
    const originX = rect.left + rect.width / 2 - window.innerWidth / 2;
    const originY = rect.top + rect.height / 2 - window.innerHeight / 2;
    setModalOrigin({ x: originX, y: originY });
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
    if (window.confirm("Delete selected product(s)?")) {
      setShowDeleteAnimation(true);
      Promise.all(
        selectedProducts.map((p) =>
          fetch(
            `http://localhost:8080/api/products/sku/${encodeURIComponent(p.sku)}`,
            { method: "DELETE" }
          )
        )
      )
        .then((responses) => {
          if (responses.some((res) => !res.ok))
            throw new Error("Failed to delete some products");
          setTimeout(() => {
            setShowDeleteAnimation(false);
            setSelectedProducts([]);
            loadProducts();
          }, 2000);
        })
        .catch((err) => {
          setShowDeleteAnimation(false);
          setSnackBarMessage(err.message || "Something went wrong");
          setSnackBarOpen(true);
        });
    }
  };

  const handleSnackbarClose = () => setSnackBarOpen(false);

  const handlePageChange = (event, value) => setCurrentPage(value);

  const filteredProducts = products.filter((product) => {
    const name = (product.name || "").toLowerCase();
    const sku = (product.sku || "").toLowerCase();
    const category = (product.categoryName || "").toLowerCase();
    const query = searchQuery.toLowerCase();
    return name.includes(query) || sku.includes(query) || category.includes(query);
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (!sortField) return 0;
    const valA = new Date(a[sortField]);
    const valB = new Date(b[sortField]);
    return sortOrder === "asc" ? valA - valB : valB - valA;
  });

  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  const paginatedProducts = sortedProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <PageWrapper>
      <MainContent>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Box mb={3} textAlign="center">
              <Typography variant="h4" gutterBottom sx={{ letterSpacing: 5, fontWeight: "bold" }}>
                CATALOG DASHBOARD
              </Typography>
            </Box>

            {error && <Alert severity="error">{error}</Alert>}

            <TextField
              fullWidth
              label="Search by Name, SKU, or Category"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              sx={{ mb: 2 }}
            />

            <Box display="flex" gap={2} mb={2}>
              <Button ref={addButtonRef} variant="contained" color="success" onClick={handleAddClick}>
                ADD PRODUCT
              </Button>
              <Button variant="contained" color="warning" disabled={selectedProducts.length !== 1} onClick={handleEditClick}>
                Edit
              </Button>
              <Button variant="contained" color="error" disabled={selectedProducts.length === 0} onClick={handleDeleteClick}>
                Delete
              </Button>
            </Box>

            <Divider sx={{ my: 2 }} />

            {loading ? (
              <Loader />
            ) : (
              <>
                <ProductTable
                  products={paginatedProducts}
                  selectedProducts={selectedProducts}
                  onSelect={(product) => {
                    setSelectedProducts((prev) => {
                      const exists = prev.find((p) => p.sku === product.sku);
                      return exists ? prev.filter((p) => p.sku !== product.sku) : [...prev, product];
                    });
                  }}
                  onSort={handleSort}
                  sortField={sortField}
                  sortOrder={sortOrder}
                />

                <Box mt={3} display="flex" justifyContent="center">
                  <Pagination count={totalPages} page={currentPage} onChange={handlePageChange} color="primary" />
                </Box>

                <Box mt={3} display="flex" justifyContent="center" gap={2}>
                  <Button variant="outlined" component="label">
                    Import Excel
                    <input hidden type="file" accept=".xlsx, .xls" onChange={handleImport} />
                  </Button>
                  <Button variant="outlined" onClick={handleExport}>Export to Excel</Button>
                </Box>

                <AddProductModal
                  isOpen={showModal}
                  onClose={() => setShowModal(false)}
                  product={editMode ? selectedProducts[0] : null}
                  origin={modalOrigin}
                  sx={{ width: 400, mx: "auto" }}
                  onSave={(data) => {
                    const newProduct = {
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
                      body: JSON.stringify(newProduct),
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
              </>
            )}
          </Paper>
        </Container>
      </MainContent>

      <FixedFooter>
        © 2025 ASCEND Catalog Management System | Powered by Nisum
      </FixedFooter>

      <Modal
        open={showDeleteAnimation}
        sx={{ display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1500 }}
      >
        <Box sx={{ width: 250, textAlign: "center", bgcolor: "white", p: 2, borderRadius: 2 }}>
          <Lottie animationData={deleteAnim} loop={false} />
          <Typography fontWeight="bold">Deleting...</Typography>
        </Box>
      </Modal>

      <Snackbar
        open={snackBarOpen}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <MuiAlert onClose={handleSnackbarClose} severity="error" sx={{ width: "100%" }} elevation={6} variant="filled">
          {snackBarMessage}
        </MuiAlert>
      </Snackbar>
    </PageWrapper>
  );
}
