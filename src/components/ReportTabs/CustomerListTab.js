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

const CustomerListTab = ({ customers }) => {
  if (!customers || customers.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="body1" color="text.secondary">
          No customer data available
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow sx={{ bgcolor: 'grey.50' }}>
            <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Customer Name</TableCell>
            <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Phone</TableCell>
            <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Joined Date</TableCell>
            <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {customers.map((customer) => (
            <TableRow key={customer.id} hover>
              <TableCell>
                <Typography variant="subtitle2" fontWeight={600}>
                  {customer.name}
                </Typography>
              </TableCell>
              <TableCell>{customer.phone || 'No phone'}</TableCell>
              <TableCell>
                {format(new Date(customer.created_at), 'dd MMM yyyy')}
              </TableCell>
              <TableCell>
                <Chip 
                  label="Active" 
                  size="small" 
                  color="success" 
                  variant="outlined" 
                  sx={{ fontSize: '0.75rem' }}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default CustomerListTab;