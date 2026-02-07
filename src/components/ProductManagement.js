import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Grid,
  Button,
  IconButton,
  Tooltip,
  Skeleton,
  Paper,
  TextField,
  InputAdornment,
  LinearProgress,
  alpha,
  useMediaQuery,
  useTheme,
  Fade,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Inventory as InventoryIcon,
  Refresh as RefreshIcon,
  ImportExport as ImportExportIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { supabase } from '../config/supabase';
import ProductList from './ProductList';
import ProductForm from './ProductForm';
import StatsCards from './StatsCards';

const ProductManagement = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  const [products, setProducts] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProduct, setEditingProduct] = useState(null);
  const [newProduct, setNewProduct] = useState({
    serial_number: '',
    name: '',
    description: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  const [stats, setStats] = useState({
    total: 0,
    withDescription: 0,
    recentlyAdded: 0,
  });
  
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
    action: null,
  });

  const showSnackbar = useCallback((message, severity = 'success', action = null) => {
    setSnackbar({
      open: true,
      message,
      severity,
      action,
    });
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      setRefreshing(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const productsWithStats = (data || []).map((product) => ({
        ...product,
        isRecent: new Date(product.created_at) > weekAgo,
      }));
      
      const stats = {
        total: productsWithStats.length,
        withDescription: productsWithStats.filter(p => p.description).length,
        recentlyAdded: productsWithStats.filter(p => p.isRecent).length,
      };
      
      setProducts(productsWithStats);
      setStats(stats);
      
    } catch (error) {
      console.error('Error fetching products:', error);
      showSnackbar('Error loading products. Please try again.', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [showSnackbar]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const generateSerialNumber = () => {
    return `TZ-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  };

  const handleSubmit = async () => {
    if (!newProduct.name || !newProduct.name.trim()) {
      setError('Product name is required');
      return;
    }

    try {
      const productData = {
        name: newProduct.name.trim(),
        description: newProduct.description?.trim() || '',
        updated_at: new Date().toISOString(),
      };

      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);
        
        if (error) throw error;
        
        showSnackbar('Product updated successfully!', 'success');
      } else {
        productData.serial_number = generateSerialNumber();
        
        const { error } = await supabase
          .from('products')
          .insert([productData]);
        
        if (error) throw error;
        
        showSnackbar('Product added successfully!', 'success');
      }
      
      fetchProducts();
      handleCloseDialog();
      
    } catch (error) {
      console.error('Error saving product:', error);
      showSnackbar(error.message || 'Error saving product. Please try again.', 'error');
    }
  };

  const handleDelete = async (product) => {
    showSnackbar(
      `Delete ${product.name}? This action cannot be undone.`,
      'warning',
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button 
          color="inherit" 
          size="small" 
          variant="outlined"
          onClick={() => setSnackbar({ ...snackbar, open: false })}
        >
          Cancel
        </Button>
        <Button 
          color="error" 
          size="small" 
          variant="contained"
          onClick={async () => {
            try {
              const { error } = await supabase
                .from('products')
                .delete()
                .eq('id', product.id);
              
              if (error) throw error;
              
              fetchProducts();
              showSnackbar('Product deleted successfully!', 'success');
            } catch (error) {
              console.error('Error deleting product:', error);
              showSnackbar('Error deleting product. Please try again.', 'error');
            }
          }}
        >
          Delete
        </Button>
      </Box>
    );
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setNewProduct({
      serial_number: product.serial_number || '',
      name: product.name || '',
      description: product.description || '',
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingProduct(null);
    setNewProduct({ serial_number: '', name: '', description: '' });
    setError('');
  };

  const handleRefresh = () => {
    fetchProducts();
  };

  const handleExport = () => {
    showSnackbar('Export feature coming soon!', 'info');
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const toggleRowExpansion = (productId) => {
    setExpandedRow(expandedRow === productId ? null : productId);
  };

  const filteredProducts = products.filter(product => {
    if (!product) return false;
    
    const search = searchTerm.toLowerCase();
    return (
      product.name?.toLowerCase().includes(search) ||
      product.serial_number?.toLowerCase().includes(search) ||
      product.description?.toLowerCase().includes(search)
    );
  }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const paginatedProducts = filteredProducts.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (loading) {
    return (
      <Box sx={{ p: isMobile ? 2 : 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Grid container spacing={2}>
              {[1, 2, 3].map((item) => (
                <Grid item xs={6} sm={4} key={item}>
                  <Skeleton 
                    variant="rectangular" 
                    height={120} 
                    sx={{ borderRadius: 3 }}
                  />
                </Grid>
              ))}
            </Grid>
          </Grid>
          
          <Grid item xs={12}>
            <Skeleton 
              variant="rectangular" 
              height={56} 
              sx={{ borderRadius: 2 }}
            />
          </Grid>
          
          <Grid item xs={12}>
            {[...Array(5)].map((_, index) => (
              <Skeleton
                key={index}
                variant="rectangular"
                height={68}
                sx={{ 
                  borderRadius: 2,
                  mb: 1,
                  width: '100%'
                }}
              />
            ))}
          </Grid>
        </Grid>
      </Box>
    );
  }

  return (
    <Fade in={!loading}>
      <Box sx={{ 
        minHeight: '100vh',
        bgcolor: 'background.default',
        p: isMobile ? 2 : 3,
      }}>
        {/* Header Section */}
        <Box sx={{ mb: 4 }}>
          <Grid container alignItems="center" justifyContent="space-between" spacing={2}>
            <Grid item xs={12} md="auto">
              <Typography 
                variant={isMobile ? "h5" : "h4"} 
                fontWeight={700}
                color="secondary"
                sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5
                }}
              >
                <InventoryIcon fontSize={isMobile ? "medium" : "large"} />
                Product Management
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
                Manage scrap products for customer transactions
              </Typography>
            </Grid>
            
            <Grid item xs={12} md="auto">
              <Box sx={{ 
                display: 'flex', 
                gap: isMobile ? 1 : 2,
                flexWrap: 'wrap'
              }}>
                <Tooltip title="Refresh">
                  <IconButton
                    onClick={handleRefresh}
                    disabled={refreshing}
                    sx={{ 
                      bgcolor: 'background.paper',
                      border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`,
                      '&:hover': {
                        bgcolor: alpha(theme.palette.secondary.main, 0.04),
                      }
                    }}
                  >
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Export Data">
                  <IconButton
                    onClick={handleExport}
                    sx={{ 
                      bgcolor: 'background.paper',
                      border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                      '&:hover': {
                        bgcolor: alpha(theme.palette.success.main, 0.04),
                      }
                    }}
                  >
                    <ImportExportIcon />
                  </IconButton>
                </Tooltip>
                
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<AddIcon />}
                  onClick={() => setOpenDialog(true)}
                  sx={{ 
                    borderRadius: 3,
                    px: 3,
                    py: 1,
                    fontWeight: 600,
                    boxShadow: theme.shadows[3],
                    '&:hover': {
                      boxShadow: theme.shadows[6],
                    }
                  }}
                >
                  {isMobile ? 'Add' : 'Add Product'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Stats Cards */}
        <StatsCards stats={stats} isMobile={isMobile} />

        {/* Search Section */}
        <Paper 
          elevation={0}
          sx={{ 
            p: isMobile ? 2 : 3,
            mb: 3,
            borderRadius: 3,
            bgcolor: 'background.paper',
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          }}
        >
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search products by name, serial, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                variant="outlined"
                size={isMobile ? "small" : "medium"}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: searchTerm && (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => setSearchTerm('')}
                      >
                        <Typography variant="caption" color="textSecondary">
                          Clear
                        </Typography>
                      </IconButton>
                    </InputAdornment>
                  ),
                  sx: { borderRadius: 2 }
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box sx={{ 
                display: 'flex', 
                gap: 2,
                justifyContent: isMobile ? 'space-between' : 'flex-end',
                flexWrap: 'wrap'
              }}>
                <Button
                  variant="outlined"
                  onClick={() => setSearchTerm('')}
                  disabled={!searchTerm}
                  sx={{ borderRadius: 2 }}
                >
                  Clear Search
                </Button>
              </Box>
            </Grid>
          </Grid>
          
          {refreshing && (
            <LinearProgress 
              sx={{ 
                mt: 2,
                borderRadius: 2,
                height: 3,
                bgcolor: 'secondary.light'
              }} 
            />
          )}
        </Paper>

        {/* Product List Component */}
        <ProductList
          products={paginatedProducts}
          filteredProducts={filteredProducts}
          isMobile={isMobile}
          isTablet={isTablet}
          expandedRow={expandedRow}
          page={page}
          rowsPerPage={rowsPerPage}
          searchTerm={searchTerm}
          theme={theme}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleExpand={toggleRowExpansion}
          onChangePage={handleChangePage}
          onChangeRowsPerPage={handleChangeRowsPerPage}
          onAddProduct={() => setOpenDialog(true)}
        />

        {/* Product Form Dialog */}
        <ProductForm
          open={openDialog}
          onClose={handleCloseDialog}
          editingProduct={editingProduct}
          newProduct={newProduct}
          error={error}
          isMobile={isMobile}
          theme={theme}
          onChange={setNewProduct}
          onSubmit={handleSubmit}
          onErrorChange={setError}
        />

        {/* Snackbar Notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={snackbar.severity === 'warning' ? null : 6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ 
            vertical: isMobile ? 'bottom' : 'bottom', 
            horizontal: isMobile ? 'center' : 'right' 
          }}
          TransitionComponent={Fade}
        >
          <Alert
            elevation={6}
            variant="filled"
            severity={snackbar.severity}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            sx={{ 
              borderRadius: 2,
              alignItems: 'center',
              width: '100%',
              maxWidth: isMobile ? '90vw' : 400,
            }}
            action={snackbar.action}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Fade>
  );
};

export default ProductManagement;