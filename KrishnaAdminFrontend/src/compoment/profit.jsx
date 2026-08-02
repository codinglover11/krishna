import React from "react";
import { formatCurrency } from "../utils/utils";

export const ProfitChart = ({ data = [] }) => {
  // Build a custom vector SVG chart dynamically using coordinate maps
  const chartHeight = 180;
  const chartWidth = 500;
  const padding = 30;

  const maxVal = Math.max(...data.map((x) => x.sales), 1000);
  const minVal = 0;

  const getPoints = () => {
    return data
      .map((item, idx) => {
        const x = padding + (idx * (chartWidth - padding * 2)) / (data.length - 1);
        const y = chartHeight - padding - ((item.sales - minVal) * (chartHeight - padding * 2)) / (maxVal - minVal);
        return `${x},${y}`;
      })
      .join(" ");
  };

  const getProfitPoints = () => {
    return data
      .map((item, idx) => {
        const x = padding + (idx * (chartWidth - padding * 2)) / (data.length - 1);
        const y = chartHeight - padding - ((item.profit - minVal) * (chartHeight - padding * 2)) / (maxVal - minVal);
        return `${x},${y}`;
      })
      .join(" ");
  };

  return (
    <div style={{ width: "100%", overflowX: "auto" }}>
      <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} style={{ width: "100%", height: "230px", background: "var(--bg-secondary)", borderRadius: "8px" }}>
        {/* Grids */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
          const y = padding + ratio * (chartHeight - padding * 2);
          const value = Math.round(maxVal - ratio * (maxVal - minVal));
          return (
            <g key={idx}>
              <line
                x1={padding}
                y1={y}
                x2={chartWidth - padding}
                y2={y}
                stroke="rgba(255,255,255,0.06)"
                strokeDasharray="4"
              />
              <text x={padding - 5} y={y + 4} fill="var(--text-muted)" fontSize="8" textAnchor="end">
                {formatCurrency(value, "₹")}
              </text>
            </g>
          );
        })}

        {/* X Axis Labels */}
        {data.map((item, idx) => {
          const x = padding + (idx * (chartWidth - padding * 2)) / (data.length - 1);
          return (
            <text key={idx} x={x} y={chartHeight - 8} fill="var(--text-secondary)" fontSize="9" textAnchor="middle">
              {item.month}
            </text>
          );
        })}

        {/* Sales Path (Cyan) */}
        {data.length > 0 && (
          <path
            d={`M ${getPoints()}`}
            fill="none"
            stroke="var(--accent-cyan)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Profit Path (Purple) */}
        {data.length > 0 && (
          <path
            d={`M ${getProfitPoints()}`}
            fill="none"
            stroke="var(--accent-purple)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </svg>
    </div>
  );
};

export const FinancialSummary = ({ totalSales, totalProfit, totalOrders }) => {
  return (
    <div className="grid-3" style={{ marginBottom: "20px" }}>
      <div className="stat-card" style={{ borderLeft: "4px solid var(--accent-cyan)" }}>
        <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Total Revenue</div>
        <div style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--accent-cyan)", margin: "8px 0" }}>
          {formatCurrency(totalSales)}
        </div>
        <span style={{ fontSize: "0.75rem", color: "var(--accent-green)" }}>+12% vs last month</span>
      </div>

      <div className="stat-card" style={{ borderLeft: "4px solid var(--accent-purple)" }}>
        <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Net Profit</div>
        <div style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--accent-purple)", margin: "8px 0" }}>
          {formatCurrency(totalProfit)}
        </div>
        <span style={{ fontSize: "0.75rem", color: "var(--accent-green)" }}>+8.5% margin growth</span>
      </div>

      <div className="stat-card" style={{ borderLeft: "4px solid var(--accent-green)" }}>
        <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Orders Completed</div>
        <div style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--accent-green)", margin: "8px 0" }}>
          {totalOrders}
        </div>
        <span style={{ fontSize: "0.75rem", color: "var(--accent-green)" }}>+18% order volume</span>
      </div>
    </div>
  );
};
