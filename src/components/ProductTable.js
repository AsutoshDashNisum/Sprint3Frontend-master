import React from "react";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Checkbox,
  TableContainer,
  Paper,
  Tooltip,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";

// Colors
const primaryColor = "#1e88e5";
const headerTextColor = "#000000";
const ascColor = "#4caf50"; // green
const descColor = "#f44336"; // red

// Glassmorphic Container
const GlassTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: 18,
  background: "rgba(255,255,255,0.82)",
  boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.13)",
  backdropFilter: "blur(10px)",
  border: "1.5px solid rgba(200,200,200,0.18)",
  marginBottom: theme.spacing(2),
  overflow: "hidden",
}));

const HighlightRow = styled(TableRow)(({ selected }) => ({
  transition: "background 0.2s, box-shadow 0.18s, transform 0.18s",
  background:
    selected === "true"
      ? "linear-gradient(90deg, #e0e0e0 0%, #f5f5f5 100%)"
      : "transparent",
  "&:hover": {
    background:
      selected === "true"
        ? "linear-gradient(90deg, #e0e0e0 0%, #eeeeee 100%)"
        : "rgba(120,120,120,0.08)",
    boxShadow: "0 2px 16px 0 rgba(100,100,100,0.08)",
    transform: "scale(1.008)",
  },
}));

const StyledTableCell = styled(TableCell)(() => ({
  fontWeight: 500,
  fontSize: 15,
  borderBottom: "none",
  transition: "background 0.18s",
  "&:hover": {
    background: "rgba(120,120,120,0.06)",
  },
  whiteSpace: "normal",
  wordBreak: "break-word",
}));

export default function ProductTable({
  products,
  selectedProducts,
  onSelect,
  onSelectAll,
  onSort,
  sortField,
  sortOrder,
}) {
  const isSelected = (sku) =>
    selectedProducts.find((p) => p.sku === sku) !== undefined;

  const allSelected =
    products.length > 0 &&
    products.every((p) => selectedProducts.some((sp) => sp.sku === p.sku));

  const someSelected =
    products.some((p) => selectedProducts.some((sp) => sp.sku === p.sku)) &&
    !allSelected;

  const columns = [
    { id: "sku", label: "SKU" },
    { id: "name", label: "Name" },
    { id: "categoryName", label: "Category" },
    { id: "size", label: "Size" },
    { id: "price", label: "Price" },
    { id: "discount", label: "Discount (%)" },
    { id: "discountPrice", label: "Final Price" },
  ];

  return (
    <GlassTableContainer component={Paper} elevation={0}>
      <Table stickyHeader sx={{ tableLayout: "fixed", width: "100%" }}>
        <TableHead>
          <TableRow
            sx={{
              backgroundColor: "#b0b0b0",
              position: "sticky",
              top: 0,
              zIndex: 2,
            }}
          >
            <TableCell padding="checkbox">
              <Checkbox
                color="default"
                checked={allSelected}
                indeterminate={someSelected}
                onChange={() => onSelectAll(products)}
                sx={{
                  color: primaryColor,
                  "&.Mui-checked": { color: primaryColor },
                }}
              />
            </TableCell>
            {columns.map((col) => {
              const isActiveSort = sortField === col.id;
              const activeColor =
                sortOrder === "asc" ? ascColor : descColor;

              return (
                <StyledTableCell
                  key={col.id}
                  align="left"
                  onClick={() => onSort(col.id)}
                  sx={{
                    cursor: "pointer",
                    userSelect: "none",
                    transition: "color 0.2s",
                  }}
                >
                  <Tooltip title={`Sort by ${col.label}`} arrow>
                    <Typography
                      variant="h6"
                      component="span"
                      fontWeight="bold"
                      sx={{
                        color: isActiveSort ? activeColor : headerTextColor,
                        letterSpacing: 0.5,
                      }}
                    >
                      {col.label}
                    </Typography>
                  </Tooltip>
                </StyledTableCell>
              );
            })}
          </TableRow>
        </TableHead>
        <TableBody>
          {products.map((product) => (
            <HighlightRow
              key={product.sku}
              selected={isSelected(product.sku) ? "true" : "false"}
            >
              <StyledTableCell padding="checkbox">
                <Checkbox
                  checked={isSelected(product.sku)}
                  onChange={() => onSelect(product)}
                  color="default"
                  sx={{ "&.Mui-checked": { color: primaryColor } }}
                />
              </StyledTableCell>
              <StyledTableCell>{product.sku}</StyledTableCell>
              <StyledTableCell>{product.name}</StyledTableCell>
              <StyledTableCell>{product.categoryName}</StyledTableCell>
              <StyledTableCell>{product.size}</StyledTableCell>
              <StyledTableCell>
                ₹{Number(product.price).toFixed(2)}
              </StyledTableCell>
              <StyledTableCell>{product.discount}%</StyledTableCell>
              <StyledTableCell>
                ₹{Number(product.discountPrice).toFixed(2)}
              </StyledTableCell>
            </HighlightRow>
          ))}
        </TableBody>
      </Table>
    </GlassTableContainer>
  );
}
