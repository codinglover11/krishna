import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import { toast } from '../stores/toastStore';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ImageUploader } from '../components/common/ImageUploader';
import { Store, Mail, Phone, MapPin, Globe, Save, Upload, FileText, Shield } from 'lucide-react';

export const Settings = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    storeName: '',
    storeLogo: '',
    email: '',
    phone: '',
    address: '',
    facebookUrl: '',
    instagramUrl: '',
    twitterUrl: '',
    returnPolicy: '',
    aboutContent: ''
  });

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getStoreSettings();
      if (data) {
        setFormData({
          storeName: data.store_name || 'Krishna Footwear',
          storeLogo: data.store_logo || '',
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || '',
          facebookUrl: data.facebook_url || '',
          instagramUrl: data.instagram_url || '',
          twitterUrl: data.twitter_url || '',
          returnPolicy: data.return_policy || '',
          aboutContent: data.about_content || ''
        });
      }
    } catch (err) {
      toast.error('Failed to load store settings.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const uploaded = await adminService.uploadImage(file);
      setFormData((prev) => ({ ...prev, storeLogo: uploaded.url }));
      toast.success('Store logo uploaded to Cloudinary.');
    } catch (err) {
      toast.error('Logo upload failed.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await adminService.updateStoreSettings(formData);
      toast.success('Store settings updated successfully.');
    } catch (err) {
      toast.error('Failed to update settings.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner label="Loading Store Configuration..." />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1000px' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--ink)', margin: 0, fontFamily: '"Rozha One", serif' }}>Store Configuration & Settings</h1>
          <p style={{ color: 'var(--ink-soft)', fontSize: '0.875rem', margin: '4px 0 0' }}>Manage brand identity, contact information, return policy, and store content</p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={isSaving}
          style={{
            padding: '10px 22px',
            backgroundColor: 'var(--bottle)',
            color: 'var(--parchment)',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '700',
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: isSaving ? 'not-allowed' : 'pointer'
          }}
        >
          <Save size={18} /> {isSaving ? 'Saving Changes...' : 'Save Settings'}
        </button>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* 1. General Brand Profile */}
        <div style={{ padding: '24px', backgroundColor: 'var(--card)', borderRadius: '12px', border: '1px solid var(--line)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ margin: '0 0 8px', fontSize: '1.125rem', fontWeight: '700', color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Store size={20} color="var(--brass)" /> Brand Profile
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>Store Name *</label>
              <input
                type="text"
                required
                value={formData.storeName}
                onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            </div>

            <div>
              <ImageUploader
                images={formData.storeLogo}
                folder="users"
                label="Store Logo (Cloudinary)"
                onChange={(res) => setFormData({ ...formData, storeLogo: res ? res.url : '' })}
              />
            </div>
          </div>

          {formData.storeLogo && (
            <div style={{ width: '120px', height: '60px', borderRadius: '8px', border: '1px solid var(--line)', padding: '6px', backgroundColor: 'var(--parchment-soft)', overflow: 'hidden' }}>
              <img src={formData.storeLogo} alt="Logo Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
          )}
        </div>

        {/* 2. Contact Information */}
        <div style={{ padding: '24px', backgroundColor: 'var(--card)', borderRadius: '12px', border: '1px solid var(--line)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ margin: '0 0 8px', fontSize: '1.125rem', fontWeight: '700', color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Mail size={20} color="var(--bottle)" /> Contact Information
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>Customer Support Email *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>Contact Phone Number</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>Physical Store Address</label>
            <textarea
              rows={2}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            />
          </div>
        </div>

        {/* 3. Social Links & Policies */}
        <div style={{ padding: '24px', backgroundColor: 'var(--card)', borderRadius: '12px', border: '1px solid var(--line)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ margin: '0 0 8px', fontSize: '1.125rem', fontWeight: '700', color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={20} color="var(--chestnut)" /> Policies & Brand Content
          </h3>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>Return & Refund Policy</label>
            <textarea
              rows={3}
              value={formData.returnPolicy}
              onChange={(e) => setFormData({ ...formData, returnPolicy: e.target.value })}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>About Store Content</label>
            <textarea
              rows={3}
              value={formData.aboutContent}
              onChange={(e) => setFormData({ ...formData, aboutContent: e.target.value })}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            />
          </div>
        </div>

      </form>

    </div>
  );
};

export default Settings;
