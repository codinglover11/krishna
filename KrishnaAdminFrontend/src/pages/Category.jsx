import React, { useState } from "react";
import { useAdmin } from "../hooks/useAdmin";
import { PageHeader } from "../compoment/common";
import { CategoryCard } from "../compoment/category";
import { Modal, Button } from "../compoment/ui";
import { Input, TextArea } from "../compoment/form";
import { Plus } from "lucide-react";

export const CategoryList = () => {
  const { categories, addCategory, editCategory, deleteCategory } = useAdmin();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
  });

  const handleOpenAdd = () => {
    setEditingCat(null);
    setForm({ name: "", description: "" });
    setModalOpen(true);
  };

  const handleOpenEdit = (category) => {
    setEditingCat(category);
    setForm({ name: category.name, description: category.description });
    setModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    if (editingCat) {
      editCategory(editingCat.id, form.name, form.description);
    } else {
      addCategory(form);
    }
    setModalOpen(false);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this category? All products under it will remain but category classification will be deleted.")) {
      deleteCategory(id);
    }
  };

  return (
    <div>
      <PageHeader title="Category Manager" breadcrumbs={[{ label: "Categories" }]}>
        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <Plus size={18} /> Add Category
        </button>
      </PageHeader>

      <div className="grid-3" style={{ alignItems: "stretch" }}>
        {categories.map((c) => (
          <CategoryCard
            key={c.id}
            category={c}
            onEdit={handleOpenEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCat ? "Modify Category Details" : "Create New Category"}
      >
        <form onSubmit={handleSubmit}>
          <Input
            label="Category Name"
            name="name"
            placeholder="e.g., Running Shoes"
            value={form.name}
            onChange={handleInputChange}
            required
          />
          <TextArea
            label="Category Description"
            name="description"
            placeholder="Short details about styles, brands or usage of this category..."
            value={form.description}
            onChange={handleInputChange}
          />
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "24px" }}>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingCat ? "Save Changes" : "Create Category"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CategoryList;
