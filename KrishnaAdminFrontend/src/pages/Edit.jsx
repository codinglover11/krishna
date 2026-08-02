import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAdmin } from "../hooks/useAdmin";
import { PageHeader } from "../compoment/common";
import { Input, Select, TextArea, ImageUpload } from "../compoment/form";
import { Button } from "../compoment/ui";
import { Save, ArrowLeft, Trash2 } from "lucide-react";

export const EditProduct = () => {
  const { products, editProduct, deleteProduct, categories } = useAdmin();
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const p = products.find((x) => x.id === id);
    if (p) {
      setForm({
        name: p.name,
        category: p.category,
        price: p.price.toString(),
        discount: p.discount.toString(),
        stock: p.stock.toString(),
        description: p.description || "",
        image: p.image,
      });
    } else {
      navigate("/products");
    }
  }, [id, products, navigate]);

  if (!form) return <div style={{ padding: "30px", textAlign: "center" }}>Loading product data...</div>;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleImageChange = (url) => {
    setForm((prev) => ({ ...prev, image: url }));
  };

  const validateForm = () => {
    const err = {};
    if (!form.name.trim()) err.name = "Product name is required";
    if (!form.price || isNaN(form.price) || parseFloat(form.price) <= 0) err.price = "Enter a valid price";
    if (isNaN(form.discount) || parseFloat(form.discount) < 0 || parseFloat(form.discount) > 100) err.discount = "Discount must be 0-100";
    if (!form.stock || isNaN(form.stock) || parseInt(form.stock) < 0) err.stock = "Enter a valid stock number";
    return err;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const err = validateForm();
    if (Object.keys(err).length > 0) {
      setErrors(err);
      return;
    }

    const payload = {
      ...form,
      price: parseFloat(form.price),
      discount: parseFloat(form.discount || 0),
      stock: parseInt(form.stock),
      image: form.image || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80",
    };

    editProduct(id, payload);
    navigate("/products");
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${form.name}"?`)) {
      deleteProduct(id);
      navigate("/products");
    }
  };

  return (
    <div>
      <PageHeader
        title={`Edit Product: ${form.name}`}
        breadcrumbs={[{ label: "Products", path: "/products" }, { label: "Edit" }]}
      >
        <button className="btn btn-danger" onClick={handleDelete}>
          <Trash2 size={18} /> Delete Product
        </button>
        <button className="btn btn-secondary" onClick={() => navigate("/products")}>
          <ArrowLeft size={18} /> Cancel
        </button>
      </PageHeader>

      <div className="card">
        <form onSubmit={handleSubmit} className="grid-layout">
          <div>
            <Input
              label="Product Title"
              name="name"
              placeholder="e.g., Run-Fast Mesh Sneakers v3"
              value={form.name}
              onChange={handleInputChange}
              error={errors.name}
              required
            />

            <div className="grid-2">
              <Select
                label="Product Category"
                name="category"
                value={form.category}
                onChange={handleInputChange}
                options={categories.map((c) => ({ value: c.name, label: c.name }))}
                required
              />

              <Input
                label="Price (₹)"
                name="price"
                placeholder="2499.00"
                value={form.price}
                onChange={handleInputChange}
                error={errors.price}
                required
              />
            </div>

            <div className="grid-2">
              <Input
                label="Discount (%)"
                name="discount"
                placeholder="10"
                value={form.discount}
                onChange={handleInputChange}
                error={errors.discount}
              />

              <Input
                label="Stock Quantity"
                name="stock"
                placeholder="50"
                value={form.stock}
                onChange={handleInputChange}
                error={errors.stock}
                required
              />
            </div>

            <TextArea
              label="Product Description"
              name="description"
              placeholder="Write specs here..."
              value={form.description}
              onChange={handleInputChange}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div className="card-title" style={{ fontSize: "0.95rem", margin: 0 }}>Thumbnail Image</div>
            <ImageUpload
              label=""
              value={form.image}
              onChange={handleImageChange}
            />

            <div style={{ marginTop: "auto" }}>
              <Button type="submit" variant="primary" style={{ width: "100%" }}>
                <Save size={18} /> Save Changes
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProduct;
