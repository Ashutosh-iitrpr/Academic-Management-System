'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Stepper,
  Step,
  StepLabel,
  InputAdornment,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/lib/auth/AuthContext';
import { toast } from 'sonner';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';

// Demo Credentials for Testing:
// Admin: admin@iitrpr.ac.in | OTP will be sent to email
// Instructor: instructor@iitrpr.ac.in | OTP will be sent to email
// Student: student@iitrpr.ac.in | OTP will be sent to email

const emailSchema = z.object({
  email: z.string().email('Invalid email address'),
});

const otpSchema = z.object({
  otp: z.string().length(6, 'OTP must be 6 digits').regex(/^\d+$/, 'OTP must contain only numbers'),
});

type EmailFormData = z.infer<typeof emailSchema>;
type OTPFormData = z.infer<typeof otpSchema>;

export default function LoginPage() {
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { login } = useAuth();

  const emailForm = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: '',
    },
  });

  const otpForm = useForm<OTPFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: '',
    },
  });

  const handleSendOTP = async (data: EmailFormData) => {
    try {
      setLoading(true);
      setError('');

      // Call backend API to send OTP
      const response = await fetch('http://localhost:3001/api/auth/request-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: data.email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send OTP');
      }

      setEmail(data.email);
      setStep(1);
      toast.success('OTP sent to your email address. Please check your inbox.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      toast.error(err instanceof Error ? err.message : 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (data: OTPFormData) => {
    try {
      setLoading(true);
      setError('');

      await login(email, data.otp);
      toast.success('Login successful');

      // Get user from localStorage after login
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        
        // Redirect based on user role
        let dashboardPath = '/student/dashboard';
        if (userData.role === 'ADMIN') {
          dashboardPath = '/admin/dashboard';
        } else if (userData.role === 'INSTRUCTOR') {
          dashboardPath = '/instructor/dashboard';
        }

        setTimeout(() => {
          router.push(dashboardPath);
        }, 500);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid OTP');
      toast.error('Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f8f7f5 0%, #faf9f7 100%)',
        position: 'relative',
        overflow: 'hidden',
        backgroundImage: 
          `radial-gradient(circle at 10% 20%, rgba(139, 58, 58, 0.04) 0%, transparent 50%),
           radial-gradient(circle at 90% 80%, rgba(212, 165, 116, 0.05) 0%, transparent 50%)`,
      }}
    >
      {/* IIT Ropar Background Pattern */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.06,
          backgroundImage: 
            `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(139, 58, 58, 0.1) 35px, rgba(139, 58, 58, 0.1) 70px)`,
          pointerEvents: 'none',
        }}
      />

      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
        <Paper
          elevation={24}
          sx={{
            padding: 4,
            borderRadius: 2,
            backgroundColor: '#ffffff',
            backdropFilter: 'blur(10px)',
          }}
        >
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 700, color: '#8B3A3A', mb: 1 }}>
              Academic Portal
            </Typography>
            <Typography variant="body2" sx={{ color: '#666' }}>
              IIT Ropar - Academic Management System
            </Typography>
          </Box>

          {/* Stepper */}
          <Stepper activeStep={step} sx={{ mb: 4 }}>
            <Step>
              <StepLabel>Email</StepLabel>
            </Step>
            <Step>
              <StepLabel>Verify OTP</StepLabel>
            </Step>
          </Stepper>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Step 1: Email Input */}
          {step === 0 && (
            <Box component="form" onSubmit={emailForm.handleSubmit(handleSendOTP)}>
              <Controller
                name="email"
                control={emailForm.control}
                render={({ field, fieldState: { error: fieldError } }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Email Address"
                    type="email"
                    placeholder="you@iitrpr.ac.in"
                    error={!!fieldError}
                    helperText={fieldError?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon sx={{ color: '#8B3A3A' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ mb: 3 }}
                  />
                )}
              />

              <Button
                fullWidth
                variant="contained"
                type="submit"
                disabled={loading}
                sx={{
                  backgroundColor: '#8B3A3A',
                  color: '#fff',
                  padding: '12px',
                  fontSize: '1rem',
                  fontWeight: 600,
                  '&:hover': {
                    backgroundColor: '#6B2A2A',
                  },
                  '&:disabled': {
                    backgroundColor: '#ccc',
                  },
                }}
              >
                {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Send OTP'}
              </Button>
            </Box>
          )}

          {/* Step 2: OTP Verification */}
          {step === 1 && (
            <Box component="form" onSubmit={otpForm.handleSubmit(handleVerifyOTP)}>
              <Typography variant="body2" sx={{ color: '#666', mb: 3 }}>
                Enter the 6-digit OTP sent to <strong>{email}</strong>
              </Typography>

              <Controller
                name="otp"
                control={otpForm.control}
                render={({ field, fieldState: { error: fieldError } }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="OTP Code"
                    placeholder="000000"
                    type="text"
                    inputMode="numeric"
                
                    error={!!fieldError}
                    helperText={fieldError?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon sx={{ color: '#8B3A3A' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      mb: 3,
                      '& input': {
                        letterSpacing: '0.5em',
                        fontSize: '1.5rem',
                        textAlign: 'center',
                      },
                    }}
                  />
                )}
              />

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => {
                    setStep(0);
                    emailForm.reset();
                  }}
                  disabled={loading}
                  sx={{
                    borderColor: '#8B3A3A',
                    color: '#8B3A3A',
                    padding: '12px',
                    fontSize: '1rem',
                    fontWeight: 600,
                  }}
                >
                  Back
                </Button>

                <Button
                  fullWidth
                  variant="contained"
                  type="submit"
                  disabled={loading}
                  sx={{
                    backgroundColor: '#8B3A3A',
                    color: '#fff',
                    padding: '12px',
                    fontSize: '1rem',
                    fontWeight: 600,
                    '&:hover': {
                      backgroundColor: '#6B2A2A',
                    },
                    '&:disabled': {
                      backgroundColor: '#ccc',
                    },
                  }}
                >
                  {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Verify & Login'}
                </Button>
              </Box>
            </Box>
          )}
        </Paper>

        {/* Footer */}
        <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 3, color: '#999' }}>
          © 2024 IIT Ropar. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
}
