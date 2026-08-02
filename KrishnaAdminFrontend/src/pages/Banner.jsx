import React, { useState } from "react";
import { useAdmin } from "../hooks/useAdmin";
import { PageHeader } from "../compoment/common";
import { Modal, Button, Switch } from "../compoment/ui";
import { Input, ImageUpload } from "../compoment/form";
import { Plus, Trash2, Link as LinkIcon } from "lucide-react";

export const BannerList = () => {
  const { banners, addBanner, toggleBannerStatus, deleteBanner } = useAdmin();
  const [modalOpen, setModalOpen] = useState(false);

  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    link: "",
    image: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (url) => {
    setForm((prev) => ({ ...prev, image: url }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.image.trim()) return;

    addBanner({
      title: form.title,
      subtitle: form.subtitle,
      link: form.link || "/products",
      image: form.image,
    });

    setModalOpen(false);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to remove this home page banner?")) {
      deleteBanner(id);
    }
  };

  return (
    <div>
      <PageHeader title="Storefront Banners" breadcrumbs={[{ label: "Banners" }]}>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
          <Plus size={18} /> Add Homepage Banner
        </button>
      </PageHeader>

      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {banners.map((banner) => (
          <div
            key={banner.id}
            className="card"
            style={{
              padding: 0,
              overflow: "hidden",
              display: "flex",
              flexDirection: window.innerWidth < 768 ? "column" : "row",
              marginBottom: 0
            }}
          >
            <img
              src={banner.image}
              alt={banner.title}
              style={{
                width: window.innerWidth < 768 ? "100%" : "300px",
                height: "170px",
                objectFit: "cover",
                backgroundColor: "var(--bg-tertiary)"
              }}
            />
            <div style={{ padding: "24px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <h3 style={{ fontSize: "1.2rem", fontWeight: "700", marginBottom: "4px" }}>{banner.title}</h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "12px" }}>{banner.subtitle}</p>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8rem", color: "var(--accent-cyan)" }}>
                  <LinkIcon size={12} />
                  <span>Redirect Link: {banner.link}</span>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--glass-border)", paddingTop: "14px", marginTop: "15px" }}>
                <Switch
                  checked={banner.active}
                  onChange={() => toggleBannerStatus(banner.id)}
                  label={banner.active ? "Visible on Frontend" : "Hidden"}
                />
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(banner.id)}>
                  <Trash2 size={14} /> Remove Banner
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Upload Homepage Slider Banner">
        <form onSubmit={handleSubmit}>
          <Input
            label="Banner Primary Title"
            name="title"
            placeholder="e.g., Summer Joggers Edition"
            value={form.title}
            onChange={handleInputChange}
            required
          />

          <Input
            label="Subtitle Tagline"
            name="subtitle"
            placeholder="e.g., Get flat 20% cashback on checkout"
            value={form.subtitle}
            onChange={handleInputChange}
          />

          <Input
            label="Redirect Route/Url"
            name="link"
            placeholder="e.g., /products?category=Sports"
            value={form.link}
            onChange={handleInputChange}
          />

          <ImageUpload
            label="Banner Landscape Image"
            value={form.image}
            onChange={handleImageChange}
            required
          />

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "24px" }}>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Publish Banner
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default BannerList;
