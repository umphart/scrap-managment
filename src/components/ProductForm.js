import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
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
        
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Product Name"
              value={newProduct.name}
              onChange={(e) => onChange({ ...newProduct, name: e.target.value })}
              required
              size={isMobile ? "small" : "medium"}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <InventoryIcon color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 1 }}
            />
            <Typography variant="caption" color="textSecondary" sx={{ pl: 4 }}>
              Required. Enter the name of the scrap product
            </Typography>
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={isMobile ? 3 : 4}
              value={newProduct.description}
              onChange={(e) => onChange({ ...newProduct, description: e.target.value })}
              size={isMobile ? "small" : "medium"}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <DescriptionIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <Typography variant="caption" color="textSecondary" sx={{ pl: 4 }}>
              Optional. Describe the scrap product details
            </Typography>
          </Grid>
          
          {editingProduct && (
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Serial Number"
                value={newProduct.serial_number}
                disabled
                size={isMobile ? "small" : "medium"}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <QrCodeIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
              <Typography variant="caption" color="textSecondary" sx={{ pl: 4 }}>
                Auto-generated serial number
              </Typography>
            </Grid>
          )}
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
          onClick={onSubmit}
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