import React, { useState, useEffect, useCallback } from 'react';
import {
  Paper,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Box,
  Typography,
  Grid,
  Alert,
  Snackbar,
  InputAdornment,
  Fade,
  useMediaQuery,
  useTheme,
  CircularProgress,
  Tooltip,
  alpha,
  Zoom,
  Skeleton,
  LinearProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  MoreVert as MoreIcon,
  PersonAdd as PersonAddIcon,
  Refresh as RefreshIcon,
  ImportExport as ImportExportIcon,
  Email as EmailIcon,
  AccountCircle as AccountIcon,
  Phone as PhoneIcon,
  Edit as EditIcon, // Fixed: Import from icons-material
} from '@mui/icons-material';
import PrintIcon from '@mui/icons-material/Print';
import { supabase } from '../config/supabase';

// Import the new components
import CustomerStatsCards from './CustomerStatsCards';
import CustomerTable from './CustomerTable';

const CustomerManagement = ({ onSelectCustomer }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallDesktop = useMediaQuery(theme.breakpoints.down('lg'));
  
  const [customers, setCustomers] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  const [stats, setStats] = useState({
    total: 0,
    recent: 0,
    withoutPhone: 0,
  });
  
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
    action: null,
  });

  const [selectedFilter, setSelectedFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  const showSnackbar = useCallback((message, severity = 'success', action = null) => {
    setSnackbar({
      open: true,
      message,
      severity,
      action,
    });
  }, []);

  const fetchCustomers = useCallback(async () => {
    try {
      setRefreshing(true);
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      // Add SN numbers and calculate stats
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const customersWithSN = (data || []).map((customer, index) => ({
        ...customer,
        sn: index + 1,
        isRecent: new Date(customer.created_at) > weekAgo,
      }));
      
      const stats = {
        total: customersWithSN.length,
        recent: customersWithSN.filter(c => c.isRecent).length,
        withoutPhone: customersWithSN.filter(c => !c.phone).length,
      };
      
      setCustomers(customersWithSN);
      setStats(stats);
      
    } catch (error) {
      console.error('Error fetching customers:', error);
      showSnackbar('Error loading customers. Please try again.', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [showSnackbar]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleSubmit = async () => {
    // Validation
    const name = newCustomer.name?.trim();
    const phone = newCustomer.phone?.trim();
    const email = newCustomer.email?.trim();
    const address = newCustomer.address?.trim();

    if (!name) {
      setError('Customer name is required');
      return;
    }

    if (phone && !/^[\d\s\+\-\(\)]{8,15}$/.test(phone)) {
      setError('Please enter a valid phone number (8-15 digits)');
      return;
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    const customerData = {
      name,
      phone: phone || null,
      email: email || null,
      address: address || null,
      updated_at: new Date().toISOString(),
    };

    try {
      if (editingCustomer) {
        const { error } = await supabase
          .from('customers')
          .update(customerData)
          .eq('id', editingCustomer.id);
        
        if (error) throw error;
        
        showSnackbar('Customer updated successfully!', 'success');
      } else {
        const { error } = await supabase
          .from('customers')
          .insert([customerData]);
        
        if (error) throw error;
        
        showSnackbar('Customer added successfully!', 'success');
      }
      
      fetchCustomers();
      handleCloseDialog();
      
    } catch (error) {
      console.error('Error saving customer:', error);
      showSnackbar(error.message || 'Error saving customer. Please try again.', 'error');
    }
  };

  const handleDelete = async (customer) => {
    showSnackbar(
      `Delete ${customer.name}? This will also delete all related transactions.`,
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
                .from('customers')
                .delete()
                .eq('id', customer.id);
              
              if (error) throw error;
              
              fetchCustomers();
              showSnackbar('Customer deleted successfully!', 'success');
            } catch (error) {
              console.error('Error deleting customer:', error);
              showSnackbar('Error deleting customer. Please try again.', 'error');
            }
          }}
        >
          Delete
        </Button>
      </Box>
    );
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setNewCustomer({
      name: customer.name || '',
      phone: customer.phone || '',
      email: customer.email || '',
      address: customer.address || '',
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingCustomer(null);
    setNewCustomer({ name: '', phone: '', email: '', address: '' });
    setError('');
  };

  const handleRefresh = () => {
    fetchCustomers();
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

  const toggleRowExpansion = (customerId) => {
    setExpandedRow(expandedRow === customerId ? null : customerId);
  };

  const filteredCustomers = customers.filter(customer => {
    if (!customer) return false;
    if (selectedFilter === 'recent' && !customer.isRecent) return false;
    if (selectedFilter === 'noPhone' && customer.phone) return false;
    
    const search = searchTerm.toLowerCase();
    return (
      customer.name?.toLowerCase().includes(search) ||
      customer.phone?.includes(search) ||
      customer.email?.toLowerCase().includes(search) ||
      customer.address?.toLowerCase().includes(search) ||
      customer.sn?.toString().includes(search)
    );
  }).sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'date':
        return new Date(b.created_at) - new Date(a.created_at);
      default:
        return 0;
    }
  });

  // Pagination
  const paginatedCustomers = filteredCustomers.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Loading skeleton
  if (loading) {
    return (
      <Box sx={{ p: isMobile ? 2 : 3 }}>
        <Grid container spacing={3}>
          {/* Stats Skeletons */}
          <Grid item xs={12}>
            <Grid container spacing={2}>
              {[1, 2, 3, 4].map((item) => (
                <Grid item xs={6} sm={3} key={item}>
                  <Skeleton 
                    variant="rectangular" 
                    height={120} 
                    sx={{ borderRadius: 3 }}
                  />
                </Grid>
              ))}
            </Grid>
          </Grid>
          
          {/* Search Bar Skeleton */}
          <Grid item xs={12}>
            <Skeleton 
              variant="rectangular" 
              height={56} 
              sx={{ borderRadius: 2 }}
            />
          </Grid>
          
          {/* Table Skeletons */}
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
                color="primary"
                sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5
                }}
              >
                <AccountIcon fontSize={isMobile ? "medium" : "large"} />
                Customer Management
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
                Manage your scrap customers efficiently
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
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.04),
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
                  startIcon={<PersonAddIcon />}
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
                  {isMobile ? 'Add' : 'Add Customer'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Stats Cards */}
        <CustomerStatsCards stats={stats} isMobile={isMobile} />

        {/* Search and Filter Section */}
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
                placeholder="Search customers by name, phone, email..."
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
                  startIcon={<FilterIcon />}
                  variant="outlined"
                  onClick={() => setSelectedFilter(
                    selectedFilter === 'all' ? 'recent' : 
                    selectedFilter === 'recent' ? 'noPhone' : 'all'
                  )}
                  sx={{ borderRadius: 2 }}
                >
                  {selectedFilter === 'all' ? 'All Customers' : 
                   selectedFilter === 'recent' ? 'Recent' : 'No Phone'}
                </Button>
                
                <Button
                  variant="outlined"
                  onClick={() => setSortBy(sortBy === 'name' ? 'date' : 'name')}
                  sx={{ borderRadius: 2 }}
                >
                  Sort: {sortBy === 'name' ? 'A-Z' : 'Newest'}
                </Button>
              </Box>
            </Grid>
          </Grid>
          
          {refreshing && (
            <LinearProgress 
              sx={{ 
                mt: 2,
                borderRadius: 2,
                height: 3
              }} 
            />
          )}
        </Paper>

        {/* Customer Table */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            overflow: 'hidden',
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            bgcolor: 'background.paper',
          }}
        >
          <CustomerTable
            customers={customers}
            paginatedCustomers={paginatedCustomers}
            filteredCustomers={filteredCustomers}
            page={page}
            rowsPerPage={rowsPerPage}
            handleChangePage={handleChangePage}
            handleChangeRowsPerPage={handleChangeRowsPerPage}
            handleEdit={handleEdit}
            handleDelete={handleDelete}
            onSelectCustomer={onSelectCustomer}
            isMobile={isMobile}
            isTablet={isTablet}
            isSmallDesktop={isSmallDesktop}
            expandedRow={expandedRow}
            toggleRowExpansion={toggleRowExpansion}
            searchTerm={searchTerm}
          />
        </Paper>

        {/* Add/Edit Customer Dialog - Responsive */}
        <Dialog
          open={openDialog}
          onClose={handleCloseDialog}
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
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            bgcolor: isMobile ? 'primary.main' : 'transparent',
            color: isMobile ? 'primary.contrastText' : 'inherit',
          }}>
            <Typography variant={isMobile ? "h6" : "h5"} fontWeight={700}>
              {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
            </Typography>
            {!isMobile && (
              <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
                {editingCustomer ? `Update details for ${editingCustomer.name}` : 'Enter customer details'}
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
                onClose={() => setError('')}
              >
                {error}
              </Alert>
            )}
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Customer Name"
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                  required
                  size={isMobile ? "small" : "medium"}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AccountIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 1 }}
                />
                <Typography variant="caption" color="textSecondary" sx={{ pl: 4 }}>
                  Required. Enter the customer's full name
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                  size={isMobile ? "small" : "medium"}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
                <Typography variant="caption" color="textSecondary" sx={{ pl: 4 }}>
                  Optional. Enter phone number for contact
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                  size={isMobile ? "small" : "medium"}
                />
                <Typography variant="caption" color="textSecondary" sx={{ pl: 1 }}>
                  Optional. Enter email for digital communication
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  multiline
                  rows={isMobile ? 2 : 3}
                  value={newCustomer.address}
                  onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                  size={isMobile ? "small" : "medium"}
                />
                <Typography variant="caption" color="textSecondary" sx={{ pl: 1 }}>
                  Optional. Enter customer's address
                </Typography>
              </Grid>
            </Grid>
          </DialogContent>
          
          <DialogActions sx={{ 
            p: isMobile ? 2 : 3, 
            pt: isMobile ? 1 : 2,
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            bgcolor: isMobile ? 'background.default' : 'transparent',
          }}>
            <Button
              onClick={handleCloseDialog}
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
              onClick={handleSubmit}
              sx={{ 
                borderRadius: 2,
                px: 3,
                py: 1,
                fontWeight: 600,
              }}
              startIcon={isMobile ? null : (editingCustomer ? <EditIcon /> : <AddIcon />)}
            >
              {editingCustomer ? 'Update' : 'Add Customer'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar Notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={snackbar.severity === 'warning' ? null : 6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ 
            vertical: isMobile ? 'bottom' : 'bottom', 
            horizontal: isMobile ? 'center' : 'right' 
          }}
          TransitionComponent={Zoom}
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

export default CustomerManagement;