import React, { useState, useEffect, useCallback } from 'react';
import {
  Paper,
  Box,
  Typography,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  IconButton,
  Tooltip,
  Button,
} from '@mui/material';
import {
  PictureAsPdf as PdfIcon,
  GridOn as ExcelIcon,
  Print as PrintIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Inventory as InventoryIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';
import { supabase } from '../config/supabase';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Import tab components
import CustomerSpendingTab from './ReportTabs/CustomerSpendingTab';
import ProductBuyTab from './ReportTabs/ProductBuyTab';
import RecentTransactionsTab from './ReportTabs/RecentTransactionsTab';
import CustomerListTab from './ReportTabs/CustomerListTab';
import ProductListTab from './ReportTabs/ProductListTab';

const Reports = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState({
    customers: [],
    products: [],
    transactions: [],
    summary: null,
  });
  const [dateRange, setDateRange] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchReportData = useCallback(async () => {
    try {
      setLoading(true);

      // Build date filter
      let dateFilter = {};
      if (dateRange === 'month') {
        const start = startOfMonth(new Date());
        const end = endOfMonth(new Date());
        dateFilter = { created_at: { gte: start.toISOString(), lte: end.toISOString() } };
      } else if (dateRange === 'lastMonth') {
        const start = startOfMonth(subMonths(new Date(), 1));
        const end = endOfMonth(subMonths(new Date(), 1));
        dateFilter = { created_at: { gte: start.toISOString(), lte: end.toISOString() } };
      } else if (dateRange === 'custom' && startDate && endDate) {
        dateFilter = { created_at: { gte: startDate, lte: endDate } };
      }

      // Fetch all data in parallel
      const [
        customersResponse,
        productsResponse,
        transactionsResponse
      ] = await Promise.all([
        supabase.from('customers').select('*').order('created_at', { ascending: false }),
        supabase.from('products').select('*').order('created_at', { ascending: false }),
        supabase.from('transactions')
          .select(`
            *,
            customers (name, phone),
            products (name, serial_number)
          `)
          .order('created_at', { ascending: false })
      ]);

      // Calculate summary
      const transactions = transactionsResponse.data || [];
      const totalAmount = transactions.reduce((sum, t) => sum + (parseFloat(t.total_amount) || 0), 0);
      const totalQuantity = transactions.reduce((sum, t) => sum + (parseFloat(t.quantity) || 0), 0);
      
      // Calculate customer spending
      const customerSpending = {};
      transactions.forEach(t => {
        if (t.customer_id && t.customers) {
          if (!customerSpending[t.customer_id]) {
            customerSpending[t.customer_id] = {
              name: t.customers.name,
              phone: t.customers.phone,
              total: 0,
              transactions: 0
            };
          }
          customerSpending[t.customer_id].total += parseFloat(t.total_amount) || 0;
          customerSpending[t.customer_id].transactions += 1;
        }
      });

      // Calculate product purchases
      const productPurchases = {};
      transactions.forEach(t => {
        if (t.product_id && t.products) {
          if (!productPurchases[t.product_id]) {
            productPurchases[t.product_id] = {
              name: t.products.name,
              serial: t.products.serial_number,
              quantity: 0,
              amount: 0
            };
          }
          productPurchases[t.product_id].quantity += parseFloat(t.quantity) || 0;
          productPurchases[t.product_id].amount += parseFloat(t.total_amount) || 0;
        }
      });

      setReportData({
        customers: customersResponse.data || [],
        products: productsResponse.data || [],
        transactions: transactions,
        summary: {
          totalCustomers: customersResponse.data?.length || 0,
          totalProducts: productsResponse.data?.length || 0,
          totalTransactions: transactions.length,
          totalAmount,
          totalQuantity,
          customerSpending: Object.values(customerSpending).sort((a, b) => b.total - a.total),
          productPurchases: Object.values(productPurchases).sort((a, b) => b.amount - a.amount),
          dateRange: getDateRangeText(),
        }
      });
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  }, [dateRange, startDate, endDate]);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  const getDateRangeText = () => {
    switch (dateRange) {
      case 'month': return 'This Month';
      case 'lastMonth': return 'Last Month';
      case 'custom': return `Custom: ${format(new Date(startDate), 'dd/MM/yyyy')} - ${format(new Date(endDate), 'dd/MM/yyyy')}`;
      default: return 'All Time';
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text('TZ Scraps - Business Report', 20, 20);
    
    doc.setFontSize(12);
    doc.text(`Report Period: ${reportData.summary?.dateRange || 'All Time'}`, 20, 35);
    doc.text(`Generated: ${format(new Date(), 'dd/MM/yyyy hh:mm a')}`, 20, 42);
    
    let yPos = 55;
    
    doc.setFontSize(14);
    doc.text('Summary Statistics', 20, yPos);
    yPos += 10;
    
    const summaryData = [
      ['Total Customers', reportData.summary?.totalCustomers || 0],
      ['Total Products', reportData.summary?.totalProducts || 0],
      ['Total Transactions', reportData.summary?.totalTransactions || 0],
      ['Total Amount', `₦${(reportData.summary?.totalAmount || 0).toFixed(2)}`],
      ['Total Quantity', (reportData.summary?.totalQuantity || 0).toFixed(2)],
    ];
    
    autoTable(doc, {
      startY: yPos,
      head: [['Metric', 'Value']],
      body: summaryData,
      theme: 'grid',
    });
    
    yPos = doc.lastAutoTable.finalY + 15;
    
    // Export based on active tab
    switch (activeTab) {
      case 0: // Customer Spending
        if (reportData.summary?.customerSpending?.length > 0) {
          doc.setFontSize(14);
          doc.text('Customer Spending Report', 20, yPos);
          yPos += 10;
          
          const customerData = reportData.summary.customerSpending.map(c => [
            c.name,
            c.phone || 'No Phone',
            c.transactions,
            `₦${c.total.toFixed(2)}`
          ]);
          
          autoTable(doc, {
            startY: yPos,
            head: [['Customer', 'Phone', 'Transactions', 'Total Spent']],
            body: customerData,
            theme: 'grid',
          });
        }
        break;
        
      case 1: // Product Buy
        if (reportData.summary?.productPurchases?.length > 0) {
          doc.setFontSize(14);
          doc.text('Product Buy Report', 20, yPos);
          yPos += 10;
          
          const productData = reportData.summary.productPurchases.map(p => [
            p.name,
            p.serial,
            p.quantity.toFixed(2),
            `₦${p.amount.toFixed(2)}`
          ]);
          
          autoTable(doc, {
            startY: yPos,
            head: [['Product', 'Serial', 'Quantity BUY', 'Amount']],
            body: productData,
            theme: 'grid',
          });
        }
        break;
        
      case 2: // Recent Transactions
        if (reportData.transactions?.length > 0) {
          doc.setFontSize(14);
          doc.text('Recent Transactions Report', 20, yPos);
          yPos += 10;
          
          const transactionData = reportData.transactions.slice(0, 100).map(t => [
            format(new Date(t.created_at), 'dd/MM/yy hh:mm a'),
            t.customers?.name || 'Unknown',
            t.products?.name || 'Unknown',
            `${t.quantity} ${t.unit}`,
            `₦${parseFloat(t.total_amount || 0).toFixed(2)}`
          ]);
          
          autoTable(doc, {
            startY: yPos,
            head: [['Date', 'Customer', 'Product', 'Quantity', 'Amount']],
            body: transactionData,
            theme: 'grid',
          });
        }
        break;
        
      case 3: // Customer List
        if (reportData.customers?.length > 0) {
          doc.setFontSize(14);
          doc.text('Customer List Report', 20, yPos);
          yPos += 10;
          
          const customerListData = reportData.customers.map(c => [
            c.name,
            c.phone || 'No Phone',
            format(new Date(c.created_at), 'dd MMM yyyy'),
            'Active'
          ]);
          
          autoTable(doc, {
            startY: yPos,
            head: [['Customer Name', 'Phone', 'Joined Date', 'Status']],
            body: customerListData,
            theme: 'grid',
          });
        }
        break;
        
      case 4: // Product List
        if (reportData.products?.length > 0) {
          doc.setFontSize(14);
          doc.text('Product List Report', 20, yPos);
          yPos += 10;
          
          const productListData = reportData.products.map(p => [
            p.name,
            p.serial_number,
            p.description || 'No description',
            format(new Date(p.created_at), 'dd MMM yyyy')
          ]);
          
          autoTable(doc, {
            startY: yPos,
            head: [['Product Name', 'Serial No', 'Description', 'Added Date']],
            body: productListData,
            theme: 'grid',
          });
        }
        break;
    }
    
    doc.save(`TZ-Scraps-Report-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  const generateExcel = () => {
    const workbook = XLSX.utils.book_new();
    
    const summaryData = [
      ['TZ Scraps - Business Report'],
      [`Report Period: ${reportData.summary?.dateRange || 'All Time'}`],
      [`Generated: ${format(new Date(), 'dd/MM/yyyy hh:mm a')}`],
      [],
      ['Summary Statistics'],
      ['Metric', 'Value'],
      ['Total Customers', reportData.summary?.totalCustomers || 0],
      ['Total Products', reportData.summary?.totalProducts || 0],
      ['Total Transactions', reportData.summary?.totalTransactions || 0],
      ['Total Amount', reportData.summary?.totalAmount || 0],
      ['Total Quantity', reportData.summary?.totalQuantity || 0],
    ];
    
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
    
    XLSX.writeFile(workbook, `TZ-Scraps-Report-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
  };

  const handlePrint = () => {
    window.print();
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return <CustomerSpendingTab customerSpending={reportData.summary?.customerSpending || []} />;
      case 1:
        return <ProductBuyTab productPurchases={reportData.summary?.productPurchases || []} />;
      case 2:
        return <RecentTransactionsTab transactions={reportData.transactions || []} />;
      case 3:
        return <CustomerListTab customers={reportData.customers || []} />;
      case 4:
        return <ProductListTab products={reportData.products || []} />;
      default:
        return null;
    }
  };

  return (
    <Box sx={{ p: { xs: 1, sm: 2 } }}>
      {/* Header - Compact Design */}
      <Box sx={{ mb: 2 }}>
        <Grid container alignItems="center" justifyContent="space-between" spacing={1}>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ 
                width: 36, 
                height: 36, 
                borderRadius: '50%',
                bgcolor: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
              }}>
                <TrendingUpIcon fontSize="small" />
              </Box>
              <Box>
                <Typography 
                  variant="h6" 
                  fontWeight={600}
                  color="text.primary"
                  sx={{ lineHeight: 1.2 }}
                >
                  Business Reports
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Analyze business performance
                </Typography>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box sx={{ 
              display: 'flex', 
              gap: 0.75,
              justifyContent: { xs: 'flex-start', md: 'flex-end' },
              flexWrap: 'wrap',
            }}>
              <Tooltip title="Print Report">
                <IconButton
                  size="small"
                  onClick={handlePrint}
                  sx={{ 
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    p: 0.75,
                  }}
                >
                  <PrintIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Download PDF">
                <IconButton
                  size="small"
                  onClick={generatePDF}
                  sx={{ 
                    bgcolor: 'error.light',
                    color: 'error.contrastText',
                    borderRadius: 1,
                    p: 0.75,
                    '&:hover': { bgcolor: 'error.main' }
                  }}
                >
                  <PdfIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Download Excel">
                <IconButton
                  size="small"
                  onClick={generateExcel}
                  sx={{ 
                    bgcolor: 'success.light',
                    color: 'success.contrastText',
                    borderRadius: 1,
                    p: 0.75,
                    '&:hover': { bgcolor: 'success.main' }
                  }}
                >
                  <ExcelIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Date Range Filter - Compact Search Design */}
      <Paper sx={{ 
        p: 1.5, 
        mb: 2, 
        borderRadius: 1,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}>
        <Grid container spacing={1} alignItems="center">
          <Grid item xs={12} md={5}>
            <FormControl fullWidth size="small">
              <InputLabel sx={{ fontSize: '0.875rem' }}>Time Period</InputLabel>
              <Select
                value={dateRange}
                label="Time Period"
                onChange={(e) => setDateRange(e.target.value)}
                size="small"
                sx={{ 
                  borderRadius: 0.75,
                  fontSize: '0.875rem',
                  '& .MuiSelect-select': {
                    py: 1,
                  }
                }}
              >
                <MenuItem value="all" sx={{ fontSize: '0.875rem' }}>All Time</MenuItem>
                <MenuItem value="month" sx={{ fontSize: '0.875rem' }}>This Month</MenuItem>
                <MenuItem value="lastMonth" sx={{ fontSize: '0.875rem' }}>Last Month</MenuItem>
                <MenuItem value="custom" sx={{ fontSize: '0.875rem' }}>Custom Range</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          {dateRange === 'custom' && (
            <>
              <Grid item xs={12} md={3}>
                <TextField
                  label="From"
                  type="date"
                  fullWidth
                  size="small"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  InputLabelProps={{ 
                    shrink: true,
                    sx: { fontSize: '0.875rem' }
                  }}
                  InputProps={{
                    sx: {
                      fontSize: '0.875rem',
                      borderRadius: 0.75,
                      '& input': {
                        py: 1,
                      }
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  label="To"
                  type="date"
                  fullWidth
                  size="small"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  InputLabelProps={{ 
                    shrink: true,
                    sx: { fontSize: '0.875rem' }
                  }}
                  InputProps={{
                    sx: {
                      fontSize: '0.875rem',
                      borderRadius: 0.75,
                      '& input': {
                        py: 1,
                      }
                    }
                  }}
                />
              </Grid>
            </>
          )}
          
          <Grid item xs={12} md={dateRange === 'custom' ? 1 : 7}>
            <Button
              variant="contained"
              onClick={fetchReportData}
              fullWidth
              disabled={loading}
              size="small"
              sx={{ 
                borderRadius: 0.75,
                py: 1,
                fontSize: '0.875rem',
                fontWeight: 500,
              }}
            >
              {loading ? 'Loading...' : 'Refresh'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Statistics Cards - Reduced Width */}
      <Grid container spacing={1} sx={{ mb: 2 }}>
        {/* Customers Card */}
        <Grid item xs={6} sm={3}>
          <Card sx={{ 
            borderRadius: 1,
            border: 'none',
            bgcolor: 'primary.light',
            background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
            height: '100%',
            minWidth: '120px',
          }}>
            <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <PeopleIcon sx={{ 
                  fontSize: 18, 
                  color: 'primary.dark', 
                  mr: 1 
                }} />
                <Typography variant="caption" fontWeight={600} color="primary.dark">
                  Customers
                </Typography>
              </Box>
              <Typography variant="h5" fontWeight={700} color="text.primary">
                {reportData.summary?.totalCustomers || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Products Card */}
        <Grid item xs={6} sm={3}>
          <Card sx={{ 
            borderRadius: 1,
            border: 'none',
            bgcolor: 'secondary.light',
            background: 'linear-gradient(135deg, #ffecb3 0%, #ffe082 100%)',
            height: '100%',
            minWidth: '120px',
          }}>
            <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <InventoryIcon sx={{ 
                  fontSize: 18, 
                  color: 'secondary.dark', 
                  mr: 1 
                }} />
                <Typography variant="caption" fontWeight={600} color="secondary.dark">
                  Products
                </Typography>
              </Box>
              <Typography variant="h5" fontWeight={700} color="text.primary">
                {reportData.summary?.totalProducts || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Transactions Card */}
        <Grid item xs={6} sm={3}>
          <Card sx={{ 
            borderRadius: 1,
            border: 'none',
            bgcolor: 'info.light',
            background: 'linear-gradient(135deg, #e1f5fe 0%, #b3e5fc 100%)',
            height: '100%',
            minWidth: '120px',
          }}>
            <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrendingUpIcon sx={{ 
                  fontSize: 18, 
                  color: 'info.dark', 
                  mr: 1 
                }} />
                <Typography variant="caption" fontWeight={600} color="info.dark">
                  Transactions
                </Typography>
              </Box>
              <Typography variant="h5" fontWeight={700} color="text.primary">
                {reportData.summary?.totalTransactions || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Total Amount Card */}
        <Grid item xs={6} sm={3}>
          <Card sx={{ 
            borderRadius: 1,
            border: 'none',
            bgcolor: 'success.light',
            background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
            height: '100%',
            minWidth: '120px',
          }}>
            <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <MoneyIcon sx={{ 
                  fontSize: 18, 
                  color: 'success.dark', 
                  mr: 1 
                }} />
                <Typography variant="caption" fontWeight={600} color="success.dark">
                  Total Amount
                </Typography>
              </Box>
              <Typography variant="h5" fontWeight={700} color="text.primary">
                ₦{(reportData.summary?.totalAmount || 0).toFixed(0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Tabs */}
          <Paper sx={{ borderRadius: 1.5, overflow: 'hidden', mb: 2 }}>
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange}
              sx={{ 
                borderBottom: 1, 
                borderColor: 'divider',
                minHeight: 48,
              }}
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label="Customer Spending" sx={{ minHeight: 48, fontSize: '0.875rem' }} />
              <Tab label="Product Buy" sx={{ minHeight: 48, fontSize: '0.875rem' }} />
              <Tab label="Recent Transactions" sx={{ minHeight: 48, fontSize: '0.875rem' }} />
              <Tab label="Customer List" sx={{ minHeight: 48, fontSize: '0.875rem' }} />
              <Tab label="Product List" sx={{ minHeight: 48, fontSize: '0.875rem' }} />
            </Tabs>

            {/* Tab Content */}
            <Box sx={{ p: 2 }}>
              {renderTabContent()}
            </Box>
          </Paper>

          {/* Report Period Info */}
          <Box sx={{ p: 1.5, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Report Period: <strong>{reportData.summary?.dateRange || 'All Time'}</strong> • 
              Generated: {format(new Date(), 'dd/MM/yyyy hh:mm a')}
            </Typography>
          </Box>
        </>
      )}
    </Box>
  );
};

export default Reports;