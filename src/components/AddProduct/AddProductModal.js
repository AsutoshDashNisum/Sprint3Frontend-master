import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

const AddProductModal = ({ isOpen, onClose, onSave, product }) => {
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    size: '',
    price: '',
    discount: '',
  });

  useEffect(() => {
    if (product) {
      setFormData(product);
    } else {
      setFormData({
        name: '',
        sku: '',
        category: '',
        size: '',
        price: '',
        discount: '',
      });
    }
  }, [product]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'auto';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const getSizeOptions = () => {
    switch (formData.category) {
      case 'Footwear':
        return ['6', '7', '8', '9', '10'];
      case 'Men':
      case 'Women':
      case 'Kids':
        return ['S', 'M', 'L', 'XL'];
      default:
        return [];
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Overlay
          as={motion.div}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={(e) => {
            if (e.target.id === 'modal-overlay') onClose();
          }}
          id="modal-overlay"
        >
          <StyledCard
            as={motion.div}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.7, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
          >
            <Close onClick={onClose}>&times;</Close>
            <h2>{product ? 'Edit' : 'Add'} Product</h2>
            <form onSubmit={handleSubmit}>
              <InputWrapper>
                <label>Product Name *</label>
                <input name="name" value={formData.name} onChange={handleChange} required />
              </InputWrapper>
              <InputWrapper>
                <label>SKU *</label>
                <input name="sku" value={formData.sku} onChange={handleChange} required />
              </InputWrapper>
              <InputWrapper>
                <label>Category *</label>
                <select name="category" value={formData.category} onChange={handleChange} required>
                  <option value="">Select Category</option>
                  <option value="Men">Men</option>
                  <option value="Women">Women</option>
                  <option value="Kids">Kids</option>
                  <option value="Footwear">Footwear</option>
                </select>
              </InputWrapper>
              <InputWrapper>
                <label>Size *</label>
                <select name="size" value={formData.size} onChange={handleChange} required>
                  <option value="">Select Size</option>
                  {getSizeOptions().map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </InputWrapper>
              <InputWrapper>
                <label>Price *</label>
                <input type="number" name="price" value={formData.price} onChange={handleChange} required />
              </InputWrapper>
              <InputWrapper>
                <label>Discount (%) *</label>
                <input type="number" name="discount" value={formData.discount} onChange={handleChange} required />
              </InputWrapper>
              <ButtonGroup>
                <SaveButton type="submit">Save</SaveButton>
              </ButtonGroup>
            </form>
          </StyledCard>
        </Overlay>
      )}
    </AnimatePresence>
  );
};

export default AddProductModal;

// Styled Components
const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const StyledCard = styled.div`
  background: #fff;
  padding: 2rem;
  border-radius: 16px;
  width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
`;

const Close = styled.button`
  position: absolute;
  top: 12px;
  right: 14px;
  background: transparent;
  border: none;
  font-size: 1.6rem;
  cursor: pointer;
`;

const InputWrapper = styled.div`
  margin-bottom: 1.2rem;
  display: flex;
  flex-direction: column;

  label {
    margin-bottom: 0.4rem;
    font-weight: 600;
  }

  input,
  select {
    padding: 0.6rem;
    border: 1px solid #ccc;
    border-radius: 8px;
    font-size: 1rem;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: center;
`;

const SaveButton = styled.button`
  background: #28a745;
  color: white;
  border: none;
  padding: 0.8rem 1.6rem;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;

  &:hover {
    background: #1e7e34;
  }
`;
