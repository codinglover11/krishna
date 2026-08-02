import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  pageSize = 10,
  totalItems = 0,
  onPageChange,
  onPageSizeChange
}) => {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 20px',
      backgroundColor: '#ffffff',
      borderTop: '1px solid #e2e8f0',
      flexWrap: 'wrap',
      gap: '12px',
      fontSize: '0.875rem',
      color: '#64748b'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <span>Showing <strong>{startItem}-{endItem}</strong> of <strong>{totalItems}</strong> entries</span>
        {onPageSizeChange && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>Per page:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              style={{
                padding: '4px 8px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                color: '#1e293b',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '6px 12px',
            borderRadius: '6px',
            border: '1px solid #cbd5e1',
            backgroundColor: currentPage <= 1 ? '#f8fafc' : '#ffffff',
            color: currentPage <= 1 ? '#94a3b8' : '#1e293b',
            cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
            fontWeight: '500'
          }}
        >
          <ChevronLeft size={16} /> Prev
        </button>

        <span style={{ fontWeight: '600', color: '#1e293b' }}>
          Page {currentPage} of {Math.max(totalPages, 1)}
        </span>

        <button
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '6px 12px',
            borderRadius: '6px',
            border: '1px solid #cbd5e1',
            backgroundColor: currentPage >= totalPages ? '#f8fafc' : '#ffffff',
            color: currentPage >= totalPages ? '#94a3b8' : '#1e293b',
            cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
            fontWeight: '500'
          }}
        >
          Next <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
