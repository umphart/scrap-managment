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
  Tab,
  Tabs,
} from '@mui/material';
import { blue, orange } from '@mui/material/colors';
import ScrapIcon from '@mui/icons-material/Recycling';
import LockIcon from '@mui/icons-material/Lock';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import CustomerManagement from './components/CustomerManagement';
import ProductManagement from './components/ProductManagement';
import CustomerSheet from './components/CustomerSheet';
import Reports from './components/Reports';
import { supabase } from './config/supabase';

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

function AuthPage({ onLogin }) {
  const [activeTab, setActiveTab] = useState(0); // 0 for login, 1 for signup
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setError('');
    setSuccess('');
    // Reset form fields
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setUsername('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password');
      return;
    }

    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (error) throw error;

      if (data.user) {
        // Store user info in localStorage
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userEmail', data.user.email);
        localStorage.setItem('userId', data.user.id);
        
        // Get username from user metadata or email
        const userName = data.user.user_metadata?.username || data.user.email?.split('@')[0];
        localStorage.setItem('username', userName);
        
        onLogin();
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Validation
    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password.trim(),
        options: {
          data: {
            username: username.trim() || email.split('@')[0],
          },
          // Disable email verification
          emailRedirectTo: undefined,
        },
      });

      if (error) throw error;

      if (data.user) {
        // Auto-confirm the email (since we're not using email verification)
        // Note: This depends on your Supabase settings
        setSuccess('Account created successfully! You can now log in.');
        
        // Auto switch to login tab after successful signup
        setTimeout(() => {
          setActiveTab(0);
          setPassword('');
          setConfirmPassword('');
        }, 2000);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      if (activeTab === 0) {
        handleLogin(e);
      } else {
        handleSignUp(e);
      }
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

          {/* Auth Tabs */}
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange} 
            sx={{ 
              width: '100%',
              mb: 2,
              '& .MuiTab-root': {
                fontSize: '1rem',
                fontWeight: 600,
                flex: 1,
              },
            }}
          >
            <Tab label="Sign In" />
            <Tab label="Create Account" />
          </Tabs>

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

          {/* Success Alert */}
          {success && (
            <Alert
              severity="success"
              sx={{
                width: '100%',
                mb: 2,
                '& .MuiAlert-icon': {
                  alignItems: 'center',
                },
              }}
            >
              {success}
            </Alert>
          )}

          {/* Auth Form */}
          <Box
            component="form"
            onSubmit={activeTab === 0 ? handleLogin : handleSignUp}
            sx={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: 2.5,
            }}
          >
            {/* Username field for signup only */}
            {activeTab === 1 && (
              <TextField
                fullWidth
                label="Username (optional)"
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
              />
            )}

            <TextField
              fullWidth
              label="Email"
              type="email"
              variant="outlined"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={handleKeyPress}
              InputProps={{
                startAdornment: (
                  <EmailIcon sx={{ mr: 1, color: 'action.active' }} />
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
              helperText={activeTab === 1 ? "Minimum 6 characters" : ""}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: 'primary.main',
                  },
                },
              }}
            />

            {/* Confirm Password for signup */}
            {activeTab === 1 && (
              <TextField
                fullWidth
                label="Confirm Password"
                type="password"
                variant="outlined"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                InputProps={{
                  startAdornment: (
                    <LockIcon sx={{ mr: 1, color: 'action.active' }} />
                  ),
                }}
                disabled={loading}
              />
            )}

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
                activeTab === 0 ? 'Sign In' : 'Create Account'
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
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    // Get user email from localStorage
    const email = localStorage.getItem('userEmail') || '';
    setUserEmail(email);
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab !== 'customers') {
      setSelectedCustomer(null);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userId');
      localStorage.removeItem('username');
      window.location.reload(); // Reload to show login page
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
              
              {/* User Email and Logout */}
              <Box sx={{ 
                ml: 2, 
                display: { xs: 'none', md: 'flex' }, 
                alignItems: 'center',
                borderLeft: '1px solid rgba(255,255,255,0.3)',
                pl: 2,
              }}>
                <Typography variant="body2" sx={{ mr: 2, fontSize: '0.875rem' }}>
                  {userEmail}
                </Typography>
                <Button
                  color="inherit"
                  onClick={handleLogout}
                  sx={{
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

              {/* Mobile Logout */}
              <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                <IconButton
                  color="inherit"
                  onClick={handleLogout}
                  size="small"
                  sx={{ ml: 1 }}
                >
                  <LockIcon fontSize="small" />
                </IconButton>
              </Box>
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
            {localStorage.getItem('userEmail') && ` • ${localStorage.getItem('userEmail')}`}
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
    checkUser();
    
    // Subscribe to auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        setIsAuthenticated(true);
      } else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userEmail', session.user.email);
        localStorage.setItem('userId', session.user.id);
        
        const userName = session.user.user_metadata?.username || session.user.email?.split('@')[0];
        localStorage.setItem('username', userName);
        
        setIsAuthenticated(true);
      } else {
        // Check local storage fallback
        const authStatus = localStorage.getItem('isAuthenticated');
        if (authStatus === 'true') {
          setIsAuthenticated(true);
        }
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setLoading(false);
    }
  };

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

  return isAuthenticated ? <MainApp /> : <AuthPage onLogin={handleLogin} />;
}

export default App;