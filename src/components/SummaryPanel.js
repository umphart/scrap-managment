import React from 'react';
import {
  Paper,
  Box,
  Typography,
  Divider,
  Stack,
  alpha,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { format } from 'date-fns';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import InventoryIcon from '@mui/icons-material/Inventory';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ReceiptIcon from '@mui/icons-material/Receipt';

const SummaryPanel = ({ transactions, totalAmount, totalItems }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  const getTotalItemsFormatted = () => {
    const total = totalItems.toFixed(2);
    return total.endsWith('.00') ? parseInt(total) : total;
  };

  // Ultra compact mobile view
  if (isMobile) {
    return (
      <Paper sx={{ 
        p: 1.5, 
        borderRadius: 1.5,
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        mb: 2
      }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
          {/* Transactions */}
          <Stack alignItems="center" sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
              <ReceiptIcon sx={{ fontSize: '0.9rem', color: 'primary.main', mr: 0.5 }} />
              <Typography variant="caption" color="text.secondary">
                Txns
              </Typography>
            </Box>
            <Typography variant="body2" fontWeight={700}>
              {transactions.length}
            </Typography>
          </Stack>

          <Divider orientation="vertical" flexItem />

          {/* Total Items */}
          <Stack alignItems="center" sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
              <InventoryIcon sx={{ fontSize: '0.9rem', color: 'success.main', mr: 0.5 }} />
              <Typography variant="caption" color="text.secondary">
                Items
              </Typography>
            </Box>
            <Typography variant="body2" fontWeight={700}>
              {getTotalItemsFormatted()}
            </Typography>
          </Stack>

          <Divider orientation="vertical" flexItem />

          {/* Total Amount */}
          <Stack alignItems="center" sx={{ flex: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
              <AttachMoneyIcon sx={{ fontSize: '0.9rem', color: 'warning.main', mr: 0.5 }} />
              <Typography variant="caption" color="text.secondary">
                Total
              </Typography>
            </Box>
            <Typography variant="body2" fontWeight={700} color="primary.main">
              ₦{totalAmount.toFixed(2)}
            </Typography>
          </Stack>
        </Stack>
        
        {/* Last Updated - very small */}
        <Box sx={{ mt: 1, pt: 1, borderTop: `1px solid ${theme.palette.divider}` }}>
          <Typography variant="caption" color="text.secondary" align="center">
            Updated: {format(new Date(), 'HH:mm')}
          </Typography>
        </Box>
      </Paper>
    );
  }

  // Compact tablet view
  if (isTablet) {
    return (
      <Paper sx={{ 
        p: 2, 
        borderRadius: 1.5,
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        mb: 2
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
          <TrendingUpIcon sx={{ fontSize: '1.1rem', color: 'primary.main', mr: 1 }} />
          <Typography variant="subtitle2" fontWeight={600}>
            Summary
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
            {format(new Date(), 'dd MMM')}
          </Typography>
        </Box>
        
        <Stack direction="row" spacing={2} sx={{ mb: 1 }}>
          {/* Transactions */}
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
              <ReceiptIcon sx={{ fontSize: '1rem', color: 'primary.main', mr: 0.5 }} />
              <Typography variant="caption" color="text.secondary">
                Transactions
              </Typography>
            </Box>
            <Typography variant="h6" fontWeight={700}>
              {transactions.length}
            </Typography>
          </Box>
          
          {/* Total Items */}
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
              <InventoryIcon sx={{ fontSize: '1rem', color: 'success.main', mr: 0.5 }} />
              <Typography variant="caption" color="text.secondary">
                Items
              </Typography>
            </Box>
            <Typography variant="h6" fontWeight={700}>
              {getTotalItemsFormatted()}
            </Typography>
          </Box>
        </Stack>
        
        {/* Total Amount - compact */}
        <Box sx={{ 
          p: 1.5, 
          bgcolor: alpha(theme.palette.primary.main, 0.04),
          borderRadius: 1,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <AttachMoneyIcon sx={{ fontSize: '1rem', color: 'primary.main', mr: 0.5 }} />
              <Typography variant="caption" fontWeight={600} color="text.secondary">
                Total Amount
              </Typography>
            </Box>
            <Typography variant="h6" fontWeight={800} color="primary.main">
              ₦{totalAmount.toFixed(2)}
            </Typography>
          </Box>
        </Box>
      </Paper>
    );
  }

  // Compact desktop view
  return (
    <Paper sx={{ 
      p: 2, 
      borderRadius: 1.5,
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      height: 'fit-content'
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <TrendingUpIcon sx={{ fontSize: '1.2rem', color: 'primary.main', mr: 1 }} />
        <Typography variant="subtitle1" fontWeight={600}>
          Summary
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
          {format(new Date(), 'dd MMM yyyy')}
        </Typography>
      </Box>
      
      <Stack spacing={1.5}>
        {/* Stats row */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <ReceiptIcon sx={{ fontSize: '1.1rem', color: 'primary.main', mr: 1 }} />
            <Box>
              <Typography variant="caption" color="text.secondary">
                Transactions
              </Typography>
              <Typography variant="h6" fontWeight={700}>
                {transactions.length}
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <InventoryIcon sx={{ fontSize: '1.1rem', color: 'success.main', mr: 1 }} />
            <Box>
              <Typography variant="caption" color="text.secondary">
                Items
              </Typography>
              <Typography variant="h6" fontWeight={700}>
                {getTotalItemsFormatted()}
              </Typography>
            </Box>
          </Box>
        </Box>
        
        <Divider />
        
        {/* Total Amount */}
        <Box sx={{ 
          p: 1.5, 
          bgcolor: alpha(theme.palette.primary.main, 0.04),
          borderRadius: 1,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <AttachMoneyIcon sx={{ fontSize: '1.2rem', color: 'primary.main', mr: 1 }} />
              <Typography variant="body2" fontWeight={600} color="text.secondary">
                Total Amount
              </Typography>
            </Box>
            <Typography variant="h5" fontWeight={800} color="primary.main">
              ₦{totalAmount.toFixed(2)}
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            Last updated: {format(new Date(), 'HH:mm')}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
};

export default SummaryPanel;