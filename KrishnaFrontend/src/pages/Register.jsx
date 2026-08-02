import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { toast } from '../stores/toastStore';
import { UserPlus, AlertCircle, ShieldCheck, Mail, Phone } from 'lucide-react';
import api from '../services/api';

export const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { register, login, isLoading } = useAuthStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // OTP state
  const [step, setStep] = useState(1); // 1: Details form, 2: OTP verification
  const [otpInput, setOtpInput] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const from = location.state?.from || '/';

  const handleSendEmailOTP = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name || !email || !password) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    setIsSendingOtp(true);
    try {
      await api.post('/auth/email-otp/send', { email, purpose: 'registration' });
      toast.success(`Verification OTP code sent to ${email}.`);
      setStep(2);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to dispatch verification OTP.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOTPAndRegister = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!otpInput.trim()) {
      setErrorMessage('Please enter the 6-digit verification code.');
      return;
    }

    setIsSendingOtp(true);
    try {
      // 1. Verify Email OTP
      const verifyRes = await api.post('/auth/email-otp/verify', {
        email,
        otp: otpInput.trim(),
        purpose: 'registration'
      });

      if (!verifyRes.data?.data?.verified) {
        throw new Error('Invalid verification code.');
      }

      // 2. Register User Account
      await register(name, email, password, phone);
      toast.success('Registration successful! Logging in...');
      
      // 3. Auto-Login
      await login(email, password);
      navigate(from, { replace: true });
    } catch (error) {
      console.error('Registration/OTP failed:', error);
      const msg = error.response?.data?.message || error.message || 'Verification or Registration failed.';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsSendingOtp(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '75vh',
      padding: '24px',
      backgroundColor: 'var(--bg-color)'
    }}>
      <div style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-lg)',
        width: '100%',
        maxWidth: '440px',
        padding: '36px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <h2 style={{ fontSize: '1.875rem', fontWeight: '800', color: 'var(--primary-color)', margin: '0 0 8px' }}>
            Create Account
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', margin: 0 }}>
            Join Krishna Footwear for express checkout & OTP verified security
          </p>
        </div>

        {errorMessage && (
          <div style={{
            padding: '12px 16px',
            backgroundColor: 'var(--error-bg)',
            color: 'var(--error)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--error)',
            marginBottom: '20px',
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertCircle size={18} /> {errorMessage}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleSendEmailOTP} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '6px', textAlign: 'left' }}>
                Full Name
              </label>
              <input
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '6px', textAlign: 'left' }}>
                Email Address
              </label>
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '6px', textAlign: 'left' }}>
                <Phone size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Phone Number (Optional)
              </label>
              <input
                type="tel"
                placeholder="+1234567890"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '6px', textAlign: 'left' }}>
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '6px', textAlign: 'left' }}>
                Confirm Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSendingOtp}
              style={{ width: '100%', padding: '14px', marginTop: '8px' }}
            >
              <Mail size={18} /> {isSendingOtp ? 'Sending OTP...' : 'Send Verification OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTPAndRegister} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ textAlign: 'center', backgroundColor: 'var(--bg-muted)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
              <ShieldCheck size={32} style={{ color: 'var(--secondary-color)', marginBottom: '8px' }} />
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
                We sent a 6-digit code to <strong>{email}</strong>
              </p>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '8px', textAlign: 'center' }}>
                Enter 6-Digit OTP Code
              </label>
              <input
                type="text"
                maxLength={6}
                placeholder="123456"
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value)}
                required
                style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '8px', fontWeight: '700' }}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSendingOtp || isLoading}
              style={{ width: '100%', padding: '14px' }}
            >
              <UserPlus size={18} /> {isSendingOtp || isLoading ? 'Verifying & Registering...' : 'Verify OTP & Complete Registration'}
            </button>

            <button
              type="button"
              onClick={() => setStep(1)}
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.875rem' }}
            >
              ← Edit Account Details
            </button>
          </form>
        )}

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.875rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Already have an account? </span>
          <Link to="/login" state={{ from }} style={{ color: 'var(--primary-color)', fontWeight: '700', textDecoration: 'none' }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
