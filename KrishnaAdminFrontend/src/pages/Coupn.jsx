import React, { useState } from "react";
import { useAdmin } from "../hooks/useAdmin";
import { PageHeader } from "../compoment/common";
import { CouponCard } from "../compoment/coupn";
import { Modal, Button } from "../compoment/ui";
import { Input, Select } from "../compoment/form";
import { Plus } from "lucide-react";

export const CouponList = () => {
  const { coupons, addCoupon, toggleCouponStatus, deleteCoupon } = useAdmin();
  const [modalOpen, setModalOpen] = useState(false);

  const [form, setForm] = useState({
    code: "",
    discount: "",
    type: "percentage",
    minPurchase: "50",
    expiry: "2026-12-31",
  });

  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.code.trim()) return;

    if (isNaN(form.discount) || parseFloat(form.discount) <= 0) {
      setError("Please enter a valid discount amount");
      return;
    }

    addCoupon({
      code: form.code.toUpperCase().trim(),
      discount: parseFloat(form.discount),
      type: form.type,
      minPurchase: parseFloat(form.minPurchase || 0),
      expiry: form.expiry,
    });

    setModalOpen(false);
    setError("");
  };

  const handleToggle = (id) => {
    toggleCouponStatus(id);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this coupon code?")) {
      deleteCoupon(id);
    }
  };

  return (
    <div>
      <PageHeader title="Promo Codes & Coupons" breadcrumbs={[{ label: "Coupons" }]}>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
          <Plus size={18} /> Create Code
        </button>
      </PageHeader>

      <div className="grid-3" style={{ alignItems: "stretch" }}>
        {coupons.map((c) => (
          <CouponCard
            key={c.id}
            coupon={c}
            onToggle={handleToggle}
            onDelete={handleDelete}
          />
        ))}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create New Coupon Code">
        <form onSubmit={handleSubmit}>
          {error && <div style={{ color: "var(--accent-red)", marginBottom: "15px", fontSize: "0.85rem" }}>{error}</div>}

          <Input
            label="Promo Code String"
            name="code"
            placeholder="e.g., KICKS25"
            value={form.code}
            onChange={handleInputChange}
            required
          />

          <div className="grid-2">
            <Select
              label="Discount Type"
              name="type"
              value={form.type}
              onChange={handleInputChange}
              options={[
                { value: "percentage", label: "Percentage (%)" },
                { value: "fixed", label: "Fixed Amount (₹)" },
              ]}
              required
            />

            <Input
              label="Value"
              name="discount"
              placeholder="e.g., 10"
              value={form.discount}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="grid-2">
            <Input
              label="Minimum Purchase (₹)"
              name="minPurchase"
              placeholder="e.g., 500"
              value={form.minPurchase}
              onChange={handleInputChange}
            />

            <Input
              label="Expiry Date"
              name="expiry"
              type="date"
              value={form.expiry}
              onChange={handleInputChange}
              required
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "24px" }}>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Create Coupon
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CouponList;
