import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ShoppingCart, Heart, ArrowLeft, Star, ShieldCheck, RefreshCw } from 'lucide-react';
import productService from '../services/productService';
import { useAuthAction } from '../hooks/useAuthAction';
import { useWishlistStore } from '../stores/wishlistStore';
import { toast } from '../stores/toastStore';
import api from '../services/api';
import ProductCard from '../components/product/ProductCard';
import { useOrderModalStore } from '../stores/orderModalStore';

export const ProductDetail = () => {
  const { id: paramId } = useParams();
  const navigate = useNavigate();
  const runWithAuth = useAuthAction();
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Checks if param is UUID format
  const isUuid = (val) => /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(val);

  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');

  // Fetch product detail using React Query
  const { data: product, isLoading, error, refetch: refetchProduct } = useQuery({
    queryKey: ['product', paramId],
    queryFn: () => isUuid(paramId) ? productService.getProductById(paramId) : productService.getProductBySlug(paramId),
    retry: false
  });

  // Fetch product reviews
  const { data: reviews = [], refetch: refetchReviews } = useQuery({
    queryKey: ['reviews', product?.id],
    queryFn: async () => {
      const res = await api.get(`/reviews?productId=${product.id}`);
      return res.data.data;
    },
    enabled: !!product?.id
  });

  // Fetch related products
  const { data: relatedProducts } = useQuery({
    queryKey: ['relatedProducts', product?.id],
    queryFn: () => productService.getRelatedProducts(product.id, 4),
    enabled: !!product?.id,
    retry: false
  });

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    runWithAuth(async () => {
      try {
        await api.post('/reviews', { productId: product.id, rating: newRating, comment: newComment });
        toast.success('Thank you! Your product review has been posted.');
        setNewComment('');
        refetchReviews();
        refetchProduct();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to submit review.');
      }
    });
  };

  const wishlistItems = useWishlistStore((state) => state.items);
  const isWishlisted = product?.id ? wishlistItems.some((item) => item.product_id === product.id) : false;

  const handleAddToCart = () => {
    const { openModal } = useOrderModalStore.getState();
    openModal(product.name);
  };

  const handleBuyNow = () => {
    const { openModal } = useOrderModalStore.getState();
    openModal(product.name);
  };

  const handleAddWishlist = () => {
    runWithAuth(async () => {
      const { toggleWishlist } = useWishlistStore.getState();
      await toggleWishlist(product.id);
    });
  };

  if (isLoading) {
    return (
      <div style={{ maxWidth: '1200px', margin: '48px auto', padding: '0 24px', display: 'flex', flexDirection: 'column', gap: '32px', width: '100%' }}>
        <div className="skeleton" style={{ width: '80px', height: '32px' }}></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '48px' }}>
          <div className="skeleton" style={{ height: '400px' }}></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="skeleton" style={{ width: '70%', height: '36px' }}></div>
            <div className="skeleton" style={{ width: '40%', height: '24px' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div style={{ maxWidth: '600px', margin: '80px auto', padding: '24px', textAlign: 'center', backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
        <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: 'var(--error)', marginBottom: '12px' }}>Product Not Found</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
          The product ID or SEO slug may be invalid or connection has not been completed.
        </p>
        <button onClick={() => navigate('/products')} className="btn btn-primary">
          Back to Catalogue
        </button>
      </div>
    );
  }

  // Extract unique sizes and colors from variants list
  const sizes = [...new Set(product.variants.map((v) => v.size_label))];
  const colors = [...new Set(product.variants.map((v) => v.color_name))];

  // Determine stock quantity for active configuration
  const activeVariant = product.variants.find(
    (v) => v.size_label === selectedSize && v.color_name === selectedColor
  );
  const stockAvailable = activeVariant ? activeVariant.stock_quantity : null;

  const price = parseFloat(product.price);
  const discountPrice = product.discount_price ? parseFloat(product.discount_price) : null;
  const hasDiscount = discountPrice !== null && discountPrice < price;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px', width: '100%' }}>
      
      {/* Breadcrumb */}
      <nav style={{ display: 'flex', gap: '8px', fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
        <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>Home</Link>
        <span>/</span>
        <Link to="/products" style={{ color: 'inherit', textDecoration: 'none' }}>Catalog</Link>
        <span>/</span>
        <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>{product.name}</span>
      </nav>

      {/* Back Link */}
      <button
        onClick={() => navigate(-1)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'transparent',
          border: 'none',
          color: 'var(--text-secondary)',
          cursor: 'pointer',
          marginBottom: '32px',
          fontSize: '1rem',
          padding: 0
        }}
      >
        <ArrowLeft size={16} /> Back to Browse
      </button>

      {/* Detail Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '64px', alignItems: 'start' }}>
        
        {/* Left: Image Gallery */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{
            backgroundColor: 'var(--bg-muted)',
            borderRadius: 'var(--radius-lg)',
            height: '420px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            border: '1px solid var(--border-color)'
          }}>
            {product.images && product.images[activeImageIndex] ? (
              <img
                src={product.images[activeImageIndex].image_url}
                alt={product.name}
                style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '24px' }}
              />
            ) : (
              <span style={{ color: 'var(--text-muted)' }}>No image</span>
            )}
          </div>

          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {product.images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImageIndex(i)}
                  style={{
                    width: '72px',
                    height: '72px',
                    borderRadius: 'var(--radius-md)',
                    border: activeImageIndex === i ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    padding: 0
                  }}
                >
                  <img src={img.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '4px' }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Info Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', textAlign: 'left' }}>
          
          {/* Header */}
          <div>
            <span style={{ fontSize: '0.875rem', color: 'var(--secondary-color)', fontWeight: '600', textTransform: 'uppercase' }}>
              {product.brand || 'Krishna Footwear'}
            </span>
            <h1 style={{ fontSize: '2.25rem', fontWeight: '700', color: 'var(--primary-color)', margin: '4px 0 12px' }}>
              {product.name}
            </h1>
            
            {/* Reviews Summary */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', color: 'var(--secondary-color)' }}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill={i < Math.round(product.average_rating || 4.5) ? 'currentColor' : 'none'} />
                ))}
              </div>
              <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>{product.average_rating || 4.5}</span>
              <span style={{ color: 'var(--text-muted)' }}>|</span>
              <span style={{ color: 'var(--text-secondary)' }}>{product.reviews_count || 0} Verified Reviews</span>
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: 0 }} />

          {/* Pricing */}
          <div>
            {hasDiscount ? (
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
                <span style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--secondary-color)' }}>
                  ${discountPrice.toFixed(2)}
                </span>
                <span style={{ fontSize: '1.25rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                  ${price.toFixed(2)}
                </span>
              </div>
            ) : (
              <span style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--primary-color)' }}>
                ${price.toFixed(2)}
              </span>
            )}
            <div style={{ marginTop: '8px' }}>
              {stockAvailable !== null ? (
                <span style={{ fontSize: '0.875rem', fontWeight: '600', color: stockAvailable > 0 ? 'var(--success)' : 'var(--error)' }}>
                  {stockAvailable > 0 ? `In Stock (${stockAvailable} available)` : 'Out of Stock'}
                </span>
              ) : (
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Select Size & Color to check availability</span>
              )}
            </div>
          </div>

          {/* Color Selector */}
          {colors.length > 0 && (
            <div>
              <h4 style={{ fontWeight: '600', marginBottom: '12px', fontSize: '1rem' }}>Available Colors</h4>
              <div style={{ display: 'flex', gap: '12px' }}>
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => { setSelectedColor(color); setSelectedSize(''); }}
                    style={{
                      padding: '10px 16px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid',
                      borderColor: selectedColor === color ? 'var(--primary-color)' : 'var(--border-color)',
                      backgroundColor: selectedColor === color ? 'var(--primary-color)' : 'transparent',
                      color: selectedColor === color ? 'var(--text-light)' : 'var(--text-primary)',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <span style={{
                      display: 'inline-block',
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      backgroundColor: color.toLowerCase().replace(' ', ''),
                      border: '1px solid var(--border-color)'
                    }}></span>
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size Selector */}
          {sizes.length > 0 && (
            <div>
              <h4 style={{ fontWeight: '600', marginBottom: '12px', fontSize: '1rem' }}>Select Size (UK)</h4>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    style={{
                      padding: '10px 16px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid',
                      borderColor: selectedSize === size ? 'var(--primary-color)' : 'var(--border-color)',
                      backgroundColor: selectedSize === size ? 'var(--primary-color)' : 'transparent',
                      color: selectedSize === size ? 'var(--text-light)' : 'var(--text-primary)',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '12px' }}>
            <button
              onClick={handleAddToCart}
              className="btn btn-outline"
              style={{ flex: 1, minWidth: '180px', display: 'flex', gap: '8px', padding: '16px' }}
            >
              <ShoppingCart size={20} /> Add to Cart
            </button>
            <button
              onClick={handleBuyNow}
              className="btn btn-secondary"
              style={{ flex: 1, minWidth: '180px', display: 'flex', gap: '8px', padding: '16px' }}
            >
              Buy Now
            </button>
            <button
              onClick={handleAddWishlist}
              style={{
                padding: '16px',
                border: '1px solid',
                borderColor: isWishlisted ? 'var(--error)' : 'var(--border-color)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                color: isWishlisted ? 'var(--error)' : 'var(--text-secondary)'
              }}
              title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
            >
              <Heart size={20} fill={isWishlisted ? 'currentColor' : 'none'} />
            </button>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: 0 }} />

          {/* Description & Specs */}
          <div>
            <h4 style={{ fontWeight: '600', marginBottom: '8px', fontSize: '1.0625rem' }}>Product Description</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', lineHeight: '1.6' }}>
              {product.description || 'Premium comfort cushioning and authentic stitch design.'}
            </p>
          </div>

        </div>

      </div>

      {/* Customer Reviews Section */}
      <section style={{ marginTop: '64px', textAlign: 'left' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--primary-color)', marginBottom: '24px' }}>
          Customer Reviews ({reviews.length})
        </h2>

        {/* Submit Review Form */}
        <form onSubmit={handleReviewSubmit} style={{ backgroundColor: 'var(--bg-card)', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginBottom: '32px' }}>
          <h4 style={{ fontWeight: '600', marginBottom: '16px' }}>Write a Customer Review</h4>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '16px' }}>
            <label style={{ fontWeight: '500', fontSize: '0.875rem' }}>Rating:</label>
            <div style={{ display: 'flex', gap: '4px' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setNewRating(star)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: star <= newRating ? 'var(--secondary-color)' : 'var(--border-color)' }}
                >
                  <Star size={24} fill={star <= newRating ? 'currentColor' : 'none'} />
                </button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: '16px' }}>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share details of your experience with this footwear product..."
              rows={3}
              required
              style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)', fontFamily: 'inherit' }}
            />
          </div>
          <button type="submit" className="btn btn-primary">Submit Review</button>
        </form>

        {/* Review List */}
        {reviews.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No reviews yet. Be the first to review this product!</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {reviews.map((rev) => (
              <div key={rev.id} style={{ padding: '20px', backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ fontWeight: '600', color: 'var(--primary-color)' }}>{rev.customer_name || 'Customer'}</div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{new Date(rev.created_at).toLocaleDateString()}</div>
                </div>
                <div style={{ display: 'flex', color: 'var(--secondary-color)', marginBottom: '8px' }}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill={i < rev.rating ? 'currentColor' : 'none'} />
                  ))}
                </div>
                <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.9375rem' }}>{rev.comment}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Related Products Section */}
      {relatedProducts && relatedProducts.length > 0 && (
        <section style={{ marginTop: '80px', textAlign: 'left' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--primary-color)', marginBottom: '32px' }}>
            Related Products
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '32px' }}>
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

    </div>
  );
};

export default ProductDetail;
