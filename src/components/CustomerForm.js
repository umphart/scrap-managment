import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Typography,
  Alert,
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  AccountCircle as AccountIcon,
  Phone as PhoneIcon,
} from '@mui/icons-material';

const CustomerForm = ({
  open,
  onClose,
  editingCustomer,
  newCustomer,
  error,
  isMobile,
  theme,
  onChange,
  onSubmit,
  onErrorChange,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : 4,
          m: isMobile ? 0 : 4,
          maxHeight: isMobile ? '100vh' : '90vh',
        }
      }}
    >
      <DialogTitle sx={{ 
        p: isMobile ? 2 : 3, 
        pb: isMobile ? 1 : 2,
        borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
        bgcolor: isMobile ? 'primary.main' : 'transparent',
        color: isMobile ? 'primary.contrastText' : 'inherit',
      }}>
        <Typography variant={isMobile ? "h6" : "h5"} fontWeight={700}>
          {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
        </Typography>
        {!isMobile && (
          <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
            {editingCustomer ? `Update details for ${editingCustomer.name}` : 'Enter customer details'}
          </Typography>
        )}
      </DialogTitle>
      
      <DialogContent sx={{ p: isMobile ? 2 : 3 }}>
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3, 
              borderRadius: 2,
            }}
            onClose={() => onErrorChange('')}
          >
            {error}
          </Alert>
        )}
        
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Customer Name"
              value={newCustomer.name}
              onChange={(e) => onChange({ ...newCustomer, name: e.target.value })}
              required
              size={isMobile ? "small" : "medium"}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AccountIcon color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 1 }}
            />
            <Typography variant="caption" color="textSecondary" sx={{ pl: 4 }}>
              Required. Enter the customer's full name
            </Typography>
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Phone Number"
              value={newCustomer.phone}
              onChange={(e) => onChange({ ...newCustomer, phone: e.target.value })}
              size={isMobile ? "small" : "medium"}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <Typography variant="caption" color="textSecondary" sx={{ pl: 4 }}>
              Optional. Enter phone number for contact
            </Typography>
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={newCustomer.email}
              onChange={(e) => onChange({ ...newCustomer, email: e.target.value })}
              size={isMobile ? "small" : "medium"}
            />
            <Typography variant="caption" color="textSecondary" sx={{ pl: 1 }}>
              Optional. Enter email for digital communication
            </Typography>
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Address"
              multiline
              rows={isMobile ? 2 : 3}
              value={newCustomer.address}
              onChange={(e) => onChange({ ...newCustomer, address: e.target.value })}
              size={isMobile ? "small" : "medium"}
            />
            <Typography variant="caption" color="textSecondary" sx={{ pl: 1 }}>
              Optional. Enter customer's address
            </Typography>
          </Grid>
        </Grid>
      </DialogContent>
      
      <DialogActions sx={{ 
        p: isMobile ? 2 : 3, 
        pt: isMobile ? 1 : 2,
        borderTop: (theme) => `1px solid ${theme.palette.divider}`,
        bgcolor: isMobile ? 'background.default' : 'transparent',
      }}>
        <Button
          onClick={onClose}
          sx={{ 
            borderRadius: 2,
            px: 3,
            py: 1,
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={onSubmit}
          sx={{ 
            borderRadius: 2,
            px: 3,
            py: 1,
            fontWeight: 600,
          }}
          startIcon={isMobile ? null : (editingCustomer ? <EditIcon /> : <AddIcon />)}
        >
          {editingCustomer ? 'Update' : 'Add Customer'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CustomerForm;