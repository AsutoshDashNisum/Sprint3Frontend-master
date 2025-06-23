import React from 'react';

export default function ProductTable({ products, onSelect }) {
  return (
    <table>
      <thead>
        <tr>
          <th>Select</th>
          <th>Category</th>
          <th>Product</th>
          <th>SKU</th>
          <th>Size</th>
          <th>Price (₹)</th>
          <th>Discount (%)</th>
          <th>Discounted Price (₹)</th>
        </tr>
      </thead>
      <tbody>
        {products.map(p => (
          <tr key={p.productID}>
            <td>
              <input
                type="checkbox"
                onChange={() => {
                  if (typeof onSelect === 'function') {
                    onSelect(p);
                  } else {
                    console.warn("onSelect is not a function");
                  }
                }}
              />
            </td>
            <td>{p.categoryName}</td>
            <td>{p.name}</td>
            <td>{p.sku}</td>
            <td>{p.size}</td>
            <td>₹{p.price}</td>
            <td>{p.discount}</td>
            <td>₹{p.discountPrice}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
