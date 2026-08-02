import React, { useState } from "react";
import { useAdmin } from "../hooks/useAdmin";
import { PageHeader } from "../compoment/common";
import { Input, ImageUpload } from "../compoment/form";
import { Button } from "../compoment/ui";
import { Save } from "lucide-react";

export const Profile = () => {
  const { currentUser, updateProfile } = useAdmin();

  const [form, setForm] = useState({
    name: currentUser?.name || "Krishna Kumar",
    email: currentUser?.email || "admin@krishna.com",
    avatar: currentUser?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (url) => {
    setForm((prev) => ({ ...prev, avatar: url }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateProfile(form.name, form.email, form.avatar);
  };

  return (
    <div>
      <PageHeader title="Admin Profile" breadcrumbs={[{ label: "Profile" }]} />

      <form onSubmit={handleSubmit} className="grid-layout">
        <div className="card">
          <div className="card-title">Personal Details</div>

          <Input
            label="Full Display Name"
            name="name"
            value={form.name}
            onChange={handleInputChange}
            required
          />

          <Input
            label="Profile Email Address"
            name="email"
            type="email"
            value={form.email}
            onChange={handleInputChange}
            required
          />

          <div style={{ marginTop: "24px", display: "flex", gap: "12px" }}>
            <Button type="submit" variant="primary">
              <Save size={18} /> Update Details
            </Button>
          </div>
        </div>

        <div className="card" style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
          <div className="card-title" style={{ width: "100%", textAlign: "left" }}>Profile Avatar</div>
          <img
            src={form.avatar}
            alt={form.name}
            style={{ width: "120px", height: "120px", borderRadius: "50%", border: "4px solid var(--accent-purple)", objectFit: "cover", marginBottom: "20px" }}
          />

          <ImageUpload
            label="Change Avatar Image"
            value={form.avatar}
            onChange={handleAvatarChange}
          />
        </div>
      </form>
    </div>
  );
};

export default Profile;
