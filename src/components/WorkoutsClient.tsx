'use client';
import { useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Workout } from '@/types';
import DonutChart from './DonutChart';
import '../app/Workouts.css';

const getWorkoutIcon = (type: string) => {
  const t = type.toLowerCase();
  if (t.includes('run')) return '🏃‍♂️';
  if (t.includes('walk')) return '🚶‍♂️';
  if (t.includes('cycl') || t.includes('bik') || t.includes('spin')) return '🚴‍♂️';
  if (t.includes('swim')) return '🏊‍♂️';
  if (t.includes('weight') || t.includes('strength')) return '🏋️‍♂️';
  if (t.includes('yoga')) return '🧘‍♂️';
  if (t.includes('elliptical')) return '⛷️';
  if (t.includes('hike') || t.includes('climb')) return '🧗‍♂️';
  if (t.includes('dance')) return '💃';
  if (t.includes('aerobic')) return '🤸‍♂️';
  if (t.includes('workout')) return '💪';
  return '🏅';
};

/**
 * Client Component: WorkoutsClient
 * Handles the interactive dashboard UI including date filtering,
 * workout type selection, and displaying detailed metrics.
 * 
 * @param {Object} props - Component props
 * @param {Workout[]} props.initialWorkouts - Pre-fetched and filtered workouts from the server
 * @returns {JSX.Element} The interactive dashboard interface
 */
export default function WorkoutsClient({ initialWorkouts }: { initialWorkouts: Workout[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [filter, setFilter] = useState<string | null>(null);
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);

  // States for custom dates
  const [customStart, setCustomStart] = useState(searchParams.get('start') || '');
  const [customEnd, setCustomEnd] = useState(searchParams.get('end') || '');
  const [isCustomDate, setIsCustomDate] = useState(!!(searchParams.get('start')));

  /**
   * Applies a preset date filter by updating URL search parameters.
   * Modifying search params automatically triggers a server re-render in Next.js App Router.
   * 
   * @param {number | null} days - Number of days to look back, or null to enable custom date mode
   */
  const handleDateFilter = (days: number | null) => {
    setSelectedWorkout(null);
    if (days === null) {
      // Custom
      setIsCustomDate(true);
      return;
    }
    setIsCustomDate(false);
    
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    
    // Update URL
    router.push(`/?start=${start.toISOString().split('T')[0]}&end=${end.toISOString().split('T')[0]}`);
  };

  /**
   * Applies the custom date range selected by the user.
   * Fallbacks to a wide range if inputs are left empty.
   */
  const applyCustomDates = () => {
    setSelectedWorkout(null);
    const start = customStart || '2000-01-01';
    const end = customEnd || new Date().toISOString().split('T')[0];
    router.push(`/?start=${start}&end=${end}`);
  };

  // Extract unique types for the filters, or use defaults if none exist
  const EXERCISE_TYPES = useMemo(() => {
    const types = new Set(initialWorkouts.map(w => w.type));
    return Array.from(types);
  }, [initialWorkouts]);

  const filteredWorkouts = filter 
    ? initialWorkouts.filter((w) => w.type === filter)
    : [];

  const CHART_COLORS = [
    '#4CAF50', '#2196F3', '#FF9800', '#E91E63', 
    '#9C27B0', '#00BCD4', '#FFC107', '#F44336'
  ];

  const distributionData = useMemo(() => {
    const counts: Record<string, number> = {};
    initialWorkouts.forEach(w => {
      counts[w.type] = (counts[w.type] || 0) + 1;
    });

    return Object.entries(counts).map(([type, count], index) => ({
      label: type,
      value: count,
      color: CHART_COLORS[index % CHART_COLORS.length],
      icon: getWorkoutIcon(type)
    }));
  }, [initialWorkouts]);

  const renderDetailSection = () => (
    <div className="detail-section glass-panel">
      {selectedWorkout ? (
        <div className="workout-details">
          <div className="detail-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {getWorkoutIcon(selectedWorkout.type)} {selectedWorkout.type}
            </h3>
            <p suppressHydrationWarning style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              {new Date(selectedWorkout.rawDateStr).toLocaleDateString()} · {new Date(selectedWorkout.rawDateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          
          <div className="stats-grid">
            <div className="stat-box">
              <span className="stat-label">Duration</span>
              <span className="stat-value">{selectedWorkout.duration}</span>
            </div>
            <div className="stat-box highlight">
              <span className="stat-label">Cardio Load</span>
              <span className="stat-value">{selectedWorkout.cardioLoad}</span>
            </div>
            <div className="stat-box">
              <span className="stat-label">Avg BPM</span>
              <span className="stat-value">{selectedWorkout.avgHeartRate > 0 ? selectedWorkout.avgHeartRate : '--'}</span>
            </div>
            <div className="stat-box">
              <span className="stat-label">Calories</span>
              <span className="stat-value">{selectedWorkout.calories > 0 ? selectedWorkout.calories : '--'} kcal</span>
            </div>
          </div>
          
          <div className="extra-details-grid" style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
            <div className="glass-panel" style={{ padding: '1.5rem', background: 'rgba(255, 255, 255, 0.02)' }}>
              <h4 style={{ marginBottom: '1rem', color: 'var(--primary-color)', fontSize: '1.1rem' }}>Device & Source</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '2' }}>
                <li><strong>Device:</strong> {selectedWorkout.deviceName}</li>
                <li><strong>Platform:</strong> {selectedWorkout.platform}</li>
                <li><strong>Recording Method:</strong> {selectedWorkout.recordingMethod === 'PASSIVELY_MEASURED' ? 'Automatic' : selectedWorkout.recordingMethod}</li>
              </ul>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem', background: 'rgba(255, 255, 255, 0.02)' }}>
              <h4 style={{ marginBottom: '1rem', color: 'var(--primary-color)', fontSize: '1.1rem' }}>Heart Rate Zones</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '2' }}>
                <li><span style={{color: '#4CAF50'}}>●</span> <strong>Light:</strong> {selectedWorkout.zones?.light || 0} min</li>
                <li><span style={{color: '#FFC107'}}>●</span> <strong>Moderate:</strong> {selectedWorkout.zones?.moderate || 0} min</li>
                <li><span style={{color: '#FF9800'}}>●</span> <strong>Vigorous:</strong> {selectedWorkout.zones?.vigorous || 0} min</li>
                <li><span style={{color: '#F44336'}}>●</span> <strong>Peak:</strong> {selectedWorkout.zones?.peak || 0} min</li>
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <div className="detail-empty" style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
          <p>Select a session to view details</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="workouts-container">
      <header className="page-header" style={{ marginBottom: '1rem' }}>
        <h1>Workouts</h1>
      </header>

      {/* Date Selector */}
      <div className="filter-container glass-panel" style={{ marginBottom: '1rem', padding: '1rem' }}>
        <div className="filter-chips">
          <button className={`chip ${!isCustomDate && searchParams.get('start')?.includes(new Date(Date.now() - 7*86400000).toISOString().split('T')[0]) ? 'active' : ''}`} onClick={() => handleDateFilter(7)}>7 Days</button>
          <button className={`chip ${!isCustomDate && searchParams.get('start')?.includes(new Date(Date.now() - 30*86400000).toISOString().split('T')[0]) ? 'active' : ''}`} onClick={() => handleDateFilter(30)}>30 Days</button>
          <button className={`chip ${!isCustomDate && searchParams.get('start')?.includes(new Date(Date.now() - 365*86400000).toISOString().split('T')[0]) ? 'active' : ''}`} onClick={() => handleDateFilter(365)}>1 Year</button>
          <button className={`chip ${isCustomDate ? 'active' : ''}`} onClick={() => handleDateFilter(null)}>Custom</button>
          {searchParams.has('start') && (
            <button className="chip clear-filter-btn" onClick={() => router.push('/')}>Clear Filter</button>
          )}
        </div>
        
        {isCustomDate && (
          <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <input type="date" className="date-input" value={customStart} onChange={(e) => setCustomStart(e.target.value)} style={{ padding: '0.5rem', borderRadius: '4px', border: 'none', background: 'rgba(255,255,255,0.1)', color: 'white' }} />
            <span>to</span>
            <input type="date" className="date-input" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} style={{ padding: '0.5rem', borderRadius: '4px', border: 'none', background: 'rgba(255,255,255,0.1)', color: 'white' }} />
            <button className="login-btn" onClick={applyCustomDates} style={{ padding: '0.5rem 1rem' }}>Apply Filter</button>
          </div>
        )}
      </div>

      {/* Workout Type Selector */}
      <div className="filter-container glass-panel" style={{ padding: '1rem', marginBottom: '1.5rem' }}>
        <div className="filter-chips">
          {EXERCISE_TYPES.length > 0 ? EXERCISE_TYPES.map((type) => (
            <button
              key={type}
              title={type}
              className={`chip ${filter === type ? 'active' : ''}`}
              style={{ fontSize: '1.5rem', padding: '0.5rem 1rem' }}
              onClick={() => {
                setFilter(filter === type ? null : type);
                setSelectedWorkout(null);
              }}
            >
              {getWorkoutIcon(type)}
            </button>
          )) : (
            <p className="subtitle" style={{ margin: 0 }}>No data</p>
          )}
          {filter && <button className="chip clear-filter-btn" onClick={() => setFilter(null)}>Clear Filter</button>}
        </div>
      </div>

      <div className="dashboard-grid">
        {filter ? (
          <>
            <div className="list-section glass-panel">
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.2rem', marginBottom: '1rem' }}>
                {filter}
              </h2>
              <div className="workout-list">
                {filteredWorkouts.map((workout) => {
                  const localDate = new Date(workout.rawDateStr);
                  const displayDate = localDate.toLocaleDateString();
                  const displayTime = localDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  
                  return (
                    <div 
                      key={workout.id} 
                      className={`workout-card ${selectedWorkout?.id === workout.id ? 'selected' : ''}`}
                      onClick={() => setSelectedWorkout(workout)}
                    >
                      <div className="workout-card-header">
                        <span className="workout-date" suppressHydrationWarning>{displayDate} - {displayTime}</span>
                      </div>
                      <div className="workout-card-body">
                        <div className="metric">
                          <span className="metric-value">{workout.cardioLoad}</span>
                          <span className="metric-label">Cardio Load</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {filteredWorkouts.length === 0 && (
                  <p className="empty-state">No workouts found for this type.</p>
                )}
              </div>
            </div>

            {renderDetailSection()}
          </>
        ) : searchParams.has('start') ? (
          <div className="overview-section" style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Chart Panel (Full width) */}
            <div className="glass-panel" style={{ padding: '2rem' }}>
              <h2 style={{ marginBottom: '2rem', fontSize: '1.5rem' }}>
                Workout Distribution
              </h2>
              {initialWorkouts.length > 0 ? (
                <DonutChart data={distributionData} />
              ) : (
                <div className="empty-state" style={{ padding: '3rem 0' }}>
                  <p>No workouts found for this period.</p>
                </div>
              )}
            </div>

            {/* Split layout for List and Details */}
            {initialWorkouts.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: selectedWorkout ? '1fr 1.5fr' : '1fr', gap: '2rem' }}>
                {/* All Sessions List Panel */}
                <div className="glass-panel list-section" style={{ padding: '2rem' }}>
                  <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>All Sessions</h2>
                  <div className="workout-list" style={{ maxHeight: selectedWorkout ? '400px' : '500px' }}>
                    {initialWorkouts.map((workout) => {
                      const localDate = new Date(workout.rawDateStr);
                      const displayDate = localDate.toLocaleDateString();
                      const displayTime = localDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                      
                      return (
                        <div 
                          key={workout.id} 
                          className={`workout-card ${selectedWorkout?.id === workout.id ? 'selected' : ''}`} 
                          onClick={() => setSelectedWorkout(workout)}
                        >
                        <div className="workout-card-header" style={{ marginBottom: '0.5rem' }}>
                          <span style={{ fontSize: '1.2rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {getWorkoutIcon(workout.type)} {workout.type}
                          </span>
                          <span className="workout-date" suppressHydrationWarning>{displayDate} - {displayTime}</span>
                        </div>
                        <div className="workout-card-body" style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                          <div className="metric">
                            <span className="metric-value">{workout.cardioLoad}</span>
                            <span className="metric-label">Cardio Load</span>
                          </div>
                          {workout.duration && (
                            <div className="metric">
                              <span className="metric-value" style={{ fontSize: '1.2rem', color: 'var(--text-primary)' }}>{workout.duration}</span>
                              <span className="metric-label">Duration</span>
                            </div>
                          )}
                          {workout.calories > 0 && (
                            <div className="metric">
                              <span className="metric-value" style={{ fontSize: '1.2rem', color: 'var(--text-primary)' }}>{workout.calories}</span>
                              <span className="metric-label">Kcal</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                    })}
                  </div>
                </div>
                
                {/* Right side details pane */}
                {selectedWorkout && renderDetailSection()}
              </div>
            )}
          </div>
        ) : (
          <div className="empty-state glass-panel" style={{ gridColumn: '1 / -1' }}>
            <h2>Welcome to your Dashboard</h2>
            <p>Please select a time period, an exercise type, or both from the filters above to view your metrics and distribution.</p>
          </div>
        )}
      </div>
    </div>
  );
}
