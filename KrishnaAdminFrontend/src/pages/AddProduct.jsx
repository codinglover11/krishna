import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { adminService } from '../services/adminService';
import { toast } from '../stores/toastStore';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { ImageUploader } from '../components/common/ImageUploader';
import { FormSelect, FormInput } from '../components/common/FormComponents';

export const AddProduct = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [metadata, setMetadata] = useState({ sizes: [], colors: [] });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newSize, setNewSize] = useState('');
  const [newColorName, setNewColorName] = useState('');
  const [newColorCode, setNewColorCode] = useState('#000000');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    sku: '',
    brand: 'Krishna Footwear',
    categoryId: '',
    price: '',
    discountPrice: '',
    shortDescription: '',
    description: '',
    isActive: true,
  });

  const [images, setImages] = useState([]);
  
  const [variants, setVariants] = useState([]);
  const [selectedSizeId, setSelectedSizeId] = useState('');
  const [selectedColorId, setSelectedColorId] = useState('');
  const [variantStock, setVariantStock] = useState('10');

  useEffect(() => {
    const loadInit = async () => {
      try {
        const cats = await adminService.getCategories();
        setCategories(cats);
        const meta = await adminService.getMetadata();
        setMetadata(meta);
        if (meta.sizes.length > 0) setSelectedSizeId(meta.sizes[0].id);
        if (meta.colors.length > 0) setSelectedColorId(meta.colors[0].id);

        if (cats.length > 0) {
          const menCat = cats.find(c => c.slug?.toLowerCase() === 'men');
          setFormData((prev) => ({ ...prev, categoryId: menCat ? menCat.id : cats[0].id }));
        }
      } catch (err) {
        console.error('Failed to load metadata:', err);
      }
    };
    loadInit();
  }, []);

  const handleNameChange = (nameVal) => {
    const autoSku = nameVal ? `KF-${nameVal.slice(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}` : '';
    setFormData((prev) => ({
      ...prev,
      name: nameVal,
      slug: nameVal.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
      sku: prev.sku || autoSku
    }));
  };


  const addVariant = () => {
    if (!selectedSizeId || !selectedColorId) return toast.warning('Please select both size and color.');
    const sizeId = Number(selectedSizeId);
    const colorId = Number(selectedColorId);
    const qty = Math.max(0, parseInt(variantStock, 10) || 0);

    const existingIndex = variants.findIndex((v) => v.sizeId === sizeId && v.colorId === colorId);
    if (existingIndex >= 0) {
      const updated = [...variants];
      updated[existingIndex].stockQuantity = qty;
      setVariants(updated);
      toast.info('Variant stock updated.');
    } else {
      setVariants([...variants, { sizeId, colorId, stockQuantity: qty }]);
      toast.success('Variant added.');
    }
  };

  const removeVariant = (index) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddSize = async () => {
    if (!newSize) return;
    try {
      const res = await adminService.createSize({ size_label: newSize });
      setMetadata(prev => ({ ...prev, sizes: [...prev.sizes, res] }));
      setNewSize('');
      toast.success('Size added');
    } catch (err) {
      toast.error('Failed to add size');
    }
  };

  const handleAddColor = async () => {
    if (!newColorName) return;
    try {
      const res = await adminService.createColor({ color_name: newColorName, color_code: newColorCode });
      setMetadata(prev => ({ ...prev, colors: [...prev.colors, res] }));
      setNewColorName('');
      toast.success('Color added');
    } catch (err) {
      toast.error('Failed to add color');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) return toast.warning('Please enter a product name.');
    if (!formData.price) return toast.warning('Please enter a price.');

    setIsSubmitting(true);
    try {
      const parsedPrice = parseFloat(formData.price) || 0;
      const parsedDiscount = formData.discountPrice ? parseFloat(formData.discountPrice) : null;
      
      if (parsedDiscount !== null && parsedPrice < parsedDiscount) {
        toast.warning('Selling Price cannot be greater than MRP (Base Price).');
        setIsSubmitting(false);
        return;
      }
      
      // variants state already matches required payload structure
      if (variants.length === 0) {
        toast.warning('Please add at least one variant.');
        setIsSubmitting(false);
        return;
      }

      const payload = {
        ...formData,
        price: parsedPrice,
        discountPrice: parsedDiscount,
        images,
        variants
      };

      await adminService.createProduct(payload);
      toast.success('Product published successfully!');
      navigate('/products');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create product.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Preview computed values
  const previewCategory = categories.find(c => c.id === Number(formData.categoryId))?.name || 'Category';
  const previewImage = images.length > 0 ? (images[0].url || images[0]) : null;

  return (
    <div className="sawariya-add-product-container">
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <Link to="/products" style={{ color: 'var(--s-chestnut)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}>
          <ArrowLeft size={16} /> Back
        </Link>
      </div>

      <h1>Add New Product</h1>

      <div className="sawariya-grid">
        {/* LEFT COLUMN: FORM */}
        <div className="sawariya-card">
          
          <ImageUploader 
            images={images}
            folder="products"
            label="Product Images"
            multiple={true}
            colors={metadata.colors}
            onChange={(res) => {
              if (!res) {
                 setImages([]);
                 return;
              }
              setImages(res);
            }}
          />

          <label className="sawariya-label">Product Name</label>
          <input 
            type="text" 
            className="sawariya-input" 
            placeholder="e.g. Boots - Krishna Footwear"
            value={formData.name}
            onChange={(e) => handleNameChange(e.target.value)}
          />

          <div className="sawariya-row">
            <div style={{ gridColumn: 'span 2' }}>
              <label className="sawariya-label">Category</label>
              <select 
                className="sawariya-select"
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              >
                <option value="">Select Category</option>
                {categories
                  .filter(c => ['men', 'women', 'kids', 'jutti'].includes(c.slug.toLowerCase()))
                  .map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
              </select>
            </div>
          </div>

          <div className="sawariya-row">
            <div>
              <label className="sawariya-label">Brand</label>
              <input 
                type="text" 
                className="sawariya-input"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              />
            </div>
          </div>

          <div className="sawariya-row">
            <div>
              <label className="sawariya-label">MRP (Base Price)</label>
              <input 
                type="number" 
                className="sawariya-input"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              />
            </div>
            <div>
              <label className="sawariya-label">Selling Price</label>
              <input 
                type="number" 
                className="sawariya-input"
                value={formData.discountPrice}
                onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
              />
            </div>
          </div>

          {/* SKU and global stock removed as requested */}

          <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '700', color: 'var(--ink)', fontFamily: '"Rozha One", serif', marginTop: '16px' }}>Manage Custom Attributes</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', paddingBottom: '16px', borderBottom: '1px solid var(--line)' }}>
            <div>
              <label style={{ fontSize: '0.875rem', fontWeight: '600' }}>Add Custom Size</label>
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <input type="text" style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid var(--line)' }} placeholder="Size (e.g. UK10)" value={newSize} onChange={(e) => setNewSize(e.target.value)} />
                <button type="button" onClick={handleAddSize} style={{ padding: '8px 12px', backgroundColor: 'var(--bottle)', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Add</button>
              </div>
            </div>
            <div>
              <label style={{ fontSize: '0.875rem', fontWeight: '600' }}>Add Custom Color</label>
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px', alignItems: 'center' }}>
                <input type="text" style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid var(--line)' }} placeholder="Color Name" value={newColorName} onChange={(e) => setNewColorName(e.target.value)} />
                <input type="color" value={newColorCode} onChange={(e) => setNewColorCode(e.target.value)} style={{ width: '36px', height: '36px', padding: 0, border: 'none' }} />
                <button type="button" onClick={handleAddColor} style={{ padding: '8px 12px', backgroundColor: 'var(--bottle)', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Add</button>
              </div>
            </div>
          </div>

          <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '700', color: 'var(--ink)', fontFamily: '"Rozha One", serif', marginTop: '16px' }}>Variants & Stock Quantities</h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '12px', alignItems: 'end' }}>
            <FormSelect
              label="Size"
              value={selectedSizeId}
              onChange={(e) => setSelectedSizeId(e.target.value)}
              options={metadata.sizes.map((s) => ({ value: s.id, label: s.size_label }))}
            />
            <FormSelect
              label="Color"
              value={selectedColorId}
              onChange={(e) => setSelectedColorId(e.target.value)}
              options={metadata.colors.map((c) => ({ value: c.id, label: c.color_name }))}
            />
            <FormInput
              label="Stock Qty"
              type="number"
              value={variantStock}
              onChange={(e) => setVariantStock(e.target.value)}
            />
            <button
              type="button"
              onClick={addVariant}
              style={{ padding: '10px 16px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '0.875rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={16} /> Add Variant
            </button>
          </div>

          {variants.length > 0 && (
            <div style={{ marginTop: '12px', border: '1px solid var(--line)', borderRadius: '8px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', textAlign: 'left' }}>
                <thead style={{ backgroundColor: 'var(--parchment-soft)' }}>
                  <tr>
                    <th style={{ padding: '10px 16px' }}>Size</th>
                    <th style={{ padding: '10px 16px' }}>Color</th>
                    <th style={{ padding: '10px 16px' }}>Stock Quantity</th>
                    <th style={{ padding: '10px 16px', textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {variants.map((v, idx) => {
                    const sizeLabel = metadata.sizes.find(s => s.id === v.sizeId)?.size_label;
                    const colorObj = metadata.colors.find(c => c.id === v.colorId);
                    return (
                      <tr key={idx} style={{ borderTop: '1px solid var(--line)' }}>
                        <td style={{ padding: '10px 16px', fontWeight: '600' }}>{sizeLabel}</td>
                        <td style={{ padding: '10px 16px' }}>
                          {colorObj ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: colorObj.color_code || '#ccc' }}></span>
                              {colorObj.color_name}
                            </div>
                          ) : 'Default'}
                        </td>
                        <td style={{ padding: '10px 16px' }}>{v.stockQuantity}</td>
                        <td style={{ padding: '10px 16px', textAlign: 'right' }}>
                          <button type="button" onClick={() => removeVariant(idx)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={16}/></button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <label className="sawariya-label">Short Description</label>
          <textarea 
            rows="3" 
            className="sawariya-textarea"
            value={formData.shortDescription}
            onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
          ></textarea>

          <label className="sawariya-label">Detailed Description</label>
          <textarea 
            rows="5" 
            className="sawariya-textarea"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          ></textarea>

          <div className="sawariya-btns">
            <button type="button" className="sawariya-btn sawariya-btn-outline" onClick={() => navigate('/products')}>Cancel</button>
            <button type="button" className="sawariya-btn sawariya-btn-secondary">Save Draft</button>
            <button type="button" className="sawariya-btn sawariya-btn-primary" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Publishing...' : 'Publish'}
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: PREVIEW */}
        <div>
          <div className="sawariya-card" style={{ position: 'sticky', top: '90px' }}>
            <h2 style={{ marginBottom: '16px' }}>Live Preview</h2>
            
            <div className="product-card-preview">
              {formData.discountPrice && (
                 <span style={{ position: 'absolute', top: '14px', left: '14px', zIndex: 2, background: 'var(--s-chestnut)', color: '#fff', fontSize: '10px', fontWeight: 700, padding: '5px 10px', borderRadius: '999px', textTransform: 'uppercase' }}>
                   Sale
                 </span>
              )}
              
              <div className="thumb-wrap">
                {previewImage ? (
                  <img src={previewImage} alt="Preview" />
                ) : (
                  <span style={{ color: 'var(--s-ink-soft)', opacity: 0.5, fontWeight: 600 }}>Image Preview</span>
                )}
              </div>

              <div className="p-meta">
                <h4>{formData.name || 'Product Name'}</h4>
                <p className="desc">{previewCategory} · {formData.brand}</p>
                <p className="price">
                  ₹{formData.discountPrice ? formData.discountPrice : (formData.price || '0')}
                  {formData.discountPrice && formData.price && (
                    <s>₹{formData.price}</s>
                  )}
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;
