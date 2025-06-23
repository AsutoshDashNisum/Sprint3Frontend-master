import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { toast } from 'react-toastify';

export default function AddProductModal({
  show,
  onClose,
  onSuccess,
  editMode = false,
  productToEdit = null,
}) {
  const [categories, setCategories] = useState([]);
  const [product, setProduct] = useState({
    name: '',
    sku: '',
    categoryName: '',
    size: '',
    price: '',
    discount: '',
  });

  useEffect(() => {
    if (show) {
      fetch('http://localhost:8080/api/categories/active')
        .then((res) => res.json())
        .then(setCategories)
        .catch(() => toast.error('Failed to load categories'));
    }
  }, [show]);

  useEffect(() => {
    if (editMode && productToEdit) {
      setProduct({ ...productToEdit });
    } else {
      setProduct({
        name: '',
        sku: '',
        categoryName: '',
        size: '',
        price: '',
        discount: '',
      });
    }
  }, [editMode, productToEdit, show]);

  const handleChange = (e) => {
    setProduct({ ...product, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (product.price < 0 || product.discount < 0) {
      toast.error('Price and Discount must be non-negative');
      return;
    }

    if (editMode && !window.confirm('Are you sure you want to update this product?')) return;

    const url = editMode
      ? `http://localhost:8080/api/products/${product.productID}`
      : 'http://localhost:8080/api/products';

    const method = editMode ? 'PUT' : 'POST';

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(() => {
        toast.success(editMode ? 'Product updated successfully!' : 'Product added successfully!');
        onSuccess();
        onClose();
      })
      .catch(() => toast.error('Error saving product'));
  };

  if (!show) return null;

  return (
    <Overlay>
      <StyledCard>
        <Close onClick={onClose}>×</Close>
        <h2>{editMode ? 'Edit Product' : 'Add Product'}</h2>
        <form onSubmit={handleSubmit}>
          <label>Product Name *</label>
          <input name="name" required value={product.name} onChange={handleChange} />

          <label>SKU *</label>
          <input name="sku" required value={product.sku} onChange={handleChange} />

          <label>Category *</label>
          <select name="categoryName" required value={product.categoryName} onChange={handleChange}>
            <option value="">Select Category</option>
            {categories.map((c) => (
              <option key={c.categoryID} value={c.categoryName}>
                {c.categoryName}
              </option>
            ))}
          </select>

          <label>Size *</label>
          <select name="size" required value={product.size} onChange={handleChange}>
            <option value="">Select Size</option>
            <option value="XS">XS</option>
            <option value="S">S</option>
            <option value="M">M</option>
            <option value="L">L</option>
            <option value="XL">XL</option>
          </select>

          <label>Price *</label>
          <input name="price" type="number" required value={product.price} onChange={handleChange} />

          <label>Discount (%) *</label>
          <input name="discount" type="number" required value={product.discount} onChange={handleChange} />

          <button type="submit">{editMode ? 'Update' : 'Save'}</button>
        </form>
      </StyledCard>
    </Overlay>
  );
}

// ✅ Final Style Block (Only Once!)
const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StyledCard = styled.div`
  position: relative;
  width: 400px;
  padding: 20px 25px;
  background-color: #111;
  color: white;
  border-radius: 10px;
  box-shadow: 0 0 20px rgba(100, 255, 255, 0.3);
  display: flex;
  flex-direction: column;
  gap: 10px;
  animation: scaleIn 0.3s ease;

  h2 {
    margin-top: 0;
    color: #00dbde;
    text-align: center;
  }

  form {
    display: flex;
    flex-direction: column;
  }

  label {
    font-weight: 600;
    margin-top: 8px;
  }

  input,
  select {
    margin-top: 4px;
    padding: 8px;
    border-radius: 4px;
    border: none;
    font-size: 15px;
  }

  button {
    margin-top: 20px;
    padding: 10px;
    font-size: 16px;
    background: linear-gradient(135deg, #fc00ff, #13ec1e);
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: 0.3s ease;
  }

  button:hover {
    opacity: 0.9;
  }

  @keyframes scaleIn {
    from {
      transform: scale(0.9);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }
`;

const Close = styled.button`
  position: absolute;
  top: 8px;
  right: 12px;
  background: transparent;
  color: white;
  font-size: 20px;
  border: none;
  cursor: pointer;
`;
