import React from "react";
import { Edit2, Trash2 } from "lucide-react";

/**
 * Category Item Card
 */
export const CategoryCard = ({ category, onEdit, onDelete }) => {
  return (
    <div className="stat-card" style={{ display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between" }}>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: "700" }}>{category.name}</h3>
          <span style={{ fontSize: "0.75rem", background: "var(--accent-purple-glow)", color: "var(--accent-purple)", padding: "2px 8px", borderRadius: "10px", fontWeight: "600" }}>
            {category.count} Products
          </span>
        </div>
        <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: "1.4", marginBottom: "15px" }}>
          {category.description || "No description provided."}
        </p>
      </div>

      <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
        <button
          className="btn btn-secondary btn-sm"
          style={{ flex: 1 }}
          onClick={() => onEdit(category)}
        >
          <Edit2 size={12} /> Edit
        </button>
        <button
          className="btn btn-danger btn-sm"
          style={{ flex: 1 }}
          onClick={() => onDelete(category.id)}
        >
          <Trash2 size={12} /> Delete
        </button>
      </div>
    </div>
  );
};
