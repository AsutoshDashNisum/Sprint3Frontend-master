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
} from "@mui/material";
import { styled } from "@mui/system";
import Lottie from "lottie-react";
import deleteAnim from "../animations/DeleteAnimation.json";

const PageWrapper = styled("div")({
  display: "flex",
  flexDirection: "column",
  minHeight: "100vh",
  backgroundColor: "#edf1f5",
  overflowX: "hidden",
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
  zIndex: 1300,
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
          alert(err.message);
        });
    }
  };

  return (
    <PageWrapper>
      <MainContent>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Box mb={3} textAlign="center">
              <Typography
                variant="h4"
                component="h1"
                gutterBottom
                sx={{ letterSpacing: 5, fontWeight: "bold" }}
              >
                CATALOG DASHBOARD
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Box display="flex" gap={2} mb={2}>
              <Button
                ref={addButtonRef}
                variant="contained"
                color="success"
                onClick={handleAddClick}
                sx={{ fontWeight: "bold" }}
              >
                ADD PRODUCT
              </Button>

              <Button
                variant="contained"
                color="warning"
                disabled={selectedProducts.length !== 1}
                onClick={handleEditClick}
              >
                Edit
              </Button>

              <Button
                variant="contained"
                color="error"
                disabled={selectedProducts.length === 0}
                onClick={handleDeleteClick}
              >
                Delete
              </Button>
            </Box>

            <Divider sx={{ my: 2 }} />

            {loading ? (
              <Loader />
            ) : (
              <>
                <ProductTable
                  products={products}
                  selectedProducts={selectedProducts}
                  onSelect={(product) => {
                    setSelectedProducts((prev) => {
                      const exists = prev.find((p) => p.sku === product.sku);
                      return exists
                        ? prev.filter((p) => p.sku !== product.sku)
                        : [...prev, product];
                    });
                  }}
                />

                <AddProductModal
                  isOpen={showModal}
                  onClose={() => setShowModal(false)}
                  product={editMode ? selectedProducts[0] : null}
                  origin={modalOrigin}
                  onSave={(data) => {
                    const newProduct = {
                      name: data.name,
                      sku: data.sku,
                      categoryName: data.category,
                      size: data.size,
                      price: parseFloat(data.price),
                      discount: parseInt(data.discount),
                      discountPrice:
                        parseFloat(data.price) *
                        (1 - parseInt(data.discount) / 100),
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
                        if (!res.ok)
                          throw new Error("Failed to save product");
                        return res.json();
                      })
                      .then(() => {
                        setShowModal(false);
                        loadProducts();
                        setSelectedProducts([]);
                      })
                      .catch((err) => alert(err.message));
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
        sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <Box sx={{ width: 250, textAlign: "center", bgcolor: "white", p: 2, borderRadius: 2 }}>
          <Lottie animationData={deleteAnim} loop={false} />
          <Typography fontWeight="bold">Deleting...</Typography>
        </Box>
      </Modal>
    </PageWrapper>
  );
}
