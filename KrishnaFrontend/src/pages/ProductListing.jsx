import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { Filter, RotateCcw, ChevronLeft, ChevronRight, PackageX } from 'lucide-react';
import productService from '../services/productService';
import ProductCard from '../components/product/ProductCard';
import { SkeletonGrid } from '../components/common/SkeletonCard';
import { EmptyState } from '../components/common/EmptyState';

export const ProductListing = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCategory = searchParams.get('category') || '';
  const selectedGender = searchParams.get('gender') || '';
  const selectedAgeGroup = searchParams.get('ageGroup') || '';
  
  const [sortOrder, setSortOrder] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [page, setPage] = useState(1);
  const limit = 9;

  // Fetch product list using react-query
  const { data, isLoading, error } = useQuery({
    queryKey: ['products', selectedCategory, selectedGender, selectedAgeGroup, sortOrder, minPrice, maxPrice, page],
    queryFn: () => productService.getProducts({
      category: selectedCategory,
      gender: selectedGender,
      ageGroup: selectedAgeGroup,
      sort: sortOrder,
      minPrice,
      maxPrice,
      page,
      limit
    }),
    retry: false
  });

  // Fetch categories list
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => productService.getCategories(),
    retry: false
  });

  const products = data?.products || [];
  const pagination = data?.pagination || { total: 0, totalPages: 1 };

  const handleResetFilters = () => {
    setSearchParams({});
    setSortOrder('');
    setMinPrice('');
    setMaxPrice('');
    setPage(1);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px', width: '100%' }}>
      
      {/* Breadcrumb */}
      <nav style={{ display: 'flex', gap: '8px', fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
        <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>Home</Link>
        <span>/</span>
        <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>Catalog</span>
      </nav>

      <h1 style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--primary-color)', marginBottom: '8px', textAlign: 'left' }}>
        Catalogue Collection
      </h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '40px', textAlign: 'left' }}>
        Browse our catalog of premium boots, lifestyle sneakers, and formal business shoes.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '40px', alignItems: 'start' }} className="listing-grid">
        
        {/* Sidebar Filters */}
        <aside style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Filter size={18} /> Filters
            </span>
            <button
              onClick={handleResetFilters}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-secondary)',
                fontSize: '0.875rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <RotateCcw size={14} /> Clear
            </button>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: 0 }} />

          {/* Category Filter */}
          <div>
            <h4 style={{ fontWeight: '600', marginBottom: '12px', fontSize: '0.9375rem', textAlign: 'left' }}>Category</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="category"
                  checked={selectedCategory === ''}
                  onChange={() => {
                    const newParams = new URLSearchParams(searchParams);
                    newParams.delete('category');
                    setSearchParams(newParams);
                    setPage(1);
                  }}
                />
                All Categories
              </label>
              {categories?.map((cat) => (
                <label key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="category"
                    checked={parseInt(selectedCategory, 10) === cat.id}
                    onChange={() => {
                      const newParams = new URLSearchParams(searchParams);
                      newParams.set('category', cat.id.toString());
                      setSearchParams(newParams);
                      setPage(1);
                    }}
                  />
                  {cat.name}
                </label>
              ))}
            </div>
          </div>

          {/* Gender Filter */}
          <div>
            <h4 style={{ fontWeight: '600', marginBottom: '12px', fontSize: '0.9375rem', textAlign: 'left' }}>Gender</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
              {['All', 'Men', 'Women', 'None', 'Boys', 'Girls'].map((g) => (
                <label key={g} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="gender"
                    checked={(g === 'All' && selectedGender === '') || selectedGender === g}
                    onChange={() => {
                      const newParams = new URLSearchParams(searchParams);
                      if (g === 'All') newParams.delete('gender');
                      else newParams.set('gender', g);
                      setSearchParams(newParams);
                      setPage(1);
                    }}
                  />
                  {g === 'All' ? 'All Genders' : g}
                </label>
              ))}
            </div>
          </div>

          {/* Age Group Filter */}
          <div>
            <h4 style={{ fontWeight: '600', marginBottom: '12px', fontSize: '0.9375rem', textAlign: 'left' }}>Age Group</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
              {['All', 'Adults', 'Kids', 'Infants', 'All Ages'].map((a) => (
                <label key={a} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="ageGroup"
                    checked={(a === 'All' && selectedAgeGroup === '') || selectedAgeGroup === a}
                    onChange={() => {
                      const newParams = new URLSearchParams(searchParams);
                      if (a === 'All') newParams.delete('ageGroup');
                      else newParams.set('ageGroup', a);
                      setSearchParams(newParams);
                      setPage(1);
                    }}
                  />
                  {a === 'All' ? 'All Ages' : a}
                </label>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div>
            <h4 style={{ fontWeight: '600', marginBottom: '12px', fontSize: '0.9375rem', textAlign: 'left' }}>Price Range (₹)</h4>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => { setMinPrice(e.target.value); setPage(1); }}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.875rem'
                }}
              />
              <span style={{ color: 'var(--text-muted)' }}>-</span>
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => { setMaxPrice(e.target.value); setPage(1); }}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.875rem'
                }}
              />
            </div>
          </div>

          {/* Sorting */}
          <div>
            <h4 style={{ fontWeight: '600', marginBottom: '12px', fontSize: '0.9375rem', textAlign: 'left' }}>Sort By</h4>
            <select
              value={sortOrder}
              onChange={(e) => { setSortOrder(e.target.value); setPage(1); }}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                fontSize: '0.875rem'
              }}
            >
              <option value="">Default (Newest)</option>
              <option value="price_low_high">Price: Low to High</option>
              <option value="price_high_low">Price: High to Low</option>
            </select>
          </div>
        </aside>

        {/* Product Grid Area */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
          
          {/* Loading Skeletons */}
          {isLoading && <SkeletonGrid count={6} />}

          {/* Error Handling */}
          {error && (
            <div style={{ padding: '32px', textAlign: 'center', backgroundColor: 'var(--error-bg)', color: 'var(--error)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--error)' }}>
              <p style={{ margin: 0, fontWeight: '600' }}>Unable to load catalogue products from backend database.</p>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && products.length === 0 && (
            <EmptyState
              icon={PackageX}
              title="No Products Found"
              description="No footwear items match your active filter criteria."
              actionLabel="Clear Filters"
              onAction={handleResetFilters}
            />
          )}

          {/* Product Grid */}
          {!isLoading && !error && products.length > 0 && (
            <>
              <div className="product-grid">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination UI */}
              {pagination.totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginTop: '16px' }}>
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(p => Math.max(p - 1, 1))}
                    style={{
                      padding: '8px 16px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'transparent',
                      cursor: page === 1 ? 'not-allowed' : 'pointer',
                      opacity: page === 1 ? 0.5 : 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <ChevronLeft size={16} /> Prev
                  </button>
                  <span style={{ fontSize: '0.9375rem', fontWeight: '500' }}>
                    Page {page} of {pagination.totalPages}
                  </span>
                  <button
                    disabled={page === pagination.totalPages}
                    onClick={() => setPage(p => Math.min(p + 1, pagination.totalPages))}
                    style={{
                      padding: '8px 16px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'transparent',
                      cursor: page === pagination.totalPages ? 'not-allowed' : 'pointer',
                      opacity: page === pagination.totalPages ? 0.5 : 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    Next <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .listing-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ProductListing;
