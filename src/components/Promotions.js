import React, { useEffect, useRef, useState } from "react";
import {
  Container, Typography, TextField, MenuItem, Button,
  Table, TableHead, TableRow, TableCell, TableBody,
  Paper, Box, Divider, Checkbox, Modal, Fab
} from "@mui/material";
import { styled } from "@mui/material/styles";
import Lottie from "lottie-react";
import { AnimatePresence, motion } from "framer-motion";
import deleteAnim from "../animations/DeleteAnimation.json";
import CloseIcon from "@mui/icons-material/Close";
import * as XLSX from "xlsx";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useSnackbar } from "notistack";

// Color palette
const primaryColor = "#1e88e5";
const accentColor = "#ffd54f";
const headerTextColor = "#000";
const rowBlueColor = "#e3f0ff";
const rowSelectedGradient = "linear-gradient(90deg, #e0e0e0 0%, #f5f5f5 100%)";

// Glassmorphic Container
const GlassTableContainer = styled(Paper)(({ theme }) => ({
  borderRadius: 18,
  background: "rgba(255,255,255,0.82)",
  boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.13)",
  backdropFilter: "blur(10px)",
  border: "1.5px solid rgba(200,200,200,0.18)",
  marginBottom: theme.spacing(2),
  overflow: "hidden",
}));

const HighlightRow = styled(TableRow, {
  shouldForwardProp: (prop) => prop !== "selected"
})(({ selected }) => ({
  transition: "background 0.2s, box-shadow 0.18s, transform 0.18s",
  background:
    selected === "true"
      ? rowSelectedGradient
      : rowBlueColor,
  "&:hover": {
    background:
      selected === "true"
        ? rowSelectedGradient
        : rowBlueColor,
    boxShadow: "0 2px 16px 0 rgba(30,136,229,0.08)",
    transform: "scale(1.008)",
  },
}));

const StyledTableCell = styled(TableCell)(() => ({
  fontWeight: 500,
  fontSize: 15,
  borderBottom: "none",
  transition: "background 0.18s",
  "&:hover": {
    background: "rgba(30,136,229,0.06)",
  },
  whiteSpace: "normal",
  wordBreak: "break-word",
}));

const PageWrapper = styled("div")({
  display: "flex",
  flexDirection: "column",
  minHeight: "100vh",
  background: "linear-gradient(135deg, #e3f0ff 0%, #fafcff 100%)",
});

const MainContent = styled("main")({
  flex: 1,
  paddingBottom: "80px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

const FixedFooter = styled("footer")({
  position: "fixed",
  bottom: 0,
  left: 0,
  right: 0,
  background: "linear-gradient(90deg, #1e2d3b 60%, #3a5068 100%)",
  color: "#fff",
  textAlign: "center",
  padding: "16px",
  fontSize: "14px",
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
  const { enqueueSnackbar } = useSnackbar();
  const [promotions, setPromotions] = useState([]);
  const [formData, setFormData] = useState({ promoCode: "", promoType: "", description: "", promoAmount: "" });
  const [isEditing, setIsEditing] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPromos, setSelectedPromos] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [promoTypeFilter, setPromoTypeFilter] = useState("");
  const [origin, setOrigin] = useState({ top: 0, left: 0 });
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [showDeleteAnimation, setShowDeleteAnimation] = useState(false);
  const addButtonRef = useRef();

  const promoTypes = [
    { id: "Cashback", label: "Cashback" },
    { id: "Discount", label: "Discount" },
  ];

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = () => {
    fetch("http://localhost:8080/api/promotions")
      .then(res => res.json())
      .then(setPromotions)
      .catch(() => enqueueSnackbar("Could not load promotions", { variant: "error" }));
  };

  const handleOpenModal = () => {
    setFormData({ promoCode: "", promoType: "", description: "", promoAmount: "" });
    setIsEditing(false);
    const rect = addButtonRef.current.getBoundingClientRect();
    setOrigin({ top: rect.top, left: rect.left });
    setModalOpen(true);
  };

  const handleEdit = () => {
    if (selectedPromos.length !== 1) return;
    setFormData(selectedPromos[0]);
    setIsEditing(true);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (!selectedPromos.length) return;
    if (!confirmDeleteOpen) {
      enqueueSnackbar("Click delete again to confirm", { variant: "warning" });
      setConfirmDeleteOpen(true);
      setTimeout(() => setConfirmDeleteOpen(false), 4000);
      return;
    }

    setShowDeleteAnimation(true);
    Promise.all(
      selectedPromos.map(p =>
        fetch(`http://localhost:8080/api/promotions/${p.promoCode}`, { method: "DELETE" })
      )
    )
      .then(() => {
        setTimeout(() => {
          fetchPromotions();
          setSelectedPromos([]);
          setShowDeleteAnimation(false);
          enqueueSnackbar("Promotions deleted", { variant: "success" });
        }, 1200);
      })
      .catch(() => {
        enqueueSnackbar("Failed to delete", { variant: "error" });
        setShowDeleteAnimation(false);
      });
  };

  const handleSubmit = e => {
    e.preventDefault();
    const payload = { ...formData, promoAmount: parseFloat(formData.promoAmount) };
    const url = `http://localhost:8080/api/promotions${isEditing ? `/${formData.promoCode}` : ""}`;
    const method = isEditing ? "PUT" : "POST";

    fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(() => {
        fetchPromotions();
        handleCloseModal();
        enqueueSnackbar(`Promotion ${isEditing ? "updated" : "added"}`, { variant: "success" });
      })
      .catch(() => enqueueSnackbar("Failed to save promotion", { variant: "error" }));
  };

  const toggleSelectPromo = promo => {
    const exists = selectedPromos.some(p => p.promoCode === promo.promoCode);
    setSelectedPromos(exists ? selectedPromos.filter(p => p.promoCode !== promo.promoCode) : [...selectedPromos, promo]);
  };

  const handleSelectAll = e => {
    setSelectedPromos(e.target.checked ? filteredPromotions : []);
  };

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleExport = () => {
    const ws = XLSX.utils.json_to_sheet(promotions);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Promotions");
    XLSX.writeFile(wb, "promotions.xlsx");
    enqueueSnackbar("Exported promotions", { variant: "success" });
  };

  const handleImport = e => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
      const wb = XLSX.read(evt.target.result, { type: "binary" });
      const data = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
      fetch("http://localhost:8080/api/promotions/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
        .then(() => {
          fetchPromotions();
          enqueueSnackbar("Imported promotions", { variant: "success" });
        })
        .catch(() => enqueueSnackbar("Failed to import", { variant: "error" }));
    };
    reader.readAsBinaryString(file);
  };

  const filteredPromotions = promotions.filter(p => {
    const matchesSearch =
      p.promoCode.toLowerCase().includes(searchText.toLowerCase()) ||
      p.description.toLowerCase().includes(searchText.toLowerCase()) ||
      String(p.promoAmount).includes(searchText);
    const matchesType = promoTypeFilter === "" || p.promoType === promoTypeFilter;
    return matchesSearch && matchesType;
  });

  const isSelected = (promoCode) =>
    selectedPromos.find((p) => p.promoCode === promoCode) !== undefined;

  const allSelected =
    filteredPromotions.length > 0 &&
    filteredPromotions.every((p) => selectedPromos.some((sp) => sp.promoCode === p.promoCode));

  const someSelected =
    filteredPromotions.some((p) => selectedPromos.some((sp) => sp.promoCode === p.promoCode)) &&
    !allSelected;

  return (
    <PageWrapper>
      <MainContent>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h4" align="center" fontWeight="bold" letterSpacing={2} mb={2}>
              CREATE PROMO CODE
            </Typography>

            <Box display="flex" gap={2} mb={2}>
              <TextField size="small" label="Search" value={searchText} onChange={e => setSearchText(e.target.value)} sx={{ minWidth: 200 }} />
              <TextField select size="small" label="Filter by Type" value={promoTypeFilter} onChange={e => setPromoTypeFilter(e.target.value)} sx={{ minWidth: 200 }}>
                <MenuItem value="">All</MenuItem>
                {promoTypes.map(type => (
                  <MenuItem key={type.id} value={type.id}>{type.label}</MenuItem>
                ))}
              </TextField>
            </Box>

            <Divider sx={{ mb: 2 }} />

            <GlassTableContainer elevation={0}>
              <Table stickyHeader sx={{ tableLayout: "fixed", width: "100%" }}>
                <TableHead>
                  <TableRow
                    sx={{
                      // No background set here: default/transparent
                      position: "sticky",
                      top: 0,
                      zIndex: 2,
                    }}
                  >
                    <TableCell padding="checkbox" sx={{ background: "inherit" }}>
                      <Checkbox
                        color="default"
                        checked={allSelected}
                        indeterminate={someSelected}
                        onChange={handleSelectAll}
                        sx={{
                          color: headerTextColor,
                          "&.Mui-checked": { color: accentColor },
                        }}
                      />
                    </TableCell>
                    <StyledTableCell sx={{ color: headerTextColor, fontWeight: 700 }}>Promo Code</StyledTableCell>
                    <StyledTableCell sx={{ color: headerTextColor, fontWeight: 700 }}>Type</StyledTableCell>
                    <StyledTableCell sx={{ color: headerTextColor, fontWeight: 700 }}>Description</StyledTableCell>
                    <StyledTableCell sx={{ color: headerTextColor, fontWeight: 700 }}>Amount</StyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredPromotions.map((p) => (
                    <HighlightRow
                      key={p.promoCode}
                      selected={isSelected(p.promoCode) ? "true" : "false"}
                    >
                      <StyledTableCell padding="checkbox">
                        <Checkbox
                          checked={isSelected(p.promoCode)}
                          onChange={() => toggleSelectPromo(p)}
                          color="default"
                          sx={{
                            "&.Mui-checked": {
                              color: primaryColor,
                            },
                          }}
                        />
                      </StyledTableCell>
                      <StyledTableCell>{p.promoCode}</StyledTableCell>
                      <StyledTableCell>{p.promoType}</StyledTableCell>
                      <StyledTableCell>{p.description}</StyledTableCell>
                      <StyledTableCell>{p.promoAmount}</StyledTableCell>
                    </HighlightRow>
                  ))}
                </TableBody>
              </Table>
            </GlassTableContainer>

            <Box mt={3} display="flex" justifyContent="center" gap={2}>
              <Button component="label" variant="outlined">
                Import Excel
                <input type="file" accept=".xlsx, .xls" hidden onChange={handleImport} />
              </Button>
              <Button variant="outlined" onClick={handleExport}>
                Export to Excel
              </Button>
            </Box>
          </Paper>
        </Container>

        {/* FAB Buttons */}
        <Fab color="success" aria-label="add" sx={{ position: "fixed", bottom: 90, right: 40 }} onClick={handleOpenModal} ref={addButtonRef}><AddIcon /></Fab>
        <Fab color="warning" aria-label="edit" sx={{ position: "fixed", bottom: 160, right: 40 }} onClick={handleEdit} disabled={selectedPromos.length !== 1}><EditIcon /></Fab>
        <Fab color="error" aria-label="delete" sx={{ position: "fixed", bottom: 230, right: 40 }} onClick={handleDelete} disabled={selectedPromos.length === 0}><DeleteIcon /></Fab>
      </MainContent>

      <FixedFooter>© 2025 ASCEND Catalog Management System | Powered by Nisum</FixedFooter>

      <AnimatePresence>
        {modalOpen && (
          <Modal open={modalOpen} onClose={handleCloseModal}>
            <Box
              component={motion.div}
              onClick={e => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.5, x: origin.left - window.innerWidth / 2, y: origin.top - window.innerHeight / 2 }}
              animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 30 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}
            >
              <PromoModalCard>
                <CloseButton onClick={handleCloseModal} />
                <Typography variant="h6" textAlign="center" fontWeight="bold" mb={2}>
                  {isEditing ? "Edit Promotion" : "Add Promotion"}
                </Typography>
                <form onSubmit={handleSubmit}>
                  <TextField name="promoCode" label="Promo Code" fullWidth required disabled={isEditing} value={formData.promoCode} onChange={handleChange} size="small" sx={{ mb: 2 }} />
                  <TextField name="promoType" label="Promo Type" select fullWidth required value={formData.promoType} onChange={handleChange} size="small" sx={{ mb: 2 }}>
                    {promoTypes.map(t => <MenuItem key={t.id} value={t.id}>{t.label}</MenuItem>)}
                  </TextField>
                  <TextField name="description" label="Description" fullWidth required value={formData.description} onChange={handleChange} size="small" sx={{ mb: 2 }} />
                  <TextField name="promoAmount" label="Amount" type="number" fullWidth required value={formData.promoAmount} onChange={handleChange} size="small" sx={{ mb: 2 }} />
                  <Box display="flex" justifyContent="flex-end">
                    <Button type="submit" variant="contained" color="success">
                      {isEditing ? "Update" : "Save"}
                    </Button>
                  </Box>
                </form>
              </PromoModalCard>
            </Box>
          </Modal>
        )}
      </AnimatePresence>

      <Modal open={showDeleteAnimation} sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Box sx={{ width: 250, textAlign: "center", bgcolor: "white", p: 2, borderRadius: 2 }}>
          <Lottie animationData={deleteAnim} loop={false} />
          <Typography fontWeight="bold">Deleting...</Typography>
        </Box>
      </Modal>
    </PageWrapper>
  );
}
