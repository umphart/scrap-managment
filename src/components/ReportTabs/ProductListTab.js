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
  Chip,
} from '@mui/material';
import { format } from 'date-fns';

const ProductListTab = ({ products }) => {
  if (!products || products.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="body1" color="text.secondary">
          No product data available
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow sx={{ bgcolor: 'grey.50' }}>
            <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Product Name</TableCell>
            <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Serial No</TableCell>
            <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Description</TableCell>
            <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Added Date</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id} hover>
              <TableCell>
                <Typography variant="subtitle2" fontWeight={600}>
                  {product.name}
                </Typography>
              </TableCell>
              <TableCell>
                <Chip 
                  label={product.serial_number} 
                  size="small" 
                  variant="outlined" 
                  sx={{ fontSize: '0.75rem' }}
                />
              </TableCell>
              <TableCell>
                <Typography variant="body2" color="text.secondary">
                  {product.description || 'No description'}
                </Typography>
              </TableCell>
              <TableCell>
                {format(new Date(product.created_at), 'dd MMM yyyy')}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ProductListTab;