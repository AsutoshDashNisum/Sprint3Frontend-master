import React from 'react';

export default function ProductTable({ products, selectedProducts = [], onSelect }) {
  const isSelected = (sku) => selectedProducts.some((p) => p.sku === sku);

  const handleSelectAll = (e) => {
    if (typeof onSelect === 'function') {
      products.forEach((product) => {
        const selected = isSelected(product.sku);
        const shouldSelect = e.target.checked;

        if (shouldSelect && !selected) onSelect(product);
        if (!shouldSelect && selected) onSelect(product);
      });
    }
  };

  return (
    <table>
      <thead>
        <tr>
          <th>
            <input
              type="checkbox"
              onChange={handleSelectAll}
              checked={products.length > 0 && products.every((p) => isSelected(p.sku))}
              indeterminate={
                products.some((p) => isSelected(p.sku)) &&
                !products.every((p) => isSelected(p.sku))
              }
            />
          </th>
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
        {products.map((p) => (
          <tr key={p.productID}>
            <td>
              <input
                type="checkbox"
                checked={isSelected(p.sku)}
                onChange={() => onSelect?.(p)}
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
