import React from "react";
import { X, AlertCircle, CheckCircle, Info } from "lucide-react";

/**
 * Reusable Button Component
 */
export const Button = ({
  children,
  onClick,
  type = "button",
  variant = "primary",
  size = "md",
  disabled = false,
  className = "",
  icon: Icon,
}) => {
  const classes = `btn btn-${variant} ${size === "sm" ? "btn-sm" : ""} ${className}`;
  return (
    <button type={type} onClick={onClick} className={classes} disabled={disabled}>
      {Icon && <Icon size={size === "sm" ? 14 : 18} />}
      {children}
    </button>
  );
};

/**
 * Reusable Badge Component
 */
export const Badge = ({ children, variant = "info" }) => {
  return <span className={`badge badge-${variant}`}>{children}</span>;
};

/**
 * Reusable Modal Container Component
 */
export const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="card-title" style={{ marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ fontSize: "1.25rem", fontWeight: "700" }}>{title}</h3>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", display: "flex", alignItems: "center" }}
          >
            <X size={20} />
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};

/**
 * Custom Toggle Switch Component
 */
export const Switch = ({ checked, onChange, label }) => {
  return (
    <label className="switch-label">
      <input
        type="checkbox"
        className="switch-input"
        checked={checked}
        onChange={onChange}
      />
      <span className="switch-slider"></span>
      {label && <span style={{ fontSize: "0.95rem", fontWeight: 500 }}>{label}</span>}
    </label>
  );
};

/**
 * Alert Banner Component
 */
export const Alert = ({ type = "success", message, onClose }) => {
  const Icon = type === "success" ? CheckCircle : type === "error" ? AlertCircle : Info;
  return (
    <div className={`alert-banner alert-banner-${type}`}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <Icon size={18} />
        <span>{message}</span>
      </div>
      {onClose && (
        <button onClick={onClose} style={{ background: "none", border: "none", color: "inherit", cursor: "pointer" }}>
          <X size={16} />
        </button>
      )}
    </div>
  );
};
