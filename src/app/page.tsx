import { getServerSession } from "next-auth/next"
import { authOptions } from "./api/auth/[...nextauth]/route"
import WorkoutsClient from "@/components/WorkoutsClient"
import { GoogleHealthDataPoint, Workout } from "@/types"

/**
 * Server Component: Home Page
 * Fetches user session and fetches workout data from the Google Health API.
 * Maps raw API data into standardized Workout objects and performs server-side filtering.
 * 
 * @param {Object} props - Next.js page props
 * @param {Object} props.searchParams - URL search parameters for date filtering
 * @returns {JSX.Element} The rendered dashboard page
 */
export default async function Home(props: { searchParams?: { [key: string]: string | undefined } }) {
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

  // Read dates from URL (or use the last year by default)
  let startDateObj = new Date();
  startDateObj.setFullYear(startDateObj.getFullYear() - 1);
  let endDateObj = new Date();

  if (searchParams?.start && searchParams?.end) {
    startDateObj = new Date(searchParams.start);
    endDateObj = new Date(searchParams.end);
    endDateObj.setHours(23, 59, 59, 999); // End of day
  }

  const startDateIso = startDateObj.toISOString();
  const endDateIso = endDateObj.toISOString();

  // "Civil" format required by Google (without the 'Z' or milliseconds at the end)
  const startCivil = startDateIso.substring(0, 19);
  const endCivil = endDateIso.substring(0, 19);

  // New Google Health API (Unified Fitbit)
  // Add date filter. Format required by the API:
  const filterQuery = encodeURIComponent(`exercise.interval.civil_start_time >= "${startCivil}" AND exercise.interval.civil_start_time < "${endCivil}"`);
  
  // KEY! Add pageSize=500 to avoid the hidden default limit of 25 results from Google
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
        <h2>Connection Error to the new API</h2>
        <p>Make sure you have accepted the new Google Health permissions.</p>
        <p style={{fontSize: '0.8rem', marginTop: '1rem'}}>{errorText.substring(0, 200)}</p>
      </div>
    )
  }

  const data = await res.json()
  console.log("\n--- DEBUG NEW GOOGLE HEALTH API ---");
  console.log("Workouts found:", data.dataPoints?.length || 0);
  if (data.dataPoints?.length > 0) {
    console.log("Complete structure of ONE workout to find Cardio Load:");
    console.log(JSON.stringify(data.dataPoints[0], null, 2));
  }
  console.log("-------------------------------------\n");
  
  // Transform data (safely adapted to the new schema)
  const rawDataPoints: GoogleHealthDataPoint[] = data.dataPoints || [];
  
  const realWorkouts: Workout[] = rawDataPoints.map((point, index) => {
    // In the new API, data is usually wrapped in 'point.exercise'
    const exerciseData = point.exercise || point;
    const interval = exerciseData.interval || {};

    const startDateStr = interval.civilStartTime || interval.startTime || new Date().toISOString();
    const endDateStr = interval.civilEndTime || interval.endTime || startDateStr;
    
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);
    
    // Calculate exact duration
    const diffSecs = Math.floor((endDate.getTime() - startDate.getTime()) / 1000);
    const mins = Math.floor(diffSecs / 60);
    const secs = diffSecs % 60;
    const durationExact = `${mins} min ${secs} s`;
    
    // The exercise type is usually found in exerciseType (e.g. "WALKING", "RUNNING")
    let exerciseName = exerciseData.exerciseType || "Workout";
    // If it's uppercase, format it nicely
    if (typeof exerciseName === 'string') {
      exerciseName = exerciseName.charAt(0).toUpperCase() + exerciseName.slice(1).toLowerCase();
    }
    
    const metrics = exerciseData.metricsSummary || {};
    const realCalories = Math.round(metrics.caloriesKcal || 0);
    const realHeartRate = parseInt(metrics.averageHeartRateBeatsPerMinute) || 0;
    // In the Google/Fitbit ecosystem, Cardio Load translates to Active Zone Minutes
    const realCardioLoad = parseInt(metrics.activeZoneMinutes) || 0;

    // Extract additional data
    const deviceName = point.dataSource?.device?.displayName || "Unknown";
    const platform = point.dataSource?.platform || "Unknown";
    const recordingMethod = point.dataSource?.recordingMethod || "Unknown";
    
    const zones = metrics.heartRateZoneDurations || {};
    const lightTime = parseInt(zones.lightTime) || 0;
    const moderateTime = parseInt(zones.moderateTime) || 0;
    const vigorousTime = parseInt(zones.vigorousTime) || 0;
    const peakTime = parseInt(zones.peakTime) || 0;

    return {
      id: point.name || point.id || `workout-${index}`,
      type: exerciseName,
      rawDateStr: startDate.toISOString(), // Pass raw date string so the browser converts it to local time
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
  .filter((w: Workout) => {
    // Exact local filtering
    const wDate = new Date(w.rawDateStr);
    return wDate >= startDateObj && wDate <= endDateObj;
  })
  .sort((a: Workout, b: Workout) => new Date(b.rawDateStr).getTime() - new Date(a.rawDateStr).getTime()); // Sort descending

  return <WorkoutsClient initialWorkouts={realWorkouts} />
}
