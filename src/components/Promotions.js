import React, { useEffect, useState, useRef } from 'react';
import {
  Container, Typography, TextField, MenuItem, Button,
  Grid, Table, TableHead, TableRow, TableCell,
  TableBody, Paper, Alert, Box, Divider, Checkbox, Modal
} from '@mui/material';
import { styled } from '@mui/system';
import Lottie from 'lottie-react';
import { motion, AnimatePresence } from 'framer-motion';
import deleteAnim from '../animations/DeleteAnimation.json';
import CloseIcon from '@mui/icons-material/Close';

const PageWrapper = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
  backgroundColor: '#edf1f5',
});

const MainContent = styled('div')({
  flex: 1,
  paddingBottom: '80px',
});

const FixedFooter = styled('footer')({
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  width: '100%',
  backgroundColor: '#1e2d3b',
  color: '#fff',
  textAlign: 'center',
  padding: '16px',
  fontSize: '14px',
  zIndex: 1300,
});

const PromoModalCard = styled(motion.div)`
  background: white;
  padding: 2rem;
  border-radius: 16px;
  width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
`;

const CloseButton = styled(CloseIcon)`
  position: absolute;
  top: 12px;
  right: 12px;
  cursor: pointer;
`;

export default function Promotions() {
  const [promotions, setPromotions] = useState([]);
  const [formData, setFormData] = useState({
    promoCode: '',
    promoType: '',
    description: '',
    promoAmount: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPromos, setSelectedPromos] = useState([]);
  const [showDeleteAnimation, setShowDeleteAnimation] = useState(false);
  const [origin, setOrigin] = useState({ top: 0, left: 0 });
  const addButtonRef = useRef();

  const promoTypes = [
    { id: "Cashback", label: "Cashback" },
    { id: "Discount", label: "Discount" }
  ];

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = () => {
    fetch('http://localhost:8080/api/promotions')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch promotions');
        return res.json();
      })
      .then(data => {
        setPromotions(data);
        setError(null);
      })
      .catch(err => {
        console.error('❌ Error fetching promotions:', err);
        setError("Could not load promotions.");
      });
  };

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleOpenModal = () => {
    setFormData({ promoCode: '', promoType: '', description: '', promoAmount: '' });
    setIsEditing(false);
    const rect = addButtonRef.current.getBoundingClientRect();
    setOrigin({ top: rect.top, left: rect.left });
    setModalOpen(true);
  };

  const handleEdit = () => {
    if (selectedPromos.length !== 1) return;
    const promo = selectedPromos[0];
    setFormData({ ...promo });
    setIsEditing(true);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (selectedPromos.length === 0) return;
    if (!window.confirm("Are you sure you want to delete selected promotions?")) return;
    setShowDeleteAnimation(true);
    Promise.all(
      selectedPromos.map(promo =>
        fetch(`http://localhost:8080/api/promotions/${promo.promoCode}`, {
          method: 'DELETE'
        })
      )
    )
      .then(() => {
        setTimeout(() => {
          fetchPromotions();
          setSelectedPromos([]);
          setShowDeleteAnimation(false);
        }, 2000);
      })
      .catch(err => {
        console.error('❌ Deletion Error:', err);
        setError('Failed to delete promotions');
        setShowDeleteAnimation(false);
      });
  };

  const handleSubmit = e => {
    e.preventDefault();
    const payload = {
      ...formData,
      promoAmount: parseFloat(formData.promoAmount)
    };

    const url = `http://localhost:8080/api/promotions${isEditing ? `/${formData.promoCode}` : ''}`;
    const method = isEditing ? 'PUT' : 'POST';

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to save promotion');
        return res.json();
      })
      .then(() => {
        fetchPromotions();
        handleCloseModal();
      })
      .catch(err => {
        console.error('❌ Submission Error:', err);
        setError('Failed to save promotion');
      });
  };

  const toggleSelectPromo = (promo) => {
    const isSelected = selectedPromos.some(p => p.promoCode === promo.promoCode);
    setSelectedPromos(isSelected
      ? selectedPromos.filter(p => p.promoCode !== promo.promoCode)
      : [...selectedPromos, promo]
    );
  };

  return (
    <PageWrapper>
      <MainContent>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography
              variant="h4"
              gutterBottom
              sx={{ fontWeight: 'bold', letterSpacing: 3, textAlign: 'center', width: '100%' }}
            >
              CREATE PROMO CODE
            </Typography>

            <Box display="flex" gap={2} mb={3}>
              <Button variant="contained" color="success" onClick={handleOpenModal} ref={addButtonRef}>
                Add Promo
              </Button>
              <Button
                variant="contained"
                color="warning"
                onClick={handleEdit}
                disabled={selectedPromos.length !== 1}
              >
                Edit
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={handleDelete}
                disabled={selectedPromos.length === 0}
              >
                Delete
              </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <Divider sx={{ mb: 3 }} />

            <Typography variant="h6" gutterBottom>All Promotions</Typography>
            <Paper sx={{ overflowX: 'auto' }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell />
                    <TableCell><strong>Promo Code</strong></TableCell>
                    <TableCell><strong>Type</strong></TableCell>
                    <TableCell><strong>Description</strong></TableCell>
                    <TableCell><strong>Amount</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {promotions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">No promotions available</TableCell>
                    </TableRow>
                  ) : (
                    promotions.map(promo => {
                      const isChecked = selectedPromos.some(p => p.promoCode === promo.promoCode);
                      return (
                        <TableRow key={promo.promoCode} hover>
                          <TableCell padding="checkbox">
                            <Checkbox
                              checked={isChecked}
                              onChange={() => toggleSelectPromo(promo)}
                            />
                          </TableCell>
                          <TableCell>{promo.promoCode}</TableCell>
                          <TableCell>{promo.promoType}</TableCell>
                          <TableCell>{promo.description}</TableCell>
                          <TableCell>{promo.promoAmount}</TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </Paper>
          </Paper>
        </Container>
      </MainContent>

      <FixedFooter>
        © 2025 ASCEND Catalog Management System | Powered by Nisum
      </FixedFooter>

      {/* Animated Modal */}
      <AnimatePresence>
        {modalOpen && (
          <Modal open={modalOpen} onClose={handleCloseModal}>
            <Box
              component={motion.div}
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.5, x: origin.left - window.innerWidth / 2, y: origin.top - window.innerHeight / 2 }}
              animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 30 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
              }}
            >
              <PromoModalCard>
                <CloseButton onClick={handleCloseModal} />
                <Typography variant="h6" fontWeight="bold" gutterBottom textAlign="center">
                  {isEditing ? 'Edit Promotion' : 'Add Promotion'}
                </Typography>

                <form onSubmit={handleSubmit}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Promo Code"
                        name="promoCode"
                        value={formData.promoCode}
                        onChange={handleChange}
                        required
                        disabled={isEditing}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        select
                        fullWidth
                        label="Promotion Type"
                        name="promoType"
                        value={formData.promoType}
                        onChange={handleChange}
                        required
                        size="small"
                      >
                        <MenuItem value="">Select Type</MenuItem>
                        {promoTypes.map((type) => (
                          <MenuItem key={type.id} value={type.id}>
                            {type.label}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Promo Amount"
                        type="number"
                        name="promoAmount"
                        value={formData.promoAmount}
                        onChange={handleChange}
                        required
                        size="small"
                      />
                    </Grid>
                  </Grid>

                  <Box mt={3} display="flex" justifyContent="flex-end">
                    <Button
                      type="submit"
                      variant="contained"
                      color="success"
                      sx={{ minWidth: '120px', borderRadius: 2 }}
                    >
                      {isEditing ? 'Update' : 'Save'}
                    </Button>
                  </Box>
                </form>
              </PromoModalCard>
            </Box>
          </Modal>
        )}
      </AnimatePresence>

      {/* Delete Animation Modal */}
      <Modal
        open={showDeleteAnimation}
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Box sx={{ width: 250, textAlign: 'center', bgcolor: 'white', p: 2, borderRadius: 2 }}>
          <Lottie animationData={deleteAnim} loop={false} />
          <Typography fontWeight="bold">Deleting...</Typography>
        </Box>
      </Modal>
    </PageWrapper>
  );
}
