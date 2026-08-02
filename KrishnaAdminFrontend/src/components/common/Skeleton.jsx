import React from 'react';

export const Skeleton = ({ width = '100%', height = '20px', borderRadius = '6px', style = {} }) => {
  return (
    <div
      style={{
        width,
        height,
        borderRadius,
        backgroundColor: '#e2e8f0',
        backgroundImage: 'linear-gradient(90deg, #e2e8f0 0px, #f1f5f9 40px, #e2e8f0 80px)',
        backgroundSize: '600px',
        animation: 'shimmer 1.5s infinite linear',
        ...style
      }}
    >
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200px 0; }
          100% { background-position: 400px 0; }
        }
      `}</style>
    </div>
  );
};

export const TableSkeleton = ({ rows = 5, columns = 4 }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
      <Skeleton height="40px" borderRadius="8px" />
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} style={{ display: 'flex', gap: '16px' }}>
          {Array.from({ length: columns }).map((_, c) => (
            <Skeleton key={c} height="32px" borderRadius="6px" />
          ))}
        </div>
      ))}
    </div>
  );
};

export const CardSkeleton = () => (
  <div style={{ padding: '24px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
    <Skeleton height="24px" width="50%" />
    <Skeleton height="48px" width="100%" />
    <Skeleton height="16px" width="80%" />
  </div>
);

export default Skeleton;
