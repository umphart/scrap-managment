import React from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Alert,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  Stack,
  alpha,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import PrintIcon from '@mui/icons-material/Print';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DescriptionIcon from '@mui/icons-material/Description';

const CustomerSheetHeader = ({ 
  customer, 
  onBack, 
  onPrint, 
  onAddProduct,
  onDownload,
  onPrintAndDownload,
  anchorEl,
  onMenuOpen,
  onMenuClose,
  transactions,
  showPrintButton = true 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const open = Boolean(anchorEl);

  if (isMobile) {
    return (
      <Box sx={{ mb: 2 }}>
        <Stack spacing={1.5}>
          {/* Top row: Back button and title */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton 
              onClick={onBack} 
              size="small"
              sx={{ 
                p: 0.75,
                border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                borderRadius: 1,
                '&:hover': {
                  backgroundColor: 'action.hover',
                }
              }}
            >
              <ArrowBackIcon fontSize="small" />
            </IconButton>
            
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography 
                variant="subtitle2" 
                fontWeight={600}
                sx={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {customer?.name}'s Sheet
              </Typography>
              <Typography variant="caption" color="textSecondary" fontSize="0.7rem">
                ID: {customer?.id?.slice(0, 8)}...
              </Typography>
            </Box>
            
            {showPrintButton && transactions.length > 0 && (
              <IconButton
                onClick={onMenuOpen}
                size="small"
                sx={{
                  p: 0.75,
                  border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                  borderRadius: 1,
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  }
                }}
              >
                <MoreVertIcon fontSize="small" />
              </IconButton>
            )}
          </Box>

          {/* Customer info */}
          <Box>
            <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 0.25 }}>
              <strong>Phone:</strong> {customer?.phone || 'Not provided'}
            </Typography>
            {customer?.address && (
              <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.7rem' }}>
                <strong>Address:</strong> {customer.address.substring(0, 30)}...
              </Typography>
            )}
          </Box>

          {/* Action buttons */}
          <Stack direction="row" spacing={1} justifyContent="space-between">
            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon fontSize="small" />}
              onClick={onAddProduct}
              sx={{ 
                flex: 1,
                borderRadius: 1,
                textTransform: 'none',
                fontSize: '0.75rem',
                py: 0.5,
                minHeight: 32
              }}
            >
              Add
            </Button>
            
            {showPrintButton && transactions.length > 0 && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<PrintIcon fontSize="small" />}
                onClick={onPrint}
                sx={{ 
                  flex: 1,
                  borderRadius: 1,
                  textTransform: 'none',
                  fontSize: '0.75rem',
                  py: 0.5,
                  minHeight: 32
                }}
              >
                Print
              </Button>
            )}
          </Stack>
        </Stack>

        {/* Menu for mobile */}
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={onMenuClose}
          PaperProps={{
            sx: {
              mt: 0.5,
              borderRadius: 1,
              minWidth: 150,
            }
          }}
        >
          <MenuItem 
            onClick={() => {
              onMenuClose();
              onDownload?.();
            }}
            dense
            sx={{ fontSize: '0.875rem' }}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>
              <PictureAsPdfIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>PDF</ListItemText>
          </MenuItem>
          <MenuItem 
            onClick={() => {
              onMenuClose();
              onPrintAndDownload?.();
            }}
            dense
            sx={{ fontSize: '0.875rem' }}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>
              <DescriptionIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Both</ListItemText>
          </MenuItem>
        </Menu>

        {transactions.length === 0 && (
          <Alert 
            severity="info" 
            sx={{ 
              mt: 1.5,
              borderRadius: 1,
              fontSize: '0.75rem',
              py: 0.5,
              '& .MuiAlert-icon': {
                fontSize: '1rem',
                p: 0
              }
            }}
          >
            Add products to start
          </Alert>
        )}
      </Box>
    );
  }

  if (isTablet) {
    return (
      <Box sx={{ mb: 2.5 }}>
        {/* Tablet Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
          <IconButton 
            onClick={onBack} 
            size="small"
            sx={{ 
              p: 1,
              border: '1px solid #e0e0e0', 
              borderRadius: 1,
              '&:hover': {
                backgroundColor: 'action.hover',
              }
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
              {customer?.name}'s Sheet
            </Typography>
            <Stack direction="row" spacing={2} flexWrap="wrap" sx={{ gap: 1.5 }}>
              <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.8125rem' }}>
                <strong>Phone:</strong> {customer?.phone || 'Not provided'}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.8125rem' }}>
                <strong>ID:</strong> {customer?.id?.slice(0, 8)}...
              </Typography>
              {transactions.length > 0 && (
                <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.8125rem' }}>
                  <strong>Txns:</strong> {transactions.length}
                </Typography>
              )}
            </Stack>
          </Box>

          <Stack direction="row" spacing={1}>
            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon />}
              onClick={onAddProduct}
              sx={{ 
                borderRadius: 1,
                textTransform: 'none',
                fontWeight: 600,
                px: 1.5,
                py: 0.75,
                fontSize: '0.8125rem'
              }}
            >
              Add Product
            </Button>

            {showPrintButton && transactions.length > 0 && (
              <>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<PrintIcon />}
                  onClick={onPrint}
                  sx={{ 
                    borderRadius: 1,
                    textTransform: 'none',
                    fontWeight: 600,
                    px: 1.5,
                    py: 0.75,
                    fontSize: '0.8125rem'
                  }}
                >
                  Print
                </Button>

                <IconButton
                  onClick={onMenuOpen}
                  size="small"
                  sx={{
                    p: 0.75,
                    border: '1px solid #e0e0e0',
                    borderRadius: 1,
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    }
                  }}
                >
                  <MoreVertIcon />
                </IconButton>
              </>
            )}
          </Stack>
        </Box>

        {/* Menu for tablet */}
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={onMenuClose}
          PaperProps={{
            sx: {
              mt: 0.5,
              borderRadius: 1,
              minWidth: 160,
            }
          }}
        >
          <MenuItem 
            onClick={() => {
              onMenuClose();
              onDownload?.();
            }}
            sx={{ fontSize: '0.875rem', py: 0.75 }}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>
              <PictureAsPdfIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Download PDF</ListItemText>
          </MenuItem>
          <MenuItem 
            onClick={() => {
              onMenuClose();
              onPrintAndDownload?.();
            }}
            sx={{ fontSize: '0.875rem', py: 0.75 }}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>
              <DescriptionIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Print & PDF</ListItemText>
          </MenuItem>
        </Menu>

        {transactions.length === 0 && (
          <Alert 
            severity="info" 
            sx={{ 
              borderRadius: 1,
              fontSize: '0.8125rem',
              py: 0.75,
            }}
          >
            No transactions yet. Click "Add Product" to start.
          </Alert>
        )}
      </Box>
    );
  }

  // Desktop View
  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <IconButton 
          onClick={onBack} 
          size="medium"
          sx={{ 
            p: 1,
            border: '1px solid #e0e0e0', 
            borderRadius: 1,
            '&:hover': {
              backgroundColor: 'action.hover',
            }
          }}
        >
          <ArrowBackIcon />
        </IconButton>
        
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, fontSize: '1.5rem' }}>
            {customer?.name}'s Scrap Sheet
          </Typography>
          <Box sx={{ display: 'flex', gap: 2.5, flexWrap: 'wrap' }}>
            <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.875rem' }}>
              <strong>Phone:</strong> {customer?.phone || 'Not provided'}
            </Typography>
            {customer?.address && (
              <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.875rem' }}>
                <strong>Address:</strong> {customer.address}
              </Typography>
            )}
            <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.875rem' }}>
              <strong>ID:</strong> {customer?.id?.slice(0, 8)}...
            </Typography>
            {transactions.length > 0 && (
              <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.875rem' }}>
                <strong>Transactions:</strong> {transactions.length}
              </Typography>
            )}
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Button
            variant="contained"
            size="medium"
            startIcon={<AddIcon />}
            onClick={onAddProduct}
            sx={{ 
              px: 2,
              py: 0.875,
              borderRadius: 1,
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.875rem'
            }}
          >
            Add Product
          </Button>

          {showPrintButton && transactions.length > 0 && (
            <>
              <Button
                variant="outlined"
                size="medium"
                startIcon={<PrintIcon />}
                onClick={onPrint}
                sx={{ 
                  px: 2,
                  py: 0.875,
                  borderRadius: 1,
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.875rem'
                }}
              >
                Print
              </Button>

              <IconButton
                onClick={onMenuOpen}
                size="medium"
                sx={{
                  p: 0.875,
                  border: '1px solid #e0e0e0',
                  borderRadius: 1,
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  }
                }}
              >
                <MoreVertIcon />
              </IconButton>

              <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={onMenuClose}
                PaperProps={{
                  sx: {
                    mt: 1,
                    borderRadius: 1,
                    minWidth: 180,
                  }
                }}
              >
                <MenuItem 
                  onClick={() => {
                    onMenuClose();
                    onDownload?.();
                  }}
                  sx={{ fontSize: '0.875rem', py: 0.75 }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <PictureAsPdfIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Download PDF</ListItemText>
                </MenuItem>
                <MenuItem 
                  onClick={() => {
                    onMenuClose();
                    onPrintAndDownload?.();
                  }}
                  sx={{ fontSize: '0.875rem', py: 0.75 }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <DescriptionIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Print & PDF</ListItemText>
                </MenuItem>
              </Menu>
            </>
          )}
        </Box>
      </Box>

      {transactions.length === 0 && (
        <Alert 
          severity="info" 
          sx={{ 
            borderRadius: 1,
            py: 1,
            fontSize: '0.875rem'
          }}
        >
          <Typography variant="body2" fontWeight="medium">
            No scrap transactions yet. Click "Add Product" to start recording scrap items.
          </Typography>
        </Alert>
      )}
    </Box>
  );
};

export default CustomerSheetHeader;