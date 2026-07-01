import { getServerSession } from "next-auth/next"
import { authOptions } from "./api/auth/[...nextauth]/route"
import WorkoutsClient from "@/components/WorkoutsClient"

export default async function Home(props: { searchParams?: any }) {
  const searchParams = await props.searchParams;
  const session = await getServerSession(authOptions) as any;

  if (!session || !session.accessToken) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Bienvenido a Health Dash</h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', maxWidth: '600px' }}>
          Para visualizar tus entrenamientos reales, haz clic en el botón <strong>"Conectar con Google"</strong> del menú lateral.
        </p>
      </div>
    )
  }

  // Leer fechas desde la URL (o usar el último año por defecto)
  let startDateObj = new Date();
  startDateObj.setFullYear(startDateObj.getFullYear() - 1);
  let endDateObj = new Date();

  if (searchParams?.start && searchParams?.end) {
    startDateObj = new Date(searchParams.start);
    endDateObj = new Date(searchParams.end);
    endDateObj.setHours(23, 59, 59, 999); // Final del día
  }

  const startDateIso = startDateObj.toISOString();
  const endDateIso = endDateObj.toISOString();

  // Formato "Civil" requerido por Google (sin la 'Z' ni milisegundos al final)
  const startCivil = startDateIso.substring(0, 19);
  const endCivil = endDateIso.substring(0, 19);

  // Nueva Google Health API (Fitbit unificado)
  // Añadimos filtro de fechas. Formato requerido por la API:
  const filterQuery = encodeURIComponent(`exercise.interval.civil_start_time >= "${startCivil}" AND exercise.interval.civil_start_time < "${endCivil}"`);
  
  // ¡CLAVE! Añadimos pageSize=500 para evitar el límite oculto de 25 resultados por defecto de Google
  const url = `https://health.googleapis.com/v4/users/me/dataTypes/exercise/dataPoints?pageSize=500&filter=${filterQuery}`;

  // Fetch real sessions from Google Health API
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${session.accessToken}`
    },
    cache: 'no-store'
  })
  
  if (!res.ok) {
    const errorText = await res.text();
    console.error("Failed to fetch Google Health API", errorText);
    return (
      <div style={{padding: '3rem', color: 'var(--danger-color)'}}>
        <h2>Error de conexión a la nueva API</h2>
        <p>Asegúrate de haber aceptado los nuevos permisos de Google Health.</p>
        <p style={{fontSize: '0.8rem', marginTop: '1rem'}}>{errorText.substring(0, 200)}</p>
      </div>
    )
  }

  const data = await res.json()
  console.log("\n--- DEBUG NUEVA API GOOGLE HEALTH ---");
  console.log("Ejercicios encontrados:", data.dataPoints?.length || 0);
  if (data.dataPoints?.length > 0) {
    console.log("Estructura completa de UN ejercicio para buscar Cardio Load:");
    console.log(JSON.stringify(data.dataPoints[0], null, 2));
  }
  console.log("-------------------------------------\n");
  
  // Transform data (adaptado de forma segura al nuevo esquema)
  const realWorkouts = (data.dataPoints || []).map((point: any, index: number) => {
    // En la nueva API, los datos suelen venir envueltos en 'point.exercise'
    const exerciseData = point.exercise || point;
    const interval = exerciseData.interval || {};

    const startDateStr = interval.civilStartTime || interval.startTime || new Date().toISOString();
    const endDateStr = interval.civilEndTime || interval.endTime || startDateStr;
    
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);
    
    // Calcular duración exacta
    const diffSecs = Math.floor((endDate.getTime() - startDate.getTime()) / 1000);
    const mins = Math.floor(diffSecs / 60);
    const secs = diffSecs % 60;
    const durationExact = `${mins} min ${secs} s`;
    
    // El tipo de ejercicio suele venir en exerciseType (ej: "WALKING", "RUNNING")
    let exerciseName = exerciseData.exerciseType || "Entrenamiento";
    const metrics = exerciseData.metricsSummary || {};
    const realCalories = Math.round(metrics.caloriesKcal || 0);
    const realHeartRate = parseInt(metrics.averageHeartRateBeatsPerMinute) || 0;
    // En el ecosistema Google/Fitbit, el Cardio Load se traduce como Active Zone Minutes
    const realCardioLoad = parseInt(metrics.activeZoneMinutes) || 0;

    // Extraer datos adicionales
    const deviceName = point.dataSource?.device?.displayName || "Desconocido";
    const platform = point.dataSource?.platform || "Desconocido";
    const recordingMethod = point.dataSource?.recordingMethod || "Desconocido";
    
    const zones = metrics.heartRateZoneDurations || {};
    const lightTime = parseInt(zones.lightTime) || 0;
    const moderateTime = parseInt(zones.moderateTime) || 0;
    const vigorousTime = parseInt(zones.vigorousTime) || 0;
    const peakTime = parseInt(zones.peakTime) || 0;

    return {
      id: point.name || point.id || `workout-${index}`,
      type: exerciseName,
      rawDateStr: startDate.toISOString(), // Pasamos la fecha en crudo para que el navegador la convierta a hora local
      duration: durationExact,
      cardioLoad: realCardioLoad, 
      avgHeartRate: realHeartRate,
      calories: realCalories,
      deviceName,
      platform,
      recordingMethod,
      zones: {
        light: Math.round(lightTime / 60),
        moderate: Math.round(moderateTime / 60),
        vigorous: Math.round(vigorousTime / 60),
        peak: Math.round(peakTime / 60),
      }
    }
  })
  .filter((w: any) => {
    // Filtrado local exacto
    const wDate = new Date(w.rawDateStr);
    return wDate >= startDateObj && wDate <= endDateObj;
  })
  .sort((a: any, b: any) => new Date(b.rawDateStr).getTime() - new Date(a.rawDateStr).getTime()); // Ordenar descendente

  return <WorkoutsClient initialWorkouts={realWorkouts} />
}
