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
} from '@mui/material';

const CustomerSpendingTab = ({ customerSpending }) => {
  if (!customerSpending || customerSpending.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="body1" color="text.secondary">
          No customer spending data available
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow sx={{ bgcolor: 'grey.50' }}>
            <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Customer</TableCell>
            <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Phone</TableCell>
            <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Transactions</TableCell>
            <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Total Spent</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {customerSpending.map((customer, index) => (
            <TableRow key={index} hover>
              <TableCell>
                <Typography variant="subtitle2" fontWeight={600}>
                  {customer.name}
                </Typography>
              </TableCell>
              <TableCell>{customer.phone || 'No phone'}</TableCell>
              <TableCell align="right">{customer.transactions}</TableCell>
              <TableCell align="right">
                <Typography variant="body2" fontWeight={600} color="primary.main">
                  ₦{customer.total.toFixed(2)}
                </Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default CustomerSpendingTab;