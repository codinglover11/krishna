import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, MapPin, Package, Key, Save, Camera, Phone } from 'lucide-react';
import { toast } from '../stores/toastStore';
import api from '../services/api';

export const Profile = () => {
  const { user, logout, setAuth } = useAuthStore();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setAvatar(user.avatar || '');
    }
  }, [user]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleAvatarFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.put('/users/profile', { name, email, phone, avatar });
      if (res.data?.success) {
        toast.success('Profile details & avatar updated successfully!');
        if (user) {
          const updatedUser = { ...user, name, email, phone, avatar };
          const token = useAuthStore.getState().accessToken;
          setAuth(updatedUser, token);
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) {
      toast.warning('Please provide both current and new password.');
      return;
    }
    setLoading(true);
    try {
      const res = await api.patch('/auth/change-password', { oldPassword, newPassword });
      if (res.data?.success) {
        toast.success('Password changed successfully! Please log back in.');
        setOldPassword('');
        setNewPassword('');
        handleLogout();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto', padding: '48px 24px', width: '100%', textAlign: 'left' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--primary-color)', marginBottom: '32px' }}>
        My Profile & Account
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
        
        {/* User Profile Info & Edit Form */}
        <div style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          padding: '32px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          boxShadow: 'var(--shadow-low)'
        }}>
          {/* Avatar Picture Section */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ position: 'relative' }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--primary-color)',
                color: 'var(--text-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                fontWeight: '700',
                overflow: 'hidden',
                border: '3px solid var(--border-color)'
              }}>
                {avatar ? (
                  <img src={avatar} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  name?.[0]?.toUpperCase() || 'U'
                )}
              </div>
              <label htmlFor="avatar-file-input" style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                backgroundColor: 'var(--secondary-color)',
                color: 'white',
                padding: '6px',
                borderRadius: 'var(--radius-full)',
                cursor: 'pointer',
                display: 'flex',
                boxShadow: 'var(--shadow-sm)'
              }} title="Upload Profile Picture">
                <Camera size={14} />
              </label>
              <input
                id="avatar-file-input"
                type="file"
                accept="image/*"
                onChange={handleAvatarFileChange}
                style={{ display: 'none' }}
              />
            </div>

            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', margin: '0 0 4px', color: 'var(--primary-color)' }}>
                {user?.name || 'Customer Profile'}
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>
                {user?.email || 'authenticated@session.com'}
              </p>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                Role: Customer
              </span>
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: 0 }} />

          {/* Update Profile Details */}
          <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h4 style={{ fontWeight: '600', margin: 0, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-color)' }}>
              <User size={18} /> Personal Details
            </h4>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '6px' }}>Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '6px' }}>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '6px' }}>
                <Phone size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Phone Number
              </label>
              <input
                type="tel"
                placeholder="+1234567890"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <Save size={16} /> Save Profile & Avatar
            </button>
          </form>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: 0 }} />

          {/* Change Password */}
          <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h4 style={{ fontWeight: '600', margin: 0, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-color)' }}>
              <Key size={18} /> Change Password
            </h4>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '6px' }}>Current Password</label>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '6px' }}>New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <button type="submit" disabled={loading} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              Update Password
            </button>
          </form>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: 0 }} />

          <button onClick={handleLogout} className="btn btn-outline" style={{ display: 'flex', gap: '8px', justifyContent: 'center', color: 'var(--error)', borderColor: 'var(--error)' }}>
            <LogOut size={16} /> Log Out
          </button>
        </div>

        {/* Quick Navigation Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <button
            onClick={() => navigate('/orders')}
            style={{
              padding: '24px',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              width: '100%',
              textAlign: 'left'
            }}
          >
            <div style={{ padding: '12px', backgroundColor: 'var(--bg-muted)', borderRadius: 'var(--radius-md)', color: 'var(--primary-color)' }}>
              <Package size={20} />
            </div>
            <div>
              <h4 style={{ fontWeight: '600', margin: '0 0 4px', color: 'var(--primary-color)' }}>My Orders</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', margin: 0 }}>View history and check delivery statuses</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/addresses')}
            style={{
              padding: '24px',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              width: '100%',
              textAlign: 'left'
            }}
          >
            <div style={{ padding: '12px', backgroundColor: 'var(--bg-muted)', borderRadius: 'var(--radius-md)', color: 'var(--primary-color)' }}>
              <MapPin size={20} />
            </div>
            <div>
              <h4 style={{ fontWeight: '600', margin: '0 0 4px', color: 'var(--primary-color)' }}>Shipping Addresses</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', margin: 0 }}>Manage delivery locations and defaults</p>
            </div>
          </button>

        </div>

      </div>
    </div>
  );
};

export default Profile;
