import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Layers, AlertCircle } from 'lucide-react';
import productService from '../services/productService';
import { SkeletonGrid } from '../components/common/SkeletonCard';
import { EmptyState } from '../components/common/EmptyState';
import CategoryCarouselRow from '../components/category/CategoryCarouselRow';

export const Categories = () => {

  // Query categories
  const { data: categories, isLoading, error, refetch } = useQuery({
    queryKey: ['categories'],
    queryFn: () => productService.getCategories(),
    retry: false
  });

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '32px 24px', width: '100%', textAlign: 'left' }}>
      
      {/* Breadcrumbs */}
      <nav style={{ display: 'flex', gap: '8px', fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '24px', maxWidth: '1200px', margin: '0 auto 24px auto' }}>
        <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>Home</Link>
        <span>/</span>
        <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>Categories</span>
      </nav>

      <div style={{ maxWidth: '1200px', margin: '0 auto 40px auto' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--primary-color)', marginBottom: '8px' }}>
          Product Categories
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Discover our tailored footwear lines from sports running shoes to professional dress leather boots.
        </p>
      </div>

      {/* Loading Skeletons */}
      {isLoading && (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <SkeletonGrid count={4} />
        </div>
      )}

      {/* Connection Errors */}
      {error && (
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          padding: '32px',
          textAlign: 'center',
          backgroundColor: 'var(--error-bg)',
          color: 'var(--error)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--error)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px'
        }}>
          <AlertCircle size={32} />
          <h3 style={{ margin: 0, fontWeight: '700' }}>Unable to fetch listings</h3>
          <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Ensure your backend server is running and database is seeded.
          </p>
          <button onClick={() => refetch()} className="btn btn-outline" style={{ marginTop: '8px' }}>
            Retry Connection
          </button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && categories?.length === 0 && (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <EmptyState
            icon={Layers}
            title="No Categories Registered"
            description="There are currently no active categories in the product catalogue."
          />
        </div>
      )}

      {/* Grouped Products Layout via Carousel Rows */}
      {!isLoading && !error && categories && categories.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '56px', width: '100%', overflow: 'hidden' }}>
          {categories.map((cat) => (
            <CategoryCarouselRow key={cat.id} category={cat} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Categories;
