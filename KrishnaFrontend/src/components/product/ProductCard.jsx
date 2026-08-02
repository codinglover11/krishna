import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, Eye, Star, X } from 'lucide-react';
import { useAuthAction } from '../../hooks/useAuthAction';
import { toast } from '../../stores/toastStore';
import api from '../../services/api';
import { useCartStore } from '../../stores/cartStore';
import { useWishlistStore } from '../../stores/wishlistStore';
import productService from '../../services/productService';
import { useOrderModalStore } from '../../stores/orderModalStore';

export const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const runWithAuth = useAuthAction();
  const [quickViewOpen, setQuickViewOpen] = useState(false);

  const wishlistItems = useWishlistStore((state) => state.items);
  const isWishlisted = wishlistItems.some((item) => item.product_id === product.id);

  const price = parseFloat(product.price);
  const discountPrice = product.discount_price ? parseFloat(product.discount_price) : null;
  const hasDiscount = discountPrice !== null && discountPrice < price;
  const discountPercentage = hasDiscount ? Math.round(((price - discountPrice) / price) * 100) : 0;

  const handleWishlist = (e) => {
    e.stopPropagation();
    runWithAuth(async () => {
      const { toggleWishlist } = useWishlistStore.getState();
      await toggleWishlist(product.id);
    });
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    const { openModal } = useOrderModalStore.getState();
    openModal(product);
  };

  const handleCardClick = () => {
    // Navigate via SEO-friendly slug if present, otherwise ID
    if (product.slug) {
      navigate(`/products/${product.slug}`);
    } else {
      navigate(`/products/${product.id}`);
    }
  };

  return (
    <>
      <div
        className="hover-lift"
        onClick={handleCardClick}
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          overflow: 'hidden',
          cursor: 'pointer',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          textAlign: 'left',
          transition: 'box-shadow 0.2s',
          fontFamily: 'Arial, sans-serif'
        }}
      >
        {/* Product Image Area */}
        <div className="img-zoom-container" style={{
          height: '240px',
          backgroundColor: '#f8f9fa',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {product.primary_image || (product.images && product.images[0]?.image_url) ? (
            <img
              src={product.primary_image || product.images[0].image_url}
              alt={product.name}
              loading="lazy"
              decoding="async"
              style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '16px' }}
            />
          ) : (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No image available</div>
          )}

          {/* Action Overlay Icons (Quick view, Wishlist) */}
          <div style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            zIndex: 20
          }}>
            <button
              onClick={handleWishlist}
              style={{
                padding: '6px',
                borderRadius: '50%',
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                cursor: 'pointer',
                color: isWishlisted ? '#ef4444' : '#6b7280',
                display: 'flex',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
              }}
              title={isWishlisted ? "Remove from Wishlist" : "Save to Wishlist"}
            >
              <Heart size={18} fill={isWishlisted ? 'currentColor' : 'none'} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setQuickViewOpen(true); }}
              style={{
                padding: '6px',
                borderRadius: '50%',
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                cursor: 'pointer',
                color: '#6b7280',
                display: 'flex',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
              }}
              title="Quick View"
            >
              <Eye size={18} />
            </button>
          </div>
        </div>

        {/* Product Info Area */}
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
          
          {/* Colors variant count (mocked if not available) */}
          <span style={{ fontSize: '0.8125rem', color: '#007185', fontWeight: '500', marginBottom: '2px' }}>
             {product.variants && product.variants.length > 1 ? `+${product.variants.length} other variants` : '+ colors/patterns'}
          </span>

          <span style={{ fontSize: '0.75rem', color: '#565959', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {product.brand || 'KRISHNA FOOTWEAR'}
          </span>
          
          <h3 style={{
            fontSize: '1rem',
            fontWeight: '400',
            margin: '2px 0 4px 0',
            color: '#0f1111',
            lineHeight: '1.4',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical'
          }}>
            {product.name}
          </h3>

          {/* Rating */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8125rem', marginBottom: '4px' }}>
            <span style={{ color: '#0f1111', fontWeight: '500' }}>
              {(product.average_rating != null ? parseFloat(product.average_rating) : 4.1).toFixed(1)}
            </span>
            <div style={{ display: 'flex', color: '#de7921' }}>
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={14} fill={i < Math.round(product.average_rating != null ? parseFloat(product.average_rating) : 4.1) ? 'currentColor' : 'none'} />
              ))}
            </div>
            <span style={{ color: '#007185' }}>({product.reviews_count || Math.floor(Math.random() * 1000) + 10})</span>
          </div>

          {/* Price */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '0.8125rem', color: '#0f1111', marginTop: '2px' }}>₹</span>
              <span style={{ fontSize: '1.5rem', fontWeight: '600', color: '#0f1111' }}>
                {hasDiscount ? discountPrice.toLocaleString('en-IN') : price.toLocaleString('en-IN')}
              </span>
            </div>
            {hasDiscount && (
              <span style={{ fontSize: '0.8125rem', color: '#565959' }}>
                M.R.P: <span style={{ textDecoration: 'line-through' }}>₹{price.toLocaleString('en-IN')}</span> <span style={{ color: '#000000' }}>({discountPercentage}% off)</span>
              </span>
            )}
          </div>
          
          {/* Mock delivery text */}
          <div style={{ fontSize: '0.8125rem', color: '#0f1111', marginTop: '4px' }}>
            FREE delivery <strong>Tomorrow</strong>
          </div>

          {/* Add to cart button */}
          <div style={{ marginTop: 'auto', paddingTop: '16px' }}>
            <button
              onClick={handleAddToCart}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '50px',
                backgroundColor: '#ffd814',
                border: '1px solid #fcd200',
                color: '#0f1111',
                fontWeight: '400',
                fontSize: '0.875rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f7ca00'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ffd814'}
            >
              Add to cart
            </button>
          </div>
        </div>
      </div>

      {/* Quick View Modal Overlay */}
      {quickViewOpen && (
        <div className="modal-overlay" onClick={() => setQuickViewOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px', display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setQuickViewOpen(false)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
            >
              <X size={20} />
            </button>

            {/* Quick Image */}
            <div style={{ flex: '1 1 240px', height: '280px', backgroundColor: 'var(--bg-muted)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {product.primary_image || (product.images && product.images[0]?.image_url) ? (
                <img
                  src={product.primary_image || product.images[0].image_url}
                  alt={product.name}
                  style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '24px', borderRadius: 'var(--radius-md)' }}
                />
              ) : (
                <span style={{ color: 'var(--text-muted)' }}>No image</span>
              )}
            </div>

            {/* Quick Info */}
            <div style={{ flex: '1 1 280px', display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--secondary-color)', fontWeight: '600' }}>
                  {product.category_name || 'Footwear'}
                </span>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '700', margin: '4px 0 8px', color: 'var(--primary-color)' }}>
                  {product.name}
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                  {product.description || 'Premium comfort cushioning and authentic stitch design.'}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'baseline' }}>
                {hasDiscount ? (
                  <>
                    <span style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--secondary-color)' }}>
                      ₹{discountPrice.toLocaleString('en-IN')}
                    </span>
                    <span style={{ fontSize: '1rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                      ₹{price.toLocaleString('en-IN')}
                    </span>
                  </>
                ) : (
                  <span style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--primary-color)' }}>
                    ₹{price.toLocaleString('en-IN')}
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: 'auto' }}>
                <button onClick={handleAddToCart} className="btn btn-primary" style={{ flex: 1, padding: '12px' }}>
                  Add to Cart
                </button>
                <button onClick={handleWishlist} className="btn btn-outline" style={{ padding: '12px', color: isWishlisted ? 'var(--error)' : 'inherit', borderColor: isWishlisted ? 'var(--error)' : 'inherit' }} title={isWishlisted ? "Remove from Wishlist" : "Save to Wishlist"}>
                  <Heart size={18} fill={isWishlisted ? 'currentColor' : 'none'} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductCard;
