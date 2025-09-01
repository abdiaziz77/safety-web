import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { 
  Box, 
  Button, 
  Paper, 
  Typography,
  Fade,
  IconButton
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { ArrowBack, VerifiedUser } from "@mui/icons-material";

// Styled components for the OTP boxes
const OtpBox = styled(Paper)(({ theme, status }) => ({
  width: 50,
  height: 60,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "0 8px",
  transition: "all 0.3s ease",
  backgroundColor: "transparent",
  border: `2px solid ${
    status === "success" 
      ? theme.palette.success.main 
      : status === "error" 
        ? theme.palette.error.main 
        : theme.palette.grey[300]
  }`,
  color: status === "success" 
    ? theme.palette.success.main 
    : status === "error" 
      ? theme.palette.error.main 
      : theme.palette.text.primary,
  "&:first-of-type": {
    marginLeft: 0
  },
  "&:last-of-type": {
    marginRight: 0
  },
  "&:focus-within": {
    borderColor: theme.palette.primary.main,
    boxShadow: `0 0 0 2px ${theme.palette.primary.light}`
  }
}));

const OtpContainer = styled(Box)({
  display: "flex",
  justifyContent: "center",
  marginBottom: "24px"
});

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
  "&:disabled": {
    background: theme.palette.grey[400],
  }
}));

const VerifyOTP = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";
  const OTP_LENGTH = 6;

  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [isLoading, setIsLoading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(""); // '', 'success', 'error'
  const inputRefs = useRef([]);

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  // Reset OTP values when error status is cleared
  useEffect(() => {
    if (verificationStatus === "") {
      setOtp(Array(OTP_LENGTH).fill(""));
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    }
  }, [verificationStatus]);

  const handleChange = (index, value) => {
    if (!/^[0-9]$/.test(value) && value !== "") return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Auto-focus to next input
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        // Move focus to previous input on backspace if current is empty
        inputRefs.current[index - 1].focus();
      } else {
        // Clear current input on backspace
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");
    const pastedNumbers = pastedData.replace(/[^0-9]/g, "").slice(0, OTP_LENGTH);
    
    if (pastedNumbers.length > 0) {
      const newOtp = [...otp];
      for (let i = 0; i < pastedNumbers.length; i++) {
        if (i < OTP_LENGTH) {
          newOtp[i] = pastedNumbers[i];
        }
      }
      setOtp(newOtp);
      
      // Focus on the next empty input or the last one
      const nextFocusIndex = Math.min(pastedNumbers.length, OTP_LENGTH - 1);
      inputRefs.current[nextFocusIndex].focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return toast.error("Email is missing. Go back and try again.");
    
    const otpValue = otp.join("");
    if (otpValue.length !== OTP_LENGTH) {
      return toast.error("Please enter the complete OTP code.");
    }

    setIsLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:5000/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otpValue }),
      });

      const data = await res.json();
      if (res.ok) {
        setVerificationStatus("success");
        toast.success(data.message);
        
        // Wait for 3 seconds then navigate to reset page
        setTimeout(() => {
          navigate("/reset", { state: { email, otp: otpValue } });
        }, 3000);
      } else {
        setVerificationStatus("error");
        toast.error(data.message || "Invalid OTP");
        
        // Reset error status and clear inputs after 3 seconds
        setTimeout(() => {
          setVerificationStatus("");
        }, 3000);
      }
    } catch (error) {
      setVerificationStatus("error");
      toast.error("Failed to verify OTP. Try again.");
      
      // Reset error status and clear inputs after 3 seconds
      setTimeout(() => {
        setVerificationStatus("");
      }, 3000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Fade in={true} timeout={800}>
      <WhiteBackgroundBox>
        <ToastContainer position="top-center" autoClose={5000} />
        
        <BackButton onClick={() => navigate(-1)} aria-label="go back">
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
              <VerifiedUser sx={{ fontSize: 40 }} />
            </Box>
            <Typography variant="h4" component="h1" sx={{ fontWeight: "bold", mb: 1 }}>
              Verify OTP
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Enter the 6-digit code sent to your email
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
              Code sent to: <strong>{email}</strong>
            </Typography>
            
            <form onSubmit={handleSubmit}>
              <OtpContainer onPaste={handlePaste}>
                {otp.map((digit, index) => (
                  <OtpBox 
                    key={index} 
                    elevation={0}
                    status={verificationStatus}
                  >
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={digit}
                      onChange={(e) => handleChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      ref={(ref) => (inputRefs.current[index] = ref)}
                      style={{
                        width: "100%",
                        height: "100%",
                        border: "none",
                        background: "transparent",
                        textAlign: "center",
                        fontSize: "24px",
                        fontWeight: "bold",
                        outline: "none",
                        color: "inherit",
                        caretColor: verificationStatus === "error" ? "#f44336" : "#1976d2"
                      }}
                      disabled={isLoading || verificationStatus === "success"}
                    />
                  </OtpBox>
                ))}
              </OtpContainer>
              
              <StyledButton 
                type="submit" 
                fullWidth 
                variant="contained" 
                size="large"
                disabled={isLoading || verificationStatus === "success"}
              >
                {isLoading ? "Verifying..." : 
                 verificationStatus === "success" ? "Verified! Redirecting..." : 
                 verificationStatus === "error" ? "Invalid Code. Try Again" : 
                 "Verify OTP"}
              </StyledButton>
            </form>
            
            <Typography variant="body2" sx={{ 
              mt: 3, 
              textAlign: "center",
              color: "text.secondary"
            }}>
              Didn't receive the code?{" "}
              <Button 
                color="primary" 
                size="small" 
                sx={{ fontWeight: "bold" }}
                onClick={() => toast.info("Resend functionality would go here")}
              >
                Resend
              </Button>
            </Typography>

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

export default VerifyOTP;