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
  Badge,
  Card,
  CardContent,
  Collapse,
  useMediaQuery,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Inventory as InventoryIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
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
  const matches = useMediaQuery(theme.breakpoints.down('sm'));

  if (isMobile) {
    return (
      <Box sx={{ p: 2 }}>
        {products.length === 0 ? (
          <Box sx={{ 
            textAlign: 'center', 
            py: 8,
            px: 2
          }}>
            <InventoryIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="textSecondary" gutterBottom>
              {searchTerm ? 'No matching products found' : 'No products yet'}
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
              {searchTerm ? 'Try different search terms' : 'Add your first scrap product to get started'}
            </Typography>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<AddIcon />}
              onClick={onAddProduct}
              sx={{ borderRadius: 2 }}
            >
              Add Product
            </Button>
          </Box>
        ) : (
          <>
            {products.map((product) => (
              <MobileProductCard
                key={product.id}
                product={product}
                expandedRow={expandedRow}
                onToggleExpand={onToggleExpand}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
            
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
              <TablePagination
                component="div"
                count={filteredProducts.length}
                page={page}
                onPageChange={onChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={onChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25]}
                labelRowsPerPage="Rows:"
                sx={{
                  '& .MuiTablePagination-toolbar': {
                    flexWrap: 'wrap',
                    minHeight: 'auto',
                    padding: 1,
                  },
                }}
              />
            </Box>
          </>
        )}
      </Box>
    );
  }

  return (
    <DesktopProductTable
      products={products}
      filteredProducts={filteredProducts}
      isTablet={isTablet}
      page={page}
      rowsPerPage={rowsPerPage}
      searchTerm={searchTerm}
      theme={theme}
      onEdit={onEdit}
      onDelete={onDelete}
      onChangePage={onChangePage}
      onChangeRowsPerPage={onChangeRowsPerPage}
      onAddProduct={onAddProduct}
    />
  );
};

const MobileProductCard = ({ product, expandedRow, onToggleExpand, onEdit, onDelete }) => {
  return (
    <Card
      sx={{
        mb: 2,
        borderRadius: 2,
        transition: 'all 0.2s',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: (theme) => theme.shadows[4],
        },
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar
            sx={{
              bgcolor: 'secondary.main',
              width: 40,
              height: 40,
              mr: 2,
              fontWeight: 600,
              fontSize: '1rem',
            }}
          >
            {product.serialNumber}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle1" fontWeight={600}>
              {product.name}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              Serial: {product.serialNumber}
            </Typography>
          </Box>
          <IconButton
            size="small"
            onClick={() => onToggleExpand(product.id)}
          >
            {expandedRow === product.id ? 
              <KeyboardArrowUpIcon /> : 
              <KeyboardArrowDownIcon />
            }
          </IconButton>
        </Box>
        
        <Collapse in={expandedRow === product.id}>
          <Box sx={{ 
            mt: 2, 
            pt: 2, 
            borderTop: (theme) => `1px solid ${theme.palette.divider}` 
          }}>
            {product.description ? (
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="textSecondary" gutterBottom>
                  Description:
                </Typography>
                <Typography variant="body2">
                  {product.description}
                </Typography>
              </Box>
            ) : (
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                No description
              </Typography>
            )}
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button
                size="small"
                startIcon={<EditIcon />}
                onClick={() => onEdit(product)}
              >
                Edit
              </Button>
              <Button
                size="small"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => onDelete(product)}
              >
                Delete
              </Button>
            </Box>
          </Box>
        </Collapse>
        
        {expandedRow !== product.id && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 1 }}>
            <Button
              size="small"
              onClick={() => onEdit(product)}
            >
              Edit
            </Button>
            <Button
              size="small"
              color="error"
              onClick={() => onDelete(product)}
            >
              Delete
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

const DesktopProductTable = ({
  products,
  filteredProducts,
  isTablet,
  page,
  rowsPerPage,
  searchTerm,
  theme,
  onEdit,
  onDelete,
  onChangePage,
  onChangeRowsPerPage,
  onAddProduct,
}) => {
  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
        border: (theme) => `1px solid ${theme.palette.divider}`,
        bgcolor: 'background.paper',
      }}
    >
      <TableContainer sx={{ maxHeight: isTablet ? '60vh' : '70vh' }}>
        <Table stickyHeader size={isTablet ? "small" : "medium"}>
          <TableHead>
            <TableRow sx={{ 
              bgcolor: (theme) => theme.palette.action.hover,
              '& th': {
                fontWeight: 700,
                fontSize: isTablet ? '0.75rem' : '0.875rem',
                py: isTablet ? 1 : 2,
                borderBottom: (theme) => `2px solid ${theme.palette.secondary.main}20`,
              }
            }}>
              <TableCell sx={{ width: '80px', pl: isTablet ? 2 : 4 }}>
                SN
              </TableCell>
              
              <TableCell sx={{ minWidth: '200px' }}>
                Product Name
              </TableCell>
              
              <TableCell sx={{ minWidth: isTablet ? '200px' : '300px' }}>
                Description
              </TableCell>
              
              <TableCell sx={{ width: isTablet ? '100px' : '120px', pr: isTablet ? 2 : 4 }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 8 }}>
                  <InventoryIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="h6" color="textSecondary" gutterBottom>
                    {searchTerm ? 'No matching products found' : 'No products yet'}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                    {searchTerm ? 'Try adjusting your search terms' : 'Add your first scrap product to get started'}
                  </Typography>
                  <Button
                    variant="contained"
                    color="secondary"
                    startIcon={<AddIcon />}
                    onClick={onAddProduct}
                    sx={{ borderRadius: 2 }}
                  >
                    Add First Product
                  </Button>
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow
                  key={product.id}
                  hover
                  sx={{
                    transition: 'background-color 0.2s',
                    '&:hover': {
                      bgcolor: (theme) => theme.palette.action.hover,
                    },
                  }}
                >
                  <TableCell sx={{ pl: isTablet ? 2 : 4 }}>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Badge
                        color="secondary"
                        variant="dot"
                        sx={{ mr: 1 }}
                      >
                        <Box
                          sx={{
                            width: isTablet ? 32 : 40,
                            height: isTablet ? 32 : 40,
                            borderRadius: '50%',
                            bgcolor: 'secondary.main',
                            color: 'secondary.contrastText',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: isTablet ? '0.875rem' : '1rem',
                          }}
                        >
                          {product.serialNumber}
                        </Box>
                      </Badge>
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography 
                        variant={isTablet ? "body2" : "subtitle1"} 
                        fontWeight={600}
                        sx={{ 
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          maxWidth: isTablet ? '120px' : '200px',
                        }}
                      >
                        {product.name}
                      </Typography>
                    </Box>
                    <Typography 
                      variant="caption" 
                      color="textSecondary"
                      sx={{ mt: 0.5 }}
                    >
                      Serial: {product.serialNumber}
                    </Typography>
                  </TableCell>
                  
                  <TableCell>
                    {product.description ? (
                      <Typography 
                        variant={isTablet ? "body2" : "body1"}
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          maxHeight: isTablet ? '3em' : '3.5em',
                        }}
                      >
                        {product.description}
                      </Typography>
                    ) : (
                      <Typography 
                        variant={isTablet ? "caption" : "body2"} 
                        color="textSecondary"
                      >
                        No description
                      </Typography>
                    )}
                  </TableCell>
                  
                  <TableCell sx={{ pr: isTablet ? 2 : 4 }}>
                    <Box sx={{ 
                      display: 'flex', 
                      gap: 0.5,
                      justifyContent: 'flex-end'
                    }}>
                      <Tooltip title="Edit">
                        <IconButton
                          size={isTablet ? "small" : "medium"}
                          onClick={() => onEdit(product)}
                          sx={{
                            bgcolor: (theme) => theme.palette.secondary.main + '14',
                            '&:hover': {
                              bgcolor: (theme) => theme.palette.secondary.main + '26',
                            },
                          }}
                        >
                          <EditIcon fontSize={isTablet ? "small" : "medium"} />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Delete">
                        <IconButton
                          size={isTablet ? "small" : "medium"}
                          color="error"
                          onClick={() => onDelete(product)}
                          sx={{
                            bgcolor: (theme) => theme.palette.error.main + '14',
                            '&:hover': {
                              bgcolor: (theme) => theme.palette.error.main + '26',
                            },
                          }}
                        >
                          <DeleteIcon fontSize={isTablet ? "small" : "medium"} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      {products.length > 0 && (
        <Box sx={{ 
          borderTop: (theme) => `1px solid ${theme.palette.divider}`,
          bgcolor: 'background.paper'
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
            sx={{
              '& .MuiTablePagination-toolbar': {
                minHeight: '52px',
                padding: isTablet ? '0 8px' : '0 16px',
              },
            }}
          />
        </Box>
      )}
    </Paper>
  );
};

export default ProductList;