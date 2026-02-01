import { useMemo } from 'react';
import activities from '@/static/activities.json';

export type ActivityType = 'Run' | 'Walk' | 'Ride' | 'All';
export type TimeRange = '3m' | '6m' | '1y' | 'all';

export interface ProcessedActivity {
  date: string;
  dateTimestamp: number;
  distance: number;
  pace: number;
  movingTime: number;
  heartRate: number | null;
  elevation: number;
  type: string;
  name: string;
}

export interface ProgressStats {
  totalRuns: number;
  totalDistance: number;
  averagePace: number;
  bestPace: number;
}

export interface ProgressDataPoint {
  date: string;
  dateTimestamp: number;
  pace: number;
  movingAvgPace: number | null;
  cumulativeDistance: number;
  heartRate: number | null;
  elevation: number;
  distance: number;
}

const parseMovingTime = (timeStr: string): number => {
  const parts = timeStr.split(':');
  if (parts.length === 3) {
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    const seconds = parseFloat(parts[2]);
    return hours * 3600 + minutes * 60 + seconds;
  } else if (parts.length === 2) {
    const minutes = parseInt(parts[0], 10);
    const seconds = parseFloat(parts[1]);
    return minutes * 60 + seconds;
  }
  return 0;
};

const calculatePace = (distanceMeters: number, timeSeconds: number): number => {
  if (distanceMeters <= 0 || timeSeconds <= 0) return 0;
  const distanceKm = distanceMeters / 1000;
  const timeMinutes = timeSeconds / 60;
  return timeMinutes / distanceKm;
};

const calculateMovingAverage = (
  data: number[],
  index: number,
  windowSize: number = 7
): number | null => {
  const start = Math.max(0, index - windowSize + 1);
  const values = data.slice(start, index + 1).filter((v) => v > 0);
  if (values.length === 0) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
};

const getTimeRangeDate = (range: TimeRange): Date | null => {
  const now = new Date();
  switch (range) {
    case '3m':
      return new Date(now.setMonth(now.getMonth() - 3));
    case '6m':
      return new Date(now.setMonth(now.getMonth() - 6));
    case '1y':
      return new Date(now.setFullYear(now.getFullYear() - 1));
    case 'all':
      return null;
  }
};

export const useProgressData = (
  activityType: ActivityType,
  timeRange: TimeRange
) => {
  const { processedActivities, stats, chartData } = useMemo(() => {
    const rangeDate = getTimeRangeDate(timeRange);

    const filteredActivities = (activities as any[])
      .filter((activity) => {
        if (activityType !== 'All') {
          if (activityType === 'Run' && activity.type !== 'Run') return false;
          if (activityType === 'Walk' && activity.type !== 'Walk') return false;
          if (activityType === 'Ride' && activity.type !== 'Ride') return false;
        }

        if (rangeDate) {
          const activityDate = new Date(activity.start_date_local);
          if (activityDate < rangeDate) return false;
        }

        return true;
      })
      .map((activity) => {
        const movingTimeSeconds = parseMovingTime(activity.moving_time);
        const pace = calculatePace(activity.distance, movingTimeSeconds);

        return {
          date: activity.start_date_local.split(' ')[0],
          dateTimestamp: new Date(activity.start_date_local).getTime(),
          distance: activity.distance,
          pace,
          movingTime: movingTimeSeconds,
          heartRate: activity.average_heartrate || null,
          elevation: activity.elevation_gain || 0,
          type: activity.type,
          name: activity.name,
        } as ProcessedActivity;
      })
      .sort((a, b) => a.dateTimestamp - b.dateTimestamp);

    const totalRuns = filteredActivities.length;
    const totalDistance =
      filteredActivities.reduce((sum, a) => sum + a.distance, 0) / 1000;

    const validPaces = filteredActivities
      .map((a) => a.pace)
      .filter((p) => p > 0 && p < 15);
    const averagePace =
      validPaces.length > 0
        ? validPaces.reduce((a, b) => a + b, 0) / validPaces.length
        : 0;
    const bestPace = validPaces.length > 0 ? Math.min(...validPaces) : 0;

    const stats: ProgressStats = {
      totalRuns,
      totalDistance,
      averagePace,
      bestPace,
    };

    let cumulativeDistance = 0;
    const paces = filteredActivities.map((a) => a.pace);

    const chartData: ProgressDataPoint[] = filteredActivities.map(
      (activity, index) => {
        cumulativeDistance += activity.distance / 1000;
        const movingAvgPace = calculateMovingAverage(paces, index, 7);

        return {
          date: activity.date,
          dateTimestamp: activity.dateTimestamp,
          pace: activity.pace,
          movingAvgPace,
          cumulativeDistance,
          heartRate: activity.heartRate,
          elevation: activity.elevation,
          distance: activity.distance / 1000,
        };
      }
    );

    return {
      processedActivities: filteredActivities,
      stats,
      chartData,
    };
  }, [activityType, timeRange]);

  return {
    activities: processedActivities,
    stats,
    chartData,
  };
};

export const formatPace = (pace: number): string => {
  if (!pace || pace <= 0 || pace > 30) return '--';
  const minutes = Math.floor(pace);
  const seconds = Math.round((pace - minutes) * 60);
  return `${minutes}'${seconds.toString().padStart(2, '0')}"`;
};

export const formatDistance = (km: number): string => {
  return km.toFixed(1);
};
