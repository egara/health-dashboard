'use client';
import { useState, useMemo, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Workout } from '@/types';
import DonutChart from './DonutChart';
import WorkoutCalendar from './WorkoutCalendar';
import '../app/Workouts.css';

const getWorkoutIcon = (type: string) => {
  const t = type.toLowerCase();
  if (t.includes('hiit') || t.includes('interval')) return '🔥';
  if (t.includes('pilates')) return '🧎‍♀️';
  if (t.includes('row')) return '🚣‍♂️';
  if (t.includes('hike')) return '🥾';
  if (t.includes('run')) return '🏃‍♂️';
  if (t.includes('walk')) return '🚶‍♂️';
  if (t.includes('cycl') || t.includes('bik') || t.includes('spin')) return '🚴‍♂️';
  if (t.includes('swim')) return '🏊‍♂️';
  if (t.includes('weight') || t.includes('strength')) return '🏋️‍♂️';
  if (t.includes('yoga')) return '🧘‍♂️';
  if (t.includes('elliptical')) return '⛷️';
  if (t.includes('climb')) return '🧗‍♂️';
  if (t.includes('cardio') || t.includes('aerobic')) return '❤️';
  if (t.includes('dance')) return '💃';
  if (t.includes('workout')) return '💪';
  return '🏅';
};

const getCardioLoadColor = (load: number) => {
  if (load <= 15) return '#4CAF50'; // Green
  if (load <= 30) return '#FFC107'; // Yellow
  return '#F44336'; // Red
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
  const [highlightedDate, setHighlightedDate] = useState<string | null>(null);
  const [overviewTab, setOverviewTab] = useState<'chart' | 'calendar'>('chart');

  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = (e: Event) => {
      const target = e.target as HTMLElement | Document;
      const scrollTop = target === document ? window.scrollY : (target as HTMLElement).scrollTop;
      setShowScrollTop(scrollTop > 300);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
      mainContent.addEventListener('scroll', handleScroll, { passive: true });
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (mainContent) mainContent.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.querySelector('.main-content')?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleWorkoutClick = (workout: Workout) => {
    setSelectedWorkout(workout);
    setTimeout(() => {
      const el = document.getElementById('workout-details-section');
      if (el && window.innerWidth <= 768) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

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
    
    if (days === 0) setOverviewTab('chart');
    
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    
    // Update URL
    router.push(`/?start=${start.toISOString().split('T')[0]}&end=${end.toISOString().split('T')[0]}`);
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const startParam = searchParams.get('start') || todayStr;
  const endParam = searchParams.get('end') || todayStr;
  const isTodayMode = startParam === todayStr && endParam === todayStr;

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

  // Compute the active date string from the selected workout for calendar syncing
  const activeDateStr = useMemo(() => {
    if (!selectedWorkout) return undefined;
    const d = new Date(selectedWorkout.rawDateStr);
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${mm}-${dd}`;
  }, [selectedWorkout]);

  const renderDetailSection = () => (
    <div id="workout-details-section" className="detail-section glass-panel">
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
              <span className="stat-value" style={{ color: getCardioLoadColor(selectedWorkout.cardioLoad) }}>{selectedWorkout.cardioLoad}</span>
            </div>
            <div className="stat-box">
              <span className="stat-label">Avg BPM</span>
              <span className="stat-value">{selectedWorkout.avgHeartRate > 0 ? selectedWorkout.avgHeartRate : '--'}</span>
            </div>
            <div className="stat-box">
              <span className="stat-label">Calories</span>
              <span className="stat-value">{selectedWorkout.calories > 0 ? selectedWorkout.calories : '--'} kcal</span>
            </div>
            
            {(selectedWorkout.type.toLowerCase().includes('walk') || 
              selectedWorkout.type.toLowerCase().includes('bik') || 
              selectedWorkout.type.toLowerCase().includes('cycl') || 
              selectedWorkout.type.toLowerCase().includes('run')) && (
              <div className="stat-box">
                <span className="stat-label">Distance</span>
                <span className="stat-value" style={{ fontSize: selectedWorkout.distance ? '2rem' : '1.2rem' }}>
                  {selectedWorkout.distance ? selectedWorkout.distance : 'Not available'}
                </span>
              </div>
            )}
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

  const renderWorkoutGroups = (workoutsToRender: Workout[]) => {
    const groups: { dateStr: string, displayDate: string, isToday: boolean, workouts: Workout[] }[] = [];
    workoutsToRender.forEach(w => {
      const localDate = new Date(w.rawDateStr);
      const mm = String(localDate.getMonth() + 1).padStart(2, '0');
      const dd = String(localDate.getDate()).padStart(2, '0');
      const dateStr = `${localDate.getFullYear()}-${mm}-${dd}`;
      
      let lastGroup = groups[groups.length - 1];
      if (!lastGroup || lastGroup.dateStr !== dateStr) {
        groups.push({
          dateStr,
          displayDate: localDate.toLocaleDateString(),
          isToday: localDate.toDateString() === new Date().toDateString(),
          workouts: [w]
        });
      } else {
        lastGroup.workouts.push(w);
      }
    });

    return groups.map(group => (
      <div 
        key={group.dateStr} 
        className={`day-group ${highlightedDate === group.dateStr ? 'highlight-flash' : ''}`}
        style={{ 
          marginBottom: '1.5rem', 
          border: '1px solid rgba(255,255,255,0.05)', 
          borderRadius: '16px', 
          padding: '1rem', 
          background: 'rgba(255,255,255,0.02)' 
        }}
      >
        <div suppressHydrationWarning style={{ marginBottom: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}>
          {group.isToday && <span className="today-badge" style={{ fontSize: '0.7rem' }}>TODAY</span>}
          {group.displayDate}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {group.workouts.map((workout) => {
            const localDate = new Date(workout.rawDateStr);
            const displayTime = localDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            return (
              <div 
                id={`workout-card-${workout.id}`}
                key={workout.id} 
                className={`workout-card ${selectedWorkout?.id === workout.id ? 'selected' : ''}`}
                onClick={() => handleWorkoutClick(workout)}
                style={{ margin: 0 }}
              >
                <div className="workout-card-header" style={{ marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '1.2rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {getWorkoutIcon(workout.type)} {workout.type}
                  </span>
                  <span className="workout-date" suppressHydrationWarning>
                    {displayTime}
                  </span>
                </div>
                <div className="workout-card-body" style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                  <div className="metric">
                    <span className="metric-value" style={{ color: getCardioLoadColor(workout.cardioLoad) }}>{workout.cardioLoad}</span>
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
    ));
  };

  return (
    <div className="workouts-container">
      <header className="page-header" style={{ marginBottom: '1rem' }}>
        <h1>Workouts</h1>
      </header>

      {/* Date Selector */}
      <div className="filter-container glass-panel" style={{ marginBottom: '1rem', padding: '1rem' }}>
        <div className="filter-chips">
          <button className={`chip ${isTodayMode && !isCustomDate ? 'active' : ''}`} onClick={() => handleDateFilter(0)}>Today</button>
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
          <div className="overview-section" style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Calendar Panel (Full width) - Hidden in Today mode */}
            {!isTodayMode && (
              <div className="glass-panel" style={{ padding: '2rem' }}>
                <WorkoutCalendar 
                  workouts={filteredWorkouts} 
                  selectedType={filter} 
                  activeDateStr={activeDateStr}
                  onDayClick={(dateStr) => {
                    const targetWorkouts = filteredWorkouts.filter(w => {
                      const d = new Date(w.rawDateStr);
                      const mm = String(d.getMonth() + 1).padStart(2, '0');
                      const dd = String(d.getDate()).padStart(2, '0');
                      const key = `${d.getFullYear()}-${mm}-${dd}`;
                      return key === dateStr;
                    });

                    if (targetWorkouts.length > 0) {
                      setSelectedWorkout(targetWorkouts[0]);
                      setHighlightedDate(dateStr);
                      
                      setTimeout(() => {
                        document.getElementById(`workout-card-${targetWorkouts[0].id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }, 50);
                      
                      setTimeout(() => {
                        setHighlightedDate(null);
                      }, 2000);
                    }
                  }}
                />
              </div>
            )}

            {/* Split layout for List and Details */}
            <div className={`dynamic-grid ${selectedWorkout ? 'split' : ''}`}>
              <div className="list-section glass-panel" style={{ padding: '2rem' }}>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.2rem', marginBottom: '1rem' }}>
                  {filter} List
                </h2>
                <div className="workout-list" style={{ flex: 1 }}>
                  {renderWorkoutGroups(filteredWorkouts)}
                  {filteredWorkouts.length === 0 && (
                    <p className="empty-state">No workouts found for this type.</p>
                  )}
                </div>
              </div>

              {renderDetailSection()}
            </div>
          </div>
        ) : searchParams.has('start') || isTodayMode ? (
          <div className="overview-section" style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Tabs Panel (Full width) */}
            <div className="glass-panel" style={{ padding: '2rem' }}>
              {!isTodayMode && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2rem' }}>
                  <button 
                    className={`chip ${overviewTab === 'chart' ? 'active' : ''}`}
                    onClick={() => setOverviewTab('chart')}
                  >
                    Distribution Chart
                  </button>
                  <button 
                    className={`chip ${overviewTab === 'calendar' ? 'active' : ''}`}
                    onClick={() => setOverviewTab('calendar')}
                  >
                    Activity Calendar
                  </button>
                </div>
              )}

              {overviewTab === 'chart' || isTodayMode ? (
                initialWorkouts.length > 0 ? (
                  <DonutChart data={distributionData} onSelect={(label) => setFilter(label)} />
                ) : (
                  <div className="empty-state" style={{ padding: '3rem 0' }}>
                    <p>No workouts found for this period.</p>
                  </div>
                )
              ) : (
                <WorkoutCalendar 
                  workouts={initialWorkouts} 
                  selectedType="Total" 
                  activeDateStr={activeDateStr}
                  onDayClick={(dateStr) => {
                    const targetWorkouts = initialWorkouts.filter(w => {
                      const d = new Date(w.rawDateStr);
                      const mm = String(d.getMonth() + 1).padStart(2, '0');
                      const dd = String(d.getDate()).padStart(2, '0');
                      const key = `${d.getFullYear()}-${mm}-${dd}`;
                      return key === dateStr;
                    });

                    if (targetWorkouts.length > 0) {
                      setSelectedWorkout(targetWorkouts[0]);
                      setHighlightedDate(dateStr);
                      
                      setTimeout(() => {
                        document.getElementById(`workout-card-${targetWorkouts[0].id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }, 50);
                      
                      setTimeout(() => {
                        setHighlightedDate(null);
                      }, 2000);
                    }
                  }}
                />
              )}
            </div>

            {/* Split layout for List and Details */}
            {initialWorkouts.length > 0 && (
              <div className={`dynamic-grid ${selectedWorkout ? 'split' : ''}`}>
                {/* All Sessions List Panel */}
                <div className="glass-panel list-section" style={{ padding: '2rem' }}>
                  <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>All Sessions</h2>
                  <div className="workout-list" style={{ flex: 1 }}>
                    {renderWorkoutGroups(initialWorkouts)}
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
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            backgroundColor: 'var(--accent-color)',
            color: '#fff',
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            zIndex: 1000,
            border: 'none',
            cursor: 'pointer'
          }}
        >
          ↑
        </button>
      )}
    </div>
  );
}
