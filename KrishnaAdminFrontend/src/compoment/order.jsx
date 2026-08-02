import React from "react";
import { formatCurrency, formatDate } from "../utils/utils";
import { Badge } from "./ui";
import { Eye, Clock, ShoppingBag } from "lucide-react";

/**
 * Order row representation inside order lists
 */
export const OrderRow = ({ order, onViewDetails, onStatusUpdate }) => {
  const getStatusBadge = (status) => {
    switch (status) {
      case "Delivered": return <Badge variant="success">Delivered</Badge>;
      case "Shipped": return <Badge variant="info">Shipped</Badge>;
      case "Pending": return <Badge variant="warning">Pending</Badge>;
      case "Cancelled": return <Badge variant="danger">Cancelled</Badge>;
      default: return <Badge variant="info">{status}</Badge>;
    }
  };

  return (
    <tr>
      <td>
        <span style={{ fontWeight: 700 }}>{order.id}</span>
      </td>
      <td>
        <div>
          <div style={{ fontWeight: 500 }}>{order.customer}</div>
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{order.email}</div>
        </div>
      </td>
      <td>{formatDate(order.date)}</td>
      <td>
        <span style={{ fontWeight: 600, color: "var(--accent-cyan)" }}>{formatCurrency(order.total)}</span>
      </td>
      <td>{getStatusBadge(order.status)}</td>
      <td>
        <div style={{ display: "flex", gap: "8px" }}>
          <button className="btn btn-secondary btn-sm" onClick={() => onViewDetails(order)}>
            <Eye size={12} /> View
          </button>
          <select
            className="form-control"
            value={order.status}
            onChange={(e) => onStatusUpdate(order.id, e.target.value)}
            style={{ padding: "4px 8px", width: "110px", fontSize: "0.8rem", height: "30px" }}
          >
            <option value="Pending">Pending</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </td>
    </tr>
  );
};

/**
 * Invoice summary card/dialog component
 */
export const OrderInvoice = ({ order }) => {
  if (!order) return null;
  return (
    <div style={{ padding: "10px 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--glass-border)", paddingBottom: "15px", marginBottom: "15px" }}>
        <div>
          <h4 style={{ fontSize: "1.1rem", fontWeight: "700" }}>Invoice Details</h4>
          <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>ID: {order.id}</span>
        </div>
        <div style={{ textAlign: "right" }}>
          <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Placed on:</span>
          <div style={{ fontWeight: 600 }}>{formatDate(order.date)}</div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px", gap: "20px", flexWrap: "wrap" }}>
        <div>
          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Customer Info</span>
          <div style={{ fontWeight: 600, marginTop: "4px" }}>{order.customer}</div>
          <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>{order.email}</div>
        </div>
        <div style={{ minWidth: "200px" }}>
          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Shipping Address</span>
          <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "4px", lineHeight: "1.4" }}>
            {order.address}
          </div>
        </div>
      </div>

      <h5 style={{ fontSize: "0.9rem", fontWeight: 600, marginBottom: "10px" }}>Ordered Items</h5>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", borderBottom: "1px solid var(--glass-border)", paddingBottom: "15px", marginBottom: "15px" }}>
        {order.items.map((item, idx) => (
          <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--bg-primary)", padding: "10px 14px", borderRadius: "8px" }}>
            <div>
              <div style={{ fontWeight: 500, fontSize: "0.9rem" }}>{item.name}</div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Qty: {item.qty} × {formatCurrency(item.price)}</div>
            </div>
            <span style={{ fontWeight: 600 }}>{formatCurrency(item.price * item.qty)}</span>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.05rem" }}>
        <span style={{ fontWeight: 700 }}>Grand Total:</span>
        <span style={{ fontWeight: 800, color: "var(--accent-cyan)" }}>{formatCurrency(order.total)}</span>
      </div>
    </div>
  );
};
