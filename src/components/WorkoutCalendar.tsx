import React, { useState, useMemo } from 'react';
import { Workout } from '@/types';

export default function WorkoutCalendar({ workouts, selectedType, onDayClick }: { workouts: Workout[], selectedType: string, onDayClick?: (dateStr: string) => void }) {
  // Initialize to the most recent workout's month, or current month if no workouts
  const [currentDate, setCurrentDate] = useState(() => {
    if (workouts.length > 0) {
      // workouts are sorted descending, so workouts[0] is the most recent
      return new Date(workouts[0].rawDateStr);
    }
    return new Date();
  });

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  // Map workouts to a dictionary by YYYY-MM-DD
  const workoutDays = useMemo(() => {
    const map = new Map<string, number>();
    workouts.forEach(w => {
      const d = new Date(w.rawDateStr);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const key = `${yyyy}-${mm}-${dd}`;
      map.set(key, (map.get(key) || 0) + 1);
    });
    return map;
  }, [workouts]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  
  // Adjust so Monday is column 0
  const startOffset = firstDay === 0 ? 6 : firstDay - 1;

  const days = [];
  for (let i = 0; i < startOffset; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '700px', margin: '0 auto' }}>
      
      {/* Header Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '1.5rem' }}>
        <button className="chip" style={{ padding: '0.5rem 1.5rem' }} onClick={prevMonth}>&larr; Prev</button>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--text-primary)' }}>
          {monthNames[month]} {year}
        </h3>
        <button className="chip" style={{ padding: '0.5rem 1.5rem' }} onClick={nextMonth}>Next &rarr;</button>
      </div>

      {/* Days of week header */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', width: '100%', gap: '0.75rem', marginBottom: '0.75rem' }}>
        {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(d => (
          <div key={d} style={{ textAlign: 'center', color: 'var(--text-secondary)', fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase' }}>{d}</div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', width: '100%', gap: '0.75rem' }}>
        {days.map((day, idx) => {
          if (day === null) {
            return <div key={`empty-${idx}`} style={{ aspectRatio: '1', borderRadius: '12px', background: 'transparent' }}></div>;
          }

          const mm = String(month + 1).padStart(2, '0');
          const dd = String(day).padStart(2, '0');
          const dateKey = `${year}-${mm}-${dd}`;
          const count = workoutDays.get(dateKey) || 0;
          const isToday = isCurrentMonth && day === today.getDate();

          let bg = 'rgba(255,255,255,0.03)';
          let border = '1px solid rgba(255,255,255,0.05)';
          let textColor = 'var(--text-secondary)';

          let cursor = 'default';

          if (count > 0) {
            bg = 'var(--accent-color)';
            textColor = '#fff';
            border = '1px solid rgba(255,255,255,0.3)';
            cursor = 'pointer';
          } else if (isToday) {
            bg = 'rgba(255,255,255,0.1)';
            border = '1px solid var(--text-primary)';
            textColor = 'var(--text-primary)';
          }

          return (
            <div 
              key={dateKey} 
              onClick={() => {
                if (count > 0 && onDayClick) onDayClick(dateKey);
              }}
              style={{ 
                aspectRatio: '1', 
                borderRadius: '12px', 
                background: bg,
                border: border,
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center', 
                justifyContent: 'center',
                color: textColor,
                position: 'relative',
                boxShadow: count > 0 ? '0 4px 12px rgba(59, 130, 246, 0.4)' : 'none', // using standard blue accent glow
                fontWeight: count > 0 ? 800 : 600,
                transition: 'all 0.2s ease',
                cursor: cursor
              }}
              title={count > 0 ? `${count} ${selectedType} session(s)` : 'No workouts'}
            >
              <span style={{ fontSize: '1.2rem' }}>{day}</span>
              {count > 1 && (
                <span style={{ position: 'absolute', bottom: '4px', right: '6px', fontSize: '0.7rem', color: '#fff', background: 'rgba(0,0,0,0.3)', padding: '2px 4px', borderRadius: '4px' }}>x{count}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
