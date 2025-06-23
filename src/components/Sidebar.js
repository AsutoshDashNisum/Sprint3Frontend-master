import React from 'react';
import './Sidebar.css';

export default function Sidebar() {
  return (
    <div className="sidebar">
<img
  src="https://www.nisum.com/hs-fs/hubfs/WP3%20-%20Home%20Page/wp3-%20%20business%20agility/Nisum-gif.gif?width=200&height=200&name=Nisum-gif.gif"
  alt="Nisum Logo"
  className="logo"
/>

      <h2>CATALOG<br />MANAGEMENT</h2>
      <nav>
        <a href="/">Catalog Dashboard</a>
        <a href="/add-category">Add Category</a>
        <a href="/promotions">Create Promo Code</a>
      </nav>
    </div>
  );
}
