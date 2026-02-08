import React from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  Typography,
  IconButton,
  Tooltip,
  Avatar,
  Chip,
  Collapse,
  useMediaQuery,
  alpha,
  Fade,
  Alert,
  Stack,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Inventory as InventoryIcon,
  Description as DescriptionIcon,
  MoreVert as MoreVertIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';

const ProductList = ({
  products,
  filteredProducts,
  isMobile,
  isTablet,
  expandedRow,
  page,
  rowsPerPage,
  searchTerm,
  theme,
  onEdit,
  onDelete,
  onToggleExpand,
  onChangePage,
  onChangeRowsPerPage,
  onAddProduct,
}) => {
  if (products.length === 0) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: { xs: 6, md: 10 },
        px: 2,
        minHeight: '60vh',
      }}>
        <Box sx={{
          width: { xs: 80, md: 100 },
          height: { xs: 80, md: 100 },
          borderRadius: '50%',
          bgcolor: alpha(theme.palette.secondary.main, 0.08),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 3,
        }}>
          <InventoryIcon sx={{ 
            fontSize: { xs: 40, md: 50 }, 
            color: 'secondary.main' 
          }} />
        </Box>
        <Typography 
          variant="h6" 
          align="center" 
          fontWeight={600}
          sx={{ mb: 1 }}
        >
          {searchTerm ? 'No matching products' : 'No products yet'}
        </Typography>
        <Typography 
          variant="body2" 
          color="text.secondary" 
          align="center"
          sx={{ 
            mb: 4,
            maxWidth: 400,
            mx: 'auto'
          }}
        >
          {searchTerm 
            ? 'Try adjusting your search terms to find what you\'re looking for.'
            : 'Start by adding your first scrap product to manage inventory.'
          }
        </Typography>
        <Button
          variant="contained"
          color="secondary"
          startIcon={<AddIcon />}
          onClick={onAddProduct}
          sx={{ 
            borderRadius: 2,
            px: 4,
            py: 1.5,
            fontWeight: 600,
          }}
        >
          Add Product
        </Button>
      </Box>
    );
  }

  if (isMobile) {
    return (
      <Box sx={{ py: 1 }}>
        {products.map((product) => (
          <Fade in key={product.id}>
            <Paper
              elevation={0}
              sx={{
                mb: 2,
                p: 2.5,
                borderRadius: 2,
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  borderColor: alpha(theme.palette.secondary.main, 0.3),
                  boxShadow: theme.shadows[2],
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <Avatar
                  sx={{
                    bgcolor: alpha(theme.palette.secondary.main, 0.1),
                    color: 'secondary.main',
                    width: 44,
                    height: 44,
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    flexShrink: 0,
                  }}
                >
                  {product.serialNumber}
                </Avatar>
                
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography 
                    variant="subtitle1" 
                    fontWeight={600}
                    sx={{ 
                      mb: 0.5,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {product.name}
                  </Typography>
                  
                  {product.description && (
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{
                        mb: 1.5,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {product.description}
                    </Typography>
                  )}
                  
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    pt: 1,
                    borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  }}>
                    <Typography variant="caption" color="text.secondary">
                      Serial: {product.serial_number || product.serialNumber}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => onEdit(product)}
                          sx={{ 
                            bgcolor: alpha(theme.palette.secondary.main, 0.08),
                            '&:hover': {
                              bgcolor: alpha(theme.palette.secondary.main, 0.16),
                            },
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          onClick={() => onDelete(product)}
                          sx={{ 
                            bgcolor: alpha(theme.palette.error.main, 0.08),
                            color: 'error.main',
                            '&:hover': {
                              bgcolor: alpha(theme.palette.error.main, 0.16),
                            },
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Paper>
          </Fade>
        ))}
        
        <Box sx={{ mt: 3 }}>
          <TablePagination
            component="div"
            count={filteredProducts.length}
            page={page}
            onPageChange={onChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={onChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
            labelRowsPerPage="Show:"
            sx={{
              '& .MuiTablePagination-toolbar': {
                flexWrap: 'wrap',
                minHeight: 'auto',
                px: 1,
              },
              '& .MuiTablePagination-selectLabel': {
                display: 'none',
              },
              '& .MuiTablePagination-displayedRows': {
                fontSize: '0.875rem',
              },
            }}
          />
        </Box>
      </Box>
    );
  }

  return (
    <Fade in>
      <Paper
        elevation={0}
        sx={{
          borderRadius: 2,
          overflow: 'hidden',
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          bgcolor: 'background.paper',
          minHeight: '50vh',
        }}
      >
        {/* Table Header */}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ 
                bgcolor: 'background.default',
                '& th': {
                  borderBottom: `2px solid ${alpha(theme.palette.divider, 0.2)}`,
                  py: isTablet ? 2 : 2.5,
                  px: isTablet ? 2 : 3,
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  color: 'text.primary',
                  letterSpacing: '0.5px',
                }
              }}>
                <TableCell sx={{ width: '80px', textAlign: 'center' }}>
                  <Typography variant="caption" fontWeight={600} color="text.secondary">
                    #
                  </Typography>
                </TableCell>
                
                <TableCell>
                  <Typography variant="caption" fontWeight={600} color="text.secondary">
                    PRODUCT
                  </Typography>
                </TableCell>
                
                <TableCell>
                  <Typography variant="caption" fontWeight={600} color="text.secondary">
                    DESCRIPTION
                  </Typography>
                </TableCell>
                
                <TableCell sx={{ width: isTablet ? '100px' : '120px', textAlign: 'center' }}>
                  <Typography variant="caption" fontWeight={600} color="text.secondary">
                    ACTIONS
                  </Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            
            <TableBody>
              {products.map((product) => (
                <TableRow
                  key={product.id}
                  hover
                  sx={{
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      bgcolor: alpha(theme.palette.secondary.main, 0.02),
                    },
                    '&:last-child td': {
                      borderBottom: 0,
                    },
                    '& td': {
                      py: isTablet ? 2 : 2.5,
                      px: isTablet ? 2 : 3,
                      borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    }
                  }}
                >
                  <TableCell sx={{ textAlign: 'center' }}>
                    <Box
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: isTablet ? 32 : 36,
                        height: isTablet ? 32 : 36,
                        borderRadius: '50%',
                        bgcolor: alpha(theme.palette.secondary.main, 0.1),
                        color: 'secondary.main',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                      }}
                    >
                      {product.serialNumber}
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    <Box>
                      <Typography 
                        variant="subtitle2" 
                        fontWeight={600}
                        sx={{ mb: 0.5 }}
                      >
                        {product.name}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        color="text.secondary"
                      >
                        Serial: {product.serial_number || product.serialNumber}
                      </Typography>
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    {product.description ? (
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                        <DescriptionIcon 
                          sx={{ 
                            fontSize: 16, 
                            color: 'text.secondary',
                            mt: 0.25,
                            flexShrink: 0,
                          }} 
                        />
                        <Typography 
                          variant="body2"
                          color="text.primary"
                          sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            lineHeight: 1.5,
                          }}
                        >
                          {product.description}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        fontStyle="italic"
                      >
                        No description provided
                      </Typography>
                    )}
                  </TableCell>
                  
                  <TableCell sx={{ textAlign: 'center' }}>
                    <Stack direction="row" spacing={1} justifyContent="center">
                      <Tooltip title="Edit Product" arrow>
                        <IconButton
                          size="small"
                          onClick={() => onEdit(product)}
                          sx={{ 
                            bgcolor: alpha(theme.palette.secondary.main, 0.08),
                            color: 'secondary.main',
                            '&:hover': {
                              bgcolor: alpha(theme.palette.secondary.main, 0.16),
                            },
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Delete Product" arrow>
                        <IconButton
                          size="small"
                          onClick={() => onDelete(product)}
                          sx={{ 
                            bgcolor: alpha(theme.palette.error.main, 0.08),
                            color: 'error.main',
                            '&:hover': {
                              bgcolor: alpha(theme.palette.error.main, 0.16),
                            },
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        
        {/* Pagination */}
        <Box sx={{ 
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          bgcolor: 'background.default',
        }}>
          <TablePagination
            component="div"
            count={filteredProducts.length}
            page={page}
            onPageChange={onChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={onChangeRowsPerPage}
            rowsPerPageOptions={[10, 25, 50]}
            labelRowsPerPage="Rows per page:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} of ${count}`}
            sx={{
              '& .MuiTablePagination-toolbar': {
                minHeight: 56,
                px: isTablet ? 2 : 3,
              },
              '& .MuiTablePagination-selectLabel, & .MuiTablePagination-input': {
                fontSize: '0.875rem',
              },
            }}
          />
        </Box>
      </Paper>
    </Fade>
  );
};

export default ProductList;