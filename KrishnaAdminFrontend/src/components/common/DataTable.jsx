import React from 'react';
import { TableSkeleton } from './Skeleton';
import Pagination from './Pagination';
import { Inbox } from 'lucide-react';

export const DataTable = ({
  columns = [],
  data = [],
  isLoading = false,
  emptyMessage = 'No records found matching your query.',
  pagination = null,
  rowKey = 'id'
}) => {
  if (isLoading) {
    return (
      <div style={{ padding: '24px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <TableSkeleton rows={6} columns={columns.length || 4} />
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      border: '1px solid #e2e8f0',
      overflow: 'hidden',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
    }}>
      <div style={{ overflowX: 'auto', width: '100%' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              {columns.map((col, idx) => (
                <th
                  key={col.accessor || idx}
                  style={{
                    padding: '14px 20px',
                    fontWeight: '700',
                    color: '#475569',
                    textTransform: 'uppercase',
                    fontSize: '0.75rem',
                    letterSpacing: '0.05em'
                  }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length || 1} style={{ padding: '48px 24px', textAlign: 'center', color: '#94a3b8' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <Inbox size={40} style={{ strokeWidth: 1.5 }} />
                    <span style={{ fontSize: '0.9375rem', color: '#64748b' }}>{emptyMessage}</span>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, rIdx) => (
                <tr
                  key={row[rowKey] || rIdx}
                  style={{
                    borderBottom: rIdx === data.length - 1 ? 'none' : '1px solid #f1f5f9',
                    transition: 'background-color 0.15s ease'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  {columns.map((col, cIdx) => (
                    <td key={col.accessor || cIdx} style={{ padding: '16px 20px', color: '#1e293b', verticalAlign: 'middle' }}>
                      {col.render ? col.render(row) : row[col.accessor] ?? '-'}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && <Pagination {...pagination} />}
    </div>
  );
};

export default DataTable;
