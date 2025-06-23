// src/components/Footer.js
import React from 'react';
import { Box } from '@mui/material';

const Footer = () => {
  return (
    <Box component="footer" sx={{ mt: 4, textAlign: 'center', py: 2, color: '#999' }}>
      © {new Date().getFullYear()} ASCEND Catalog Management System | Powered by Nisum 
    </Box>
  );
};

export default Footer;
