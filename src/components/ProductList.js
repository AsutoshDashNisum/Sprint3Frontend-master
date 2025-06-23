import React, { useState, useEffect } from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  TablePagination,
  Box,
  Alert,
  Checkbox,
} from "@mui/material";

export default function ProductList({ onSelect }) {
  const [products, setProducts] = useState([]); // fetched products
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [error, setError] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8080/api/products")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Network response was not ok");
        }
        return res.json();
      })
      .then((data) => {
        setProducts(data);
      })
      .catch((err) => {
        console.error("Failed to fetch products:", err);
        setError("Failed to load products. Please try again.");
      });
  }, []);

  // Handle pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Toggle checkbox for a single product
  const handleToggleSelect = (product) => {
    const alreadySelected = selectedProducts.some(
      (p) => p.productID === product.productID
    );
    let newSelected;
    if (alreadySelected) {
      newSelected = selectedProducts.filter(
        (p) => p.productID !== product.productID
      );
    } else {
      newSelected = [...selectedProducts, product];
    }
    setSelectedProducts(newSelected);
    if (onSelect) onSelect(newSelected);
  };

  // Check if product is selected
  const isSelected = (product) =>
    selectedProducts.some((p) => p.productID === product.productID);

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Product List
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox"></TableCell>
              <TableCell>Name</TableCell>
              <TableCell>SKU</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Size</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Discount</TableCell>
              <TableCell>Discount Price</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((p) => {
                const selected = isSelected(p);
                return (
                  <TableRow
                    key={p.productID}
                    hover
                    selected={selected}
                    sx={{ cursor: "pointer" }}
                    onClick={() => handleToggleSelect(p)} // toggle on row click too
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selected}
                        onChange={() => handleToggleSelect(p)}
                        onClick={(e) => e.stopPropagation()} // prevent row click triggering twice
                      />
                    </TableCell>
                    <TableCell>{p.name}</TableCell>
                    <TableCell>{p.sku}</TableCell>
                    <TableCell>{p.categoryName}</TableCell>
                    <TableCell>{p.size}</TableCell>
                    <TableCell>{p.price}</TableCell>
                    <TableCell>{p.discount}%</TableCell>
                    <TableCell>{p.discountPrice}</TableCell>
                    <TableCell>{p.status}</TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={products.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>
    </Box>
  );
}
