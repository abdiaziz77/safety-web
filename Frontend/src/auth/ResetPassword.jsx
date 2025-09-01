import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { 
  Box, 
  Button, 
  TextField, 
  Paper, 
  Typography,
  IconButton,
  InputAdornment,
  LinearProgress,
  Fade
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { 
  Visibility, 
  VisibilityOff, 
  ArrowBack,
  CheckCircleOutline,
  CancelOutlined,
  LockReset
} from "@mui/icons-material";

// Styled components
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  width: "100%",
  maxWidth: 450,
  borderRadius: 16,
  background: "#ffffff",
  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
  border: "1px solid #e0e0e0",
}));

const WhiteBackgroundBox = styled(Box)({
  minHeight: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: 16,
  backgroundColor: "#ffffff",
  backgroundImage: "radial-gradient(#f0f0f0 1.5px, transparent 1.5px), radial-gradient(#f0f0f0 1.5px, transparent 1.5px)",
  backgroundSize: "60px 60px",
  backgroundPosition: "0 0, 30px 30px",
});

const StyledTextField = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  "& .MuiOutlinedInput-root": {
    borderRadius: 12,
    backgroundColor: "#f9f9f9",
    "&:hover fieldset": {
      borderColor: theme.palette.primary.main,
    },
    "&.Mui-focused fieldset": {
      borderColor: theme.palette.primary.main,
      borderWidth: 2,
    },
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  padding: "14px 0",
  borderRadius: 12,
  fontSize: "16px",
  fontWeight: "bold",
  marginTop: theme.spacing(2),
  background: "linear-gradient(135deg, #1976d2 0%, #2196f3 100%)",
  boxShadow: "0 4px 14px 0 rgba(25, 118, 210, 0.3)",
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 6px 20px 0 rgba(25, 118, 210, 0.4)",
    background: "linear-gradient(135deg, #1565c0 0%, #1976d2 100%)",
  },
}));

const BackButton = styled(IconButton)(({ theme }) => ({
  position: "absolute",
  top: 16,
  left: 16,
  backgroundColor: "rgba(255, 255, 255, 0.9)",
  boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
  "&:hover": {
    backgroundColor: "rgba(255, 255, 255, 1)",
  },
}));

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

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";
  const otp = location.state?.otp || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  useEffect(() => {
    if (!email || !otp) {
      toast.error("Invalid access. Please try the password reset process again.");
      navigate("/forgot-password");
    }
  }, [email, otp, navigate]);

  useEffect(() => {
    // Calculate password strength
    let strength = 0;
    
    if (newPassword.length > 0) {
      if (newPassword.length >= 8) strength++;
      if (/[A-Z]/.test(newPassword)) strength++;
      if (/[0-9]/.test(newPassword)) strength++;
      if (/[^A-Za-z0-9]/.test(newPassword)) strength++;
    }
    
    setPasswordStrength(strength);
  }, [newPassword]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      return toast.error("Passwords do not match");
    }
    
    if (passwordStrength < 3) {
      return toast.error("Please choose a stronger password");
    }

    setIsLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:5000/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, new_password: newPassword }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        setTimeout(() => navigate("/login"), 2000);
      } else {
        toast.error(data.message || "Failed to reset password");
      }
    } catch (error) {
      toast.error("Failed to reset password. Try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const hasUpperCase = /[A-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecialChar = /[^A-Za-z0-9]/.test(newPassword);
  const hasMinLength = newPassword.length >= 8;

  return (
    <Fade in={true} timeout={800}>
      <WhiteBackgroundBox>
        <ToastContainer 
          position="top-center" 
          autoClose={5000}
          toastStyle={{ borderRadius: 12 }}
        />
        
        <BackButton onClick={handleGoBack} aria-label="go back">
          <ArrowBack />
        </BackButton>
        
        <Box sx={{ maxWidth: 500, width: "100%" }}>
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
              <LockReset sx={{ fontSize: 40 }} />
            </Box>
            <Typography variant="h4" component="h1" sx={{ fontWeight: "bold", mb: 1 }}>
              Reset Password
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Create a new secure password for your account
            </Typography>
          </Box>

          <StyledPaper elevation={3}>
            <Typography 
              variant="body1" 
              sx={{ 
                mb: 3, 
                textAlign: "center",
                color: "text.secondary"
              }}
            >
              Please enter your new password below
            </Typography>
            
            <form onSubmit={handleSubmit}>
              <StyledTextField
                fullWidth
                type={showPassword ? "text" : "password"}
                label="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              
              {newPassword && (
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
              
              <StyledTextField
                fullWidth
                type={showConfirmPassword ? "text" : "password"}
                label="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                error={confirmPassword !== "" && newPassword !== confirmPassword}
                helperText={confirmPassword !== "" && newPassword !== confirmPassword ? "Passwords do not match" : ""}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              
              <StyledButton 
                type="submit" 
                fullWidth 
                variant="contained" 
                disabled={isLoading || passwordStrength < 3}
                size="large"
              >
                {isLoading ? "Updating Password..." : "Reset Password"}
              </StyledButton>
            </form>
            
            <Box sx={{ textAlign: "center", mt: 3 }}>
              <Button 
                component={Link}
                to="/login"
                sx={{ 
                  fontWeight: "bold",
                  color: "primary.main"
                }}
              >
                Back to Login
              </Button>
            </Box>
          </StyledPaper>
        </Box>
      </WhiteBackgroundBox>
    </Fade>
  );
};

export default ResetPassword;