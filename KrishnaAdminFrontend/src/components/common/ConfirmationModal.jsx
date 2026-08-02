import React from 'react';
import Modal from './Modal';
import { AlertTriangle } from 'lucide-react';

export const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed with this action? This step cannot be undone.',
  confirmText = 'Delete',
  cancelText = 'Cancel',
  isDanger = true,
  isLoading = false
}) => {
  const footer = (
    <>
      <button
        type="button"
        onClick={onClose}
        disabled={isLoading}
        style={{
          padding: '10px 18px',
          borderRadius: '8px',
          border: '1px solid #cbd5e1',
          backgroundColor: '#ffffff',
          color: '#334155',
          fontSize: '0.875rem',
          fontWeight: '600',
          cursor: 'pointer'
        }}
      >
        {cancelText}
      </button>
      <button
        type="button"
        onClick={onConfirm}
        disabled={isLoading}
        style={{
          padding: '10px 18px',
          borderRadius: '8px',
          border: 'none',
          backgroundColor: isDanger ? '#ef4444' : '#2563eb',
          color: '#ffffff',
          fontSize: '0.875rem',
          fontWeight: '600',
          cursor: 'pointer'
        }}
      >
        {isLoading ? 'Processing...' : confirmText}
      </button>
    </>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} footer={footer} maxWidth="480px">
      <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
        <div style={{
          padding: '12px',
          borderRadius: '50%',
          backgroundColor: isDanger ? '#fef2f2' : '#eff6ff',
          color: isDanger ? '#ef4444' : '#2563eb',
          flexShrink: 0
        }}>
          <AlertTriangle size={24} />
        </div>
        <div>
          <p style={{ margin: 0, fontSize: '0.9375rem', color: '#475569', lineHeight: '1.5' }}>
            {message}
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;
