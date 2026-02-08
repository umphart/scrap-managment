import React from 'react';
import {
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Typography,
  Box,
  IconButton,
  Tooltip,
  Chip,
  useTheme,
  alpha,
  TablePagination,
  Paper,
  Stack,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Phone as PhoneIcon,
  AccountCircle as AccountIcon,
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';

const CustomerTable = ({
  customers,
  paginatedCustomers,
  filteredCustomers,
  page,
  rowsPerPage,
  handleChangePage,
  handleChangeRowsPerPage,
  handleEdit,
  handleDelete,
  onSelectCustomer,
  isMobile,
  isTablet,
  expandedRow,
  toggleRowExpansion,
  searchTerm,
  hidePagination = false,
  showDateColumn = false,
}) => {
  const theme = useTheme();

  const renderEmptyState = () => (
    <Box sx={{ 
      textAlign: 'center', 
      py: 6,
      px: 2
    }}>
      <AccountIcon sx={{ 
        fontSize: 48, 
        color: alpha(theme.palette.text.secondary, 0.4), 
        mb: 2 
      }} />
      <Typography variant="body1" color="text.secondary" gutterBottom>
        {searchTerm ? 'No customers match your search' : 'No customers yet'}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {searchTerm ? 'Try different keywords' : 'Add your first customer to get started'}
      </Typography>
    </Box>
  );

  const renderMobileView = () => (
    <Box sx={{ py: 0.5 }}>
      {paginatedCustomers.length === 0 ? (
        renderEmptyState()
      ) : (
        <>
          {paginatedCustomers.map((customer) => (
            <Paper
              key={customer.id}
              elevation={0}
              sx={{
                mb: 1,
                p: 1.5,
                borderRadius: 1.5,
                border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                bgcolor: 'background.paper',
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderColor: alpha(theme.palette.primary.main, 0.2),
                  bgcolor: alpha(theme.palette.primary.main, 0.02),
                  cursor: 'pointer',
                },
              }}
              onClick={() => onSelectCustomer(customer)}
            >
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: 'primary.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    flexShrink: 0,
                  }}
                >
                  {customer.sn}
                </Box>
                
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography 
                    variant="subtitle2" 
                    fontWeight={600}
                    sx={{ 
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      mb: 0.25,
                    }}
                  >
                    {customer.name}
                  </Typography>
                  
                  {customer.phone && (
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <PhoneIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                      <Typography variant="caption" color="text.secondary">
                        {customer.phone}
                      </Typography>
                    </Stack>
                  )}
                </Box>
                
                <Stack direction="row" spacing={0.5}>
                  <Tooltip title="Edit">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(customer);
                      }}
                      sx={{ 
                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                        '&:hover': {
                          bgcolor: alpha(theme.palette.primary.main, 0.16),
                        },
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title="Delete">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(customer);
                      }}
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
              </Stack>
            </Paper>
          ))}
          
          {!hidePagination && (
            <Box sx={{ mt: 2 }}>
              <TablePagination
                component="div"
                count={filteredCustomers.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25]}
                labelRowsPerPage="Rows:"
                sx={{
                  '& .MuiTablePagination-toolbar': {
                    flexWrap: 'wrap',
                    minHeight: 'auto',
                    px: 0.5,
                    py: 1,
                  },
                  '& .MuiTablePagination-selectLabel': {
                    fontSize: '0.75rem',
                  },
                  '& .MuiTablePagination-displayedRows': {
                    fontSize: '0.75rem',
                  }
                }}
              />
            </Box>
          )}
        </>
      )}
    </Box>
  );

  const renderDesktopView = () => (
    <>
      <TableContainer>
        <Table size={isTablet ? "small" : "medium"}>
          <TableHead>
            <TableRow sx={{ 
              bgcolor: alpha(theme.palette.divider, 0.04),
              '& th': {
                fontWeight: 600,
                fontSize: isTablet ? '0.75rem' : '0.8125rem',
                py: isTablet ? 1.25 : 1.5,
                px: isTablet ? 1.5 : 2,
                borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                color: 'text.secondary',
              }
            }}>
              <TableCell sx={{ width: '60px' }}>
                SN
              </TableCell>
              
              <TableCell>
                CUSTOMER
              </TableCell>
              
              <TableCell sx={{ width: '150px' }}>
                PHONE
              </TableCell>
              
              {showDateColumn && (
                <TableCell sx={{ width: '120px' }}>
                  DATE
                </TableCell>
              )}
              
              <TableCell sx={{ width: '100px', textAlign: 'right' }}>
                ACTIONS
              </TableCell>
            </TableRow>
          </TableHead>
          
          <TableBody>
            {paginatedCustomers.length === 0 ? (
              <TableRow>
                <TableCell 
                  colSpan={showDateColumn ? 5 : 4} 
                  sx={{ 
                    py: 6,
                    borderBottom: 'none',
                  }}
                >
                  {renderEmptyState()}
                </TableCell>
              </TableRow>
            ) : (
              paginatedCustomers.map((customer) => (
                <TableRow
                  key={customer.id}
                  hover
                  sx={{
                    transition: 'background-color 0.2s',
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.02),
                      cursor: 'pointer',
                    },
                    '& td': {
                      py: isTablet ? 1.25 : 1.5,
                      px: isTablet ? 1.5 : 2,
                      borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                    }
                  }}
                  onClick={() => onSelectCustomer(customer)}
                >
                  <TableCell>
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        color: 'primary.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                      }}
                    >
                      {customer.sn}
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    <Box>
                      <Typography 
                        variant="subtitle2" 
                        fontWeight={600}
                        sx={{ 
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          maxWidth: isTablet ? '180px' : '250px',
                        }}
                      >
                        {customer.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ID: {customer.id?.slice(0, 8)}
                      </Typography>
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    {customer.phone ? (
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <PhoneIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          {customer.phone}
                        </Typography>
                      </Stack>
                    ) : (
                      <Chip
                        label="No Phone"
                        size="small"
                        variant="outlined"
                        sx={{ 
                          fontSize: '0.75rem',
                          height: 24,
                          borderColor: alpha(theme.palette.text.secondary, 0.2),
                          color: 'text.secondary',
                        }}
                      />
                    )}
                  </TableCell>
                  
                  {showDateColumn && (
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {format(parseISO(customer.created_at), 'dd MMM')}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {format(parseISO(customer.created_at), 'hh:mm a')}
                      </Typography>
                    </TableCell>
                  )}
                  
                  <TableCell sx={{ textAlign: 'right' }}>
                    <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                      <Tooltip title="Edit" arrow>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(customer);
                          }}
                          sx={{ 
                            bgcolor: alpha(theme.palette.primary.main, 0.08),
                            '&:hover': {
                              bgcolor: alpha(theme.palette.primary.main, 0.16),
                            },
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Delete" arrow>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(customer);
                          }}
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
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      {!hidePagination && paginatedCustomers.length > 0 && (
        <Box sx={{ 
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}>
          <TablePagination
            component="div"
            count={filteredCustomers.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[10, 25, 50]}
            labelRowsPerPage="Rows:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} of ${count}`}
            sx={{
              '& .MuiTablePagination-toolbar': {
                minHeight: 48,
                px: isTablet ? 1.5 : 2,
              },
              '& .MuiTablePagination-selectLabel, & .MuiTablePagination-input': {
                fontSize: '0.8125rem',
              },
            }}
          />
        </Box>
      )}
    </>
  );

  return isMobile ? renderMobileView() : renderDesktopView();
};

export default CustomerTable;