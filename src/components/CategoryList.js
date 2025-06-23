import React, { useEffect, useState } from 'react';

export default function CategoryList() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetch('http://localhost:8080/api/categories/active')
      .then(response => response.json())
      .then(data => setCategories(data))
      .catch(err => console.error('Error:', err));
  }, []);

  return (
    <div>
      <h2>Active Categories</h2>
      <ul>
        {categories.map(cat => (
          <li key={cat.categoryID}>{cat.categoryName}</li>
        ))}
      </ul>
    </div>
  );
}
