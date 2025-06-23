import React, { useState } from 'react';

export default function AddProduct() {
  const [product, setProduct] = useState({
    name: '',
    sku: '',
    categoryName: '',
    size: '',
    price: '',
    discount: '',
    discountPrice: ''
  });

  const handleChange = e => {
    setProduct({ ...product, [e.target.name]: e.target.value });
  };

  const handleSubmit = e => {
    e.preventDefault();

    fetch('http://localhost:8080/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product)
    })
      .then(response => {
        if (!response.ok) throw new Error('Failed to add product');
        return response.json();
      })
      .then(() => alert('Product added successfully!'))
      .catch(() => alert('Error adding product'));
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Add Product</h2>
      <input name="name" placeholder="Name" value={product.name} onChange={handleChange} required /><br />
      <input name="sku" placeholder="SKU" value={product.sku} onChange={handleChange} required /><br />
      <input name="categoryName" placeholder="Category Name" value={product.categoryName} onChange={handleChange} required /><br />
      <input name="size" placeholder="Size" value={product.size} onChange={handleChange} /><br />
      <input name="price" type="number" placeholder="Price" value={product.price} onChange={handleChange} required /><br />
      <input name="discount" type="number" placeholder="Discount (%)" value={product.discount} onChange={handleChange} /><br />
      <input name="discountPrice" type="number" placeholder="Discount Price" value={product.discountPrice} onChange={handleChange} /><br />
      <button type="submit">Add Product</button>
    </form>
  );
}
