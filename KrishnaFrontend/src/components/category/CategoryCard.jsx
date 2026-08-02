import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers } from 'lucide-react';

export const CategoryCard = ({ category }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    // Navigate to listing page pre-filtered by this category ID or Slug
    navigate(`/products?category=${category.id}`);
  };

  return (
    <div
      className="hover-scale"
      onClick={handleCardClick}
      style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        textAlign: 'left'
      }}
    >
      {/* Category Image Area */}
      <div style={{
        height: '200px',
        backgroundColor: 'var(--bg-muted)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        position: 'relative'
      }}>
        {category.image_url ? (
          <img
            src={category.image_url}
            alt={category.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
            <Layers size={36} />
            <span style={{ fontSize: '0.875rem' }}>Browse {category.name}</span>
          </div>
        )}
      </div>

      {/* Category Info Area */}
      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', margin: 0, color: 'var(--primary-color)' }}>
            {category.name}
          </h3>
          <span style={{
            fontSize: '0.75rem',
            fontWeight: '600',
            backgroundColor: 'var(--bg-muted)',
            color: 'var(--text-secondary)',
            padding: '4px 8px',
            borderRadius: 'var(--radius-full)'
          }}>
            {category.product_count || 0} Shoes
          </span>
        </div>
        
        {category.description && (
          <p style={{
            fontSize: '0.875rem',
            color: 'var(--text-secondary)',
            lineHeight: '1.4',
            margin: '8px 0 0',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical'
          }}>
            {category.description}
          </p>
        )}
      </div>
    </div>
  );
};

export default CategoryCard;
