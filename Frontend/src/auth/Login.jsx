import { useState } from "react";
import { Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Checkbox,
  FormControlLabel,
  Paper,
  Typography,
  Box,
  Divider
} from "@mui/material";
import {
  Shield,
  Visibility,
  VisibilityOff,
  ArrowBack,
  Email,
  Lock
} from "@mui/icons-material";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch(`http://127.0.0.1:5000/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
        credentials: "include", // important for cookies!
      });

      if (res.ok) {
        toast.success("Login successful! Redirecting to dashboard...");
        setTimeout(() => {
          window.location.href = "/dashboard"; // Redirect to user dashboard
        }, 1500);
      } else {
        const data = await res.json();
        toast.error(data.message || "Login failed. Please check your credentials.");
      }
    } catch (error) {
      toast.error("Login failed. Please try again later.");
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
            <Shield sx={{ fontSize: 40 }} />
          </Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: "bold", mb: 1 }}>
            Welcome Back
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Sign in to your SafeZone101 account
          </Typography>
        </Box>

        {/* Login Card */}
        <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h5" component="h2" sx={{ textAlign: "center", mb: 1 }}>
            Sign In
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", mb: 3 }}>
            Enter your credentials to access your dashboard
          </Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            {/* Email */}
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
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
              label="Password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
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

            {/* Remember Me & Forgot Password */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    color="primary"
                  />
                }
                label="Remember me"
              />
              <Button
                component={Link}
                to="/auth/forgot-password"
                size="small"
                sx={{ textTransform: "none" }}
              >
                Forgot password?
              </Button>
            </Box>

            {/* Submit Button */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isLoading}
              sx={{ py: 1.5 }}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>

            {/* Divider */}
            <Divider sx={{ my: 3 }}>OR</Divider>

            {/* Sign Up Link */}
            <Typography variant="body2" sx={{ textAlign: "center", mb: 2 }}>
              Don't have an account?{" "}
              <Link to="/auth/register" style={{ color: "#1976d2" }}>
                Sign up
              </Link>
            </Typography>

            {/* Emergency Access */}
            <Button
              component={Link}
              to="/report"
              fullWidth
              variant="outlined"
              startIcon={<Shield />}
              sx={{ mt: 2 }}
            >
              Emergency Access (No Login Required)
            </Button>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default Login;
