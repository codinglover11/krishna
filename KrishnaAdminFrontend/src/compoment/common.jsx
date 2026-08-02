import React from "react";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

/**
 * Page Header component with Breadcrumbs and actions
 */
export const PageHeader = ({ title, breadcrumbs = [], children }) => {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px", flexWrap: "wrap", gap: "15px" }}>
      <div>
        {breadcrumbs.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "6px" }}>
            <Link to="/" style={{ color: "inherit", textDecoration: "none" }}>Home</Link>
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                <ChevronRight size={12} />
                {crumb.path ? (
                  <Link to={crumb.path} style={{ color: "inherit", textDecoration: "none" }}>{crumb.label}</Link>
                ) : (
                  <span style={{ color: "var(--text-secondary)" }}>{crumb.label}</span>
                )}
              </React.Fragment>
            ))}
          </div>
        )}
        <h2 style={{ fontSize: "1.6rem", fontWeight: 700, background: "linear-gradient(135deg, #fff, var(--text-secondary))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          {title}
        </h2>
      </div>
      <div style={{ display: "flex", gap: "12px" }}>{children}</div>
    </div>
  );
};

/**
 * Stat Summary Card Component
 */
export const InfoCard = ({ title, value, subtitle, icon: Icon, color = "purple" }) => {
  return (
    <div className="stat-card">
      <div className="stat-header">
        <span>{title}</span>
        <div className={`stat-icon ${color}`}>
          {Icon && <Icon size={20} />}
        </div>
      </div>
      <div className="stat-value">{value}</div>
      {subtitle && <div className="stat-change">{subtitle}</div>}
    </div>
  );
};
