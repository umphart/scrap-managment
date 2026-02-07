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
  Collapse,
  Tooltip,
  alpha,
  Zoom,
  Skeleton,
  LinearProgress,
  Card,
  CardContent,
  Chip,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  PersonAdd as PersonAddIcon,
  Refresh as RefreshIcon,
  ImportExport as ImportExportIcon,
  AccountCircle as AccountIcon,
  Edit as EditIcon,
  Phone as PhoneIcon,
  People as PeopleIcon,
  Today as TodayIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import PrintIcon from '@mui/icons-material/Print';
import { supabase } from '../config/supabase';
import { format, parseISO, isToday, isYesterday, isThisWeek, startOfDay, differenceInDays } from 'date-fns';

// Import the new components
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
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Group customers by date
  const [groupedCustomers, setGroupedCustomers] = useState({});
  const [expandedDates, setExpandedDates] = useState({});
  
  const [stats, setStats] = useState({
    total: 0,
    today: 0,
    yesterday: 0,
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

  // Group customers by date
  const groupCustomersByDate = (customersList) => {
    const grouped = {};
    
    customersList.forEach(customer => {
      const date = startOfDay(parseISO(customer.created_at));
      const dateKey = format(date, 'yyyy-MM-dd');
      const displayDate = format(date, 'dd MMM yyyy');
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = {
          date: date,
          displayDate: displayDate,
          customers: [],
          count: 0
        };
      }
      
      grouped[dateKey].customers.push(customer);
      grouped[dateKey].count++;
    });
    
    // Sort dates in descending order
    const sortedGrouped = {};
    Object.keys(grouped)
      .sort((a, b) => new Date(b) - new Date(a))
      .forEach(key => {
        sortedGrouped[key] = grouped[key];
      });
    
    return sortedGrouped;
  };

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
      const todayStart = startOfDay(now);
      const yesterdayStart = startOfDay(new Date(now.getTime() - 24 * 60 * 60 * 1000));
      
      const customersWithSN = (data || []).map((customer, index) => ({
        ...customer,
        sn: index + 1,
        isToday: startOfDay(parseISO(customer.created_at)).getTime() === todayStart.getTime(),
        isYesterday: startOfDay(parseISO(customer.created_at)).getTime() === yesterdayStart.getTime(),
      }));
      
      // Group customers by date
      const grouped = groupCustomersByDate(customersWithSN);
      
      // Calculate stats
      const stats = {
        total: customersWithSN.length,
        today: customersWithSN.filter(c => c.isToday).length,
        yesterday: customersWithSN.filter(c => c.isYesterday).length,
      };
      
      setCustomers(customersWithSN);
      setGroupedCustomers(grouped);
      setStats(stats);
      
      // Expand today's customers by default
      const todayKey = format(todayStart, 'yyyy-MM-dd');
      setExpandedDates({
        [todayKey]: true
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

  const handleExport = () => {
    showSnackbar('Export feature coming soon!', 'info');
  };

  const toggleDateExpansion = (dateKey) => {
    setExpandedDates(prev => ({
      ...prev,
      [dateKey]: !prev[dateKey]
    }));
  };

  const renderDateGroups = () => {
    return Object.keys(groupedCustomers).map(dateKey => {
      const group = groupedCustomers[dateKey];
      const isExpanded = expandedDates[dateKey];
      const isTodayGroup = startOfDay(new Date()).getTime() === group.date.getTime();
      const isYesterdayGroup = startOfDay(new Date().getTime() - 24 * 60 * 60 * 1000).getTime() === group.date.getTime();
      
      return (
        <Box key={dateKey} sx={{ mb: 3 }}>
          {/* Date Header */}
          <Paper
            elevation={0}
            sx={{
              p: 2,
              mb: 1,
              borderRadius: 2,
              bgcolor: isTodayGroup ? alpha(theme.palette.primary.main, 0.08) : 
                       isYesterdayGroup ? alpha(theme.palette.info.main, 0.08) : 
                       'background.paper',
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              cursor: 'pointer',
              '&:hover': {
                bgcolor: isTodayGroup ? alpha(theme.palette.primary.main, 0.12) : 
                         isYesterdayGroup ? alpha(theme.palette.info.main, 0.12) : 
                         alpha(theme.palette.action.hover, 0.04),
              }
            }}
            onClick={() => toggleDateExpansion(dateKey)}
          >
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between' 
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <TodayIcon color={isTodayGroup ? "primary" : isYesterdayGroup ? "info" : "action"} />
                <Box>
                  <Typography variant="h6" fontWeight={600}>
                    {group.displayDate}
                    {isTodayGroup && (
                      <Chip
                        label="Today"
                        size="small"
                        color="primary"
                        sx={{ ml: 2, height: 20, fontSize: '0.75rem' }}
                      />
                    )}
                    {isYesterdayGroup && (
                      <Chip
                        label="Yesterday"
                        size="small"
                        color="info"
                        sx={{ ml: 2, height: 20, fontSize: '0.75rem' }}
                      />
                    )}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {group.count} customer{group.count !== 1 ? 's' : ''}
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" color="textSecondary">
                  {isExpanded ? 'Hide' : 'Show'}
                </Typography>
                {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </Box>
            </Box>
          </Paper>
          
          {/* Customers for this date */}
          <Collapse in={isExpanded}>
            <CustomerTable
              customers={group.customers}
              paginatedCustomers={group.customers}
              filteredCustomers={group.customers}
              page={0}
              rowsPerPage={group.customers.length}
              handleChangePage={() => {}}
              handleChangeRowsPerPage={() => {}}
              handleEdit={handleEdit}
              handleDelete={handleDelete}
              onSelectCustomer={onSelectCustomer}
              isMobile={isMobile}
              isTablet={isTablet}
              isSmallDesktop={isSmallDesktop}
              expandedRow={expandedRow}
              toggleRowExpansion={setExpandedRow}
              searchTerm={searchTerm}
              hidePagination={true}
            />
          </Collapse>
        </Box>
      );
    });
  };

  // Filter customers based on search term
  const filteredCustomers = customers.filter(customer => {
    if (!customer) return false;
    
    const search = searchTerm.toLowerCase();
    return (
      customer.name?.toLowerCase().includes(search) ||
      customer.phone?.includes(search) ||
      customer.sn?.toString().includes(search)
    );
  });

  // Loading skeleton
  if (loading) {
    return (
      <Box sx={{ p: isMobile ? 2 : 3 }}>
        {/* Header Skeleton */}
        <Box sx={{ mb: 4 }}>
          <Skeleton variant="rectangular" height={40} width="60%" sx={{ mb: 1, borderRadius: 2 }} />
          <Skeleton variant="rectangular" height={20} width="40%" sx={{ borderRadius: 1 }} />
        </Box>
        
        {/* Total Customers Skeleton */}
        <Box sx={{ mb: 3 }}>
          <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 3, mb: 2 }} />
        </Box>
        
        {/* Search Bar Skeleton */}
        <Skeleton 
          variant="rectangular" 
          height={56} 
          sx={{ borderRadius: 2, mb: 3 }}
        />
        
        {/* Date Group Skeletons */}
        <Box sx={{ mb: 3 }}>
          {[...Array(3)].map((_, index) => (
            <React.Fragment key={index}>
              <Skeleton
                variant="rectangular"
                height={80}
                sx={{ 
                  borderRadius: 2,
                  mb: 1,
                  width: '100%'
                }}
              />
              <Box sx={{ pl: 2 }}>
                {[...Array(2)].map((_, subIndex) => (
                  <Skeleton
                    key={subIndex}
                    variant="rectangular"
                    height={60}
                    sx={{ 
                      borderRadius: 2,
                      mb: 1,
                      width: '100%'
                    }}
                  />
                ))}
              </Box>
            </React.Fragment>
          ))}
        </Box>
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
                Manage your customers - Grouped by day
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

        {/* Statistics Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={4}>
            <Card sx={{ 
              borderRadius: 3,
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: theme.shadows[8],
              }
            }}>
              <CardContent sx={{ 
                p: isMobile ? 2 : 3,
              }}>
                <Typography 
                  variant={isMobile ? "h3" : "h2"} 
                  fontWeight={800}
                  sx={{ 
                    mb: 0.5,
                    textShadow: `0 2px 4px ${alpha(theme.palette.common.black, 0.2)}`,
                  }}
                >
                  {stats.total}
                </Typography>
                <Typography 
                  variant={isMobile ? "h6" : "h5"} 
                  sx={{ 
                    opacity: 0.9,
                    fontWeight: 600,
                  }}
                >
                  Total Customers
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Card sx={{ 
              borderRadius: 3,
              bgcolor: 'info.main',
              color: 'info.contrastText',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: theme.shadows[8],
              }
            }}>
              <CardContent sx={{ 
                p: isMobile ? 2 : 3,
              }}>
                <Typography 
                  variant={isMobile ? "h3" : "h2"} 
                  fontWeight={800}
                  sx={{ 
                    mb: 0.5,
                    textShadow: `0 2px 4px ${alpha(theme.palette.common.black, 0.2)}`,
                  }}
                >
                  {stats.today}
                </Typography>
                <Typography 
                  variant={isMobile ? "h6" : "h5"} 
                  sx={{ 
                    opacity: 0.9,
                    fontWeight: 600,
                  }}
                >
                  Today's Customers
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Card sx={{ 
              borderRadius: 3,
              bgcolor: 'success.main',
              color: 'success.contrastText',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: theme.shadows[8],
              }
            }}>
              <CardContent sx={{ 
                p: isMobile ? 2 : 3,
              }}>
                <Typography 
                  variant={isMobile ? "h3" : "h2"} 
                  fontWeight={800}
                  sx={{ 
                    mb: 0.5,
                    textShadow: `0 2px 4px ${alpha(theme.palette.common.black, 0.2)}`,
                  }}
                >
                  {stats.yesterday}
                </Typography>
                <Typography 
                  variant={isMobile ? "h6" : "h5"} 
                  sx={{ 
                    opacity: 0.9,
                    fontWeight: 600,
                  }}
                >
                  Yesterday's
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

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
            <Grid item xs={12}>
              <TextField
                fullWidth
                placeholder="Search customers by name or phone..."
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

        {/* Date Grouped Customers */}
        {searchTerm ? (
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
              paginatedCustomers={filteredCustomers.slice(0, rowsPerPage)}
              filteredCustomers={filteredCustomers}
              page={page}
              rowsPerPage={rowsPerPage}
              handleChangePage={(e, newPage) => setPage(newPage)}
              handleChangeRowsPerPage={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
              handleEdit={handleEdit}
              handleDelete={handleDelete}
              onSelectCustomer={onSelectCustomer}
              isMobile={isMobile}
              isTablet={isTablet}
              isSmallDesktop={isSmallDesktop}
              expandedRow={expandedRow}
              toggleRowExpansion={setExpandedRow}
              searchTerm={searchTerm}
            />
          </Paper>
        ) : (
          /* Date Grouped View */
          <Box>
            {renderDateGroups()}
          </Box>
        )}

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