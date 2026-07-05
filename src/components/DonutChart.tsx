import React from 'react';

interface DonutChartData {
  label: string;
  value: number;
  color: string;
  icon: string;
}

/**
 * DonutChart Component
 * Renders a custom, lightweight SVG donut chart for workout distribution.
 * 
 * @param {Object} props
 * @param {Function} [props.onSelect] - Optional callback when a slice or legend item is clicked
 * @returns {JSX.Element} SVG Donut Chart with Legend
 */
export default function DonutChart({ data, onSelect }: { data: DonutChartData[], onSelect?: (label: string) => void }) {
  const total = data.reduce((acc, item) => acc + item.value, 0);
  let currentOffset = 0;
  const radius = 70;
  const circumference = 2 * Math.PI * radius;

  // Sort data by value descending for better visual presentation
  const sortedData = [...data].sort((a, b) => b.value - a.value);

  return (
    <div className="donut-chart-container" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '4rem', padding: '1rem' }}>
      {/* SVG Chart */}
      <div style={{ position: 'relative', width: '220px', height: '220px' }}>
        <svg width="220" height="220" viewBox="0 0 220 220" style={{ transform: 'rotate(-90deg)', dropShadow: '0 8px 16px rgba(0,0,0,0.3)' }}>
          {/* Background circle */}
          <circle
            cx="110"
            cy="110"
            r={radius}
            fill="transparent"
            stroke="rgba(255, 255, 255, 0.05)"
            strokeWidth="25"
          />
          
          {/* Data slices */}
          {sortedData.map((item) => {
            const percentage = item.value / total;
            // Add a small gap between slices by reducing the stroke length slightly
            const gap = percentage === 1 ? 0 : 2; 
            const strokeLength = Math.max(0, (percentage * circumference) - gap);
            const dashoffset = -currentOffset;
            currentOffset += percentage * circumference;
            
            return (
              <circle
                key={item.label}
                cx="110"
                cy="110"
                r={radius}
                fill="transparent"
                stroke={item.color}
                strokeWidth="25"
                strokeDasharray={`${strokeLength} ${circumference}`}
                strokeDashoffset={dashoffset}
                strokeLinecap="round"
                style={{ 
                  transition: 'all 1s cubic-bezier(0.4, 0, 0.2, 1)',
                  filter: `drop-shadow(0 0 8px ${item.color}40)`,
                  cursor: onSelect ? 'pointer' : 'default'
                }}
                onClick={() => onSelect && onSelect(item.label)}
              />
            );
          })}
        </svg>
        {/* Center Text */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>{total}</span>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Sessions</span>
        </div>
      </div>

      {/* Legend */}
      <div className="chart-legend" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1, minWidth: '200px' }}>
        {sortedData.map(item => (
          <div 
            key={item.label} 
            style={{ 
              display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.5rem', 
              borderRadius: '8px', background: 'rgba(255,255,255,0.02)',
              cursor: onSelect ? 'pointer' : 'default',
              transition: 'background 0.2s ease'
            }}
            onClick={() => onSelect && onSelect(item.label)}
            onMouseEnter={(e) => { if(onSelect) e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
            onMouseLeave={(e) => { if(onSelect) e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
          >
            <div style={{ width: '16px', height: '16px', borderRadius: '4px', backgroundColor: item.color, boxShadow: `0 0 8px ${item.color}80` }}></div>
            <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{item.label}</span>
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: '1.1rem' }}>{item.value}</span>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>({Math.round((item.value / total) * 100)}%)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
