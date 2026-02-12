import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Box, Grid, Typography, Snackbar, Alert, Button, Menu, MenuItem, ListItemIcon, ListItemText, useTheme, useMediaQuery } from '@mui/material';
import { supabase } from '../config/supabase';
import CustomerSheetHeader from './CustomerSheetHeader';
import TransactionTable from './TransactionTable';
import SummaryPanel from './SummaryPanel';
import AddProductDialog from './AddProductDialog';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const CustomerSheet = ({ customer, onBack }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  const [transactions, setTransactions] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [openProductDialog, setOpenProductDialog] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [transactionToEdit, setTransactionToEdit] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [currentInvoiceTransactions, setCurrentInvoiceTransactions] = useState([]);

  const receiptRef = useRef();

  const showSnackbar = useCallback((message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  }, []);

  // Generate unique invoice number for each customer session
  const generateInvoiceNumber = useCallback(async () => {
    try {
      // Get customer initials (max 3 characters)
      const customerInitials = customer.name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .replace(/[^A-Z]/g, '')
        .slice(0, 3);

      // Pad with 'X' if less than 3 characters
      const paddedInitials = customerInitials.padEnd(3, 'X');

      // Get current date in YYYYMMDD format
      const today = new Date();
      const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');

      // Query the last invoice number for today with this customer
      const { data, error } = await supabase
        .from('transactions')
        .select('invoice_number')
        .eq('customer_id', customer.id)
        .like('invoice_number', `${paddedInitials}-${dateStr}-%`)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;

      let sequential = 1;
      if (data && data.length > 0) {
        // Extract sequential number from last invoice
        const lastInvoice = data[0].invoice_number;
        const lastSequential = parseInt(lastInvoice.split('-').pop());
        sequential = lastSequential + 1;
      }

      // Format: XXX-YYYYMMDD-XXX (Initials-Date-Sequential)
      const newInvoiceNumber = `${paddedInitials}-${dateStr}-${sequential.toString().padStart(3, '0')}`;
      setInvoiceNumber(newInvoiceNumber);
      
      return newInvoiceNumber;
    } catch (error) {
      console.error('Error generating invoice number:', error);
      // Fallback to timestamp-based number
      const fallbackNumber = `INV-${Date.now().toString().slice(-8)}`;
      setInvoiceNumber(fallbackNumber);
      return fallbackNumber;
    }
  }, [customer]);

  // Filter transactions for current invoice
  useEffect(() => {
    if (transactions.length > 0 && invoiceNumber) {
      const currentInvoice = transactions.filter(t => t.invoice_number === invoiceNumber);
      setCurrentInvoiceTransactions(currentInvoice);
    } else {
      setCurrentInvoiceTransactions([]);
    }
  }, [transactions, invoiceNumber]);

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          products (*)
        `)
        .eq('customer_id', customer.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching transactions:', error);
        showSnackbar('Error loading transactions', 'error');
      } else {
        setTransactions(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
      showSnackbar('Error loading transactions', 'error');
    } finally {
      setLoading(false);
    }
  }, [customer.id, showSnackbar]);

  const fetchProducts = useCallback(async () => {
    try {
      setProductsLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching products:', error);
        showSnackbar('Error loading products', 'error');
        return [];
      } else {
        setProducts(data || []);
        return data || [];
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      showSnackbar('Error loading products', 'error');
      return [];
    } finally {
      setProductsLoading(false);
    }
  }, [showSnackbar]);

  useEffect(() => {
    fetchTransactions();
    fetchProducts();
    generateInvoiceNumber();
  }, [fetchTransactions, fetchProducts, generateInvoiceNumber]);

  const handleAddProductDialogOpen = async () => {
    if (products.length === 0) {
      await fetchProducts();
    }
    setOpenProductDialog(true);
  };

  const handleAddProduct = async (transactionData) => {
    try {
      const transaction = {
        customer_id: customer.id,
        product_id: transactionData.product.id,
        quantity: parseFloat(transactionData.quantity),
        price: parseFloat(transactionData.price),
        unit: transactionData.unit,
        total_amount: parseFloat(transactionData.total_amount),
        invoice_number: invoiceNumber, // Assign current invoice number
      };

      let error;
      
      if (transactionData.id) {
        // Editing existing transaction
        const { error: updateError } = await supabase
          .from('transactions')
          .update(transaction)
          .eq('id', transactionData.id);
        
        error = updateError;
        
        if (!error) {
          showSnackbar('Transaction updated successfully!', 'success');
        }
      } else {
        // Adding new transaction
        const { error: insertError } = await supabase
          .from('transactions')
          .insert([transaction]);
        
        error = insertError;
        
        if (!error) {
          showSnackbar('Product added successfully!', 'success');
        }
      }

      if (error) {
        console.error('Error saving transaction:', error);
        showSnackbar('Error saving transaction. Please try again.', 'error');
        return;
      }

      await fetchTransactions();
      setOpenProductDialog(false);
      setTransactionToEdit(null);
      
    } catch (error) {
      console.error('Error:', error);
      showSnackbar('Error saving transaction. Please try again.', 'error');
    }
  };

  // Start a new invoice/session
  const handleNewInvoice = async () => {
    await generateInvoiceNumber();
    showSnackbar('New invoice started!', 'success');
  };

  const handleDeleteTransaction = async (id) => {
    setSnackbar({
      open: true,
      message: 'Are you sure you want to delete this transaction?',
      severity: 'warning',
      action: (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button 
            color="inherit" 
            size="small" 
            onClick={() => setSnackbar({ ...snackbar, open: false })}
          >
            Cancel
          </Button>
          <Button 
            color="error" 
            size="small" 
            variant="contained"
            onClick={async () => {
              setSnackbar({ ...snackbar, open: false });
              try {
                const { error } = await supabase
                  .from('transactions')
                  .delete()
                  .eq('id', id);
                
                if (error) throw error;
                
                setTransactions(transactions.filter(t => t.id !== id));
                showSnackbar('Transaction deleted successfully!', 'success');
              } catch (error) {
                console.error('Error deleting transaction:', error);
                showSnackbar('Error deleting transaction. Please try again.', 'error');
              }
            }}
          >
            Delete
          </Button>
        </Box>
      ),
    });
  };

  const handleEditTransaction = async (transaction) => {
    try {
      setTransactionToEdit(transaction);
      setOpenProductDialog(true);
    } catch (error) {
      console.error('Error preparing to edit transaction:', error);
      showSnackbar('Error preparing to edit transaction', 'error');
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  };

  const generateReceiptHTML = () => {
    const totalAmount = currentInvoiceTransactions.reduce((sum, t) => sum + (parseFloat(t.total_amount) || 0), 0);
    const currentDate = new Date();
    
    return `
      <div id="receipt-content" style="font-family: 'Arial', sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; background: white;">
        <!-- Company Header - TASI'U ZOLA GLOBAL ENTERPRISES -->
        <div style="text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 3px solid #1a3e6f; background: linear-gradient(135deg, #1a3e6f 0%, #2a4f7f 100%); color: white; padding: 25px; border-radius: 10px 10px 0 0;">
          <div style="font-size: 26px; font-weight: 700; margin-bottom: 5px; letter-spacing: 1px;">TASI'U ZOLA GLOBAL ENTERPRISES NIG. LTD</div>
          <div style="font-size: 16px; opacity: 0.9; margin-bottom: 10px;">Dealers In All Kind Of Panel Such As; Phone, DVD, Laptop Etc.</div>
          <div style="font-size: 14px; opacity: 0.8; margin-top: 10px;">
            📞 09074444742 | 09069363200 | 08166667597
          </div>
        </div>
        
        <!-- Invoice Header with Dynamic Invoice Number -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding: 15px; background: #f0f4f8; border-left: 4px solid #1a3e6f;">
          <div>
            <span style="background: #1a3e6f; color: white; padding: 6px 15px; border-radius: 4px; font-weight: 600; letter-spacing: 1px; font-size: 16px;">
              CASH/SALES INVOICE
            </span>
            <span style="margin-left: 10px; color: #1a3e6f; font-weight: 600; font-size: 16px;">
              #${invoiceNumber}
            </span>
          </div>
          <div style="text-align: right;">
            <div style="color: #666; font-size: 12px; margin-bottom: 4px;">DAY MONTH YEAR</div>
            <div style="color: #1a3e6f; font-weight: 700; font-size: 18px;">${currentDate.toLocaleDateString('en-GB')}</div>
          </div>
        </div>
        
        <!-- Company Address & Customer Info -->
        <div style="display: flex; justify-content: space-between; margin: 25px 0; padding: 20px; background: #f8f9fa; border-radius: 8px;">
          <div style="flex: 1;">
            <h3 style="color: #1a3e6f; margin-bottom: 15px; font-size: 18px; border-bottom: 2px solid #e0e0e0; padding-bottom: 8px;">HEAD OFFICE</h3>
            <div style="margin-bottom: 8px; display: flex; align-items: center;">
              <span style="font-weight: 600; min-width: 100px; color: #555;">Address:</span>
              <span style="color: #333;">Kwanar Tikari Gama</span>
            </div>
            <div style="margin-bottom: 8px; display: flex; align-items: center;">
              <span style="font-weight: 600; min-width: 100px; color: #555;"></span>
              <span style="color: #333;">Nasarawa Local Government,</span>
            </div>
            <div style="margin-bottom: 8px; display: flex; align-items: center;">
              <span style="font-weight: 600; min-width: 100px; color: #555;"></span>
              <span style="color: #333;">Kano State</span>
            </div>
          </div>
          
          <div style="flex: 1;">
            <h3 style="color: #1a3e6f; margin-bottom: 15px; font-size: 18px; border-bottom: 2px solid #e0e0e0; padding-bottom: 8px;">Customer Details</h3>
            <div style="margin-bottom: 8px; display: flex; align-items: center;">
              <span style="font-weight: 600; min-width: 100px; color: #555;">Name:</span>
              <span style="color: #333;">${customer.name}</span>
            </div>
            <div style="margin-bottom: 8px; display: flex; align-items: center;">
              <span style="font-weight: 600; min-width: 100px; color: #555;">Phone:</span>
              <span style="color: #333;">${customer.phone || 'Not provided'}</span>
            </div>
            <div style="margin-bottom: 8px; display: flex; align-items: center;">
              <span style="font-weight: 600; min-width: 100px; color: #555;">Customer ID:</span>
              <span style="color: #333;">${customer.id?.slice(0, 8).toUpperCase()}</span>
            </div>
          </div>
        </div>
        
        <!-- Transactions Table -->
        <table style="width: 100%; border-collapse: collapse; margin: 25px 0; box-shadow: 0 2px 8px rgba(0,0,0,0.05); border-radius: 8px; overflow: hidden;">
          <thead>
            <tr style="background: #1a3e6f; color: white;">
              <th style="font-weight: 600; padding: 14px 12px; text-align: left; font-size: 14px;">S/N</th>
              <th style="font-weight: 600; padding: 14px 12px; text-align: left; font-size: 14px;">Product</th>
              <th style="font-weight: 600; padding: 14px 12px; text-align: left; font-size: 14px;">Price</th>
              <th style="font-weight: 600; padding: 14px 12px; text-align: left; font-size: 14px;">Quantity</th>
              <th style="font-weight: 600; padding: 14px 12px; text-align: left; font-size: 14px;">Amount (₦)</th>
            </tr>
          </thead>
          <tbody>
            ${currentInvoiceTransactions.map((t, index) => `
              <tr style="${index % 2 === 0 ? 'background: #f8f9fa;' : ''}">
                <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; font-size: 14px;">${index + 1}</td>
                <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; font-size: 14px;">${t.products?.name || 'N/A'}</td>
                <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; font-size: 14px;">₦${parseFloat(t.price || 0).toFixed(2)}/${t.unit || 'unit'}</td>
                <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; font-size: 14px;">${t.quantity} ${t.unit || 'unit'}</td>
                <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; font-size: 14px; font-weight: bold; color: #1a3e6f;">₦${parseFloat(t.total_amount || 0).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <!-- Total Section -->
        <div style="text-align: right; margin-top: 30px; padding-top: 20px; border-top: 3px solid #1a3e6f;">
          <div style="margin-bottom: 10px; font-size: 14px; color: #666;">
            Total Items: ${currentInvoiceTransactions.length} | Total Quantity: ${currentInvoiceTransactions.reduce((sum, t) => sum + (parseFloat(t.quantity) || 0), 0)}
          </div>
          <div style="font-size: 24px; font-weight: bold;">
            TOTAL AMOUNT: <span style="color: #1a3e6f; font-size: 32px; margin-left: 10px;">₦${totalAmount.toFixed(2)}</span>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="text-align: center; margin-top: 40px; color: #666; font-size: 12px; padding-top: 20px; border-top: 1px solid #ddd;">
          <div style="color: #1a3e6f; font-weight: 600; margin-bottom: 15px; font-size: 14px;">Thank you for your business!</div>
          <p style="margin-bottom: 5px;">This is a computer generated invoice - No signature required</p>
          <p style="margin-top: 15px; color: #1a3e6f; font-size: 13px;">
            <strong>HEAD OFFICE:</strong> Kwanar Tikari Gama, Nasarawa Local Government, Kano State
          </p>
          <p style="margin-top: 5px; color: #555;">
            Contact: 09074444742 | 09069363200 | 08166667597
          </p>
          <p style="margin-top: 15px; font-size: 10px; color: #999;">
            Invoice #: ${invoiceNumber} | Generated on ${currentDate.toLocaleString('en-GB')}
          </p>
        </div>
        
        <!-- Watermark -->
        <div style="position: fixed; bottom: 30%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); font-size: 80px; color: rgba(26, 62, 111, 0.03); font-weight: bold; pointer-events: none; z-index: -1;">
          TASI'U ZOLA
        </div>
      </div>
    `;
  };

  const handlePrint = () => {
    if (currentInvoiceTransactions.length === 0) {
      showSnackbar('No transactions to print. Add products first.', 'warning');
      return;
    }

    const printWindow = window.open('', '_blank');
    const receiptHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Tasi'u Zola Global Enterprises - Invoice ${invoiceNumber}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Roboto', Arial, sans-serif; padding: 20px; }
            @media print {
              body { padding: 0; }
              .no-print { display: none !important; }
            }
          </style>
        </head>
        <body>
          ${generateReceiptHTML()}
          <script>
            window.onload = function() {
              setTimeout(() => {
                window.print();
                setTimeout(() => {
                  window.close();
                }, 500);
              }, 500);
            };
          </script>
        </body>
      </html>
    `;
    
    printWindow.document.write(receiptHTML);
    printWindow.document.close();
    showSnackbar('Opening print dialog...', 'info');
  };

  const generatePDF = async () => {
    if (currentInvoiceTransactions.length === 0) {
      showSnackbar('No transactions to download. Add products first.', 'warning');
      return;
    }

    try {
      showSnackbar('Generating PDF...', 'info');
      
      // Create a temporary container for the receipt
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '0';
      tempDiv.style.width = '800px';
      tempDiv.style.padding = '20px';
      tempDiv.style.background = 'white';
      tempDiv.innerHTML = generateReceiptHTML();
      document.body.appendChild(tempDiv);

      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      document.body.removeChild(tempDiv);

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Calculate dimensions to fit the content
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 30;
      
      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);

      // Add page number
      const pageCount = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(10);
        pdf.setTextColor(150, 150, 150);
        pdf.text(`Page ${i} of ${pageCount}`, pdfWidth - 30, pdfHeight - 10);
      }

      const fileName = `Tasiu_Zola_Invoice_${customer.name.replace(/\s+/g, '_')}_${invoiceNumber.replace(/-/g, '_')}.pdf`;
      
      pdf.save(fileName);
      showSnackbar('PDF downloaded successfully!', 'success');
    } catch (error) {
      console.error('Error generating PDF:', error);
      showSnackbar('Error generating PDF. Please try again.', 'error');
    }
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handlePrintAndPDF = async () => {
    handlePrint();
    // Wait a bit before generating PDF to avoid conflicts
    setTimeout(async () => {
      await generatePDF();
    }, 2000);
  };

  const totalAmount = currentInvoiceTransactions.reduce((sum, transaction) => 
    sum + (parseFloat(transaction.total_amount) || 0), 0
  );

  const totalItems = currentInvoiceTransactions.reduce((sum, transaction) => 
    sum + (parseFloat(transaction.quantity) || 0), 0
  );

  if (!customer) {
    return (
      <Box sx={{ 
        p: isMobile ? 2 : 3, 
        textAlign: 'center' 
      }}>
        <Typography variant="h6" color="textSecondary">
          No customer selected
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      p: isMobile ? 2 : 3,
      height: 'calc(100vh - 64px)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <Box sx={{ mb: isMobile ? 1 : 2 }}>
        <CustomerSheetHeader
          customer={customer}
          onBack={onBack}
          onPrint={handlePrint}
          onAddProduct={handleAddProductDialogOpen}
          transactions={currentInvoiceTransactions}
          onDownload={generatePDF}
          onPrintAndDownload={handlePrintAndPDF}
          onNewInvoice={handleNewInvoice}
          anchorEl={anchorEl}
          onMenuOpen={handleMenuOpen}
          onMenuClose={handleMenuClose}
          invoiceNumber={invoiceNumber}
        />
      </Box>

      {/* Main Content with Scroll */}
      <Box sx={{ 
        flex: 1,
        overflow: 'auto',
        '&::-webkit-scrollbar': {
          width: '8px',
          height: '8px',
        },
        '&::-webkit-scrollbar-track': {
          backgroundColor: 'grey.100',
          borderRadius: '4px',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: 'grey.400',
          borderRadius: '4px',
        },
        '&::-webkit-scrollbar-thumb:hover': {
          backgroundColor: 'grey.500',
        },
      }}>
        <Grid container spacing={isMobile ? 1 : isTablet ? 2 : 3} sx={{ minHeight: '100%' }}>
          <Grid item xs={12} lg={8} md={7}>
            <Box sx={{ 
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <TransactionTable
                transactions={currentInvoiceTransactions}
                onDeleteTransaction={handleDeleteTransaction}
                onEditTransaction={handleEditTransaction}
                loading={loading}
              />
            </Box>
          </Grid>

          <Grid item xs={12} lg={4} md={5}>
            <Box sx={{ 
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <SummaryPanel
                transactions={currentInvoiceTransactions}
                totalAmount={totalAmount}
                totalItems={totalItems}
                onDownload={generatePDF}
                onPrint={handlePrint}
                onPrintAndDownload={handlePrintAndPDF}
                invoiceNumber={invoiceNumber}
              />
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Dialog and other components */}
      <AddProductDialog
        open={openProductDialog}
        onClose={() => {
          setOpenProductDialog(false);
          setTransactionToEdit(null);
        }}
        products={products}
        productsLoading={productsLoading}
        onAddProduct={handleAddProduct}
        customer={customer}
        onRefreshProducts={fetchProducts}
        transactionToEdit={transactionToEdit}
      />

      {/* Hidden receipt for PDF generation */}
      <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
        <div ref={receiptRef} id="receipt-pdf">
          {currentInvoiceTransactions.length > 0 && (
            <div dangerouslySetInnerHTML={{ __html: generateReceiptHTML() }} />
          )}
        </div>
      </div>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={snackbar.severity === 'warning' ? null : 6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ 
          vertical: 'bottom', 
          horizontal: isMobile ? 'center' : 'right' 
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
            '& .MuiAlert-message': {
              flexGrow: 1
            }
          }}
          action={snackbar.action}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CustomerSheet;