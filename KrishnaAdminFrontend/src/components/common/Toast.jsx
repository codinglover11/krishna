import React from 'react';
import { useToastStore } from '../../stores/toastStore';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export const Toast = () => {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      maxWidth: '380px',
      width: '100%'
    }}>
      {toasts.map((t) => {
        const getColors = () => {
          switch (t.type) {
            case 'success': return { bg: '#ecfdf5', border: '#10b981', color: '#065f46', icon: <CheckCircle2 size={18} color="#10b981" /> };
            case 'error': return { bg: '#fef2f2', border: '#ef4444', color: '#991b1b', icon: <AlertCircle size={18} color="#ef4444" /> };
            case 'warning': return { bg: '#fffbe finished', border: '#f59e0b', color: '#92400e', icon: <AlertTriangle size={18} color="#f59e0b" /> };
            default: return { bg: '#eff6ff', border: '#3b82f6', color: '#1e40af', icon: <Info size={18} color="#3b82f6" /> };
          }
        };
        const c = getColors();

        return (
          <div
            key={t.id}
            style={{
              backgroundColor: c.bg,
              borderLeft: `4px solid ${c.border}`,
              color: c.color,
              padding: '12px 16px',
              borderRadius: '8px',
              boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              fontSize: '0.875rem',
              fontWeight: '500',
              animation: 'fadeIn 0.2s ease-in-out'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {c.icon}
              <span>{t.message}</span>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0 }}
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default Toast;
