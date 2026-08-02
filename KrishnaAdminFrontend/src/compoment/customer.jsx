import React from "react";
import { formatCurrency } from "../utils/utils";
import { Badge } from "./ui";

/**
 * Customer row item for tables
 */
export const CustomerRow = ({ customer, idx }) => {
  // Simple deterministic generation for total spending or level based on name
  const levels = ["Gold", "Silver", "Platinum", "Bronze"];
  const level = levels[idx % levels.length];
  const spent = (idx + 1) * 3150.5;

  const getLevelBadge = (lvl) => {
    switch (lvl) {
      case "Platinum": return <Badge variant="info">Platinum</Badge>;
      case "Gold": return <Badge variant="warning">Gold</Badge>;
      case "Silver": return <Badge variant="success">Silver</Badge>;
      default: return <Badge variant="info">{lvl}</Badge>;
    }
  };

  return (
    <tr>
      <td>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "var(--accent-purple-glow)", color: "var(--accent-purple)", display: "flex", alignItems: "center", justifyCenter: "center", fontWeight: "bold", fontSize: "0.85rem", justifyContent: "center" }}>
            {customer.customer.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 600 }}>{customer.customer}</div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>ID: CUST-{idx + 104}</div>
          </div>
        </div>
      </td>
      <td>{customer.email}</td>
      <td>{getLevelBadge(level)}</td>
      <td>
        <span style={{ fontWeight: 600, color: "var(--accent-cyan)" }}>{formatCurrency(spent)}</span>
      </td>
      <td>
        <span style={{ color: "var(--accent-green)", fontWeight: 600 }}>Active</span>
      </td>
    </tr>
  );
};
