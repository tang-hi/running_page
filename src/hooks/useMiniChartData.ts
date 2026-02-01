import { useMemo } from 'react';
import { Activity } from '@/utils/utils';

interface WeeklyData {
  value: number;
  label: string;
}

interface PaceData {
  value: number;
  label: string;
}

/**
 * Get weekly distance data for the last N weeks
 */
export const useWeeklyDistanceData = (
  activities: Activity[],
  weeks: number = 8
): WeeklyData[] => {
  return useMemo(() => {
    const now = new Date();
    const msPerWeek = 7 * 24 * 60 * 60 * 1000;

    // Initialize weeks array
    const weeklyData: WeeklyData[] = [];
    for (let i = weeks - 1; i >= 0; i--) {
      const weekStart = new Date(now.getTime() - (i + 1) * msPerWeek);
      const weekEnd = new Date(now.getTime() - i * msPerWeek);

      const weekDistance = activities
        .filter((run) => {
          const runDate = new Date(run.start_date_local);
          return runDate >= weekStart && runDate < weekEnd;
        })
        .reduce((sum, run) => sum + (run.distance || 0), 0);

      weeklyData.push({
        value: weekDistance / 1000, // Convert to km
        label: `W${weeks - i}`,
      });
    }

    return weeklyData;
  }, [activities, weeks]);
};

/**
 * Get recent pace data for the last N runs
 */
export const useRecentPaceData = (
  activities: Activity[],
  count: number = 10
): PaceData[] => {
  return useMemo(() => {
    // Sort by date descending and take last N runs
    const sortedRuns = [...activities]
      .filter((run) => run.average_speed && run.average_speed > 0)
      .sort(
        (a, b) =>
          new Date(b.start_date_local).getTime() -
          new Date(a.start_date_local).getTime()
      )
      .slice(0, count)
      .reverse(); // Reverse to show oldest first (left to right)

    return sortedRuns.map((run, index) => ({
      value: run.average_speed || 0,
      label: `R${index + 1}`,
    }));
  }, [activities, count]);
};

export default { useWeeklyDistanceData, useRecentPaceData };
