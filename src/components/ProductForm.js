import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Box,
  Typography,
  Alert,
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Inventory as InventoryIcon,
  Description as DescriptionIcon,
  QrCode as QrCodeIcon,
} from '@mui/icons-material';

const ProductForm = ({
  open,
  onClose,
  editingProduct,
  newProduct,
  error,
  isMobile,
  theme,
  onChange,
  onSubmit,
  onErrorChange,
}) => {
  
  // Add this function to generate serial number
  const generateSerialNumber = () => {
    const prefix = 'PROD-';
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}${timestamp}-${random}`;
  };

  const handleSubmit = () => {
    // If creating new product and no serial number, generate one
    const productToSubmit = { ...newProduct };
    if (!editingProduct && !productToSubmit.serial_number) {
      productToSubmit.serial_number = generateSerialNumber();
    }
    onSubmit(productToSubmit);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : 4,
          m: isMobile ? 0 : 4,
          maxHeight: isMobile ? '100vh' : '90vh',
        }
      }}
    >
      <DialogTitle sx={{ 
        p: isMobile ? 2 : 3, 
        pb: isMobile ? 1 : 2,
        borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
        bgcolor: isMobile ? 'secondary.main' : 'transparent',
        color: isMobile ? 'secondary.contrastText' : 'inherit',
      }}>
        <Typography variant={isMobile ? "h6" : "h5"} fontWeight={700}>
          {editingProduct ? 'Edit Product' : 'Add New Product'}
        </Typography>
        {!isMobile && (
          <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
            {editingProduct ? `Update details for ${editingProduct.name}` : 'Enter product details'}
          </Typography>
        )}
      </DialogTitle>
      
      <DialogContent sx={{ p: isMobile ? 2 : 3 }}>
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3, 
              borderRadius: 2,
            }}
            onClose={() => onErrorChange('')}
          >
            {error}
          </Alert>
        )}
        
   <Grid container spacing={2.5}>
  <Grid item xs={12}>
    <Box sx={{ mb: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <InventoryIcon sx={{ fontSize: 18, color: 'primary.main', mr: 1 }} />
        <Typography variant="body2" fontWeight={600} color="text.primary">
          Product Name
        </Typography>
        <Typography variant="caption" color="error" sx={{ ml: 0.5 }}>
          *
        </Typography>
      </Box>
      <TextField
        fullWidth
        value={newProduct.name}
        onChange={(e) => onChange({ ...newProduct, name: e.target.value })}
        placeholder="Enter product name"
        variant="outlined"
        size={isMobile ? "small" : "medium"}
        required
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 1.5,
            fontSize: isMobile ? '0.875rem' : '1rem',
          }
        }}
      />
    </Box>
  </Grid>
  
  <Grid item xs={12}>
    <Box sx={{ mb: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <DescriptionIcon sx={{ fontSize: 18, color: 'primary.main', mr: 1 }} />
        <Typography variant="body2" fontWeight={600} color="text.primary">
          Description
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
          (Optional)
        </Typography>
      </Box>
      <TextField
        fullWidth
        multiline
        rows={isMobile ? 2 : 3}
        value={newProduct.description}
        onChange={(e) => onChange({ ...newProduct, description: e.target.value })}
        placeholder="Add product description..."
        variant="outlined"
        size={isMobile ? "small" : "medium"}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 1.5,
            fontSize: isMobile ? '0.875rem' : '1rem',
          },
          '& .MuiOutlinedInput-inputMultiline': {
            minHeight: isMobile ? '60px' : '70px',
          }
        }}
      />
    </Box>
  </Grid>
</Grid>
      </DialogContent>
      
      <DialogActions sx={{ 
        p: isMobile ? 2 : 3, 
        pt: isMobile ? 1 : 2,
        borderTop: (theme) => `1px solid ${theme.palette.divider}`,
        bgcolor: isMobile ? 'background.default' : 'transparent',
      }}>
        <Button
          onClick={onClose}
          sx={{ 
            borderRadius: 2,
            px: 3,
            py: 1,
          }}
        >
          Cancel
        </Button>
    <Button
      variant="contained"
      color="secondary"
      onClick={handleSubmit}  // Use handleSubmit instead of onSubmit directly
      sx={{ 
        borderRadius: 2,
        px: 3,
        py: 1,
        fontWeight: 600,
      }}
      startIcon={isMobile ? null : (editingProduct ? <EditIcon /> : <AddIcon />)}
    >
      {editingProduct ? 'Update' : 'Add Product'}
    </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProductForm;