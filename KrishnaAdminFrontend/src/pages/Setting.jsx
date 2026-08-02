import React, { useState } from "react";
import { useAdmin } from "../hooks/useAdmin";
import { PageHeader } from "../compoment/common";
import { Input, Select, TextArea } from "../compoment/form";
import { Button, Switch } from "../compoment/ui";
import { Save } from "lucide-react";

export const Setting = () => {
  const { settings, updateSettings, triggerAlert } = useAdmin();
  const [form, setForm] = useState({ ...settings });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (field) => {
    setForm((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateSettings(form);
    triggerAlert("success", "Shop configurations saved successfully!");
  };

  return (
    <div>
      <PageHeader title="Store Settings" breadcrumbs={[{ label: "Settings" }]} />

      <form onSubmit={handleSubmit} className="card">
        <div className="card-title">Business Information & Store Operations</div>

        <div className="grid-2">
          <Input
            label="Shop Name"
            name="shopName"
            value={form.shopName}
            onChange={handleInputChange}
            required
          />

          <Input
            label="Business Owner Name"
            name="ownerName"
            value={form.ownerName}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="grid-2">
          <Input
            label="Contact Email"
            name="contactEmail"
            type="email"
            value={form.contactEmail}
            onChange={handleInputChange}
            required
          />

          <Input
            label="Contact Phone"
            name="contactPhone"
            value={form.contactPhone}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="grid-3">
          <Select
            label="Currency Symbol"
            name="currency"
            value={form.currency}
            onChange={handleInputChange}
            options={[
              { value: "INR (₹)", label: "Indian Rupee (₹)" },
              { value: "USD ($)", label: "US Dollar ($)" },
              { value: "EUR (€)", label: "Euro (€)" },
            ]}
          />

          <Input
            label="GST Tax Rate (%)"
            name="taxRate"
            type="number"
            value={form.taxRate}
            onChange={handleInputChange}
            required
          />

          <Input
            label="Flat Shipping Rate (₹)"
            name="shippingCharge"
            type="number"
            value={form.shippingCharge}
            onChange={handleInputChange}
            required
          />
        </div>

        <TextArea
          label="Warehouse Address"
          name="address"
          value={form.address}
          onChange={handleInputChange}
          required
        />

        <div style={{ display: "flex", flexDirection: "column", gap: "16px", margin: "24px 0", borderTop: "1px solid var(--glass-border)", paddingTop: "20px" }}>
          <h4 style={{ fontSize: "1rem", fontWeight: "600", marginBottom: "8px" }}>Toggles & Rules</h4>

          <Switch
            checked={form.enableReviews}
            onChange={() => handleSwitchChange("enableReviews")}
            label="Enable Customer Product Reviews"
          />

          <Switch
            checked={form.maintenanceMode}
            onChange={() => handleSwitchChange("maintenanceMode")}
            label="Enable Storefront Maintenance Mode"
          />
        </div>

        <div style={{ borderTop: "1px solid var(--glass-border)", paddingTop: "20px" }}>
          <Button type="submit" variant="primary">
            <Save size={18} /> Save Settings
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Setting;
