import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, ArrowLeft, ShieldCheck, Key } from 'lucide-react';
import { toast } from '../stores/toastStore';
import api from '../services/api';

export const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [step, setStep] = useState(1); // 1: Send OTP to Email, 2: Enter OTP & New Password
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.warning('Please enter your email address.');
      return;
    }

    setLoading(true);
    try {
      // 1. Check if user is available in Db
      const checkRes = await api.post('/auth/forgot-password', { email });
      if (!checkRes.data?.data?.resetToken) {
        toast.error('User not found pls sign in');
        setLoading(false);
        setTimeout(() => navigate('/login'), 2000);
        return;
      }

      // 2. User exists, send OTP
      await api.post('/auth/email-otp/send', { email, purpose: 'forgot_password' });
      toast.success(`6-Digit OTP code sent to ${email}`);
      setStep(2);
    } catch (error) {
      console.error('Email OTP dispatch failed:', error);
      toast.error(error.response?.data?.message || 'Failed to dispatch Email OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!otp || !newPassword) {
      toast.warning('Please enter both OTP code and new password.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      toast.error('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);
    try {
      // 1. Verify Email OTP
      const verifyRes = await api.post('/auth/email-otp/verify', {
        email,
        otp: otp.trim(),
        purpose: 'forgot_password'
      });

      if (!verifyRes.data?.data?.verified) {
        throw new Error('Invalid or expired OTP code.');
      }

      // 2. Reset Password via existing endpoint or password update
      await api.post('/auth/forgot-password', { email });
      const resetTokenRes = await api.post('/auth/forgot-password', { email });
      const token = resetTokenRes.data?.data?.resetToken;

      if (token) {
        await api.post('/auth/reset-password', { token, newPassword });
      }

      toast.success('Your password has been reset successfully!');
      navigate('/login');
    } catch (error) {
      console.error('Password reset failed:', error);
      toast.error(error.response?.data?.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '70vh',
      padding: '24px',
      backgroundColor: 'var(--bg-color)'
    }}>
      <div style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-high)',
        width: '100%',
        maxWidth: '420px',
        padding: '32px',
        textAlign: 'left'
      }}>
        <button
          onClick={() => navigate('/login')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            marginBottom: '20px',
            fontSize: '0.875rem',
            padding: 0
          }}
        >
          <ArrowLeft size={16} /> Back to Login
        </button>

        <h2 style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--primary-color)', margin: '0 0 8px' }}>
          Reset Password via Email OTP
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '24px' }}>
          {step === 1 ? 'Enter your registered email below to receive a 6-digit OTP verification code.' : `Enter the 6-digit OTP code sent to ${email} and your new password.`}
        </p>

        {step === 1 ? (
          <form onSubmit={handleSendOTP} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '8px' }}>
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

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', padding: '14px', display: 'flex', gap: '8px', justifyContent: 'center' }}
            >
              <Mail size={18} /> {loading ? 'Sending OTP...' : 'Send Email OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={{ textAlign: 'center', backgroundColor: 'var(--bg-muted)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
              <ShieldCheck size={32} style={{ color: 'var(--secondary-color)', marginBottom: '4px' }} />
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0 }}>
                Code dispatched to <strong>{email}</strong>
              </p>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '6px' }}>
                6-Digit Email OTP Code
              </label>
              <input
                type="text"
                maxLength={6}
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '6px', fontWeight: '700' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '6px' }}>
                New Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '6px' }}>
                Confirm New Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', padding: '14px', display: 'flex', gap: '8px', justifyContent: 'center' }}
            >
              <Key size={18} /> {loading ? 'Updating Password...' : 'Verify OTP & Reset Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
