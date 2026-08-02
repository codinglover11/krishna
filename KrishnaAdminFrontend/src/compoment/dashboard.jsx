import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

/**
 * Metric summary card with glow and mini trend
 */
export const DashboardMetricCard = ({ title, value, percentage, trend = "up", color = "purple" }) => {
  const isUp = trend === "up";
  return (
    <div className="stat-card">
      <div className="stat-header">
        <span>{title}</span>
      </div>
      <div className="stat-value">{value}</div>
      <div className={`stat-change ${isUp ? "up" : "down"}`}>
        {isUp ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
        <span>{percentage}%</span>
        <span style={{ color: "var(--text-muted)", fontWeight: "normal" }}>from last month</span>
      </div>
    </div>
  );
};

/**
 * Custom Activity Logger item component
 */
export const ActivityItem = ({ text, time, type }) => {
  const getInitials = (text) => {
    return text.substring(0, 1).toUpperCase();
  };

  return (
    <div className="activity-item">
      <div className="activity-avatar" style={{
        background: type === "order" ? "rgba(16, 185, 129, 0.1)" : "rgba(139, 92, 246, 0.1)",
        color: type === "order" ? "var(--accent-green)" : "var(--accent-purple)",
        fontWeight: "bold"
      }}>
        {getInitials(type)}
      </div>
      <div className="activity-details">
        <p className="activity-text">{text}</p>
        <span className="activity-time">{time}</span>
      </div>
    </div>
  );
};
