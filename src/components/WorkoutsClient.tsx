'use client';
import { useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import '../app/Workouts.css';

interface Workout {
  id: string | number;
  type: string;
  rawDateStr: string;
  duration: string;
  cardioLoad: number;
  avgHeartRate: number;
  calories: number;
  deviceName?: string;
  platform?: string;
  recordingMethod?: string;
  zones?: {
    light: number;
    moderate: number;
    vigorous: number;
    peak: number;
  };
}

export default function WorkoutsClient({ initialWorkouts }: { initialWorkouts: Workout[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [filter, setFilter] = useState<string | null>(null);
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);

  // States for custom dates
  const [customStart, setCustomStart] = useState(searchParams.get('start') || '');
  const [customEnd, setCustomEnd] = useState(searchParams.get('end') || '');
  const [isCustomDate, setIsCustomDate] = useState(!!(searchParams.get('start')));

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

  return (
    <div className="workouts-container">
      <header className="page-header">
        <h1>Your Real Workouts</h1>
        <p className="subtitle">Data extracted directly from Google Health.</p>
      </header>

      {/* 1. Date Selector */}
      <div className="filter-container glass-panel" style={{ marginBottom: '1rem' }}>
        <span className="filter-label">1. Time Period:</span>
        <div className="filter-chips">
          <button className={`chip ${!isCustomDate && searchParams.get('start')?.includes(new Date(Date.now() - 7*86400000).toISOString().split('T')[0]) ? 'active' : ''}`} onClick={() => handleDateFilter(7)}>7 Days</button>
          <button className={`chip ${!isCustomDate && searchParams.get('start')?.includes(new Date(Date.now() - 30*86400000).toISOString().split('T')[0]) ? 'active' : ''}`} onClick={() => handleDateFilter(30)}>30 Days</button>
          <button className={`chip ${!isCustomDate && searchParams.get('start')?.includes(new Date(Date.now() - 365*86400000).toISOString().split('T')[0]) ? 'active' : ''}`} onClick={() => handleDateFilter(365)}>1 Year</button>
          <button className={`chip ${isCustomDate ? 'active' : ''}`} onClick={() => handleDateFilter(null)}>Custom...</button>
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

      {/* 2. Workout Type Selector */}
      <div className="filter-container glass-panel">
        <span className="filter-label">2. Select workout type:</span>
        <div className="filter-chips">
          {EXERCISE_TYPES.length > 0 ? EXERCISE_TYPES.map((type) => (
            <button
              key={type}
              className={`chip ${filter === type ? 'active' : ''}`}
              onClick={() => {
                setFilter(filter === type ? null : type);
                setSelectedWorkout(null);
              }}
            >
              {type}
            </button>
          )) : (
            <p className="subtitle">No data available yet</p>
          )}
          {filter && <button className="chip clear-filter" onClick={() => setFilter(null)}>Clear Filter</button>}
        </div>
      </div>

      <div className="dashboard-grid">
        {filter ? (
          <>
            <div className="list-section glass-panel">
              <h2>3. {filter} Sessions</h2>
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

            <div className="detail-section glass-panel">
              {selectedWorkout ? (
                <div className="workout-details">
                  <h2>4. Session Details</h2>
                  <div className="detail-header">
                    <h3>{selectedWorkout.type}</h3>
                    <p suppressHydrationWarning>
                      {new Date(selectedWorkout.rawDateStr).toLocaleDateString()} at {new Date(selectedWorkout.rawDateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                <div className="detail-empty">
                  <p>4. Select a workout from the list to view its details.</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="empty-state glass-panel" style={{ gridColumn: '1 / -1' }}>
            <h2>Select a category to begin</h2>
            <p>Choose an exercise type above to view your detailed metrics.</p>
          </div>
        )}
      </div>
    </div>
  );
}
