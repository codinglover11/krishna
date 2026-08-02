import React from 'react';
import { Search, X } from 'lucide-react';

export const GlobalSearch = ({
  value = '',
  onChange,
  onClear,
  placeholder = 'Search dashboard resources...',
  width = '320px'
}) => {
  return (
    <div style={{ position: 'relative', width, display: 'flex', alignItems: 'center' }}>
      <Search size={18} style={{ position: 'absolute', left: '12px', color: '#94a3b8', pointerEvents: 'none' }} />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '9px 36px 9px 38px',
          borderRadius: '8px',
          border: '1px solid #cbd5e1',
          backgroundColor: '#f8fafc',
          color: '#1e293b',
          fontSize: '0.875rem',
          outline: 'none',
          transition: 'all 0.2s ease'
        }}
      />
      {value && (
        <button
          onClick={onClear}
          style={{
            position: 'absolute',
            right: '10px',
            background: 'none',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            padding: '2px'
          }}
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export default GlobalSearch;
