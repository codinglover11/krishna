import React from 'react';

export const FormInput = ({ label, error, required, helpText, style, ...props }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left', ...style }}>
    {label && (
      <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#334155' }}>
        {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
      </label>
    )}
    <input
      {...props}
      style={{
        padding: '10px 14px',
        borderRadius: '8px',
        border: error ? '1px solid #ef4444' : '1px solid #cbd5e1',
        backgroundColor: '#ffffff',
        color: '#0f172a',
        fontSize: '0.9375rem',
        outline: 'none',
        transition: 'border-color 0.2s ease',
        ...props.style
      }}
    />
    {helpText && !error && <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{helpText}</span>}
    {error && <span style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: '500' }}>{error}</span>}
  </div>
);

export const FormSelect = ({ label, options = [], error, required, helpText, style, ...props }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left', ...style }}>
    {label && (
      <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#334155' }}>
        {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
      </label>
    )}
    <select
      {...props}
      style={{
        padding: '10px 14px',
        borderRadius: '8px',
        border: error ? '1px solid #ef4444' : '1px solid #cbd5e1',
        backgroundColor: '#ffffff',
        color: '#0f172a',
        fontSize: '0.9375rem',
        outline: 'none',
        cursor: 'pointer',
        ...props.style
      }}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
    {helpText && !error && <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{helpText}</span>}
    {error && <span style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: '500' }}>{error}</span>}
  </div>
);

export const FormTextarea = ({ label, error, required, rows = 3, helpText, style, ...props }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left', ...style }}>
    {label && (
      <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#334155' }}>
        {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
      </label>
    )}
    <textarea
      rows={rows}
      {...props}
      style={{
        padding: '10px 14px',
        borderRadius: '8px',
        border: error ? '1px solid #ef4444' : '1px solid #cbd5e1',
        backgroundColor: '#ffffff',
        color: '#0f172a',
        fontSize: '0.9375rem',
        outline: 'none',
        fontFamily: 'inherit',
        resize: 'vertical',
        ...props.style
      }}
    />
    {helpText && !error && <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{helpText}</span>}
    {error && <span style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: '500' }}>{error}</span>}
  </div>
);

export const FormCheckbox = ({ label, checked, onChange, id }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
    <input
      type="checkbox"
      id={id}
      checked={checked}
      onChange={onChange}
      style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#2563eb' }}
    />
    {label && (
      <label htmlFor={id} style={{ margin: 0, fontSize: '0.875rem', color: '#334155', cursor: 'pointer' }}>
        {label}
      </label>
    )}
  </div>
);

export default { FormInput, FormSelect, FormTextarea, FormCheckbox };
