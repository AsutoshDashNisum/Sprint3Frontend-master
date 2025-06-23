import React from 'react';
import './Navbar.css'; // External CSS for styling
import { FaUserCircle } from 'react-icons/fa'; // You need to install react-icons

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-left">
        {/* <h1 className="logo">Nisum</h1> */}
      </div>
      <div className="navbar-right">
        <div className="user-menu">
          <FaUserCircle size={28} className="user-icon" />
          <div className="dropdown">
            <ul>
              <li>User</li>
              <li>Admin</li>
              <li>More</li>
              <li>Settings</li>
              <li>Dashboard</li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
