import React from "react";
import { Trash2, Copy, Check } from "lucide-react";
import { Switch } from "./ui";

export const CouponCard = ({ coupon, onToggle, onDelete }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(coupon.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="stat-card" style={{ display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between" }}>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
          <div
            onClick={handleCopy}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "var(--bg-primary)",
              border: "1px dashed var(--accent-purple)",
              padding: "6px 12px",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "700",
              color: "var(--accent-purple)",
              fontSize: "0.95rem"
            }}
          >
            <code>{coupon.code}</code>
            {copied ? <Check size={14} style={{ color: "var(--accent-green)" }} /> : <Copy size={14} />}
          </div>
          <button className="btn btn-danger btn-sm btn-icon" onClick={() => onDelete(coupon.id)}>
            <Trash2 size={14} />
          </button>
        </div>

        <div style={{ marginBottom: "15px" }}>
          <div style={{ fontSize: "1.3rem", fontWeight: "800", color: "var(--accent-cyan)" }}>
            {coupon.type === "percentage" ? `${coupon.discount}% Off` : `₹${coupon.discount} Off`}
          </div>
          <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "4px" }}>
            Min. Spend: ₹{coupon.minPurchase}
          </div>
        </div>

        <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "15px" }}>
          Expires: {coupon.expiry} | Used: {coupon.uses} times
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--glass-border)", paddingTop: "12px" }}>
        <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Status</span>
        <Switch
          checked={coupon.active}
          onChange={() => onToggle(coupon.id)}
          label={coupon.active ? "Active" : "Inactive"}
        />
      </div>
    </div>
  );
};
