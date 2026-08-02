import React from "react";

/**
 * Standard Form Input field
 */
export const Input = ({
  label,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  required = false,
  ...props
}) => {
  return (
    <div className="form-group">
      {label && (
        <label className="form-label" htmlFor={name}>
          {label} {required && <span style={{ color: "var(--accent-red)" }}>*</span>}
        </label>
      )}
      <input
        type={type}
        id={name}
        name={name}
        className="form-control"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        {...props}
      />
      {error && <span style={{ fontSize: "0.8rem", color: "var(--accent-red)", marginTop: "4px", display: "block" }}>{error}</span>}
    </div>
  );
};

/**
 * Standard Form Textarea field
 */
export const TextArea = ({
  label,
  name,
  placeholder,
  value,
  onChange,
  error,
  required = false,
  ...props
}) => {
  return (
    <div className="form-group">
      {label && (
        <label className="form-label" htmlFor={name}>
          {label} {required && <span style={{ color: "var(--accent-red)" }}>*</span>}
        </label>
      )}
      <textarea
        id={name}
        name={name}
        className="form-control"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        {...props}
      />
      {error && <span style={{ fontSize: "0.8rem", color: "var(--accent-red)", marginTop: "4px", display: "block" }}>{error}</span>}
    </div>
  );
};

/**
 * Standard Selection dropdown field
 */
export const Select = ({
  label,
  name,
  value,
  onChange,
  options = [],
  error,
  required = false,
}) => {
  return (
    <div className="form-group">
      {label && (
        <label className="form-label" htmlFor={name}>
          {label} {required && <span style={{ color: "var(--accent-red)" }}>*</span>}
        </label>
      )}
      <select
        id={name}
        name={name}
        className="form-control"
        value={value}
        onChange={onChange}
        required={required}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span style={{ fontSize: "0.8rem", color: "var(--accent-red)", marginTop: "4px", display: "block" }}>{error}</span>}
    </div>
  );
};

/**
 * Custom File Upload dropzone simulator
 */
export const ImageUpload = ({ label, value, onChange, error }) => {
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      // Simulate file upload by creating object url
      const fakeUrl = URL.createObjectURL(file);
      onChange(fakeUrl);
    }
  };

  const handleManualChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const fakeUrl = URL.createObjectURL(file);
      onChange(fakeUrl);
    }
  };

  return (
    <div className="form-group">
      {label && <label className="form-label">{label}</label>}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        style={{
          border: "2px dashed var(--glass-border)",
          borderRadius: "var(--border-radius-sm)",
          padding: "20px",
          textAlign: "center",
          background: "var(--bg-primary)",
          cursor: "pointer",
          position: "relative",
          minHeight: "130px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
        }}
      >
        {value ? (
          <div style={{ position: "relative", width: "100%", height: "100%", maxHeight: "150px" }}>
            <img
              src={value}
              alt="Preview"
              style={{ maxHeight: "130px", objectFit: "contain", borderRadius: "6px" }}
            />
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onChange(""); }}
              style={{
                position: "absolute",
                top: "0",
                right: "0",
                background: "var(--accent-red)",
                border: "none",
                borderRadius: "50%",
                color: "white",
                width: "24px",
                height: "24px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              ×
            </button>
          </div>
        ) : (
          <>
            <span style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
              Drag & Drop product image or <b>Browse</b>
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={handleManualChange}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                opacity: 0,
                cursor: "pointer",
              }}
            />
          </>
        )}
      </div>
      {error && <span style={{ fontSize: "0.8rem", color: "var(--accent-red)", marginTop: "4px", display: "block" }}>{error}</span>}
    </div>
  );
};
