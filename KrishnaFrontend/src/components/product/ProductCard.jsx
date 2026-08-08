import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, X } from 'lucide-react';
import { useAuthAction } from '../../hooks/useAuthAction';
import { useWishlistStore } from '../../stores/wishlistStore';
import { useCartStore } from '../../stores/cartStore';

export const ProductCard = ({ product, feature = false }) => {
  const navigate = useNavigate();
  const runWithAuth = useAuthAction();
  const [quickViewOpen, setQuickViewOpen] = useState(false);

  const wishlistItems = useWishlistStore((state) => state.items);
  const isWishlisted = wishlistItems.some((item) => item.product_id === product.id);

  const price = parseFloat(product.price) || 0;
  const discountPrice = product.discount_price ? parseFloat(product.discount_price) : null;
  const hasDiscount = discountPrice !== null && discountPrice > 0;

  const handleWishlist = (e) => {
    e.stopPropagation();
    e.preventDefault();
    runWithAuth(async () => {
      const { toggleWishlist } = useWishlistStore.getState();
      await toggleWishlist(product.id);
    });
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (product.variants && product.variants.length > 0) {
      const selectedSize = product.variants[0].size_label;
      const selectedColor = product.variants[0].color_name;
      navigate('/direct-checkout', { state: { product, selectedSize, selectedColor } });
    } else {
      if (product.slug) {
        navigate(`/products/${product.slug}`);
      } else {
        navigate(`/products/${product.id}`);
      }
    }
  };

  const handleCardClick = () => {
    if (product.slug) {
      navigate(`/products/${product.slug}`);
    } else {
      navigate(`/products/${product.id}`);
    }
  };

  // Determine Tag (Sale, New, Bestseller - simulated or from API)
  let tag = null;
  if (hasDiscount) {
    tag = <span className="tag sale">Sale</span>;
  } else if (product.is_new) {
    tag = <span className="tag new">New</span>;
  } else if (product.is_bestseller) {
    tag = <span className="tag best">Bestseller</span>;
  }

  const imageUrl = product.primary_image || (product.images && product.images[0]?.image_url);

  return (
    <>
      <div className={`product-card ${feature ? 'feature' : ''}`} onClick={handleCardClick} style={{ cursor: 'pointer' }}>
        {tag}
        <button 
          className={`wish-btn ${isWishlisted ? 'active' : ''}`} 
          onClick={handleWishlist}
          title={isWishlisted ? "Remove from Wishlist" : "Save to Wishlist"}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="#221B15" strokeWidth="2">
            <path d="M12 21s-7.5-4.6-10-9C.4 8.4 2 4 6 4c2.2 0 3.7 1.2 6 4 2.3-2.8 3.8-4 6-4 4 0 5.6 4.4 4 8-2.5 4.4-10 9-10 9Z"/>
          </svg>
        </button>
        
        <div className="thumb-wrap">
          {imageUrl ? (
            <img src={imageUrl} alt={product.name} />
          ) : (
            <span style={{ color: 'var(--text-muted)' }}>No image</span>
          )}
          <button className="quick-add" onClick={handleAddToCart}>+ Quick Add</button>
        </div>
        
        <div className="p-meta">
          <h4>{product.name}</h4>
          <p className="desc">{product.category_name || product.brand || 'Premium Footwear'}</p>
          <p className="price">
            {hasDiscount ? (
              <>
                <span style={{ color: 'var(--bottle)', marginRight: '6px' }}>₹{discountPrice.toLocaleString('en-IN')}</span>
                <s style={{ color: 'var(--ink-soft)', fontSize: '0.85em', fontWeight: '500' }}>₹{price.toLocaleString('en-IN')}</s>
              </>
            ) : (
              <span>₹{price.toLocaleString('en-IN')}</span>
            )}
          </p>
        </div>
      </div>

      {/* Quick View Modal Overlay - Retained functionality from previous design */}
      {quickViewOpen && (
        <div className="modal-overlay" onClick={(e) => { e.stopPropagation(); setQuickViewOpen(false); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px', display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setQuickViewOpen(false)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
            >
              <X size={20} />
            </button>
            <div style={{ flex: '1 1 240px', height: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {imageUrl ? (
                 <img src={imageUrl} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              ) : (
                 <span>No Image</span>
              )}
            </div>
            <div style={{ flex: '1 1 280px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
               <h3 style={{ fontSize: '1.5rem', fontWeight: '700' }}>{product.name}</h3>
               <p style={{ fontSize: '1.25rem' }}>₹{hasDiscount ? discountPrice : price}</p>
               <button onClick={handleAddToCart} className="btn btn-primary" style={{ width: '100%' }}>Add to Cart</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductCard;
