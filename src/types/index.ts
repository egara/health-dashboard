/**
 * Shared TypeScript definitions for the Health Dashboard application.
 * All interfaces and types used across components and API routes should be defined here.
 */

/**
 * Represents the heart rate zones calculated during a workout.
 */
export interface HeartRateZones {
  light: number;
  moderate: number;
  vigorous: number;
  peak: number;
}

/**
 * Core interface representing a parsed workout session.
 * Used by the UI to display workout details and lists.
 */
export interface Workout {
  id: string;
  type: string;
  rawDateStr: string;
  duration: string;
  cardioLoad: number;
  avgHeartRate: number;
  calories: number;
  distance?: string | null;
  deviceName: string;
  platform: string;
  recordingMethod: string;
  zones: HeartRateZones;
}

/**
 * Raw data point interface from the Google Health API.
 */
export interface GoogleHealthDataPoint {
  id?: string;
  name?: string;
  exercise?: {
    exerciseType?: string;
    interval?: {
      startTime?: string;
      endTime?: string;
      civilStartTime?: string;
      civilEndTime?: string;
    };
    metricsSummary?: {
      caloriesKcal?: string | number;
      averageHeartRateBeatsPerMinute?: string | number;
      activeZoneMinutes?: string | number;
      distanceMeters?: string | number;
      distanceMillimeters?: string | number;
      heartRateZoneDurations?: {
        lightTime?: string | number;
        moderateTime?: string | number;
        vigorousTime?: string | number;
        peakTime?: string | number;
      };
    };
  };
  dataSource?: {
    device?: {
      displayName?: string;
    };
    platform?: string;
    recordingMethod?: string;
  };
}
