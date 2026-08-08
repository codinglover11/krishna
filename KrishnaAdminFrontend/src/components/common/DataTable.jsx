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
      <div style={{ padding: '24px', backgroundColor: 'var(--card)', borderRadius: '12px', border: '1px solid var(--line)' }}>
        <TableSkeleton rows={6} columns={columns.length || 4} />
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: 'var(--card)',
      borderRadius: '12px',
      border: '1px solid var(--line)',
      overflow: 'hidden',
      boxShadow: 'var(--shadow)'
    }}>
      <div style={{ overflowX: 'auto', width: '100%' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--parchment-soft)', borderBottom: '1px solid var(--line)' }}>
              {columns.map((col, idx) => (
                <th
                  key={col.accessor || idx}
                  style={{
                    padding: '14px 20px',
                    fontWeight: '700',
                    color: 'var(--chestnut)',
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
                <td colSpan={columns.length || 1} style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--ink-soft)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <Inbox size={40} style={{ strokeWidth: 1.5, color: 'var(--brass-light)' }} />
                    <span style={{ fontSize: '0.9375rem', color: 'var(--ink-soft)' }}>{emptyMessage}</span>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, rIdx) => (
                <tr
                  key={row[rowKey] || rIdx}
                  style={{
                    borderBottom: rIdx === data.length - 1 ? 'none' : '1px solid var(--line)',
                    transition: 'background-color 0.15s ease'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--parchment-soft)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  {columns.map((col, cIdx) => (
                    <td key={col.accessor || cIdx} style={{ padding: '16px 20px', color: 'var(--ink)', verticalAlign: 'middle' }}>
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
