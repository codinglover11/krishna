import React, { useRef } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ArrowRight, Loader2 } from 'lucide-react';
import productService from '../../services/productService';
import ProductCard from '../product/ProductCard';

const CategoryCarouselRow = ({ category }) => {
  const navigate = useNavigate();
  const scrollRef = useRef(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError
  } = useInfiniteQuery({
    queryKey: ['products', 'category', category.id],
    queryFn: ({ pageParam = 1 }) => 
      productService.getProducts({ categoryId: category.id, page: pageParam, limit: 10 }),
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.page < lastPage.pagination.totalPages) {
        return lastPage.pagination.page + 1;
      }
      return undefined;
    },
  });

  const products = data ? data.pages.flatMap((page) => page.products) : [];

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      // If we are close to the right edge (within 100px), fetch more
      if (scrollLeft + clientWidth >= scrollWidth - 100) {
        if (hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      }
    }
  };

  if (isLoading || isError) return null;
  if (products.length === 0) return null;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '32px', alignItems: 'stretch' }} className="category-carousel-row">
      
      {/* Left Side: Category Card */}
      <div 
        onClick={() => navigate(`/products?category=${category.id}`)}
        style={{
          backgroundColor: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
          padding: '32px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: '16px',
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden',
          minHeight: '400px'
        }}
        className="category-hero-card"
      >
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, opacity: 0.05, backgroundImage: `url(${category.image_url || ''})`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
        <div style={{ zIndex: 1, position: 'relative' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--primary-color)', margin: '0 0 12px 0', lineHeight: 1.2 }}>{category.name}</h2>
          <p style={{ color: 'var(--text-secondary)', margin: '0 0 24px 0', lineHeight: 1.6 }}>{category.description || `Explore our latest collection of ${category.name}.`}</p>
          <button 
            style={{ 
              background: 'transparent', 
              border: 'none', 
              color: 'var(--secondary-color)', 
              fontWeight: '700', 
              fontSize: '1rem',
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px',
              padding: 0,
              cursor: 'pointer'
            }}
          >
            Explore All <ArrowRight size={18} />
          </button>
        </div>
      </div>

      {/* Right Side: Horizontal Product Slider */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        
        <div 
          ref={scrollRef}
          onScroll={handleScroll}
          style={{ 
            display: 'flex', 
            gap: '24px', 
            overflowX: 'auto', 
            paddingBottom: '24px', // Space for scrollbar
            scrollSnapType: 'x mandatory',
            scrollBehavior: 'smooth',
            width: '100%'
          }}
          className="hide-scrollbar"
        >
          {products.map((product) => (
            <div key={product.id} style={{ minWidth: '280px', maxWidth: '280px', scrollSnapAlign: 'start', flexShrink: 0 }}>
              <ProductCard product={product} />
            </div>
          ))}

          {/* Loading Indicator or End Card */}
          {hasNextPage && (
            <div style={{ minWidth: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {isFetchingNextPage ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', color: 'var(--text-muted)' }}>
                  <Loader2 size={32} className="spinner" />
                  <span>Loading more...</span>
                </div>
              ) : (
                <button 
                  onClick={() => fetchNextPage()}
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--bg-muted)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: 'var(--text-secondary)'
                  }}
                  title="Load More"
                >
                  <ChevronRight size={32} />
                </button>
              )}
            </div>
          )}
          
          {!hasNextPage && products.length > 3 && (
            <div style={{ minWidth: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🎉</div>
                <h4 style={{ margin: 0, fontWeight: '600' }}>You've reached the end!</h4>
                <p style={{ margin: '8px 0 0 0', fontSize: '0.875rem' }}>No more {category.name} available right now.</p>
              </div>
            </div>
          )}
        </div>

        {/* Floating Right Arrow Overlay (Optional, but good for UX if not on touch) */}
        {hasNextPage && (
          <button
            onClick={() => {
              scrollRight();
              if (!isFetchingNextPage) fetchNextPage();
            }}
            style={{
              position: 'absolute',
              right: '-16px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 10,
              color: 'var(--primary-color)'
            }}
            className="carousel-next-btn"
          >
            <ChevronRight size={24} />
          </button>
        )}
      </div>
      
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          height: 8px;
        }
        .hide-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .hide-scrollbar::-webkit-scrollbar-thumb {
          background-color: var(--border-color);
          border-radius: 4px;
        }
        .category-hero-card:hover {
          border-color: var(--primary-color);
          box-shadow: 0 10px 25px rgba(0,0,0,0.05);
          transform: translateY(-2px);
          transition: all 0.3s ease;
        }
        @media (max-width: 900px) {
          .category-carousel-row {
            grid-template-columns: 1fr !important;
          }
          .category-hero-card {
            min-height: auto !important;
            padding: 24px !important;
          }
          .carousel-next-btn {
            display: none !important;
          }
        }
        .spinner {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default CategoryCarouselRow;
