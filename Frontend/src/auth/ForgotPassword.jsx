import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { 
  Box, 
  Button, 
  TextField, 
  Paper, 
  Typography,
  IconButton,
  Fade
} from "@mui/material";
import { styled } from "@mui/material/styles";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EmailIcon from "@mui/icons-material/Email";

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
  marginBottom: theme.spacing(3),
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

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:5000/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        navigate("/verify", { state: { email } });
      } else {
        toast.error(data.message || "Failed to send OTP");
      }
    } catch (error) {
      toast.error("Failed to send OTP. Try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate(-1); // Go back to previous page
  };

  return (
    <Fade in={true} timeout={800}>
      <WhiteBackgroundBox>
        <ToastContainer 
          position="top-center" 
          autoClose={5000}
          toastStyle={{ borderRadius: 12 }}
        />
        
        <BackButton onClick={handleGoBack} aria-label="go back">
          <ArrowBackIcon />
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
              <EmailIcon sx={{ fontSize: 40 }} />
            </Box>
            <Typography variant="h4" component="h1" sx={{ fontWeight: "bold", mb: 1 }}>
              Reset Password
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Enter your email to receive a verification code
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
              Enter your registered email address and we'll send you a verification code to reset your password.
            </Typography>
            
            <form onSubmit={handleSubmit}>
              <StyledTextField
                fullWidth
                type="email"
                label="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
                InputLabelProps={{
                  shrink: true,
                }}
                InputProps={{
                  startAdornment: (
                    <EmailIcon color="action" sx={{ mr: 1 }} />
                  ),
                }}
              />
              
              <StyledButton 
                type="submit" 
                fullWidth 
                variant="contained" 
                disabled={isLoading}
                size="large"
              >
                {isLoading ? "Sending Code..." : "Send Verification Code"}
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

export default ForgotPassword;