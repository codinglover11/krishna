import React from 'react';

export const SkeletonCard = () => {
  return (
    <div style={{
      backgroundColor: 'var(--bg-card)',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--border-color)',
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    }}>
      <div className="skeleton" style={{ width: '100%', height: '200px', borderRadius: 'var(--radius-md)' }}></div>
      <div className="skeleton" style={{ width: '40%', height: '16px' }}></div>
      <div className="skeleton" style={{ width: '80%', height: '24px' }}></div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
        <div className="skeleton" style={{ width: '30%', height: '24px' }}></div>
        <div className="skeleton" style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-full)' }}></div>
      </div>
    </div>
  );
};

export const SkeletonGrid = ({ count = 4 }) => {
  return (
    <div className="product-grid">
      {[...Array(count)].map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
};

export default SkeletonCard;
