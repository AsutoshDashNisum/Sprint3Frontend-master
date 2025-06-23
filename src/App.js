import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import CategoryList from './components/CategoryList';
import Promotions from './components/Promotions';
import Loader from './components/Loader';
import Sidebar from './components/Sidebar';
import AddProductModal from './components/AddProduct/AddProductModal';
import Navbar from './components/Navbar';
import './index.css';

function AppContent() {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSave = (productData) => {
    console.log('Product Saved:', productData);
    setIsModalOpen(false);
  };

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, [location]);

  return (
    <>
      <Navbar /> {/* Add Navbar here */}
      {loading && <Loader />}
      <div className="app-layout">
        <Sidebar />
        <div className="main-content">
          <AddProductModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onSave={handleSave}
          />

          {!loading && (
            <Routes>
              <Route path="/" element={<Dashboard onAddProductClick={handleOpenModal} />} />
              <Route path="/categories" element={<CategoryList />} />
              <Route path="/promotions" element={<Promotions />} />
            </Routes>
          )}
        </div>
      </div>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
