import React, { useState } from "react";
import { useAdmin } from "../hooks/useAdmin";
import { PageHeader } from "../compoment/common";
import { ProductRow } from "../compoment/product";
import { Modal, Button } from "../compoment/ui";
import { formatCurrency } from "../utils/utils";
import { Plus, Search, Filter } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export const ProductList = () => {
  const { products, deleteProduct, categories } = useAdmin();
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const navigate = useNavigate();

  // Filters logic
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.id.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = catFilter === "All" || p.category === catFilter;
    return matchesSearch && matchesCategory;
  });

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      deleteProduct(id);
    }
  };

  const handleEdit = (id) => {
    navigate(`/products/edit/${id}`);
  };

  const handleView = (product) => {
    setSelectedProduct(product);
  };

  return (
    <div>
      <PageHeader title="Products Directory" breadcrumbs={[{ label: "Products" }]}>
        <Link to="/products/add" className="btn btn-primary">
          <Plus size={18} /> Add Product
        </Link>
      </PageHeader>

      <div className="card">
        {/* Filters and Searches */}
        <div className="filter-bar">
          <div className="filter-group" style={{ flex: 1, minWidth: "260px" }}>
            <div style={{ position: "relative", width: "100%", maxWidth: "360px" }}>
              <input
                type="text"
                placeholder="Search by name or code..."
                className="form-control"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: "40px" }}
              />
              <Search size={18} style={{ position: "absolute", left: "14px", top: "14px", color: "var(--text-muted)" }} />
            </div>

            <select
              className="form-control"
              value={catFilter}
              onChange={(e) => setCatFilter(e.target.value)}
              style={{ width: "160px" }}
            >
              <option value="All">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product Info</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock Level</th>
                <th>Total Sales</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <ProductRow
                  key={product.id}
                  product={product}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onView={handleView}
                />
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "30px", color: "var(--text-secondary)" }}>
                    No products found matching criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details View Modal */}
      <Modal isOpen={!!selectedProduct} onClose={() => setSelectedProduct(null)} title="Product Sheet Overview">
        {selectedProduct && (
          <div style={{ display: "flex", gap: "20px", flexDirection: window.innerWidth < 576 ? "column" : "row" }}>
            <img
              src={selectedProduct.image}
              alt={selectedProduct.name}
              style={{ width: "160px", height: "160px", objectFit: "cover", borderRadius: "10px", background: "var(--bg-tertiary)" }}
            />
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", flex: 1 }}>
              <h4 style={{ fontSize: "1.2rem", fontWeight: "700" }}>{selectedProduct.name}</h4>
              <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>SKU Code: {selectedProduct.id}</span>
              <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", lineHeight: 1.4 }}>
                {selectedProduct.description || "No description provided."}
              </p>
              <div style={{ marginTop: "10px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Category:</span>
                  <div style={{ fontWeight: 600 }}>{selectedProduct.category}</div>
                </div>
                <div>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Price:</span>
                  <div style={{ fontWeight: 600, color: "var(--accent-cyan)" }}>{formatCurrency(selectedProduct.price)}</div>
                </div>
                <div>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Stock Available:</span>
                  <div style={{ fontWeight: 600 }}>{selectedProduct.stock} units</div>
                </div>
                <div>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Total Sold:</span>
                  <div style={{ fontWeight: 600 }}>{selectedProduct.sales} units</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ProductList;
