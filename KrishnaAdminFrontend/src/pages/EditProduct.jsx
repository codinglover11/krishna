import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { adminService } from '../services/adminService';
import { toast } from '../stores/toastStore';
import { FormInput, FormSelect, FormTextarea, FormCheckbox } from '../components/common/FormComponents';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ImageUploader } from '../components/common/ImageUploader';
import { Upload, Plus, Trash2, ArrowLeft, AlertCircle } from 'lucide-react';

export const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [metadata, setMetadata] = useState({ sizes: [], colors: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [newSize, setNewSize] = useState('');
  const [newColorName, setNewColorName] = useState('');
  const [newColorCode, setNewColorCode] = useState('#000000');

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

  const [images, setImages] = useState([]);
  const [variants, setVariants] = useState([]);

  const [selectedSizeId, setSelectedSizeId] = useState('');
  const [selectedColorId, setSelectedColorId] = useState('');
  const [variantStock, setVariantStock] = useState('10');

  useEffect(() => {
    const loadProductData = async () => {
      try {
        const cats = await adminService.getCategories();
        setCategories(cats);
        const meta = await adminService.getMetadata();
        setMetadata(meta);

        if (meta.sizes.length > 0) setSelectedSizeId(meta.sizes[0].id);
        if (meta.colors.length > 0) setSelectedColorId(meta.colors[0].id);

        const prod = await adminService.getProductById(id);
        if (prod) {
          setFormData({
            name: prod.name,
            slug: prod.slug,
            sku: prod.sku,
            brand: prod.brand || 'Krishna Footwear',
            categoryId: prod.category_id || '',
            gender: prod.gender || '',
            ageGroup: prod.age_group || '',
            price: prod.price,
            discountPrice: prod.discount_price || '',
            costPrice: prod.cost_price || '',
            shortDescription: prod.short_description || '',
            description: prod.description || '',
            isFeatured: !!prod.is_featured,
            isBestseller: !!prod.is_bestseller,
            isNewArrival: prod.is_new_arrival !== false,
            isActive: prod.is_active !== false
          });

          if (Array.isArray(prod.images)) {
            setImages(prod.images.map((img) => ({ url: img.image_url, is_primary: img.is_primary, colorId: img.color_id })));
          }

          if (Array.isArray(prod.variants)) {
            setVariants(prod.variants.map((v) => ({
              sizeId: v.size_id,
              colorId: v.color_id,
              stockQuantity: v.stock_quantity
            })));
          }
        }
      } catch (err) {
        toast.error('Failed to load product details.');
      } finally {
        setIsLoading(false);
      }
    };

    loadProductData();
  }, [id]);

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
    if (!selectedSizeId || !selectedColorId) return;
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
    if (!formData.name || !formData.price || !formData.sku) {
      toast.warning('Product Name, Price, and SKU are required.');
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
        toast.warning('Selling Price cannot be greater than MRP (Base Price).');
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

      await adminService.updateProduct(id, payload);
      toast.success('Product updated successfully!');
      navigate('/products');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update product.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner label="Loading Product Data..." />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1000px' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Link to="/products" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--ink-soft)', textDecoration: 'none', fontWeight: '600', fontSize: '0.875rem' }}>
          <ArrowLeft size={16} /> Back to Products
        </Link>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--ink)', margin: 0, fontFamily: '"Rozha One", serif' }}>
          Edit Product: {formData.name}
        </h1>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Basic Info Card */}
        <div style={{ padding: '24px', backgroundColor: 'var(--card)', borderRadius: '12px', border: '1px solid var(--line)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '700', color: 'var(--ink)', fontFamily: '"Rozha One", serif' }}>Basic Information</h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <FormInput
              label="Product Name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <FormInput
              label="SKU Code"
              required
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <FormInput
              label="Slug"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            />
            <FormInput
              label="Brand Name"
              value={formData.brand}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
            <FormSelect
              label="Category"
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              options={categories
                .filter(c => ['men', 'women', 'kids', 'jutti'].includes(c.slug?.toLowerCase()))
                .map((c) => ({ value: c.id, label: c.name }))}
            />
          </div>

          <FormInput
            label="Short Description"
            value={formData.shortDescription}
            onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
          />

          <FormTextarea
            label="Detailed Description"
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        {/* Pricing Card */}
        <div style={{ padding: '24px', backgroundColor: 'var(--card)', borderRadius: '12px', border: '1px solid var(--line)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '700', color: 'var(--ink)', fontFamily: '"Rozha One", serif' }}>Pricing Details</h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <FormInput
              label="Base Price (₹)"
              type="number"
              step="0.01"
              required
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            />
            <FormInput
              label="Discounted Price (₹)"
              type="number"
              step="0.01"
              value={formData.discountPrice}
              onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
            />
            <FormInput
              label="Cost Price (₹)"
              type="number"
              step="0.01"
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
                    <AlertCircle size={16} /> Selling Price cannot be greater than MRP.
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

        {/* Images Card */}
        <div style={{ padding: '24px', backgroundColor: 'var(--card)', borderRadius: '12px', border: '1px solid var(--line)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <ImageUploader
            images={images}
            folder="products"
            multiple={true}
            maxFiles={10}
            colors={metadata.colors}
            label="Product Gallery Images (Cloudinary)"
            onChange={(updatedList) => {
              if (Array.isArray(updatedList)) {
                setImages(updatedList);
              } else if (updatedList) {
                setImages([updatedList]);
              } else {
                setImages([]);
              }
            }}
          />
        </div>

        {/* Variants Card */}
        <div style={{ padding: '24px', backgroundColor: 'var(--card)', borderRadius: '12px', border: '1px solid var(--line)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '700', color: 'var(--ink)', fontFamily: '"Rozha One", serif' }}>Manage Custom Attributes</h3>
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

          <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '700', color: 'var(--ink)', fontFamily: '"Rozha One", serif' }}>Variants & Stock Quantities</h3>

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
                    const sizeObj = metadata.sizes.find((s) => s.id === v.sizeId);
                    const colorObj = metadata.colors.find((c) => c.id === v.colorId);
                    return (
                      <tr key={idx} style={{ borderTop: '1px solid var(--line)' }}>
                        <td style={{ padding: '10px 16px', fontWeight: '600' }}>{sizeObj?.size_label || v.sizeId}</td>
                        <td style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: colorObj?.color_code || colorObj?.color_name?.toLowerCase().replace(' ', '') || '#ccc', border: '1px solid #ccc' }}></span>
                          {colorObj?.color_name || v.colorId}
                        </td>
                        <td style={{ padding: '10px 16px', fontWeight: '700', color: v.stockQuantity === 0 ? 'var(--rose)' : 'var(--ink)' }}>{v.stockQuantity}</td>
                        <td style={{ padding: '10px 16px', textAlign: 'right' }}>
                          <button type="button" onClick={() => removeVariant(idx)} style={{ background: 'none', border: 'none', color: 'var(--rose)', cursor: 'pointer' }}>
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
        <div style={{ padding: '24px', backgroundColor: 'var(--card)', borderRadius: '12px', border: '1px solid var(--line)', display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
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
          <Link to="/products" style={{ padding: '12px 24px', borderRadius: '8px', border: '1px solid var(--line)', backgroundColor: 'var(--card)', color: 'var(--ink-soft)', textDecoration: 'none', fontWeight: '600' }}>
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              padding: '12px 32px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: 'var(--chestnut)',
              color: 'var(--parchment)',
              fontWeight: '700',
              cursor: isSubmitting ? 'not-allowed' : 'pointer'
            }}
          >
            {isSubmitting ? 'Updating Product...' : 'Update Product'}
          </button>
        </div>

      </form>
    </div>
  );
};

export default EditProduct;
