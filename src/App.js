import React, { useState, useEffect } from 'react';
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
  Paper,
  TextField,
  Alert,
  CircularProgress,
} from '@mui/material';
import { blue, orange } from '@mui/material/colors';
import ScrapIcon from '@mui/icons-material/Recycling';
import LockIcon from '@mui/icons-material/Lock';
import PersonIcon from '@mui/icons-material/Person';
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

// Mock user credentials (in a real app, this would come from a backend)
const VALID_CREDENTIALS = {
  username: 'Tasizola',
  password: '123456'
};

function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password');
      return;
    }

    setLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      if (username === VALID_CREDENTIALS.username && password === VALID_CREDENTIALS.password) {
        // Store login state in localStorage
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('username', username);
        onLogin();
      } else {
        setError('Invalid username or password');
      }
      setLoading(false);
    }, 500);
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'primary.light',
          backgroundImage: 'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)',
          p: 2,
        }}
      >
        <Paper
          elevation={6}
          sx={{
            p: { xs: 3, sm: 4, md: 5 },
            width: '100%',
            maxWidth: 450,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 3,
          }}
        >
          {/* Logo Section */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 1,
            }}
          >
            <ScrapIcon
              sx={{
                fontSize: 48,
                color: 'primary.main',
                mr: 2,
              }}
            />
            <Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  color: 'primary.main',
                  fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
                }}
              >
                TZ Scraps
              </Typography>
              <Typography
                variant="subtitle1"
                sx={{
                  color: 'text.secondary',
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                }}
              >
                Management System
              </Typography>
            </Box>
          </Box>

          <Typography
            variant="h5"
            sx={{
              mb: 1,
              fontWeight: 600,
              color: 'primary.dark',
              fontSize: { xs: '1.25rem', sm: '1.5rem' },
            }}
          >
            Sign In
          </Typography>

          {/* Error Alert */}
          {error && (
            <Alert
              severity="error"
              sx={{
                width: '100%',
                mb: 2,
                '& .MuiAlert-icon': {
                  alignItems: 'center',
                },
              }}
            >
              {error}
            </Alert>
          )}

          {/* Login Form */}
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: 2.5,
            }}
          >
            <TextField
              fullWidth
              label="Username"
              variant="outlined"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyPress={handleKeyPress}
              InputProps={{
                startAdornment: (
                  <PersonIcon sx={{ mr: 1, color: 'action.active' }} />
                ),
              }}
              disabled={loading}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: 'primary.main',
                  },
                },
              }}
            />

            <TextField
              fullWidth
              label="Password"
              type="password"
              variant="outlined"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              InputProps={{
                startAdornment: (
                  <LockIcon sx={{ mr: 1, color: 'action.active' }} />
                ),
              }}
              disabled={loading}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: 'primary.main',
                  },
                },
              }}
            />

            {/* Demo Credentials */}
            <Alert
              severity="info"
              sx={{
                fontSize: '0.875rem',
                '& .MuiAlert-icon': {
                  alignItems: 'center',
                },
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Demo Credentials:
              </Typography>
              <Typography variant="body2">
                Username: <strong>Tasizola</strong>
                <br />
                Password: <strong>123456</strong>
              </Typography>
            </Alert>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                mt: 1,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                bgcolor: 'primary.main',
                '&:hover': {
                  bgcolor: 'primary.dark',
                },
                '&:disabled': {
                  bgcolor: 'action.disabledBackground',
                },
              }}
            >
              {loading ? (
                <CircularProgress size={24} sx={{ color: 'white' }} />
              ) : (
                'Sign In'
              )}
            </Button>
          </Box>

          {/* Footer */}
          <Box
            sx={{
              mt: 3,
              pt: 2,
              borderTop: 1,
              borderColor: 'divider',
              width: '100%',
              textAlign: 'center',
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                fontSize: '0.75rem',
              }}
            >
              © {new Date().getFullYear()} TZ Scraps Management System
              <br />
              Secure Access • Version 1.0
            </Typography>
          </Box>
        </Paper>
      </Box>
    </ThemeProvider>
  );
}

function MainApp() {
  const [activeTab, setActiveTab] = useState('customers');
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab !== 'customers') {
      setSelectedCustomer(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('username');
    window.location.reload(); // Reload to show login page
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
            
            <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
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
              
              {/* Logout Button */}
              <Button
                color="inherit"
                onClick={handleLogout}
                sx={{
                  ml: 2,
                  border: '1px solid rgba(255,255,255,0.3)',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.1)',
                  },
                  py: 0.5,
                  px: 1.5,
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                }}
              >
                Logout
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
            {localStorage.getItem('username') && ` • Logged in as: ${localStorage.getItem('username')}`}
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

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated
    const authStatus = localStorage.getItem('isAuthenticated');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            backgroundColor: 'primary.light',
          }}
        >
          <CircularProgress size={60} sx={{ color: 'primary.main' }} />
        </Box>
      </ThemeProvider>
    );
  }

  return isAuthenticated ? <MainApp /> : <LoginPage onLogin={handleLogin} />;
}

export default App;