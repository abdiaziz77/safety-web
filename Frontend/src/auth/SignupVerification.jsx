import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  IconButton
} from "@mui/material";
import {
  ArrowBack,
  Shield
} from "@mui/icons-material";
import { Link } from 'react-router-dom';

const SignupVerification = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [verificationStatus, setVerificationStatus] = useState(''); // 'success', 'error', or ''
  const inputRefs = useRef([]);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state && location.state.email) {
      setEmail(location.state.email);
    } else {
      // If no email was passed, redirect back to signup
      navigate('/signup');
    }
  }, [location, navigate]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // Only allow numbers
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setVerificationStatus(''); // Reset status when user makes changes
    
    // Auto-focus to next input
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace to move to previous input
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return; // Only allow numbers
    
    const newOtp = [...otp];
    for (let i = 0; i < pastedData.length; i++) {
      if (i < 6) newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);
    
    // Focus on the last input that was filled
    const lastIndex = Math.min(pastedData.length - 1, 5);
    inputRefs.current[lastIndex].focus();
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setMessage('Please enter a 6-digit code');
      toast.error('Please enter a 6-digit code');
      setIsLoading(false);
      return;
    }
    
    try {
      const response = await fetch('http://127.0.0.1:5000/api/auth/verify-signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          otp: otpString
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessage(data.message);
        setVerificationStatus('success');
        toast.success("Email verified successfully! You can now login.");
        
        // Redirect to login after successful verification
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setMessage(data.message || 'Verification failed');
        setVerificationStatus('error');
        toast.error(data.message || 'Verification failed');
      }
    } catch (error) {
      setMessage('Verification failed. Please try again.');
      setVerificationStatus('error');
      toast.error('Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsLoading(true);
    setMessage('');
    setVerificationStatus('');
    setOtp(['', '', '', '', '', '']);
    
    try {
      const response = await fetch('http://127.0.0.1:5000/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessage(data.message);
        toast.success("Verification code resent to your email");
      } else {
        setMessage(data.message || 'Failed to resend verification code');
        toast.error(data.message || 'Failed to resend verification code');
      }
    } catch (error) {
      setMessage('Failed to resend verification code');
      toast.error('Failed to resend verification code');
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
          to="/signup"
          startIcon={<ArrowBack />}
          sx={{ mb: 2, color: "text.secondary" }}
        >
          Back to Sign Up
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
            Verify Your Email
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Please check your email for the verification code
          </Typography>
        </Box>

        {/* Verification Card */}
        <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h5" component="h2" sx={{ textAlign: "center", mb: 1 }}>
            Enter Verification Code
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", mb: 3 }}>
            We've sent a 6-digit verification code to {email}
          </Typography>

          <Box component="form" onSubmit={handleVerify} sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 3 }}>
              {otp.map((digit, index) => (
                <TextField
                  key={index}
                  inputRef={(ref) => (inputRefs.current[index] = ref)}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  inputProps={{
                    maxLength: 1,
                    style: { textAlign: 'center' }
                  }}
                  sx={{
                    width: 50,
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: verificationStatus === 'success' 
                        ? 'rgba(76, 175, 80, 0.1)' 
                        : verificationStatus === 'error'
                        ? 'rgba(244, 67, 54, 0.1)'
                        : 'transparent',
                      '& fieldset': {
                        borderColor: verificationStatus === 'success' 
                          ? '#4caf50' 
                          : verificationStatus === 'error'
                          ? '#f44336'
                          : ''
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: verificationStatus === 'success' 
                          ? '#4caf50' 
                          : verificationStatus === 'error'
                          ? '#f44336'
                          : '#1976d2'
                      }
                    }
                  }}
                />
              ))}
            </Box>
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isLoading || otp.join('').length !== 6}
              sx={{ py: 1.5, mb: 2 }}
            >
              {isLoading ? 'Verifying...' : 'Verify Email'}
            </Button>

            <Typography variant="body2" sx={{ textAlign: "center", mb: 2 }}>
              Didn't receive the code?
            </Typography>
            
            <Button
              fullWidth
              variant="outlined"
              onClick={handleResend}
              disabled={isLoading}
            >
              Resend Verification Code
            </Button>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default SignupVerification;