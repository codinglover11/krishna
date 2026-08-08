import React, { useState } from 'react';
import { adminService } from '../../services/adminService';
import { toast } from '../../stores/toastStore';
import { UploadCloud, X, RefreshCw, Star, Image as ImageIcon, AlertCircle } from 'lucide-react';

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_SIZE_MB = 5;

export const ImageUploader = ({
  images = [],
  onChange,
  folder = 'products',
  multiple = false,
  label = 'Upload Image(s)',
  maxFiles = 8,
  colors = []
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  // Normalize image prop to array format for uniform handling
  const imageList = Array.isArray(images)
    ? images.map((img) => (typeof img === 'string' ? { url: img, public_id: '', is_primary: false, colorId: null } : { ...img, colorId: img.colorId || null }))
    : images
    ? [{ url: typeof images === 'string' ? images : images.url, public_id: images.public_id || '', is_primary: true, colorId: images.colorId || null }]
    : [];

  const validateFile = (file) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      throw new Error(`Invalid format "${file.type}". Allowed formats: JPEG, PNG, WEBP.`);
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      throw new Error(`File size ${(file.size / (1024 * 1024)).toFixed(2)}MB exceeds 5MB limit.`);
    }
    return true;
  };

  const handleFileSelect = async (filesToUpload) => {
    setErrorMsg('');
    const filesArray = Array.from(filesToUpload);

    if (filesArray.length === 0) return;

    if (!multiple && filesArray.length > 1) {
      setErrorMsg('Single upload mode: Only 1 image can be selected.');
      return;
    }

    if (multiple && imageList.length + filesArray.length > maxFiles) {
      setErrorMsg(`Maximum ${maxFiles} images allowed.`);
      return;
    }

    try {
      filesArray.forEach(validateFile);
    } catch (err) {
      setErrorMsg(err.message);
      toast.error(err.message);
      return;
    }

    setIsUploading(true);
    setUploadProgress(30);

    try {
      if (multiple) {
        setUploadProgress(60);
        const results = await adminService.uploadMultipleMediaImages(filesArray, folder);
        setUploadProgress(100);

        const newItems = results.map((res, idx) => ({
          url: res.url,
          public_id: res.public_id,
          is_primary: imageList.length === 0 && idx === 0
        }));

        const updated = [...imageList, ...newItems];
        onChange(updated);
        toast.success(`Uploaded ${results.length} images to Cloudinary.`);
      } else {
        setUploadProgress(70);
        const result = await adminService.uploadMediaImage(filesArray[0], folder);
        setUploadProgress(100);

        const singleResult = { url: result.url, public_id: result.public_id, is_primary: true };
        onChange(singleResult);
        toast.success('Image uploaded to Cloudinary.');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Image upload failed.';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const handleRemove = async (indexToRemove, publicId) => {
    if (publicId) {
      try {
        await adminService.deleteMediaImage(publicId);
      } catch (err) {
        console.warn('Cloudinary delete warning:', err.message);
      }
    }

    if (multiple) {
      const updated = imageList.filter((_, idx) => idx !== indexToRemove);
      if (updated.length > 0 && !updated.some((img) => img.is_primary)) {
        updated[0].is_primary = true;
      }
      onChange(updated);
    } else {
      onChange(null);
    }
    toast.success('Image removed.');
  };

  const handleSetPrimary = (selectedIndex) => {
    if (!multiple) return;
    const updated = imageList.map((img, idx) => ({
      ...img,
      is_primary: idx === selectedIndex
    }));
    onChange(updated);
  };

  const handleColorChange = (index, colorId) => {
    if (!multiple) return;
    const updated = imageList.map((img, idx) => ({
      ...img,
      colorId: idx === index ? colorId : img.colorId
    }));
    onChange(updated);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
      
      {label && (
        <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: '700', color: '#334155' }}>
          {label} {multiple ? `(Max ${maxFiles})` : ''}
        </label>
      )}

      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        style={{
          border: '2px dashed',
          borderColor: isDragOver ? '#2563eb' : '#cbd5e1',
          borderRadius: '12px',
          padding: '24px',
          backgroundColor: isDragOver ? '#eff6ff' : '#f8fafc',
          textAlign: 'center',
          cursor: isUploading ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s ease',
          position: 'relative'
        }}
      >
        <input
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          multiple={multiple}
          disabled={isUploading}
          onChange={(e) => handleFileSelect(e.target.files)}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            opacity: 0,
            cursor: 'pointer'
          }}
        />

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', pointerEvents: 'none' }}>
          <UploadCloud size={32} color={isDragOver ? '#2563eb' : '#94a3b8'} />
          <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#334155' }}>
            {isUploading ? 'Uploading to Cloudinary...' : 'Drag & drop image file or click to browse'}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
            Supported formats: JPEG, PNG, WEBP (Max size: 5MB)
          </span>
        </div>

        {/* Progress Bar */}
        {isUploading && (
          <div style={{ marginTop: '16px', width: '100%', height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ width: `${uploadProgress}%`, height: '100%', backgroundColor: '#2563eb', transition: 'width 0.3s ease' }} />
          </div>
        )}
      </div>

      {/* Validation Error Alert */}
      {errorMsg && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#ef4444', fontSize: '0.8125rem' }}>
          <AlertCircle size={16} /> {errorMsg}
        </div>
      )}

      {/* Cloudinary Image Previews Grid */}
      {imageList.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '12px', marginTop: '8px' }}>
          {imageList.map((img, index) => (
            <div
              key={index}
              style={{
                position: 'relative',
                borderRadius: '8px',
                border: '1px solid',
                borderColor: img.is_primary ? '#2563eb' : '#cbd5e1',
                overflow: 'hidden',
                backgroundColor: '#ffffff',
                height: colors && colors.length > 0 ? '140px' : '110px'
              }}
            >
              <img
                src={img.url}
                alt={`Preview ${index}`}
                style={{ width: '100%', height: colors && colors.length > 0 ? '110px' : '100%', objectFit: 'cover' }}
              />

              {colors && colors.length > 0 && multiple && (
                <select
                  value={img.colorId || ''}
                  onChange={(e) => handleColorChange(index, e.target.value ? parseInt(e.target.value) : null)}
                  style={{
                    width: '100%', height: '30px', border: 'none', borderTop: '1px solid #cbd5e1',
                    fontSize: '11px', outline: 'none', padding: '0 4px', backgroundColor: '#f8fafc'
                  }}
                >
                  <option value="">No Color</option>
                  {colors.map(c => (
                    <option key={c.id} value={c.id}>{c.color_name}</option>
                  ))}
                </select>
              )}

              {/* Primary Image Badge / Trigger */}
              {multiple && (
                <button
                  type="button"
                  onClick={() => handleSetPrimary(index)}
                  style={{
                    position: 'absolute',
                    top: '4px',
                    left: '4px',
                    padding: '3px 6px',
                    borderRadius: '4px',
                    border: 'none',
                    backgroundColor: img.is_primary ? '#2563eb' : 'rgba(15, 23, 42, 0.6)',
                    color: '#ffffff',
                    fontSize: '0.625rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2px'
                  }}
                  title={img.is_primary ? 'Primary Image' : 'Set as Primary'}
                >
                  <Star size={10} fill={img.is_primary ? '#fff' : 'none'} /> {img.is_primary ? 'Primary' : 'Set Main'}
                </button>
              )}

              {/* Remove Action */}
              <button
                type="button"
                onClick={() => handleRemove(index, img.public_id)}
                style={{
                  position: 'absolute',
                  top: '4px',
                  right: '4px',
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  border: 'none',
                  backgroundColor: 'rgba(239, 68, 68, 0.9)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
                title="Remove Image"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default ImageUploader;
