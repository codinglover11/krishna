import React from 'react';
import { BarChart3, PieChart as PieChartIcon, TrendingUp, AlertCircle } from 'lucide-react';

// Common Empty State Widget
const EmptyChartState = ({ title, message = 'No Data Available' }) => (
  <div style={{
    height: '240px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    border: '1px dashed #cbd5e1',
    color: '#64748b',
    padding: '20px',
    textAlign: 'center'
  }}>
    <AlertCircle size={28} color="#94a3b8" style={{ marginBottom: '8px' }} />
    <span style={{ fontSize: '0.9375rem', fontWeight: '700', color: '#475569' }}>{title || message}</span>
    <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>
      Real data from PostgreSQL database will render here as records increase.
    </span>
  </div>
);

// 1. Responsive SVG Bar Chart Component
export const BarChart = ({ title, data = [], xKey = 'month_label', yKey = 'revenue', height = 240, color = '#2563eb', formatValue = (v) => v }) => {
  if (!data || data.length === 0) {
    return <EmptyChartState title={title} />;
  }

  const values = data.map((d) => parseFloat(d[yKey]) || 0);
  const maxVal = Math.max(...values, 1);

  return (
    <div style={{ width: '100%' }}>
      {title && <h4 style={{ margin: '0 0 16px', fontSize: '1rem', fontWeight: '700', color: '#0f172a' }}>{title}</h4>}
      <div style={{ height: `${height}px`, display: 'flex', alignItems: 'flex-end', gap: '12px', paddingBottom: '24px', borderBottom: '1px solid #e2e8f0', position: 'relative' }}>
        {data.map((item, idx) => {
          const val = parseFloat(item[yKey]) || 0;
          const pct = Math.max((val / maxVal) * 100, 4); // min 4% for visibility
          return (
            <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end', position: 'relative' }}>
              
              {/* Tooltip Value */}
              <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                {formatValue(val)}
              </div>

              {/* Bar */}
              <div
                title={`${item[xKey]}: ${formatValue(val)}`}
                style={{
                  width: '80%',
                  height: `${pct}%`,
                  backgroundColor: color,
                  borderRadius: '6px 6px 0 0',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
              />

              {/* Label */}
              <span style={{ position: 'absolute', bottom: '-22px', fontSize: '0.75rem', color: '#64748b', whiteSpace: 'nowrap', fontWeight: '600' }}>
                {item[xKey]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// 2. Responsive SVG Line Chart Component
export const LineChart = ({ title, data = [], xKey = 'month_label', yKey = 'revenue', height = 240, color = '#10b981', formatValue = (v) => v }) => {
  if (!data || data.length === 0) {
    return <EmptyChartState title={title} />;
  }

  const values = data.map((d) => parseFloat(d[yKey]) || 0);
  const maxVal = Math.max(...values, 1);
  const chartWidth = 500;
  const chartHeight = height - 40;

  const points = data.map((d, i) => {
    const x = (i / (data.length - 1 || 1)) * (chartWidth - 40) + 20;
    const val = parseFloat(d[yKey]) || 0;
    const y = chartHeight - (val / maxVal) * (chartHeight - 30) + 15;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div style={{ width: '100%' }}>
      {title && <h4 style={{ margin: '0 0 16px', fontSize: '1rem', fontWeight: '700', color: '#0f172a' }}>{title}</h4>}
      <div style={{ position: 'relative', width: '100%', height: `${height}px` }}>
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} style={{ width: '100%', height: '80%', overflow: 'visible' }}>
          <polyline
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points}
          />
          {data.map((d, i) => {
            const x = (i / (data.length - 1 || 1)) * (chartWidth - 40) + 20;
            const val = parseFloat(d[yKey]) || 0;
            const y = chartHeight - (val / maxVal) * (chartHeight - 30) + 15;
            return (
              <g key={i}>
                <circle cx={x} cy={y} r="5" fill={color} stroke="#ffffff" strokeWidth="2" />
                <text x={x} y={y - 10} textAnchor="middle" fontSize="10" fontWeight="bold" fill="#334155">
                  {formatValue(val)}
                </text>
              </g>
            );
          })}
        </svg>

        {/* X Labels */}
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 10px', marginTop: '12px', borderTop: '1px solid #e2e8f0' }}>
          {data.map((d, idx) => (
            <span key={idx} style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>
              {d[xKey]}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

// 3. Responsive Donut / Pie Chart Component
export const DonutChart = ({ title, data = [], labelKey = 'category_name', valueKey = 'product_count', height = 240, formatValue = (v) => v }) => {
  if (!data || data.length === 0) {
    return <EmptyChartState title={title} />;
  }

  const palette = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b'];
  const total = data.reduce((acc, curr) => acc + (parseInt(curr[valueKey], 10) || 0), 0);

  if (total === 0) {
    return <EmptyChartState title={title} message="No distribution records yet" />;
  }

  return (
    <div style={{ width: '100%' }}>
      {title && <h4 style={{ margin: '0 0 16px', fontSize: '1rem', fontWeight: '700', color: '#0f172a' }}>{title}</h4>}
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
        {/* Progress distribution bar */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ width: '100%', height: '16px', borderRadius: '8px', overflow: 'hidden', display: 'flex', backgroundColor: '#f1f5f9' }}>
            {data.map((item, idx) => {
              const val = parseInt(item[valueKey], 10) || 0;
              const pct = (val / total) * 100;
              if (pct === 0) return null;
              return (
                <div
                  key={idx}
                  title={`${item[labelKey]}: ${formatValue(val)} (${pct.toFixed(1)}%)`}
                  style={{
                    width: `${pct}%`,
                    backgroundColor: palette[idx % palette.length],
                    height: '100%'
                  }}
                />
              );
            })}
          </div>

          {/* Legend Items */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {data.map((item, idx) => {
              const val = parseInt(item[valueKey], 10) || 0;
              const pct = total > 0 ? ((val / total) * 100).toFixed(1) : 0;
              return (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8125rem' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: palette[idx % palette.length], flexShrink: 0 }} />
                  <span style={{ color: '#475569', fontWeight: '500' }}>{item[labelKey] || 'Uncategorized'}:</span>
                  <strong style={{ color: '#0f172a' }}>{formatValue(val)} ({pct}%)</strong>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
