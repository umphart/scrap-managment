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
import { format } from 'date-fns';

const RecentTransactionsTab = ({ transactions }) => {
  if (!transactions || transactions.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="body1" color="text.secondary">
          No transaction data available
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow sx={{ bgcolor: 'grey.50' }}>
            <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Date</TableCell>
            <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Customer</TableCell>
            <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Product</TableCell>
            <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Quantity</TableCell>
            <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Amount</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {transactions.slice(0, 20).map((transaction) => (
            <TableRow key={transaction.id} hover>
              <TableCell>
                {format(new Date(transaction.created_at), 'dd/MM/yy hh:mm a')}
              </TableCell>
              <TableCell>
                <Typography variant="subtitle2">
                  {transaction.customers?.name || 'Unknown'}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {transaction.products?.name || 'Unknown'}
                </Typography>
              </TableCell>
              <TableCell align="right">
                {transaction.quantity} {transaction.unit}
              </TableCell>
              <TableCell align="right">
                <Typography variant="body2" fontWeight={600} color="primary.main">
                  ₦{parseFloat(transaction.total_amount || 0).toFixed(2)}
                </Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default RecentTransactionsTab;