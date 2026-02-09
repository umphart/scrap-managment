import React from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Typography,
  Box,
  Tooltip,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { format } from 'date-fns';

const TransactionTable = ({ 
  transactions, 
  onDeleteTransaction, 
  onEditTransaction, 
  loading 
}) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

  if (loading) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
        <Typography color="textSecondary">Loading transactions...</Typography>
      </Paper>
    );
  }

  if (transactions.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            📋 No Transactions
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Start by adding scrap items using the "Add Product" button
          </Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper sx={{ 
      borderRadius: 2, 
      overflow: 'hidden', 
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      width: '100%',
      maxWidth: '100%',
    }}>
      <TableContainer sx={{ 
        width: '100%',
        maxHeight: 'calc(100vh - 200px)',
        overflow: 'auto',
        '&::-webkit-scrollbar': {
          width: '8px',
          height: '8px',
        },
        '&::-webkit-scrollbar-track': {
          backgroundColor: 'grey.100',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: 'grey.400',
          borderRadius: '4px',
        },
      }}>
        <Table 
          stickyHeader 
          size="small" // Added small size for more compact table
          sx={{ 
            minWidth: isSmallScreen ? '500px' : '100%', // Further reduced minWidth
            tableLayout: 'fixed',
          }}
        >
          <TableHead>
            <TableRow sx={{ backgroundColor: 'primary.50' }}>
              <TableCell sx={{ 
                fontWeight: 600,
                py: 1, // Reduced padding
                px: 1.5, // Reduced horizontal padding
                width: isSmallScreen ? '120px' : '140px',
              }}>
                Product
              </TableCell>
              <TableCell align="right" sx={{ 
                fontWeight: 600,
                py: 1, // Reduced padding
                px: 1.5, // Reduced horizontal padding
                width: '70px',
              }}>
                Price
              </TableCell>
              <TableCell align="right" sx={{ 
                fontWeight: 600,
                py: 1, // Reduced padding
                px: 1.5, // Reduced horizontal padding
                width: '50px',
              }}>
                Qty
              </TableCell>
              <TableCell align="right" sx={{ 
                fontWeight: 600,
                py: 1, // Reduced padding
                px: 1.5, // Reduced horizontal padding
                width: '90px',
              }}>
                Amount
              </TableCell>
              <TableCell sx={{ 
                fontWeight: 600,
                py: 1, // Reduced padding
                px: 1.5, // Reduced horizontal padding
                width: '70px',
              }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow 
                key={transaction.id}
                hover
                sx={{ 
                  '&:hover': { 
                    backgroundColor: 'action.hover' 
                  },
                }}
              >
                {/* Product Cell */}
                <TableCell sx={{ 
                  py: 1, // Reduced padding
                  px: 1.5, // Reduced horizontal padding
                }}>
                  <Typography 
                    variant="subtitle2" 
                    fontSize="0.85rem" 
                    fontWeight="medium" 
                    noWrap
                    sx={{ lineHeight: 1.2 }}
                  >
                    {transaction.products?.name || 'Unknown'}
                  </Typography>
                </TableCell>

                {/* Price Cell */}
                <TableCell align="right" sx={{ 
                  py: 1, // Reduced padding
                  px: 1.5, // Reduced horizontal padding
                }}>
                  <Typography 
                    variant="body2" 
                    fontSize="0.85rem" 
                    fontWeight="medium" 
                    noWrap
                    sx={{ lineHeight: 1.2 }}
                  >
                    ₦{parseFloat(transaction.price || 0).toFixed(2)}
                  </Typography>
                </TableCell>

                {/* Quantity Cell */}
                <TableCell align="right" sx={{ 
                  py: 1, // Reduced padding
                  px: 1.5, // Reduced horizontal padding
                }}>
                  <Typography 
                    variant="body2" 
                    fontSize="0.85rem" 
                    noWrap
                    sx={{ lineHeight: 1.2 }}
                  >
                    {transaction.quantity}
                  </Typography>
                </TableCell>

                {/* Amount Cell */}
                <TableCell align="right" sx={{ 
                  py: 1, // Reduced padding
                  px: 1.5, // Reduced horizontal padding
                }}>
                  <Typography 
                    variant="body1" 
                    fontSize="0.9rem" 
                    fontWeight="bold" 
                    color="primary.main" 
                    noWrap
                    sx={{ lineHeight: 1.2 }}
                  >
                    ₦{parseFloat(transaction.total_amount || 0).toFixed(2)}
                  </Typography>
                </TableCell>

                {/* Actions Cell */}
                <TableCell sx={{ 
                  py: 1, // Reduced padding
                  px: 1.5, // Reduced horizontal padding
                }}>
                  <Box display="flex" gap={0.5} justifyContent="flex-start">
                    <Tooltip title="Edit">
                      <IconButton
                        color="primary"
                        size="small"
                        onClick={() => onEditTransaction(transaction)}
                        sx={{
                          '&:hover': {
                            backgroundColor: 'primary.light',
                          },
                          minWidth: '28px',
                          width: '28px',
                          height: '28px',
                          padding: '4px',
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        color="error"
                        size="small"
                        onClick={() => onDeleteTransaction(transaction.id)}
                        sx={{
                          '&:hover': {
                            backgroundColor: 'error.light',
                          },
                          minWidth: '28px',
                          width: '28px',
                          height: '28px',
                          padding: '4px',
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* Mobile note for horizontal scroll */}
      {isSmallScreen && transactions.length > 0 && (
        <Box sx={{ 
          p: 0.5, // Reduced padding
          textAlign: 'center', 
          backgroundColor: 'grey.50',
          borderTop: '1px solid',
          borderColor: 'divider'
        }}>
          <Typography variant="caption" color="textSecondary" fontSize="0.7rem">
            ← Scroll horizontally to see all columns →
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default TransactionTable;