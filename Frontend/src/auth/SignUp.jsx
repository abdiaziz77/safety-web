import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Button,
  TextField,
  InputAdornment,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Paper,
  Typography,
  Box,
  Divider,
  LinearProgress
} from "@mui/material";
import {
  Shield,
  Visibility,
  VisibilityOff,
  ArrowBack,
  Person,
  Badge,
  Email,
  Phone,
  Lock,
  CheckCircleOutline,
  CancelOutlined
} from "@mui/icons-material";

// Password Requirement Component
const PasswordRequirement = ({ met, text }) => (
  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
    {met ? (
      <CheckCircleOutline sx={{ color: "success.main", fontSize: 18, mr: 1 }} />
    ) : (
      <CancelOutlined sx={{ color: "error.main", fontSize: 18, mr: 1 }} />
    )}
    <Typography variant="body2" color={met ? "success.main" : "text.secondary"}>
      {text}
    </Typography>
  </Box>
);

// Password Strength Bar Component
const PasswordStrengthBar = ({ strength }) => {
  const strengthLabels = ["Very Weak", "Weak", "Fair", "Good", "Strong"];
  const strengthColors = ["error.main", "error.main", "warning.main", "success.main", "success.main"];
  
  return (
    <Box sx={{ width: "100%", mb: 2 }}>
      <LinearProgress 
        variant="determinate" 
        value={strength * 25} 
        sx={{ 
          height: 6, 
          borderRadius: 3, 
          mb: 1,
          backgroundColor: "grey.200",
          "& .MuiLinearProgress-bar": {
            backgroundColor: strengthColors[strength - 1],
            borderRadius: 3,
          }
        }} 
      />
      <Typography variant="body2" color="text.secondary" align="right">
        Strength: <Typography component="span" color={strengthColors[strength - 1]} fontWeight="bold">
          {strengthLabels[strength - 1]}
        </Typography>
      </Typography>
    </Box>
  );
};

const SignUp = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false
  });

  // Calculate password strength
  useEffect(() => {
    let strength = 0;
    
    if (formData.password.length > 0) {
      if (formData.password.length >= 8) strength++;
      if (/[A-Z]/.test(formData.password)) strength++;
      if (/[0-9]/.test(formData.password)) strength++;
      if (/[^A-Za-z0-9]/.test(formData.password)) strength++;
    }
    
    setPasswordStrength(strength);
  }, [formData.password]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSelectChange = (e) => {
    setFormData(prev => ({
      ...prev,
      role: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      setIsLoading(false);
      return;
    }
    
    if (passwordStrength < 3) {
      toast.error("Please choose a stronger password");
      setIsLoading(false);
      return;
    }
    
    if (!formData.agreeTerms) {
      toast.error("You must agree to the terms and conditions");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(`http://127.0.0.1:5000/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          role: formData.role,
          password: formData.password,
        }),
        credentials: "include", // for cookies if needed
      });

     if (res.ok) {
  toast.success("Registration successful! Please login.");

  
 

  // Clear form
  setFormData({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });

  // Redirect to login
  setTimeout(() => {
    window.location.href = "/login";
  }, 1500);
}
else {
        const errorData = await res.json();
        toast.error(errorData.message || "Registration failed");
      }
    } catch (error) {
      toast.error("Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Password requirements
  const hasUpperCase = /[A-Z]/.test(formData.password);
  const hasNumber = /[0-9]/.test(formData.password);
  const hasSpecialChar = /[^A-Za-z0-9]/.test(formData.password);
  const hasMinLength = formData.password.length >= 8;

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
            Join SafeZone101
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Create your emergency response account
          </Typography>
        </Box>

        {/* Registration Card */}
        <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h5" component="h2" sx={{ textAlign: "center", mb: 1 }}>
            Create Account
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", mb: 3 }}>
            Join the SafeZone101 emergency response network
          </Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            {/* Name Fields */}
            <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
              <TextField
                fullWidth
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person color="action" />
                    </InputAdornment>
                  )
                }}
              />
              <TextField
                fullWidth
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Badge color="action" />
                    </InputAdornment>
                  )
                }}
              />
            </Box>

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

            {/* Phone */}
            <TextField
              fullWidth
              label="Phone Number"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              required
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Phone color="action" />
                  </InputAdornment>
                )
              }}
            />

            {/* Role Selection */}
            <FormControl fullWidth required sx={{ mb: 2 }}>
              <InputLabel>Account Type</InputLabel>
              <Select
                name="role"
                value={formData.role}
                onChange={handleSelectChange}
                label="Account Type"
              >
                <MenuItem value="citizen">Citizen</MenuItem>
                <MenuItem value="responder">Emergency Responder</MenuItem>
              </Select>
            </FormControl>

            {/* Password */}
            <TextField
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              required
              sx={{ mb: 1 }}
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

            {/* Password Strength Indicator */}
            {formData.password && (
              <>
                <PasswordStrengthBar strength={passwordStrength} />
                
                <Box sx={{ mb: 2 }}>
                  <PasswordRequirement met={hasMinLength} text="At least 8 characters" />
                  <PasswordRequirement met={hasUpperCase} text="At least one uppercase letter" />
                  <PasswordRequirement met={hasNumber} text="At least one number" />
                  <PasswordRequirement met={hasSpecialChar} text="At least one special character" />
                </Box>
              </>
            )}

            {/* Confirm Password */}
            <TextField
              fullWidth
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              sx={{ mb: 2 }}
              error={formData.confirmPassword !== "" && formData.password !== formData.confirmPassword}
              helperText={formData.confirmPassword !== "" && formData.password !== formData.confirmPassword ? "Passwords do not match" : ""}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                )
              }}
            />

            {/* Terms Agreement */}
            <FormControlLabel
              control={
                <Checkbox
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                  color="primary"
                />
              }
              label={
                <Typography variant="body2">
                  I agree to the{" "}
                  <Link to="/terms" style={{ color: "#1976d2" }}>
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link to="/privacy" style={{ color: "#1976d2" }}>
                    Privacy Policy
                  </Link>
                </Typography>
              }
              sx={{ mb: 3 }}
            />

            {/* Submit Button */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isLoading || passwordStrength < 3}
              sx={{ py: 1.5 }}
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>

            {/* Divider */}
            <Divider sx={{ my: 3 }}>OR</Divider>

            {/* Login Link */}
            <Typography variant="body2" sx={{ textAlign: "center" }}>
              Already have an account?{" "}
              <Link to="/login" style={{ color: "#1976d2" }}>
                Sign in
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default SignUp;