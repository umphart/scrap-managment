import React from 'react';
import {
  Paper,
  Box,
  Typography,
  Divider,
  Chip,
  Alert,
  useTheme,
  useMediaQuery,
  Stack,
  alpha,
} from '@mui/material';
import { format } from 'date-fns';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import InventoryIcon from '@mui/icons-material/Inventory';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

const SummaryPanel = ({ transactions, totalAmount, totalItems }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const getTotalItemsFormatted = () => {
    const total = totalItems.toFixed(2);
    return total.endsWith('.00') ? parseInt(total) : total;
  };

  if (isMobile) {
    return (
      <Paper sx={{ 
        p: 2, 
        borderRadius: 2,
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        mb: 2
      }}>
        <Stack spacing={2}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TrendingUpIcon sx={{ mr: 1, color: 'primary.main', fontSize: '1.2rem' }} />
            <Typography variant="subtitle1" fontWeight={600}>
              Summary
            </Typography>
          </Box>
          
          <Divider />
          
          {/* Stats in a row for mobile */}
          <Stack direction="row" spacing={1}>
            <Box sx={{ 
              flex: 1, 
              p: 1.5, 
              bgcolor: alpha(theme.palette.primary.main, 0.04),
              borderRadius: 1.5,
              textAlign: 'center'
            }}>
              <Typography variant="caption" color="textSecondary" display="block">
                Transactions
              </Typography>
              <Typography variant="h6" fontWeight={700}>
                {transactions.length}
              </Typography>
            </Box>
            
            <Box sx={{ 
              flex: 1, 
              p: 1.5, 
              bgcolor: alpha(theme.palette.success.main, 0.04),
              borderRadius: 1.5,
              textAlign: 'center'
            }}>
              <Typography variant="caption" color="textSecondary" display="block">
                Total Items
              </Typography>
              <Typography variant="h6" fontWeight={700}>
                {getTotalItemsFormatted()}
              </Typography>
            </Box>
          </Stack>
          
          {/* Total Amount */}
          <Box sx={{ 
            p: 2, 
            bgcolor: alpha(theme.palette.primary.main, 0.08),
            borderRadius: 2,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <AttachMoneyIcon sx={{ mr: 1, color: 'primary.main', fontSize: '1.2rem' }} />
              <Typography variant="caption" color="textSecondary">
                Total Amount
              </Typography>
            </Box>
            <Typography variant="h5" fontWeight={800} color="primary.main">
              ₦{totalAmount.toFixed(2)}
            </Typography>
          </Box>
          
          {/* Last Updated */}
          <Alert 
            severity="success" 
            sx={{ 
              borderRadius: 1.5,
              fontSize: '0.75rem',
              py: 0.5,
              '& .MuiAlert-icon': {
                fontSize: '1rem',
                mr: 1
              }
            }}
          >
            <Box>
              <Typography variant="caption" fontWeight={500}>
                Updated: {format(new Date(), 'dd MMM, HH:mm')}
              </Typography>
            </Box>
          </Alert>
        </Stack>
      </Paper>
    );
  }

  if (isTablet) {
    return (
      <Paper sx={{ 
        p: 2.5, 
        borderRadius: 2,
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        height: '100%'
      }}>
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <TrendingUpIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6" fontWeight={600}>
              Summary
            </Typography>
          </Box>
          <Divider />
        </Box>
        
        {/* Stats Cards */}
        <Stack spacing={1.5} sx={{ mb: 2 }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            p: 1.5, 
            bgcolor: 'grey.50', 
            borderRadius: 1.5 
          }}>
            <InventoryIcon sx={{ mr: 1.5, color: 'secondary.main', fontSize: '1.5rem' }} />
            <Box>
              <Typography variant="caption" color="textSecondary" display="block">
                Total Transactions
              </Typography>
              <Typography variant="h5" fontWeight={700}>
                {transactions.length}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            p: 1.5, 
            bgcolor: 'grey.50', 
            borderRadius: 1.5 
          }}>
            <Box sx={{ mr: 1.5, color: 'success.main', fontSize: '1.5rem' }}>
              📦
            </Box>
            <Box>
              <Typography variant="caption" color="textSecondary" display="block">
                Total Items
              </Typography>
              <Typography variant="h5" fontWeight={700}>
                {getTotalItemsFormatted()}
              </Typography>
            </Box>
          </Box>
        </Stack>

        {/* Total Amount Card */}
        <Box sx={{ 
          mb: 2, 
          p: 2, 
          bgcolor: alpha(theme.palette.primary.main, 0.08), 
          borderRadius: 1.5, 
          border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <AttachMoneyIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="body2" color="textSecondary">
              Total Amount
            </Typography>
          </Box>
          <Typography variant="h4" fontWeight={800} color="primary.main">
            ₦{totalAmount.toFixed(2)}
          </Typography>
        </Box>

        {/* Last Updated */}
        <Alert 
          severity="success" 
          sx={{ 
            borderRadius: 1.5,
            fontSize: '0.75rem',
            py: 1,
            '& .MuiAlert-icon': {
              mr: 1
            }
          }}
        >
          <Box>
            <Typography variant="caption" fontWeight={500}>
              Last Updated
            </Typography>
            <Typography variant="caption" display="block">
              {format(new Date(), 'dd MMM yyyy, HH:mm')}
            </Typography>
          </Box>
        </Alert>
      </Paper>
    );
  }

  // Desktop View
  return (
    <Paper sx={{ 
      p: 3, 
      borderRadius: 2,
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      height: '100%'
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <TrendingUpIcon sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="h6" fontWeight={600}>
          Summary Dashboard
        </Typography>
      </Box>
      
      <Divider sx={{ my: 2 }} />
      
      {/* Stats Cards */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          mb: 2.5, 
          p: 2, 
          bgcolor: 'grey.50', 
          borderRadius: 2 
        }}>
          <InventoryIcon sx={{ mr: 2, color: 'secondary.main' }} />
          <Box>
            <Typography variant="body2" color="textSecondary">
              Total Transactions
            </Typography>
            <Typography variant="h4" fontWeight={700}>
              {transactions.length}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          mb: 2.5, 
          p: 2, 
          bgcolor: 'grey.50', 
          borderRadius: 2 
        }}>
          <Box sx={{ mr: 2, color: 'success.main' }}>
            <Typography variant="h5">📦</Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="textSecondary">
              Total Items
            </Typography>
            <Typography variant="h4" fontWeight={700}>
              {getTotalItemsFormatted()}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Total Amount Card */}
      <Box sx={{ 
        mb: 3, 
        p: 2.5, 
        bgcolor: alpha(theme.palette.primary.main, 0.08), 
        borderRadius: 2, 
        border: '1px solid', 
        borderColor: 'primary.100' 
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <AttachMoneyIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="body2" color="textSecondary">
            Total Amount
          </Typography>
        </Box>
        <Typography variant="h3" fontWeight={800} color="primary.main">
          ₦{totalAmount.toFixed(2)}
        </Typography>
        <Chip 
          label="Amount due" 
          size="small" 
          sx={{ 
            mt: 1,
            fontWeight: 500,
            backgroundColor: 'primary.100',
            color: 'primary.main'
          }}
        />
      </Box>

      {/* Last Updated */}
      <Alert 
        severity="success" 
        sx={{ 
          borderRadius: 2,
          backgroundColor: 'success.light',
          color: 'success.dark',
          '& .MuiAlert-icon': {
            color: 'success.main',
          }
        }}
      >
        <Box>
          <Typography variant="body2" fontWeight={500}>
            Last Updated
          </Typography>
          <Typography variant="caption" display="block">
            {format(new Date(), 'dd MMM yyyy, hh:mm a')}
          </Typography>
        </Box>
      </Alert>
    </Paper>
  );
};

export default SummaryPanel;