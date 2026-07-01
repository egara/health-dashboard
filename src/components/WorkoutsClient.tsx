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

  // Estados para fechas personalizadas
  const [customStart, setCustomStart] = useState(searchParams.get('start') || '');
  const [customEnd, setCustomEnd] = useState(searchParams.get('end') || '');
  const [isCustomDate, setIsCustomDate] = useState(!!(searchParams.get('start')));

  const handleDateFilter = (days: number | null) => {
    setSelectedWorkout(null);
    if (days === null) {
      // Personalizado
      setIsCustomDate(true);
      return;
    }
    setIsCustomDate(false);
    
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    
    // Actualizar URL
    router.push(`/?start=${start.toISOString().split('T')[0]}&end=${end.toISOString().split('T')[0]}`);
  };

  const applyCustomDates = () => {
    setSelectedWorkout(null);
    const start = customStart || '2000-01-01';
    const end = customEnd || new Date().toISOString().split('T')[0];
    router.push(`/?start=${start}&end=${end}`);
  };

  // Extraer tipos únicos para los filtros, o usar los por defecto si no hay
  const EXERCISE_TYPES = useMemo(() => {
    const types = new Set(initialWorkouts.map(w => w.type));
    return Array.from(types).slice(0, 6); // Mostrar max 6 tipos
  }, [initialWorkouts]);

  const filteredWorkouts = filter 
    ? initialWorkouts.filter((w) => w.type === filter)
    : [];

  return (
    <div className="workouts-page">
      <header className="page-header">
        <h1>Tus Entrenamientos Reales</h1>
        <p className="subtitle">Datos extraídos directamente de Google Health.</p>
      </header>

      {/* 1. Selector de Fechas */}
      <div className="filter-container glass-panel" style={{ marginBottom: '1rem' }}>
        <span className="filter-label">1. Periodo de tiempo:</span>
        <div className="filter-chips">
          <button className={`chip ${!isCustomDate && searchParams.get('start')?.includes(new Date(Date.now() - 7*86400000).toISOString().split('T')[0]) ? 'active' : ''}`} onClick={() => handleDateFilter(7)}>7 Días</button>
          <button className={`chip ${!isCustomDate && searchParams.get('start')?.includes(new Date(Date.now() - 30*86400000).toISOString().split('T')[0]) ? 'active' : ''}`} onClick={() => handleDateFilter(30)}>30 Días</button>
          <button className={`chip ${!isCustomDate && searchParams.get('start')?.includes(new Date(Date.now() - 365*86400000).toISOString().split('T')[0]) ? 'active' : ''}`} onClick={() => handleDateFilter(365)}>1 Año</button>
          <button className={`chip ${isCustomDate ? 'active' : ''}`} onClick={() => handleDateFilter(null)}>Personalizado...</button>
        </div>
        
        {isCustomDate && (
          <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <input type="date" className="date-input" value={customStart} onChange={(e) => setCustomStart(e.target.value)} style={{ padding: '0.5rem', borderRadius: '4px', border: 'none', background: 'rgba(255,255,255,0.1)', color: 'white' }} />
            <span>hasta</span>
            <input type="date" className="date-input" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} style={{ padding: '0.5rem', borderRadius: '4px', border: 'none', background: 'rgba(255,255,255,0.1)', color: 'white' }} />
            <button className="login-btn" onClick={applyCustomDates} style={{ padding: '0.5rem 1rem' }}>Aplicar Filtro</button>
          </div>
        )}
      </div>

      {/* 2. Selector de Ejercicio */}
      <div className="filter-container glass-panel">
        <span className="filter-label">2. Selecciona tipo de entrenamiento:</span>
        <div className="filter-chips">
          {EXERCISE_TYPES.length > 0 ? EXERCISE_TYPES.map((type) => (
            <button
              key={type}
              className={`chip ${filter === type ? 'active' : ''}`}
              onClick={() => {
                setFilter(type);
                setSelectedWorkout(null);
              }}
            >
              {type}
            </button>
          )) : (
            <span style={{color: 'var(--text-secondary)'}}>No se han encontrado sesiones recientes.</span>
          )}
        </div>
      </div>

      <div className="dashboard-grid">
        {filter ? (
          <>
            <div className="list-section glass-panel">
              <h2>3. Sesiones de {filter}</h2>
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
                  <p className="empty-state">No hay entrenamientos de este tipo.</p>
                )}
              </div>
            </div>

            <div className="detail-section glass-panel">
              {selectedWorkout ? (
                <div className="workout-details">
                  <h2>4. Detalles de la sesión</h2>
                  <div className="detail-header">
                    <h3>{selectedWorkout.type}</h3>
                    <p suppressHydrationWarning>
                      {new Date(selectedWorkout.rawDateStr).toLocaleDateString()} a las {new Date(selectedWorkout.rawDateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  
                  <div className="stats-grid">
                    <div className="stat-box">
                      <span className="stat-label">Duración</span>
                      <span className="stat-value">{selectedWorkout.duration}</span>
                    </div>
                    <div className="stat-box highlight">
                      <span className="stat-label">Cardio Load</span>
                      <span className="stat-value">{selectedWorkout.cardioLoad}</span>
                    </div>
                    <div className="stat-box">
                      <span className="stat-label">BPM Medio</span>
                      <span className="stat-value">{selectedWorkout.avgHeartRate > 0 ? selectedWorkout.avgHeartRate : '--'}</span>
                    </div>
                    <div className="stat-box">
                      <span className="stat-label">Calorías</span>
                      <span className="stat-value">{selectedWorkout.calories > 0 ? selectedWorkout.calories : '--'} kcal</span>
                    </div>
                  </div>
                  
                  <div className="extra-details-grid" style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                    <div className="glass-panel" style={{ padding: '1.5rem', background: 'rgba(255, 255, 255, 0.02)' }}>
                      <h4 style={{ marginBottom: '1rem', color: 'var(--primary-color)', fontSize: '1.1rem' }}>Dispositivo y Origen</h4>
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '2' }}>
                        <li><strong>Dispositivo:</strong> {selectedWorkout.deviceName}</li>
                        <li><strong>Plataforma:</strong> {selectedWorkout.platform}</li>
                        <li><strong>Método de registro:</strong> {selectedWorkout.recordingMethod === 'PASSIVELY_MEASURED' ? 'Automático' : selectedWorkout.recordingMethod}</li>
                      </ul>
                    </div>

                    <div className="glass-panel" style={{ padding: '1.5rem', background: 'rgba(255, 255, 255, 0.02)' }}>
                      <h4 style={{ marginBottom: '1rem', color: 'var(--primary-color)', fontSize: '1.1rem' }}>Zonas Cardíacas</h4>
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '2' }}>
                        <li><span style={{color: '#4CAF50'}}>●</span> <strong>Ligera:</strong> {selectedWorkout.zones?.light || 0} min</li>
                        <li><span style={{color: '#FFC107'}}>●</span> <strong>Moderada:</strong> {selectedWorkout.zones?.moderate || 0} min</li>
                        <li><span style={{color: '#FF9800'}}>●</span> <strong>Vigorosa:</strong> {selectedWorkout.zones?.vigorous || 0} min</li>
                        <li><span style={{color: '#F44336'}}>●</span> <strong>Pico:</strong> {selectedWorkout.zones?.peak || 0} min</li>
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="detail-empty">
                  <p>4. Selecciona un entrenamiento de la lista para ver sus detalles.</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="empty-state glass-panel" style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center' }}>
            <p>Selecciona un tipo de entrenamiento arriba para comenzar a explorar tus datos.</p>
          </div>
        )}
      </div>
    </div>
  );
}
