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
  Tooltip,
  alpha,
  Zoom,
  Skeleton,
  LinearProgress,
  Card,
  CardContent,
  Avatar,
  Chip,
  Stack,
  Tabs,
  Tab,
  Drawer,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  AccountCircle as AccountIcon,
  Edit as EditIcon,
  Phone as PhoneIcon,
  Today as TodayIcon,
  People as PeopleIcon,
  AttachMoney as MoneyIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import { supabase } from '../config/supabase';
import { format, parseISO, isToday, startOfDay } from 'date-fns';

// Import the components
import CustomerTable from './CustomerTable';
import CustomerSheet from './CustomerSheet';

const CustomerManagement = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  const [activeTab, setActiveTab] = useState(0);
  const [customers, setCustomers] = useState([]);
  const [todayCustomers, setTodayCustomers] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedCustomer, setSelectedCustomer] = useState(null); // State for selected customer
  
  const [stats, setStats] = useState({
    today: 0,
    todayMoney: 0,
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

  const fetchCustomers = useCallback(async () => {
    try {
      setRefreshing(true);
      const today = new Date();
      const todayStart = startOfDay(today);
      
      // Fetch all customers (for All Customers tab)
      const { data: allData, error: allError } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (allError) throw allError;
      
      const allCustomersWithSN = (allData || []).map((customer, index) => ({
        ...customer,
        sn: index + 1,
      }));
      
      setCustomers(allCustomersWithSN);
      
      // Fetch today's customers and money (for Today tab)
      const { data: todayData, error: todayError } = await supabase
        .from('customers')
        .select('*')
        .gte('created_at', todayStart.toISOString())
        .lt('created_at', new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false });
      
      if (todayError) throw todayError;
      
      const todayCustomersWithSN = (todayData || []).map((customer, index) => ({
        ...customer,
        sn: index + 1,
        isToday: true,
      }));
      
      // Fetch today's transactions to calculate total money
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('total_amount')
        .gte('created_at', todayStart.toISOString())
        .lt('created_at', new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString());
      
      if (transactionsError) throw transactionsError;
      
      const todayMoney = transactionsData?.reduce((sum, transaction) => sum + (transaction.total_amount || 0), 0) || 0;
      
      setTodayCustomers(todayCustomersWithSN);
      setStats({
        today: todayCustomersWithSN.length,
        todayMoney: todayMoney,
      });
      
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

    if (!name) {
      setError('Customer name is required');
      return;
    }

    if (phone && !/^[\d\s\+\-\(\)]{8,15}$/.test(phone)) {
      setError('Please enter a valid phone number (8-15 digits)');
      return;
    }

    const customerData = {
      name,
      phone: phone || null,
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
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingCustomer(null);
    setNewCustomer({ name: '', phone: '' });
    setError('');
  };

  const handleRefresh = () => {
    fetchCustomers();
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setPage(0);
    setSearchTerm('');
  };

  // Handle customer selection
  const handleSelectCustomer = (customer) => {
    setSelectedCustomer(customer);
  };

  // Handle closing the customer sheet
  const handleCloseCustomerSheet = () => {
    setSelectedCustomer(null);
  };

  const currentCustomers = activeTab === 0 ? todayCustomers : customers;
  const filteredCustomers = currentCustomers.filter(customer => {
    if (!customer) return false;
    
    const search = searchTerm.toLowerCase();
    return (
      customer.name?.toLowerCase().includes(search) ||
      customer.phone?.includes(search) ||
      customer.sn?.toString().includes(search)
    );
  });

  const paginatedCustomers = filteredCustomers.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Loading skeleton
  if (loading) {
    return (
      <Box sx={{ p: isMobile ? 1.5 : 2 }}>
        {/* Header Skeleton */}
        <Box sx={{ mb: 2 }}>
          <Skeleton variant="rectangular" height={36} width="50%" sx={{ mb: 0.5, borderRadius: 1 }} />
          <Skeleton variant="rectangular" height={18} width="30%" sx={{ borderRadius: 0.5 }} />
        </Box>
        
        {/* Stats Card Skeletons */}
        <Grid container spacing={1.5} sx={{ mb: 2 }}>
          {[1, 2].map((item) => (
            <Grid item xs={6} key={item}>
              <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 1.5 }} />
            </Grid>
          ))}
        </Grid>
        
        {/* Tabs Skeleton */}
        <Skeleton variant="rectangular" height={40} sx={{ borderRadius: 1, mb: 2 }} />
        
        {/* Search Bar Skeleton */}
        <Skeleton 
          variant="rectangular" 
          height={48} 
          sx={{ borderRadius: 1.5, mb: 2 }}
        />
        
        {/* Table Skeletons */}
        {[...Array(4)].map((_, index) => (
          <Skeleton
            key={index}
            variant="rectangular"
            height={56}
            sx={{ 
              borderRadius: 1,
              mb: 0.5,
              width: '100%'
            }}
          />
        ))}
      </Box>
    );
  }

  return (
    <>
      <Fade in={!loading}>
        <Box sx={{ 
          bgcolor: 'background.default',
          p: isMobile ? 1.5 : 2,
        }}>
          {/* Header Section */}
          <Box sx={{ mb: 0 }}>
            <Grid container alignItems="center" justifyContent="space-between" spacing={0.5}>
              <Grid item xs={12} md={8}>
                <Typography 
                  variant={isMobile ? "h6" : "h5"} 
                  fontWeight={600}
                  color="text.primary"
                  sx={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    mb: 0,
                  }}
                >
                  <AccountIcon fontSize={isMobile ? "small" : "medium"} />
                  Customer Management
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                  Manage your customer records
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Box sx={{ 
                  display: 'flex', 
                  gap: 0.75,
                  justifyContent: isMobile ? 'flex-start' : 'flex-end',
                  mt: isMobile ? 0.5 : 0,
                }}>
                  <Tooltip title="Refresh">
                    <IconButton
                      onClick={handleRefresh}
                      disabled={refreshing}
                      size="small"
                      sx={{ 
                        bgcolor: 'background.paper',
                        border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                        '&:hover': {
                          bgcolor: alpha(theme.palette.primary.main, 0.04),
                        }
                      }}
                    >
                      <RefreshIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  
                  <Button
                    variant="contained"
                    size={isMobile ? "small" : "medium"}
                    color="primary"
                    startIcon={<AddIcon fontSize="small" />}
                    onClick={() => setOpenDialog(true)}
                    sx={{ 
                      borderRadius: 0.75,
                      px: 1.5,
                      py: 0.5,
                      fontWeight: 500,
                      fontSize: isMobile ? '0.75rem' : '0.8125rem',
                    }}
                  >
                    {isMobile ? 'Add' : 'Add Customer'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>

          {/* Statistics Cards */}
          <Grid container spacing={1} sx={{ mb: 2 }}>
            {/* Today's Customers Card */}
            <Grid item xs={6}>
              <Card sx={{ 
                borderRadius: 1,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
                bgcolor: 'background.paper',
                height: '100%',
                minWidth: '140px',
              }}>
                <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Avatar
                      sx={{
                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                        color: 'primary.main',
                        width: 32,
                        height: 32,
                        fontSize: '0.75rem',
                      }}
                    >
                      <PeopleIcon fontSize="small" />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight={700} color="text.primary" sx={{ fontSize: '1.25rem' }}>
                        {stats.today}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1, fontSize: '0.75rem' }}>
                        Today's Customers
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            
            {/* Today's Money Card */}
            <Grid item xs={6}>
              <Card sx={{ 
                borderRadius: 1,
                border: `1px solid ${alpha(theme.palette.success.main, 0.08)}`,
                bgcolor: 'background.paper',
                height: '100%',
                minWidth: '140px',
              }}>
                <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Avatar
                      sx={{
                        bgcolor: alpha(theme.palette.success.main, 0.08),
                        color: 'success.main',
                        width: 32,
                        height: 32,
                        fontSize: '0.75rem',
                      }}
                    >
                      <Typography sx={{ fontSize: '0.875rem', fontWeight: 700 }}>₦</Typography>
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight={700} color="text.primary" sx={{ fontSize: '1.25rem' }}>
                        ₦{stats.todayMoney.toLocaleString('en-NG')}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1, fontSize: '0.75rem' }}>
                        Today's Money
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Tabs */}
          <Paper sx={{ 
            mb: 2, 
            borderRadius: 1,
            bgcolor: 'background.paper',
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant="fullWidth"
              sx={{
                minHeight: 40,
                '& .MuiTab-root': {
                  minHeight: 40,
                  py: 1,
                  fontSize: '0.8125rem',
                  textTransform: 'none',
                }
              }}
            >
              <Tab 
                icon={<TodayIcon fontSize="small" />} 
                iconPosition="start"
                label="Today's Customers" 
                sx={{ 
                  minHeight: 40,
                  borderRight: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                }}
              />
              <Tab 
                icon={<HistoryIcon fontSize="small" />} 
                iconPosition="start"
                label="All Customers" 
              />
            </Tabs>
          </Paper>

          {/* Search Section */}
          <Paper 
            elevation={0}
            sx={{ 
              p: 1.5,
              mb: 2,
              borderRadius: 1.5,
              bgcolor: 'background.paper',
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            }}
          >
            <TextField
              fullWidth
              placeholder={activeTab === 0 ? "Search today's customers..." : "Search all customers..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              variant="outlined"
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => setSearchTerm('')}
                      sx={{ p: 0.25 }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        Clear
                      </Typography>
                    </IconButton>
                  </InputAdornment>
                ),
                sx: { 
                  borderRadius: 1,
                  fontSize: '0.875rem',
                }
              }}
            />
            
            {refreshing && (
              <LinearProgress 
                sx={{ 
                  mt: 1.5,
                  borderRadius: 1,
                  height: 1.5,
                  bgcolor: 'primary.light'
                }} 
              />
            )}
          </Paper>

          {/* Customer Table */}
          <Paper
            elevation={0}
            sx={{
              borderRadius: 1.5,
              overflow: 'hidden',
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              bgcolor: 'background.paper',
              mb: 2,
            }}
          >
            <CustomerTable
              customers={currentCustomers}
              paginatedCustomers={paginatedCustomers}
              filteredCustomers={filteredCustomers}
              page={page}
              rowsPerPage={rowsPerPage}
              handleChangePage={(e, newPage) => setPage(newPage)}
              handleChangeRowsPerPage={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              handleEdit={handleEdit}
              handleDelete={handleDelete}
              onSelectCustomer={handleSelectCustomer} // Pass the handler
              isMobile={isMobile}
              isTablet={isTablet}
              expandedRow={expandedRow}
              toggleRowExpansion={setExpandedRow}
              searchTerm={searchTerm}
              showDateColumn={activeTab === 1}
            />
          </Paper>

          {/* Add/Edit Customer Dialog */}
          <Dialog
            open={openDialog}
            onClose={handleCloseDialog}
            maxWidth="sm"
            fullWidth
            fullScreen={isMobile}
            PaperProps={{
              sx: {
                borderRadius: isMobile ? 0 : 1.5,
                m: isMobile ? 0 : 1,
              }
            }}
          >
            <DialogTitle sx={{ 
              p: 2, 
              borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            }}>
              <Typography variant="subtitle1" fontWeight={600}>
                {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
              </Typography>
            </DialogTitle>
            
            <DialogContent sx={{ p: 2 }}>
              {error && (
                <Alert 
                  severity="error" 
                  sx={{ 
                    mb: 2, 
                    borderRadius: 1,
                    fontSize: '0.875rem',
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
                    size="small"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 1,
                      }
                    }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    value={newCustomer.phone}
                    onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                    size="small"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 1,
                      }
                    }}
                  />
                </Grid>
              </Grid>
            </DialogContent>
            
            <DialogActions sx={{ 
              p: 2, 
              borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            }}>
              <Button
                onClick={handleCloseDialog}
                size="small"
                sx={{ 
                  borderRadius: 1,
                  px: 2,
                }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                size="small"
                onClick={handleSubmit}
                sx={{ 
                  borderRadius: 1,
                  px: 2,
                  fontWeight: 500,
                }}
              >
                {editingCustomer ? 'Update' : 'Add'}
              </Button>
            </DialogActions>
          </Dialog>

          {/* Snackbar Notifications */}
          <Snackbar
            open={snackbar.open}
            autoHideDuration={snackbar.severity === 'warning' ? null : 4000}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            anchorOrigin={{ 
              vertical: 'bottom', 
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
                borderRadius: 1,
                alignItems: 'center',
                fontSize: '0.875rem',
              }}
              action={snackbar.action}
            >
              {snackbar.message}
            </Alert>
          </Snackbar>
        </Box>
      </Fade>

      {/* Customer Sheet Drawer */}
      <Drawer
        anchor="right"
        open={!!selectedCustomer}
        onClose={handleCloseCustomerSheet}
        PaperProps={{
          sx: {
            width: isMobile ? '100%' : isTablet ? '70%' : '600px',
            maxWidth: '100%',
            boxShadow: theme.shadows[10],
          }
        }}
        ModalProps={{
          keepMounted: true,
        }}
      >
        {selectedCustomer && (
          <CustomerSheet 
            customer={selectedCustomer} 
            onBack={handleCloseCustomerSheet}
          />
        )}
      </Drawer>
    </>
  );
};

export default CustomerManagement;