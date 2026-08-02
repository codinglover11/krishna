import React from 'react';

export const Skeleton = ({
  width = '100%',
  height = '20px',
  borderRadius = 'var(--radius-sm)',
  className = '',
  style = {},
  ...props
}) => {
  return (
    <div
      className={`skeleton ${className}`}
      style={{
        width,
        height,
        borderRadius,
        ...style,
      }}
      {...props}
    />
  );
};

export const ProductCardSkeleton = () => {
  return (
    <div style={{
      border: '1px solid var(--border-color)',
      borderRadius: 'var(--radius-lg)',
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      backgroundColor: 'var(--bg-card)',
    }}>
      <Skeleton height="200px" borderRadius="var(--radius-md)" />
      <Skeleton width="60%" height="24px" />
      <Skeleton width="40%" height="18px" />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
        <Skeleton width="30%" height="24px" />
        <Skeleton width="40%" height="36px" borderRadius="var(--radius-md)" />
      </div>
    </div>
  );
};

export default Skeleton;
