import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Heart, Trash2, ShoppingCart, Eye } from 'lucide-react';
import { useWishlistStore } from '../stores/wishlistStore';
import productService from '../services/productService';
import { toast } from '../stores/toastStore';
import { EmptyState } from '../components/common/EmptyState';
import { SkeletonGrid } from '../components/common/SkeletonCard';

export const Wishlist = () => {
  const navigate = useNavigate();
  const { items, isLoading, fetchWishlist, toggleWishlist, moveToCart } = useWishlistStore();

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleMoveToCart = (item) => {
    navigate(item.slug ? `/products/${item.slug}` : `/products/${item.product_id}`);
  };

  if (isLoading && items.length === 0) {
    return (
      <div style={{ maxWidth: '1200px', margin: '48px auto', padding: '0 24px', display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
        <div className="skeleton" style={{ width: '160px', height: '36px' }}></div>
        <SkeletonGrid count={4} />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px', width: '100%', textAlign: 'left' }}>
      
      {/* Breadcrumb */}
      <nav style={{ display: 'flex', gap: '8px', fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
        <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>Home</Link>
        <span>/</span>
        <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>Wishlist</span>
      </nav>

      <h1 style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--primary-color)', marginBottom: '32px' }}>
        My Wishlist ({items.length})
      </h1>

      {items.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Your Wishlist is Empty"
          description="Bookmark shoes and boots you like to easily access or buy them later."
          actionLabel="Explore Footwear"
          onAction={() => navigate('/products')}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '32px' }}>
          {items.map((item) => {
            const price = parseFloat(item.price);
            const discountPrice = item.discount_price ? parseFloat(item.discount_price) : null;
            const hasDiscount = discountPrice !== null && discountPrice < price;

            return (
              <div
                key={item.wishlist_item_id}
                className="hover-lift"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  position: 'relative'
                }}
              >
                {/* Remove from Wishlist Button */}
                <button
                  onClick={() => toggleWishlist(item.product_id)}
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    padding: '8px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    cursor: 'pointer',
                    color: 'var(--error)',
                    display: 'flex',
                    boxShadow: 'var(--shadow-sm)',
                    zIndex: 10
                  }}
                  title="Remove from Wishlist"
                >
                  <Trash2 size={16} />
                </button>

                {/* Product Image Area */}
                <div className="img-zoom-container" style={{
                  height: '220px',
                  backgroundColor: 'var(--bg-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden'
                }}>
                  {item.primary_image ? (
                    <img src={item.primary_image} alt={item.product_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>No image</span>
                  )}
                </div>

                {/* Product Details Info */}
                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>
                    {item.brand || 'Krishna Footwear'}
                  </span>
                  <h3 style={{
                    fontSize: '1.0625rem',
                    fontWeight: '600',
                    margin: 0,
                    color: 'var(--text-primary)',
                    lineHeight: '1.3',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical'
                  }}>
                    {item.product_name}
                  </h3>

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'baseline', marginTop: '4px' }}>
                    {hasDiscount ? (
                      <>
                        <span style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--secondary-color)' }}>
                          ${discountPrice.toFixed(2)}
                        </span>
                        <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                          ${price.toFixed(2)}
                        </span>
                      </>
                    ) : (
                      <span style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--primary-color)' }}>
                        ${price.toFixed(2)}
                      </span>
                    )}
                  </div>

                  <div style={{ marginTop: '4px', fontSize: '0.8125rem', fontWeight: '600', color: item.is_in_stock ? 'var(--success)' : 'var(--error)' }}>
                    {item.is_in_stock ? 'In Stock' : 'Out of Stock'}
                  </div>

                  {/* Actions Grid */}
                  <div style={{ display: 'flex', gap: '10px', marginTop: 'auto', paddingTop: '16px' }}>
                    <button
                      disabled={!item.is_in_stock}
                      onClick={() => handleMoveToCart(item)}
                      className="btn btn-primary"
                      style={{
                        flex: 1,
                        padding: '10px',
                        fontSize: '0.875rem',
                        display: 'flex',
                        gap: '6px',
                        justifyContent: 'center',
                        alignItems: 'center',
                        cursor: !item.is_in_stock ? 'not-allowed' : 'pointer',
                        opacity: !item.is_in_stock ? 0.6 : 1
                      }}
                    >
                      <ShoppingCart size={16} /> Move to Cart
                    </button>
                    <button
                      onClick={() => navigate(item.slug ? `/products/${item.slug}` : `/products/${item.product_id}`)}
                      className="btn btn-outline"
                      style={{ padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      title="View Product"
                    >
                      <Eye size={16} />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
