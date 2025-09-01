import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Paper,
  Typography,
  Box,
  Divider,
  Alert
} from '@mui/material';
import {
  Shield,
  Visibility,
  VisibilityOff,
  ArrowBack,
  Email,
  Lock,
  AdminPanelSettings,
  Security
} from '@mui/icons-material';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }

    setIsLoading(true);

    try {
      const result = await login({ email, password, endpoint: 'admin' });

      if (result.success) {
        toast.success(`Welcome back, Administrator`);
        setTimeout(() => navigate('/admin/dashboard'), 1000);
      } else {
        toast.error(result.error || 'Admin access denied');
      }
    } catch (err) {
      console.error(err);
      toast.error('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2
      }}
    >
      <ToastContainer position="top-center" autoClose={5000} />
      
      <Box sx={{ maxWidth: 500, width: "100%" }}>
        {/* Back Link */}
        <Button
          component={Link}
          to="/"
          startIcon={<ArrowBack />}
          sx={{ mb: 2, color: "text.secondary" }}
        >
          Back to SafeZone101
        </Button>

        {/* Logo and Title */}
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 80,
              height: 80,
              borderRadius: 2,
              bgcolor: "primary.main",
              color: "primary.contrastText",
              boxShadow: 3,
              mb: 2
            }}
          >
            <AdminPanelSettings sx={{ fontSize: 40 }} />
          </Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: "bold", mb: 1 }}>
            Admin Portal
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Secure administrative access to SafeZone101
          </Typography>
        </Box>

        {/* Login Card */}
        <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            mb: 2,
            p: 1,
            borderRadius: 2,
            backgroundColor: 'warning.light',
            color: 'warning.dark',
            border: '1px solid',
            borderColor: 'warning.main'
          }}>
            <Security sx={{ fontSize: 20, mr: 1 }} />
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              RESTRICTED ADMIN ACCESS
            </Typography>
          </Box>
          
          <Typography variant="h5" component="h2" sx={{ textAlign: "center", mb: 1 }}>
            Administrator Sign In
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", mb: 3 }}>
            Enter your admin credentials to continue
          </Typography>

          <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
            <Typography variant="body2">
              Authorized personnel only. All access is logged and monitored.
            </Typography>
          </Alert>

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            {/* Email */}
            <TextField
              fullWidth
              label="Admin Email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email color="action" />
                  </InputAdornment>
                )
              }}
            />

            {/* Password */}
            <TextField
              fullWidth
              label="Admin Password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />

            {/* Submit Button */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isLoading}
              sx={{ 
                py: 1.5,
                background: 'linear-gradient(135deg, #1976d2 0%, #2196f3 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)',
                }
              }}
            >
              {isLoading ? "Authenticating..." : "Access Admin Portal"}
            </Button>

           

            {/* Security notice */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              p: 1,
              backgroundColor: 'grey.50',
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'grey.200',
              mt: 2
            }}>
              <Security sx={{ fontSize: 16, color: 'success.main', mr: 1 }} />
              <Typography variant="caption" color="text.secondary">
                Secure encrypted connection
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}