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

const ProductBuyTab = ({ productPurchases }) => {
  if (!productPurchases || productPurchases.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="body1" color="text.secondary">
          No product buy data available
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow sx={{ bgcolor: 'grey.50' }}>
            <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Product</TableCell>
            <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Serial No</TableCell>
            <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Quantity BUY</TableCell>
            <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Amount</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {productPurchases.map((product, index) => (
            <TableRow key={index} hover>
              <TableCell>
                <Typography variant="subtitle2" fontWeight={600}>
                  {product.name}
                </Typography>
              </TableCell>
              <TableCell>
                <Chip 
                  label={product.serial} 
                  size="small" 
                  variant="outlined" 
                  sx={{ fontSize: '0.75rem' }}
                />
              </TableCell>
              <TableCell align="right">{product.quantity.toFixed(2)}</TableCell>
              <TableCell align="right">
                <Typography variant="body2" fontWeight={600} color="primary.main">
                  ₦{product.amount.toFixed(2)}
                </Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ProductBuyTab;