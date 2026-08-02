import React, { useState } from "react";
import { useAdmin } from "../hooks/useAdmin";
import { PageHeader } from "../compoment/common";
import { Modal, Button, Switch } from "../compoment/ui";
import { Input, ImageUpload } from "../compoment/form";
import { Plus, Trash2, Eye } from "lucide-react";

export const OfferList = () => {
  const { offers, addOffer, toggleOfferStatus, deleteOffer } = useAdmin();
  const [modalOpen, setModalOpen] = useState(false);

  const [form, setForm] = useState({
    title: "",
    discountText: "",
    productsCount: "5",
    banner: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (url) => {
    setForm((prev) => ({ ...prev, banner: url }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;

    addOffer({
      title: form.title,
      discountText: form.discountText || "Sale",
      productsCount: parseInt(form.productsCount || 0),
      banner: form.banner || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80",
    });

    setModalOpen(false);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this promotional offer?")) {
      deleteOffer(id);
    }
  };

  return (
    <div>
      <PageHeader title="Deals & Offers Management" breadcrumbs={[{ label: "Offers" }]}>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
          <Plus size={18} /> Add New Offer
        </button>
      </PageHeader>

      <div className="grid-3" style={{ alignItems: "stretch" }}>
        {offers.map((offer) => (
          <div key={offer.id} className="stat-card" style={{ display: "flex", flexDirection: "column", height: "100%", padding: 0, overflow: "hidden" }}>
            <img
              src={offer.banner}
              alt={offer.title}
              style={{ width: "100%", height: "140px", objectFit: "cover", backgroundColor: "var(--bg-tertiary)" }}
            />
            <div style={{ padding: "20px", display: "flex", flexDirection: "column", flex: 1, justifyContent: "space-between" }}>
              <div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "8px" }}>{offer.title}</h3>
                <span
                  style={{
                    display: "inline-block",
                    padding: "4px 8px",
                    background: "rgba(6, 182, 212, 0.1)",
                    color: "var(--accent-cyan)",
                    fontSize: "0.8rem",
                    fontWeight: "600",
                    borderRadius: "6px",
                    marginBottom: "12px"
                  }}
                >
                  {offer.discountText}
                </span>
                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "15px" }}>
                  Applicable on {offer.productsCount} products.
                </p>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--glass-border)", paddingTop: "12px", marginTop: "auto" }}>
                <Switch
                  checked={offer.active}
                  onChange={() => toggleOfferStatus(offer.id)}
                  label={offer.active ? "Running" : "Paused"}
                />
                <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleDelete(offer.id)}>
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create Special Promotional Offer">
        <form onSubmit={handleSubmit}>
          <Input
            label="Offer Title"
            name="title"
            placeholder="e.g., Diwali Extravaganza Sneaker Sale"
            value={form.title}
            onChange={handleInputChange}
            required
          />

          <div className="grid-2">
            <Input
              label="Promo Tagline (e.g., Flat 30% Off)"
              name="discountText"
              placeholder="Up to 40% Off"
              value={form.discountText}
              onChange={handleInputChange}
              required
            />

            <Input
              label="Applicable Products Count"
              name="productsCount"
              type="number"
              placeholder="10"
              value={form.productsCount}
              onChange={handleInputChange}
              required
            />
          </div>

          <ImageUpload
            label="Promo Offer Cover/Banner Image"
            value={form.banner}
            onChange={handleImageChange}
          />

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "24px" }}>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Publish Offer
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default OfferList;
