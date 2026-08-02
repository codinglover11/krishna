import React from "react";
import { Edit2, Trash2, Eye } from "lucide-react";
import { formatCurrency, calculateDiscountPrice } from "../utils/utils";
import { Badge } from "./ui";

/**
 * Product Row item to render inside tables
 */
export const ProductRow = ({ product, onEdit, onDelete, onView }) => {
  const finalPrice = calculateDiscountPrice(product.price, product.discount);
  const isLowStock = product.stock <= 10;

  return (
    <tr>
      <td>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <img
            src={product.image}
            alt={product.name}
            style={{ width: "40px", height: "40px", borderRadius: "8px", objectFit: "cover", backgroundColor: "var(--bg-tertiary)" }}
          />
          <div>
            <div style={{ fontWeight: 600 }}>{product.name}</div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>ID: {product.id}</div>
          </div>
        </div>
      </td>
      <td>
        <Badge variant="info">{product.category}</Badge>
      </td>
      <td>
        {product.discount > 0 ? (
          <div>
            <span style={{ fontWeight: 600, color: "var(--accent-cyan)" }}>{formatCurrency(finalPrice)}</span>
            <span style={{ fontSize: "0.8rem", textDecoration: "line-through", color: "var(--text-muted)", marginLeft: "6px" }}>
              {formatCurrency(product.price)}
            </span>
          </div>
        ) : (
          <span style={{ fontWeight: 600 }}>{formatCurrency(product.price)}</span>
        )}
      </td>
      <td>
        <span style={{ color: isLowStock ? "var(--accent-red)" : "inherit", fontWeight: isLowStock ? 600 : "normal" }}>
          {product.stock} units
        </span>
        {isLowStock && <span style={{ display: "block", fontSize: "0.75rem", color: "var(--accent-red)" }}>Low stock!</span>}
      </td>
      <td>{product.sales} sales</td>
      <td>
        <div style={{ display: "flex", gap: "8px" }}>
          <button className="btn btn-secondary btn-sm btn-icon" onClick={() => onView(product)}>
            <Eye size={14} />
          </button>
          <button className="btn btn-secondary btn-sm btn-icon" onClick={() => onEdit(product.id)}>
            <Edit2 size={14} />
          </button>
          <button className="btn btn-danger btn-sm btn-icon" onClick={() => onDelete(product.id)}>
            <Trash2 size={14} />
          </button>
        </div>
      </td>
    </tr>
  );
};
