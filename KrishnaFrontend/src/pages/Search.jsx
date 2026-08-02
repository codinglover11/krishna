import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search as SearchIcon, PackageX } from 'lucide-react';
import productService from '../services/productService';
import ProductCard from '../components/product/ProductCard';
import { EmptyState } from '../components/common/EmptyState';
import { SkeletonGrid } from '../components/common/SkeletonCard';

export const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  const [searchInput, setSearchInput] = useState(queryParam);

  useEffect(() => {
    setSearchInput(queryParam);
  }, [queryParam]);

  // Fetch search results from API using react-query
  const { data, isLoading, error } = useQuery({
    queryKey: ['searchProducts', queryParam],
    queryFn: () => productService.getProducts({ search: queryParam }),
    enabled: !!queryParam,
    retry: false
  });

  const products = data?.products || [];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSearchParams({ q: searchInput.trim() });
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 24px', width: '100%', textAlign: 'left' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--primary-color)', marginBottom: '32px' }}>
        Search Footwear Catalogue
      </h1>

      {/* Main Search Input Form */}
      <form onSubmit={handleSearchSubmit} style={{
        display: 'flex',
        gap: '12px',
        maxWidth: '640px',
        width: '100%',
        marginBottom: '40px'
      }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <input
            type="text"
            placeholder="Search by shoe name, leather brand, or SKU..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            style={{
              width: '100%',
              padding: '16px 16px 16px 48px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              fontSize: '1rem'
            }}
          />
          <SearchIcon size={20} style={{ position: 'absolute', left: '16px', top: '18px', color: 'var(--text-muted)' }} />
        </div>
        <button type="submit" className="btn btn-primary" style={{ padding: '0 32px' }}>
          Search
        </button>
      </form>

      {/* Results Header */}
      {queryParam && (
        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '24px' }}>
          Search results for: <span style={{ color: 'var(--secondary-color)' }}>"{queryParam}"</span> ({products.length})
        </h3>
      )}

      {/* Skeletons while searching */}
      {isLoading && <SkeletonGrid count={6} />}

      {/* Error handling */}
      {error && (
        <div style={{ padding: '32px', textAlign: 'center', backgroundColor: 'var(--error-bg)', color: 'var(--error)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--error)' }}>
          <p style={{ margin: 0, fontWeight: '600' }}>Search request failed. Please check your query or backend connection.</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && queryParam && products.length === 0 && (
        <EmptyState
          icon={PackageX}
          title={`No results found for "${queryParam}"`}
          description="Try searching with different keywords like 'Loafers', 'Boots', 'Black', or 'Leather'."
        />
      )}

      {/* Results Grid */}
      {!isLoading && !error && products.length > 0 && (
        <div className="product-grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Search;
