import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Paper,
  Typography,
  Box,
  Alert,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  IconButton,
  CircularProgress,
  useMediaQuery,
  useTheme,
  Snackbar,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  FilterList as FilterListIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  Inventory as InventoryIcon,
} from '@mui/icons-material';

const AddProductDialog = ({ 
  open, 
  onClose, 
  products, 
  productsLoading,
  onAddProduct,
  customer,
  onRefreshProducts
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState('1');
  const [price, setPrice] = useState('');
  const [unit, setUnit] = useState('kg');
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info',
  });
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filter products whenever search term or products change
  useEffect(() => {
    if (!products) return;
    
    if (!searchTerm.trim()) {
      setFilteredProducts(products);
    } else {
      const searchLower = searchTerm.toLowerCase();
      const filtered = products.filter(product => {
        if (!product) return false;
        
        // Search in name and description
        const nameMatch = product.name?.toLowerCase().includes(searchLower);
        const descMatch = product.description?.toLowerCase().includes(searchLower);
        
        return nameMatch || descMatch;
      });
      setFilteredProducts(filtered);
    }
  }, [searchTerm, products]);

  const handleSubmit = async () => {
    if (!selectedProduct) {
      setError('Please select a product');
      return;
    }

    if (!quantity || parseFloat(quantity) <= 0) {
      setError('Please enter a valid quantity');
      return;
    }

    if (!price || parseFloat(price) <= 0) {
      setError('Please enter a valid price');
      return;
    }

    if (!unit) {
      setError('Please select a unit');
      return;
    }

    try {
      setLoading(true);
      const transactionData = {
        product: selectedProduct,
        quantity: parseFloat(quantity),
        price: parseFloat(price),
        unit: unit,
        total_amount: parseFloat(price) * parseFloat(quantity),
      };

      await onAddProduct(transactionData);
      resetForm();
    } catch (error) {
      console.error('Error adding product:', error);
      setError('Failed to add product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedProduct(null);
    setQuantity('1');
    setPrice('');
    setUnit('kg');
    setSearchTerm('');
    setError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  const handleRefreshProducts = async () => {
    if (onRefreshProducts) {
      await onRefreshProducts();
    }
  };

  const handleGoToProducts = () => {
    handleClose();
    setSnackbar({
      open: true,
      message: 'Please add products from the Products tab',
      severity: 'info',
    });
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  };

  const renderEmptyState = () => (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      textAlign: 'center',
      p: 4,
      height: '100%',
      minHeight: '200px'
    }}>
      <InventoryIcon sx={{ 
        fontSize: 48, 
        color: 'text.secondary', 
        mb: 2,
        opacity: 0.5
      }} />
      <Typography variant="h6" color="textSecondary" gutterBottom>
        No Products Available
      </Typography>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
        Add products from the Products tab first
      </Typography>
      <Button
        variant="outlined"
        startIcon={<AddIcon />}
        size="small"
        onClick={handleGoToProducts}
      >
        Go to Products
      </Button>
    </Box>
  );

  const renderLoadingState = () => (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      textAlign: 'center',
      p: 4,
      height: '100%',
      minHeight: '200px'
    }}>
      <CircularProgress size={40} sx={{ mb: 2 }} />
      <Typography variant="body1" color="textSecondary">
        Loading products...
      </Typography>
    </Box>
  );

  const renderSearchEmptyState = () => (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      textAlign: 'center',
      p: 4,
      height: '100%',
      minHeight: '200px'
    }}>
      <SearchIcon sx={{ 
        fontSize: 48, 
        color: 'text.secondary', 
        mb: 2,
        opacity: 0.5
      }} />
      <Typography variant="h6" color="textSecondary" gutterBottom>
        No products found
      </Typography>
      <Typography variant="body2" color="textSecondary">
        Try a different search term
      </Typography>
    </Box>
  );

  const renderProductGrid = () => {
    if (productsLoading) return renderLoadingState();
    if (products.length === 0) return renderEmptyState();
    if (filteredProducts.length === 0) return renderSearchEmptyState();

    return (
      <Grid container spacing={isMobile ? 1 : 2}>
        {filteredProducts.map((product) => (
          <Grid item xs={12} sm={6} md={4} key={product.id}>
            <Paper
              sx={{
                p: isMobile ? 1.5 : 2,
                cursor: 'pointer',
                border: selectedProduct?.id === product.id ? 2 : 1,
                borderColor: selectedProduct?.id === product.id ? 'primary.main' : 'grey.300',
                bgcolor: selectedProduct?.id === product.id ? 'primary.50' : 'white',
                borderRadius: 2,
                transition: 'all 0.2s',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                '&:hover': {
                  bgcolor: selectedProduct?.id === product.id ? 'primary.50' : 'grey.50',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                },
              }}
              onClick={() => handleProductSelect(product)}
            >
              <Box sx={{ flex: 1 }}>
                <Typography 
                  variant={isMobile ? "body2" : "subtitle2"} 
                  fontWeight="bold" 
                  gutterBottom
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {product.name}
                </Typography>
                
                <Chip 
                  label={`#${product.serialNumber || product.id?.slice(0, 8)}`}
                  size="small"
                  color="primary"
                  variant="outlined"
                  sx={{ 
                    fontWeight: 500,
                    mb: 1,
                    fontSize: isMobile ? '0.7rem' : '0.75rem'
                  }}
                />
                
                {product.description && (
                  <Typography 
                    variant="body2" 
                    color="textSecondary" 
                    sx={{ 
                      fontSize: isMobile ? '0.7rem' : '0.75rem',
                      mt: 1,
                      lineHeight: 1.4,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    {product.description}
                  </Typography>
                )}
              </Box>
              
              <Box sx={{ 
                mt: 2, 
                pt: 1, 
                borderTop: 1, 
                borderColor: 'divider',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <Typography variant="caption" color="textSecondary">
                  Click to select
                </Typography>
                {selectedProduct?.id === product.id && (
                  <Chip 
                    label="Selected" 
                    size="small" 
                    color="primary"
                    sx={{ height: 20, fontSize: '0.65rem' }}
                  />
                )}
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    );
  };

  const renderTransactionForm = () => {
    if (!selectedProduct) {
      return (
        <Box sx={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          textAlign: 'center',
          p: isMobile ? 2 : 4
        }}>
          <Box sx={{ 
            width: isMobile ? 60 : 80, 
            height: isMobile ? 60 : 80, 
            borderRadius: '50%', 
            bgcolor: 'grey.200',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 3
          }}>
            <Typography variant={isMobile ? "h5" : "h4"} color="text.secondary">→</Typography>
          </Box>
          <Typography variant={isMobile ? "body1" : "h6"} color="textSecondary" gutterBottom>
            Select a Product
          </Typography>
          <Typography variant={isMobile ? "caption" : "body2"} color="textSecondary">
            Choose a product from the list to enter transaction details
          </Typography>
        </Box>
      );
    }

    return (
      <Box sx={{ p: isMobile ? 2 : 3 }}>
        {/* Simplified Selected Product Info */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Selected Product
          </Typography>
          <Typography 
            variant={isMobile ? "h6" : "h5"} 
            fontWeight={600} 
            color="primary.main"
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {selectedProduct.name}
          </Typography>
          {selectedProduct.description && (
            <Typography 
              variant="caption" 
              color="textSecondary"
              sx={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}
            >
              {selectedProduct.description}
            </Typography>
          )}
        </Box>

        {/* Transaction Form */}
        <Box sx={{ flex: 1 }}>
          <Grid container spacing={isMobile ? 1 : 2}>
            <Grid item xs={12}>
              <Grid container spacing={isMobile ? 1 : 2}>
                <Grid item xs={6}>
                  <TextField
                    label="Quantity"
                    type="number"
                    fullWidth
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    InputProps={{
                      inputProps: { 
                        min: 0.01, 
                        step: 0.01,
                        style: { fontSize: isMobile ? '0.875rem' : '1rem' }
                      },
                      sx: { borderRadius: 2 }
                    }}
                    required
                    size={isMobile ? "small" : "medium"}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Price"
                    type="number"
                    fullWidth
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <Typography sx={{ mr: 1, fontSize: isMobile ? '0.875rem' : '1rem' }}>
                          ₦
                        </Typography>
                      ),
                      inputProps: { 
                        min: 0, 
                        step: 0.01,
                        style: { fontSize: isMobile ? '0.875rem' : '1rem' }
                      },
                      sx: { borderRadius: 2 }
                    }}
                    required
                    size={isMobile ? "small" : "medium"}
                  />
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth size={isMobile ? "small" : "medium"}>
                <InputLabel>Unit</InputLabel>
                <Select
                  value={unit}
                  label="Unit"
                  onChange={(e) => setUnit(e.target.value)}
                  sx={{ borderRadius: 2 }}
                  required
                >
                  <MenuItem value="kg">Kilogram (kg)</MenuItem>
                  <MenuItem value="g">Gram (g)</MenuItem>
                  <MenuItem value="piece">Piece</MenuItem>
                  <MenuItem value="liter">Liter</MenuItem>
                  <MenuItem value="packet">Packet</MenuItem>
                  <MenuItem value="bag">Bag</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>
      </Box>
    );
  };

  return (
    <>
      <Dialog 
        open={open} 
        onClose={handleClose}
        maxWidth="xl"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: { 
            borderRadius: isMobile ? 0 : 3,
            height: isMobile ? '100vh' : '90vh',
            maxHeight: isMobile ? '100vh' : '90vh',
            width: isMobile ? '100vw' : '95vw',
            maxWidth: '1400px',
            m: isMobile ? 0 : 2
          }
        }}
      >
        <DialogTitle sx={{ 
          p: isMobile ? 2 : 3, 
          pb: isMobile ? 1 : 2,
          borderBottom: 1, 
          borderColor: 'divider'
        }}>
          <Box>
            <Typography variant={isMobile ? "h6" : "h5"} fontWeight={600}>
              Add Scrap Product
            </Typography>
            <Typography variant={isMobile ? "caption" : "body2"} color="textSecondary">
              Customer: <strong>{customer?.name}</strong> • {products.length} products available
            </Typography>
          </Box>
        </DialogTitle>

        <DialogContent dividers sx={{ 
          p: 0, 
          display: 'flex', 
          flexDirection: 'column',
          flex: 1,
          overflow: 'hidden'
        }}>
          {/* Error Alert */}
          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                m: 2, 
                borderRadius: 2,
                '& .MuiAlert-icon': {
                  alignItems: 'center'
                }
              }}
              action={
                <IconButton 
                  size="small" 
                  onClick={() => setError('')}
                  aria-label="close"
                >
                  <ClearIcon fontSize="small" />
                </IconButton>
              }
            >
              {error}
            </Alert>
          )}

          {/* Search Bar */}
          <Box sx={{ 
            p: isMobile ? 1.5 : 2, 
            borderBottom: 1, 
            borderColor: 'divider',
            bgcolor: 'background.paper'
          }}>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <TextField
                fullWidth
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: 'action.active' }} />
                    </InputAdornment>
                  ),
                  endAdornment: searchTerm && (
                    <InputAdornment position="end">
                      <IconButton onClick={clearSearch} size="small" edge="end">
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ),
                  sx: { 
                    borderRadius: 2,
                    fontSize: isMobile ? '0.875rem' : '1rem'
                  }
                }}
                size={isMobile ? "small" : "medium"}
                autoFocus={!isMobile}
              />
              <IconButton
                onClick={handleRefreshProducts}
                disabled={productsLoading}
                sx={{
                  border: 1,
                  borderColor: 'grey.300',
                  borderRadius: 2,
                  minWidth: 'auto'
                }}
                title="Refresh products"
              >
                <RefreshIcon fontSize={isMobile ? "small" : "medium"} />
              </IconButton>
            </Box>
            
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              mt: 1 
            }}>
              <Typography variant="caption" color="textSecondary">
                {productsLoading ? (
                  <CircularProgress size={12} sx={{ mr: 1 }} />
                ) : (
                  `${products.length} products • ${filteredProducts.length} filtered`
                )}
              </Typography>
              {searchTerm && (
                <Typography variant="caption" color="primary">
                  Showing results for: "{searchTerm}"
                </Typography>
              )}
            </Box>
          </Box>

          {/* Main Content Area */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: isMobile ? 'column' : 'row',
            flex: 1, 
            overflow: 'hidden'
          }}>
            {/* Left Column: Product Selection */}
            <Box sx={{ 
              flex: 1, 
              overflow: 'auto', 
              p: isMobile ? 1.5 : 2,
              borderRight: isMobile ? 0 : 1, 
              borderBottom: isMobile ? 1 : 0,
              borderColor: 'divider',
              maxHeight: isMobile ? '50vh' : 'none'
            }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                mb: 2 
              }}>
                <Typography variant="subtitle2" fontWeight={600} sx={{ display: 'flex', alignItems: 'center' }}>
                  <FilterListIcon sx={{ mr: 1, fontSize: isMobile ? 16 : 20 }} />
                  Products ({filteredProducts.length})
                </Typography>
                {selectedProduct && (
                  <Chip 
                    label="Product Selected" 
                    size="small" 
                    color="primary"
                    sx={{ height: 24, fontSize: '0.75rem' }}
                  />
                )}
              </Box>
              
              {renderProductGrid()}
            </Box>

            {/* Right Column: Transaction Form */}
            <Box sx={{ 
              flex: 0.8, 
              p: isMobile ? 2 : 0,
              bgcolor: 'grey.50',
              display: 'flex',
              flexDirection: 'column',
              minWidth: isMobile ? '100%' : '350px',
              maxWidth: isMobile ? '100%' : '450px'
            }}>
              {renderTransactionForm()}
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ 
          p: isMobile ? 2 : 3, 
          borderTop: 1, 
          borderColor: 'divider',
          bgcolor: 'background.paper'
        }}>
          <Button 
            onClick={handleClose}
            variant="outlined"
            disabled={loading}
            sx={{ 
              borderRadius: 2,
              px: isMobile ? 2 : 3,
              py: 1,
              textTransform: 'none',
              minWidth: isMobile ? '80px' : '100px'
            }}
          >
            Cancel
          </Button>
          
          {/* Transaction Summary in Footer */}
          {selectedProduct && quantity && price && unit && (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: isMobile ? 1 : 2,
              mr: isMobile ? 1 : 2,
              p: isMobile ? 1 : 1.5,
              borderRadius: 2,
              bgcolor: 'primary.50',
              flex: 1,
              overflow: 'hidden'
            }}>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant={isMobile ? "caption" : "body2"} color="textSecondary">
                  Transaction Summary
                </Typography>
                <Typography 
                  variant={isMobile ? "caption" : "body2"} 
                  color="textSecondary" 
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {quantity} {unit} × ₦{parseFloat(price || 0).toFixed(2)}
                </Typography>
              </Box>
              <Typography 
                variant={isMobile ? "body1" : "h6"} 
                fontWeight={700} 
                color="primary.main"
                sx={{ 
                  whiteSpace: 'nowrap',
                  fontSize: isMobile ? '0.875rem' : '1.25rem'
              }}
              >
                ₦{(parseFloat(price || 0) * parseFloat(quantity || 0)).toFixed(2)}
              </Typography>
            </Box>
          )}
          
          <Button 
            onClick={handleSubmit}
            variant="contained"
            disabled={!selectedProduct || !quantity || !price || !unit || 
                     parseFloat(quantity) <= 0 || parseFloat(price) <= 0 || loading}
            sx={{ 
              borderRadius: 2,
              px: isMobile ? 3 : 4,
              py: 1,
              textTransform: 'none',
              fontWeight: 600,
              minWidth: isMobile ? '120px' : '140px'
            }}
            startIcon={loading && <CircularProgress size={20} color="inherit" />}
          >
            {loading ? 'Adding...' : 'Add to Sheet'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Local Snackbar for this component */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ 
          vertical: 'bottom', 
          horizontal: isMobile ? 'center' : 'left' 
        }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ 
            width: '100%',
            borderRadius: 2,
            alignItems: 'center',
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default AddProductDialog;