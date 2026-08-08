import React, { useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { toast } from '../stores/toastStore';
import { Mail, Shield, KeyRound, ArrowLeft, RefreshCw } from 'lucide-react';

export const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { sendLoginOTP, login, isLoading, isAuthenticated } = useAuthStore();

  const [step, setStep] = useState(1); // Step 1: Input Email, Step 2: Input OTP
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');

  const from = location.state?.from || '/dashboard';

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    if (!email || !email.trim()) {
      toast.warning('Please enter an admin email address.');
      return;
    }

    try {
      await sendLoginOTP(email.trim());
      setStep(2);
    } catch (err) {
      // Error is caught and displayed by authStore toast
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp || otp.trim().length !== 6) {
      toast.warning('Please enter a valid 6-digit OTP code.');
      return;
    }

    try {
      await login(email.trim(), otp.trim());
      navigate(from, { replace: true });
    } catch (err) {
      // Error is handled by authStore
    }
  };

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'hsl(215, 80%, 15%)',
      padding: '24px'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        width: '100%',
        maxWidth: '420px',
        padding: '40px 32px',
        textAlign: 'left'
      }}>
        {/* Header Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '12px',
            backgroundColor: 'hsl(30, 90%, 55%)',
            color: '#ffffff',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px'
          }}>
            <Shield size={28} />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'hsl(215, 80%, 20%)', margin: '0 0 6px' }}>
            Krishna Admin Portal
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.875rem', margin: 0 }}>
            {step === 1
              ? 'Enter email address to receive login OTP'
              : `Enter the 6-digit OTP code sent for ${email}`}
          </p>
        </div>

        {step === 1 ? (
          /* Step 1: Input Email */
          <form onSubmit={handleRequestOTP} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#334155', marginBottom: '8px' }}>
                Admin Email Address
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Mail size={18} style={{ position: 'absolute', left: '12px', color: '#94a3b8' }} />
                <input
                  type="email"
                  required
                  placeholder="admin@krishnafootwear.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 14px 12px 40px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9375rem',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '14px',
                backgroundColor: 'hsl(215, 80%, 20%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '700',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.7 : 1,
                marginTop: '8px'
              }}
            >
              {isLoading ? 'Sending Verification OTP...' : 'Send Verification OTP'}
            </button>
          </form>
        ) : (
          /* Step 2: Input 6-Digit OTP */
          <form onSubmit={handleVerifyOTP} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#334155', marginBottom: '8px' }}>
                Enter 6-Digit Verification Code
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <KeyRound size={18} style={{ position: 'absolute', left: '12px', color: '#94a3b8' }} />
                <input
                  type="text"
                  maxLength={6}
                  required
                  autoFocus
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  style={{
                    width: '100%',
                    padding: '12px 14px 12px 40px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '1.25rem',
                    letterSpacing: '6px',
                    fontWeight: '700',
                    textAlign: 'center',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '14px',
                backgroundColor: 'hsl(30, 90%, 50%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '700',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.7 : 1
              }}
            >
              {isLoading ? 'Verifying OTP & Logging In...' : 'Verify & Sign In to Portal'}
            </button>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
              <button
                type="button"
                onClick={() => { setStep(1); setOtp(''); }}
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <ArrowLeft size={16} /> Change Email
              </button>
              <button
                type="button"
                onClick={handleRequestOTP}
                disabled={isLoading}
                style={{ background: 'none', border: 'none', color: 'hsl(215, 80%, 35%)', cursor: 'pointer', fontSize: '0.875rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <RefreshCw size={14} /> Resend OTP
              </button>
            </div>
          </form>
        )}

        <div style={{ textAlign: 'center', marginTop: '32px', fontSize: '0.75rem', color: '#94a3b8' }}>
          Passwordless Role-Based Access Protection • Krishna Footwear
        </div>
      </div>
    </div>
  );
};

export default Login;
