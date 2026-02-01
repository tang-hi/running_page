import { useMemo } from 'react';
import YearStat from '@/components/YearStat';
import useActivities from '@/hooks/useActivities';
import { INFO_MESSAGE, YEAR_GOAL } from '@/utils/const';
import { MiniBarChart, MiniLineChart } from '@/components/MiniCharts';
import GoalRing from '@/components/GoalRing';
import {
  useWeeklyDistanceData,
  useRecentPaceData,
} from '@/hooks/useMiniChartData';
import styles from './style.module.css';

const YearsStat = ({
  year,
  onClick,
}: {
  year: string;
  onClick: (_year: string) => void;
}) => {
  const { years, activities } = useActivities();

  // Get current year's activities for goal tracking
  const currentYear = new Date().getFullYear().toString();
  const currentYearActivities = useMemo(() => {
    return activities.filter(
      (run) => run.start_date_local.slice(0, 4) === currentYear
    );
  }, [activities, currentYear]);

  // Calculate current year's total distance
  const currentYearDistance = useMemo(() => {
    return (
      currentYearActivities.reduce((sum, run) => sum + (run.distance || 0), 0) /
      1000
    );
  }, [currentYearActivities]);

  // Mini chart data
  const weeklyData = useWeeklyDistanceData(activities, 8);
  const paceData = useRecentPaceData(activities, 10);

  // Memoize the years array calculation
  const yearsArrayUpdate = useMemo(() => {
    // make sure the year click on front
    let updatedYears = years.slice();
    updatedYears.push('Total');
    updatedYears = updatedYears.filter((x) => x !== year);
    updatedYears.unshift(year);
    return updatedYears;
  }, [years, year]);

  const infoMessage = useMemo(() => {
    return INFO_MESSAGE(years.length, year);
  }, [years.length, year]);

  // Check if we should show the dashboard (only when viewing Total or current year)
  const showDashboard = year === 'Total' || year === currentYear;

  return (
    <div className={styles.yearsStatContainer}>
      <section className={styles.infoSection}>
        <p className={styles.infoMessage}>{infoMessage}</p>
      </section>

      {/* Mini Dashboard */}
      {showDashboard && (
        <div className={styles.dashboardSection}>
          {/* Goal Ring */}
          <div className={styles.goalSection}>
            <GoalRing
              current={currentYearDistance}
              target={YEAR_GOAL}
              label={`${currentYear} Goal`}
              size={100}
              strokeWidth={6}
            />
          </div>

          {/* Mini Charts */}
          <div className={styles.chartsSection}>
            <div className={styles.miniChartWrapper}>
              <span className={styles.chartLabel}>Weekly Distance</span>
              <MiniBarChart data={weeklyData} height={50} />
            </div>
            <div className={styles.miniChartWrapper}>
              <span className={styles.chartLabel}>Recent Pace</span>
              <MiniLineChart data={paceData} height={35} />
            </div>
          </div>
        </div>
      )}

      <hr className={styles.divider} />

      {/* Year Stats */}
      {yearsArrayUpdate.map((yearItem) => (
        <YearStat key={yearItem} year={yearItem} onClick={onClick} />
      ))}
    </div>
  );
};

export default YearsStat;
