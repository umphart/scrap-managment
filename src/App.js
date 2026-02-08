import React, { useState } from 'react';
import {
  Container,
  CssBaseline,
  ThemeProvider,
  createTheme,
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Button,
} from '@mui/material';
import { blue, orange } from '@mui/material/colors';
import ScrapIcon from '@mui/icons-material/Recycling';
import CustomerManagement from './components/CustomerManagement';
import ProductManagement from './components/ProductManagement';
import CustomerSheet from './components/CustomerSheet';
import Reports from './components/Reports';

// Create a simple theme first to avoid dependency issues
const theme = createTheme({
  palette: {
    primary: {
      main: blue[700],
      light: blue[300],
      dark: blue[900],
    },
    secondary: {
      main: orange[700],
      light: orange[300],
      dark: orange[900],
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});

function App() {
  const [activeTab, setActiveTab] = useState('customers');
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab !== 'customers') {
      setSelectedCustomer(null);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <AppBar 
          position="static" 
          elevation={1}
          sx={{ 
            bgcolor: 'primary.main',
            borderBottom: `2px solid ${orange[500]}`,
          }}
        >
          <Toolbar sx={{ minHeight: { xs: 48, sm: 56 } }}>
            <ScrapIcon sx={{ mr: 1.5, fontSize: { xs: 24, sm: 28 } }} />
            <Typography 
              variant="h6" 
              component="div" 
              sx={{ 
                flexGrow: 1,
                fontWeight: 700,
                letterSpacing: 0.5,
                fontSize: { xs: '1rem', sm: '1.25rem' },
              }}
            >
              TZ Scraps Management
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <Button
                color="inherit"
                variant={activeTab === 'customers' ? 'contained' : 'text'}
                onClick={() => handleTabChange('customers')}
                sx={{
                  bgcolor: activeTab === 'customers' ? 'secondary.main' : 'transparent',
                  '&:hover': {
                    bgcolor: activeTab === 'customers' ? 'secondary.dark' : 'rgba(255,255,255,0.1)',
                  },
                  py: 0.5,
                  px: 1.5,
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                }}
              >
                Customers
              </Button>
              <Button
                color="inherit"
                variant={activeTab === 'products' ? 'contained' : 'text'}
                onClick={() => handleTabChange('products')}
                sx={{
                  bgcolor: activeTab === 'products' ? 'secondary.main' : 'transparent',
                  '&:hover': {
                    bgcolor: activeTab === 'products' ? 'secondary.dark' : 'rgba(255,255,255,0.1)',
                  },
                  py: 0.5,
                  px: 1.5,
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                }}
              >
                Products
              </Button>
              <Button
                color="inherit"
                variant={activeTab === 'reports' ? 'contained' : 'text'}
                onClick={() => handleTabChange('reports')}
                sx={{
                  bgcolor: activeTab === 'reports' ? 'secondary.main' : 'transparent',
                  '&:hover': {
                    bgcolor: activeTab === 'reports' ? 'secondary.dark' : 'rgba(255,255,255,0.1)',
                  },
                  py: 0.5,
                  px: 1.5,
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                }}
              >
                Reports
              </Button>
            </Box>
          </Toolbar>
        </AppBar>

        <Container 
          maxWidth="xl" 
          sx={{ 
            flex: 1,
            py: 2,
            px: { xs: 1, sm: 2, md: 3 },
          }}
        >
          {activeTab === 'customers' && !selectedCustomer && (
            <CustomerManagement onSelectCustomer={setSelectedCustomer} />
          )}
          
          {selectedCustomer && activeTab === 'customers' && (
            <CustomerSheet 
              customer={selectedCustomer} 
              onBack={() => setSelectedCustomer(null)}
            />
          )}
          
          {activeTab === 'products' && (
            <ProductManagement />
          )}
          
          {activeTab === 'reports' && (
            <Reports />
          )}
        </Container>

        {/* Footer */}
        <Box
          component="footer"
          sx={{
            py: 2,
            px: 1,
            mt: 'auto',
            backgroundColor: 'primary.dark',
            color: 'white',
            textAlign: 'center',
            borderTop: `1px solid ${blue[800]}`,
          }}
        >
          <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
            © {new Date().getFullYear()} TZ Scraps Management System v1.0
          </Typography>
          <Typography variant="caption" sx={{ 
            opacity: 0.8, 
            mt: 0.5, 
            display: 'block',
            fontSize: { xs: '0.625rem', sm: '0.75rem' }
          }}>
            Efficient scrap management for modern businesses
          </Typography>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;