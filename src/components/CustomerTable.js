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
  Avatar,
  Chip,
  Badge,
  useTheme,
  alpha,
  Button,
  Collapse,
  TablePagination,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  Print as PrintIcon,
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
  isSmallDesktop,
  expandedRow,
  toggleRowExpansion,
  searchTerm,
}) => {
  const theme = useTheme();

  // Responsive table columns configuration
  const getVisibleColumns = () => {
    if (isMobile) return ['name', 'phone'];
    if (isTablet) return ['sn', 'name', 'phone', 'actions'];
    if (isSmallDesktop) return ['sn', 'name', 'phone', 'date', 'actions'];
    return ['sn', 'name', 'phone', 'email', 'date', 'actions'];
  };

  const visibleColumns = getVisibleColumns();

  const renderMobileView = () => (
    <Box sx={{ p: 2 }}>
      {paginatedCustomers.length === 0 ? (
        renderEmptyState()
      ) : (
        <>
          {paginatedCustomers.map((customer) => (
            <CustomerMobileCard
              key={customer.id}
              customer={customer}
              handleEdit={handleEdit}
              handleDelete={handleDelete}
              onSelectCustomer={onSelectCustomer}
              expandedRow={expandedRow}
              toggleRowExpansion={toggleRowExpansion}
              theme={theme}
            />
          ))}
          {renderPagination()}
        </>
      )}
    </Box>
  );

  const renderTabletDesktopView = () => (
    <>
      <TableContainer sx={{ maxHeight: isTablet ? '60vh' : '70vh' }}>
        <Table stickyHeader size={isTablet ? "small" : "medium"}>
          <TableHead>
            <TableRow sx={{ 
              bgcolor: alpha(theme.palette.primary.main, 0.04),
              '& th': {
                fontWeight: 700,
                fontSize: isTablet ? '0.75rem' : '0.875rem',
                py: isTablet ? 1 : 2,
                borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              }
            }}>
              {visibleColumns.includes('sn') && (
                <TableCell sx={{ width: '70px', pl: isTablet ? 2 : 4 }}>
                  ID
                </TableCell>
              )}
              
              <TableCell sx={{ minWidth: '180px' }}>
                Customer Details
              </TableCell>
              
              {visibleColumns.includes('phone') && (
                <TableCell sx={{ minWidth: '140px' }}>
                  Contact
                </TableCell>
              )}
              
              {visibleColumns.includes('email') && (
                <TableCell sx={{ minWidth: '200px' }}>
                  Email
                </TableCell>
              )}
              
              {visibleColumns.includes('date') && (
                <TableCell sx={{ width: '150px' }}>
                  Join Date
                </TableCell>
              )}
              
              {visibleColumns.includes('actions') && (
                <TableCell sx={{ 
                  width: isTablet ? '120px' : '180px', 
                  pr: isTablet ? 2 : 4 
                }}>
                  Actions
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          
          <TableBody>
            {paginatedCustomers.length === 0 ? (
              <TableRow>
                <TableCell 
                  colSpan={visibleColumns.length + 1} 
                  align="center" 
                  sx={{ py: 8 }}
                >
                  {renderEmptyState(true)}
                </TableCell>
              </TableRow>
            ) : (
              paginatedCustomers.map((customer) => (
                <CustomerTableRow
                  key={customer.id}
                  customer={customer}
                  visibleColumns={visibleColumns}
                  handleEdit={handleEdit}
                  handleDelete={handleDelete}
                  onSelectCustomer={onSelectCustomer}
                  isTablet={isTablet}
                  expandedRow={expandedRow}
                  toggleRowExpansion={toggleRowExpansion}
                />
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      {paginatedCustomers.length > 0 && renderTablePagination()}
    </>
  );

  const renderEmptyState = (inTable = false) => (
    <Box sx={{ 
      textAlign: 'center', 
      py: inTable ? 0 : 8,
      px: 2
    }}>
      <SearchIcon sx={{ 
        fontSize: inTable ? 48 : 64, 
        color: 'text.disabled', 
        mb: 2 
      }} />
      <Typography variant={inTable ? "h6" : "h5"} color="textSecondary" gutterBottom>
        {searchTerm ? 'No matching customers found' : 'No customers yet'}
      </Typography>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
        {searchTerm ? 'Try different search terms' : 'Add your first customer to get started'}
      </Typography>
    </Box>
  );

  const renderPagination = () => (
    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
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
            padding: 1,
          },
          '& .MuiTablePagination-selectLabel': {
            margin: 0,
          },
          '& .MuiTablePagination-displayedRows': {
            margin: 0,
          }
        }}
      />
    </Box>
  );

  const renderTablePagination = () => (
    <Box sx={{ 
      borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
      bgcolor: 'background.paper'
    }}>
      <TablePagination
        component="div"
        count={filteredCustomers.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[10, 25, 50]}
        labelRowsPerPage="Rows per page:"
        sx={{
          '& .MuiTablePagination-toolbar': {
            minHeight: '52px',
            padding: isTablet ? '0 8px' : '0 16px',
          },
          '& .MuiTablePagination-selectLabel': {
            fontSize: isTablet ? '0.875rem' : '1rem',
          },
          '& .MuiTablePagination-displayedRows': {
            fontSize: isTablet ? '0.875rem' : '1rem',
          }
        }}
      />
    </Box>
  );

  return isMobile ? renderMobileView() : renderTabletDesktopView();
};

// Sub-component for mobile cards
const CustomerMobileCard = ({
  customer,
  handleEdit,
  handleDelete,
  onSelectCustomer,
  expandedRow,
  toggleRowExpansion,
  theme,
}) => (
  <Box
    sx={{
      mb: 2,
      borderRadius: 2,
      bgcolor: 'background.paper',
      border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
      overflow: 'hidden',
      cursor: 'pointer',
      transition: 'all 0.2s',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: theme.shadows[4],
      },
    }}
    onClick={() => onSelectCustomer(customer)}
  >
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Avatar
          sx={{
            bgcolor: 'primary.main',
            width: 40,
            height: 40,
            mr: 2,
          }}
        >
          {customer.name.charAt(0).toUpperCase()}
        </Avatar>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="subtitle1" fontWeight={600}>
            {customer.name}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            ID: #{customer.sn}
          </Typography>
        </Box>
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            toggleRowExpansion(customer.id);
          }}
        >
          {expandedRow === customer.id ? 
            <Typography variant="caption">Less</Typography> : 
            <Typography variant="caption">More</Typography>
          }
        </IconButton>
      </Box>
      
      <Box sx={{ mb: 1 }}>
        {customer.phone && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <PhoneIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
            <Typography variant="body2">{customer.phone}</Typography>
          </Box>
        )}
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <CalendarIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
          <Typography variant="body2">
            {format(parseISO(customer.created_at), 'dd MMM yyyy')}
          </Typography>
        </Box>
      </Box>
      
      <Collapse in={expandedRow === customer.id}>
        <Box sx={{ 
          mt: 2, 
          pt: 2, 
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` 
        }}>
          <Box sx={{ mb: 2 }}>
            {customer.email && (
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <EmailIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2">{customer.email}</Typography>
              </Box>
            )}
            
            {customer.address && (
              <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                <LocationIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary', mt: 0.25 }} />
                <Typography variant="body2">{customer.address}</Typography>
              </Box>
            )}
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
            <Button
              size="small"
              variant="outlined"
              fullWidth
              onClick={(e) => {
                e.stopPropagation();
                handleEdit(customer);
              }}
            >
              Edit
            </Button>
            <Button
              size="small"
              color="error"
              variant="outlined"
              fullWidth
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(customer);
              }}
            >
              Delete
            </Button>
            <Button
              size="small"
              color="secondary"
              variant="contained"
              fullWidth
              startIcon={<PrintIcon />}
              onClick={(e) => {
                e.stopPropagation();
                onSelectCustomer(customer);
              }}
            >
              Open
            </Button>
          </Box>
        </Box>
      </Collapse>
      
      {expandedRow !== customer.id && (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          pt: 1,
          gap: 1 
        }}>
          <Button
            size="small"
            variant="text"
            fullWidth
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(customer);
            }}
          >
            Edit
          </Button>
          <Button
            size="small"
            color="error"
            variant="text"
            fullWidth
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(customer);
            }}
          >
            Delete
          </Button>
          <Button
            size="small"
            color="secondary"
            variant="text"
            fullWidth
            onClick={(e) => {
              e.stopPropagation();
              onSelectCustomer(customer);
            }}
          >
            Open
          </Button>
        </Box>
      )}
    </Box>
  </Box>
);

// Sub-component for table rows
const CustomerTableRow = ({
  customer,
  visibleColumns,
  handleEdit,
  handleDelete,
  onSelectCustomer,
  isTablet,
  expandedRow,
  toggleRowExpansion,
}) => {
  const theme = useTheme();

  return (
    <>
      <TableRow
        hover
        sx={{
          cursor: 'pointer',
          transition: 'background-color 0.2s',
          '&:hover': {
            bgcolor: alpha(theme.palette.primary.main, 0.02),
          },
        }}
        onClick={() => onSelectCustomer(customer)}
      >
        {visibleColumns.includes('sn') && (
          <TableCell sx={{ pl: isTablet ? 2 : 4 }}>
            <Badge
              color="primary"
              variant="dot"
              invisible={!customer.isRecent}
              sx={{ mr: 1 }}
            >
              <Chip
                label={`#${customer.sn}`}
                size="small"
                color="primary"
                variant="outlined"
                sx={{
                  fontWeight: 700,
                  borderRadius: 1.5,
                  borderWidth: 2,
                  fontSize: isTablet ? '0.75rem' : '0.875rem',
                }}
              />
            </Badge>
          </TableCell>
        )}
        
        <TableCell>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar
              sx={{
                bgcolor: 'primary.main',
                width: isTablet ? 32 : 40,
                height: isTablet ? 32 : 40,
                mr: 2,
                fontSize: isTablet ? '0.875rem' : '1rem',
              }}
            >
              {customer.name.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Typography 
                variant={isTablet ? "body2" : "subtitle1"} 
                fontWeight={600}
                sx={{ 
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: '200px',
                }}
              >
                {customer.name}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                ID: {customer.id?.slice(0, 8)}...
              </Typography>
            </Box>
          </Box>
        </TableCell>
        
        {visibleColumns.includes('phone') && (
          <TableCell>
            {customer.phone ? (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <PhoneIcon sx={{ 
                  fontSize: isTablet ? 14 : 16, 
                  mr: 1, 
                  color: 'text.secondary' 
                }} />
                <Typography variant={isTablet ? "body2" : "body1"}>
                  {customer.phone}
                </Typography>
              </Box>
            ) : (
              <Chip
                label="No Phone"
                size="small"
                color="warning"
                variant="outlined"
                sx={{ 
                  fontSize: isTablet ? '0.625rem' : '0.75rem',
                  height: isTablet ? 24 : 28,
                }}
              />
            )}
          </TableCell>
        )}
        
        {visibleColumns.includes('email') && (
          <TableCell>
            {customer.email ? (
              <Typography 
                variant={isTablet ? "body2" : "body1"}
                sx={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: isTablet ? '150px' : '200px',
                }}
              >
                {customer.email}
              </Typography>
            ) : (
              <Typography 
                variant={isTablet ? "caption" : "body2"} 
                color="textSecondary"
              >
                No email
              </Typography>
            )}
          </TableCell>
        )}
        
        {visibleColumns.includes('date') && (
          <TableCell>
            <Box>
              <Typography 
                variant={isTablet ? "body2" : "body1"} 
                fontWeight={500}
              >
                {format(parseISO(customer.created_at), 'dd MMM yyyy')}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {format(parseISO(customer.created_at), 'hh:mm a')}
              </Typography>
            </Box>
          </TableCell>
        )}
        
        {visibleColumns.includes('actions') && (
          <TableCell sx={{ pr: isTablet ? 2 : 4 }}>
            <Box sx={{ 
              display: 'flex', 
              gap: 0.5,
              justifyContent: 'flex-end',
              flexWrap: 'wrap'
            }}>
              <Tooltip title="Edit">
                <IconButton
                  size={isTablet ? "small" : "medium"}
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
                  <EditIcon fontSize={isTablet ? "small" : "medium"} />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Delete">
                <IconButton
                  size={isTablet ? "small" : "medium"}
                  color="error"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(customer);
                  }}
                  sx={{
                    bgcolor: alpha(theme.palette.error.main, 0.08),
                    '&:hover': {
                      bgcolor: alpha(theme.palette.error.main, 0.16),
                    },
                  }}
                >
                  <DeleteIcon fontSize={isTablet ? "small" : "medium"} />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Open Sheet">
                <IconButton
                  size={isTablet ? "small" : "medium"}
                  color="secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectCustomer(customer);
                  }}
                  sx={{
                    bgcolor: alpha(theme.palette.secondary.main, 0.08),
                    '&:hover': {
                      bgcolor: alpha(theme.palette.secondary.main, 0.16),
                    },
                  }}
                >
                  <PrintIcon fontSize={isTablet ? "small" : "medium"} />
                </IconButton>
              </Tooltip>
            </Box>
          </TableCell>
        )}
      </TableRow>
      
      {/* Expandable row for tablet details */}
      {isTablet && visibleColumns.length < 5 && (
        <TableRow>
          <TableCell 
            colSpan={visibleColumns.length + 1} 
            sx={{ 
              p: 0,
              borderBottom: expandedRow === customer.id ? 
                `2px solid ${alpha(theme.palette.primary.main, 0.1)}` : 'none'
            }}
          >
            <Collapse in={expandedRow === customer.id}>
              <Box sx={{ 
                p: 2, 
                bgcolor: alpha(theme.palette.primary.main, 0.02),
                borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <Box sx={{ flex: 1 }}>
                  {!visibleColumns.includes('email') && customer.email && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <EmailIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2">{customer.email}</Typography>
                    </Box>
                  )}
                  
                  {customer.address && (
                    <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                      <LocationIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary', mt: 0.25 }} />
                      <Typography variant="body2">{customer.address}</Typography>
                    </Box>
                  )}
                </Box>
                
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleRowExpansion(customer.id);
                  }}
                >
                  <Typography variant="caption">
                    {expandedRow === customer.id ? 'Less' : 'More'}
                  </Typography>
                </IconButton>
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      )}
    </>
  );
};

export default CustomerTable;