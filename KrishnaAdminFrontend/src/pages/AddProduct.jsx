import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { adminService } from '../services/adminService';
import { toast } from '../stores/toastStore';
import { FormInput, FormSelect, FormTextarea, FormCheckbox } from '../components/common/FormComponents';
import { ImageUploader } from '../components/common/ImageUploader';
import { Upload, Plus, Trash2, ArrowLeft, Image as ImageIcon, Check, AlertCircle } from 'lucide-react';

export const AddProduct = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [metadata, setMetadata] = useState({ sizes: [], colors: [] });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSlugEdited, setIsSlugEdited] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    sku: '',
    brand: 'Krishna Footwear',
    categoryId: '',
    gender: '',
    ageGroup: '',
    price: '',
    discountPrice: '',
    costPrice: '',
    shortDescription: '',
    description: '',
    isFeatured: false,
    isBestseller: false,
    isNewArrival: true,
    isActive: true
  });

  const [images, setImages] = useState([]); // Array of image URLs
  const [variants, setVariants] = useState([]); // Array of { sizeId, colorId, stockQuantity }

  // Temp variant selection inputs
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

        if (cats.length > 0) {
          setFormData((prev) => ({ ...prev, categoryId: cats[0].id }));
        }
        if (meta.sizes.length > 0) setSelectedSizeId(meta.sizes[0].id);
        if (meta.colors.length > 0) setSelectedColorId(meta.colors[0].id);
      } catch (err) {
        console.error('Failed to load metadata:', err);
      }
    };
    loadInit();
  }, []);

  const handleNameChange = (nameVal) => {
    const autoSku = nameVal ? `KF-${nameVal.slice(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}` : '';
    setFormData((prev) => {
      const newSlug = isSlugEdited ? prev.slug : nameVal.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      return {
        ...prev,
        name: nameVal,
        slug: newSlug,
        sku: prev.sku || autoSku
      };
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const res = await adminService.uploadImage(file);
      setImages((prev) => [...prev, res.url]);
      toast.success('Image uploaded to Cloudinary!');
    } catch (err) {
      toast.error('Image upload failed.');
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const addVariant = () => {
    if (!selectedSizeId || !selectedColorId) {
      toast.warning('Please select size and color.');
      return;
    }

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      toast.warning('Product Name is missing. Please enter a product name.');
      return;
    }
    if (!formData.sku) {
      toast.warning('SKU Code is missing. Please enter a SKU.');
      return;
    }
    if (!formData.price) {
      toast.warning('Base Selling Price is missing. Please enter a price.');
      return;
    }

    setIsSubmitting(true);
    try {
      const parsedPrice = parseFloat(formData.price) || 0;
      const parsedDiscount = formData.discountPrice ? parseFloat(formData.discountPrice) : null;
      const parsedCost = formData.costPrice ? parseFloat(formData.costPrice) : null;
      
      if (parsedPrice <= 0) {
        toast.warning('Base Selling Price must be greater than 0.');
        setIsSubmitting(false); return;
      }
      if (parsedDiscount !== null && parsedDiscount <= 0) {
        toast.warning('Discounted Price must be greater than 0.');
        setIsSubmitting(false); return;
      }
      if (parsedCost !== null && parsedCost <= 0) {
        toast.warning('Cost Price must be greater than 0.');
        setIsSubmitting(false); return;
      }
      if (parsedDiscount !== null && parsedPrice < parsedDiscount) {
        toast.warning('Discounted price cannot be greater than the original selling price.');
        setIsSubmitting(false); return;
      }

      const payload = {
        ...formData,
        price: parsedPrice,
        discountPrice: parsedDiscount,
        costPrice: parsedCost,
        images,
        variants
      };

      await adminService.createProduct(payload);
      toast.success('Product created successfully!');
      navigate('/products');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create product.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1000px' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Link to="/products" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', textDecoration: 'none', fontWeight: '600', fontSize: '0.875rem' }}>
          <ArrowLeft size={16} /> Back to Products
        </Link>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
          Add New Product
        </h1>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Basic Info Card */}
        <div style={{ padding: '24px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '700', color: '#0f172a' }}>Basic Information</h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <FormInput
              label="Product Name"
              required
              placeholder="e.g. Royal Oxford Leather Shoes"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
            />
            <FormInput
              label="SKU Code"
              required
              placeholder="e.g. KF-OXF-101"
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <FormInput
              label="Slug"
              placeholder="royal-oxford-leather-shoes"
              value={formData.slug}
              onChange={(e) => {
                setFormData({ ...formData, slug: e.target.value });
                setIsSlugEdited(true);
              }}
            />
            <FormInput
              label="Brand Name"
              placeholder="Krishna Footwear"
              value={formData.brand}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <FormSelect
              label="Category"
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              options={categories.map((c) => ({ value: c.id, label: c.name }))}
            />
            <FormSelect
              label="Gender"
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              options={[
                { value: '', label: 'Select Gender' },
                { value: 'Men', label: 'Men' },
                { value: 'Women', label: 'Women' },
                { value: 'None', label: 'None' },
                { value: 'Boys', label: 'Boys' },
                { value: 'Girls', label: 'Girls' }
              ]}
            />
            <FormSelect
              label="Age Group"
              value={formData.ageGroup}
              onChange={(e) => setFormData({ ...formData, ageGroup: e.target.value })}
              options={[
                { value: '', label: 'Select Age Group' },
                { value: 'Adults', label: 'Adults' },
                { value: 'Kids', label: 'Kids' },
                { value: 'Infants', label: 'Infants' },
                { value: 'All Ages', label: 'All Ages' }
              ]}
            />
          </div>

          <FormInput
            label="Short Description"
            placeholder="Handcrafted genuine leather shoes for formal occasions"
            value={formData.shortDescription}
            onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
          />

          <FormTextarea
            label="Detailed Description"
            placeholder="Full features, sole material, care instructions..."
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        {/* Pricing Card */}
        <div style={{ padding: '24px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '700', color: '#0f172a' }}>Pricing Details</h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <FormInput
              label="Base Selling Price (₹)"
              type="number"
              step="0.01"
              required
              placeholder="89.99"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            />
            <FormInput
              label="Discounted Price (₹)"
              type="number"
              step="0.01"
              placeholder="79.99"
              value={formData.discountPrice}
              onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
            />
            <FormInput
              label="Cost Price (₹)"
              type="number"
              step="0.01"
              placeholder="45.00"
              value={formData.costPrice}
              onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
            />
          </div>

          {/* Pricing Calculations & Validation */}
          {(() => {
            const bp = parseFloat(formData.price) || 0;
            const dp = formData.discountPrice ? parseFloat(formData.discountPrice) : null;
            const cp = formData.costPrice ? parseFloat(formData.costPrice) : null;
            
            const sellingPrice = dp !== null ? dp : bp;
            
            let discountAmt = 0;
            let discountPct = 0;
            if (dp !== null && bp > dp) {
              discountAmt = bp - dp;
              discountPct = ((discountAmt / bp) * 100).toFixed(1);
            }

            let profitAmt = 0;
            let profitMargin = 0;
            let isLoss = false;

            if (cp !== null && sellingPrice > 0) {
              profitAmt = sellingPrice - cp;
              isLoss = profitAmt < 0;
              profitMargin = ((profitAmt / sellingPrice) * 100).toFixed(1);
            }

            const hasError = dp !== null && bp < dp;

            return (
              <div style={{
                marginTop: '12px',
                padding: '16px',
                backgroundColor: hasError ? '#fef2f2' : '#f8fafc',
                borderRadius: '8px',
                border: hasError ? '1px solid #fecaca' : '1px solid #e2e8f0',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                {hasError && (
                  <div style={{ color: '#ef4444', fontWeight: '600', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <AlertCircle size={16} /> Discounted price cannot be greater than the original selling price.
                  </div>
                )}
                
                {cp !== null && dp !== null && dp < cp && !hasError && (
                  <div style={{ color: '#f59e0b', fontWeight: '600', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <AlertCircle size={16} /> Warning: This product will be sold at a loss.
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '0.875rem' }}>
                  <div>
                    <span style={{ color: '#64748b' }}>Discount: </span>
                    <span style={{ fontWeight: '600', color: discountAmt > 0 ? '#10b981' : '#0f172a' }}>
                      ₹{discountAmt.toFixed(2)} {discountPct > 0 && `(${discountPct}%)`}
                    </span>
                  </div>
                  
                  {cp !== null ? (
                    <div>
                      <span style={{ color: '#64748b' }}>Profit/Loss: </span>
                      <span style={{ fontWeight: '600', color: isLoss ? '#ef4444' : '#10b981' }}>
                        ₹{Math.abs(profitAmt).toFixed(2)} {isLoss ? '(Loss)' : '(Profit)'} | Margin: {profitMargin}%
                      </span>
                    </div>
                  ) : (
                    <div>
                      <span style={{ color: '#64748b' }}>Profit/Loss: </span>
                      <span style={{ color: '#94a3b8' }}>Enter Cost Price to calculate</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

        </div>

        {/* Cloudinary Image Upload Card */}
        <div style={{ padding: '24px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <ImageUploader
            images={images.map((url, idx) => ({ url, is_primary: idx === 0 }))}
            folder="products"
            multiple={true}
            maxFiles={10}
            label="Product Gallery Images (Cloudinary)"
            onChange={(updatedList) => {
              if (Array.isArray(updatedList)) {
                setImages(updatedList.map((img) => img.url));
              } else if (updatedList && updatedList.url) {
                setImages([updatedList.url]);
              } else {
                setImages([]);
              }
            }}
          />
        </div>

        {/* Variants & Stock Generator Card */}
        <div style={{ padding: '24px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '700', color: '#0f172a' }}>Variants & Stock Quantities</h3>

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
              style={{
                padding: '10px 16px',
                backgroundColor: '#2563eb',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '0.875rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Plus size={16} /> Add Variant
            </button>
          </div>

          {/* Variants List Table */}
          {variants.length > 0 && (
            <div style={{ marginTop: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', textAlign: 'left' }}>
                <thead style={{ backgroundColor: '#f8fafc' }}>
                  <tr>
                    <th style={{ padding: '10px 16px' }}>Size</th>
                    <th style={{ padding: '10px 16px' }}>Color</th>
                    <th style={{ padding: '10px 16px' }}>Stock Quantity</th>
                    <th style={{ padding: '10px 16px', textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {variants.map((v, idx) => {
                    const sizeObj = metadata.sizes.find((s) => s.id === v.sizeId);
                    const colorObj = metadata.colors.find((c) => c.id === v.colorId);
                    return (
                      <tr key={idx} style={{ borderTop: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '10px 16px', fontWeight: '600' }}>{sizeObj?.size_label || v.sizeId}</td>
                        <td style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: colorObj?.color_code || colorObj?.color_name?.toLowerCase().replace(' ', '') || '#ccc', border: '1px solid #ccc' }}></span>
                          {colorObj?.color_name || v.colorId}
                        </td>
                        <td style={{ padding: '10px 16px', fontWeight: '700', color: v.stockQuantity === 0 ? '#ef4444' : '#0f172a' }}>{v.stockQuantity}</td>
                        <td style={{ padding: '10px 16px', textAlign: 'right' }}>
                          <button type="button" onClick={() => removeVariant(idx)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Feature Flags */}
        <div style={{ padding: '24px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          <FormCheckbox
            id="isFeatured"
            label="Featured Product"
            checked={formData.isFeatured}
            onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
          />
          <FormCheckbox
            id="isBestseller"
            label="Best Seller"
            checked={formData.isBestseller}
            onChange={(e) => setFormData({ ...formData, isBestseller: e.target.checked })}
          />
          <FormCheckbox
            id="isNewArrival"
            label="New Arrival"
            checked={formData.isNewArrival}
            onChange={(e) => setFormData({ ...formData, isNewArrival: e.target.checked })}
          />
          <FormCheckbox
            id="isActive"
            label="Active / Visible in Storefront"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
          />
        </div>

        {/* Submit Actions */}
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end' }}>
          <Link to="/products" style={{ padding: '12px 24px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#fff', color: '#334155', textDecoration: 'none', fontWeight: '600' }}>
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              padding: '12px 32px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: 'hsl(215, 80%, 20%)',
              color: '#ffffff',
              fontWeight: '700',
              cursor: isSubmitting ? 'not-allowed' : 'pointer'
            }}
          >
            {isSubmitting ? 'Saving Product...' : 'Save Product'}
          </button>
        </div>

      </form>
    </div>
  );
};

export default AddProduct;
