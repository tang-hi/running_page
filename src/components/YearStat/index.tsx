import { lazy, Suspense, useMemo } from 'react';
import Stat from '@/components/Stat';
import useActivities from '@/hooks/useActivities';
import { formatPace } from '@/utils/utils';
import useHover from '@/hooks/useHover';
import { yearStats } from '@assets/index';
import { loadSvgComponent } from '@/utils/svgUtils';
import { SHOW_ELEVATION_GAIN } from '@/utils/const';
import styles from './style.module.css';

const YearStat = ({
  year,
  onClick,
}: {
  year: string;
  onClick: (_year: string) => void;
}) => {
  let { activities: runs, years } = useActivities();
  // for hover
  const [hovered, eventHandlers] = useHover();
  // lazy Component
  const YearSVG = lazy(() => loadSvgComponent(yearStats, `./year_${year}.svg`));

  const filteredRuns = useMemo(() => {
    if (years.includes(year)) {
      return runs.filter((run) => run.start_date_local.slice(0, 4) === year);
    }
    return runs;
  }, [runs, years, year]);

  const stats = useMemo(() => {
    let sumDistance = 0;
    let streak = 0;
    let sumElevationGain = 0;
    let heartRate = 0;
    let heartRateNullCount = 0;
    let totalMetersAvail = 0;
    let totalSecondsAvail = 0;

    filteredRuns.forEach((run) => {
      sumDistance += run.distance || 0;
      sumElevationGain += run.elevation_gain || 0;
      if (run.average_speed) {
        totalMetersAvail += run.distance || 0;
        totalSecondsAvail += (run.distance || 0) / run.average_speed;
      }
      if (run.average_heartrate) {
        heartRate += run.average_heartrate;
      } else {
        heartRateNullCount++;
      }
      if (run.streak) {
        streak = Math.max(streak, run.streak);
      }
    });

    return {
      sumDistance: parseFloat((sumDistance / 1000.0).toFixed(1)),
      sumElevationGain: sumElevationGain.toFixed(0),
      avgPace: formatPace(totalMetersAvail / totalSecondsAvail),
      hasHeartRate: heartRate !== 0,
      avgHeartRate: (
        heartRate /
        (filteredRuns.length - heartRateNullCount)
      ).toFixed(0),
      streak,
      runCount: filteredRuns.length,
    };
  }, [filteredRuns]);

  const isTotal = year === 'Total';

  return (
    <div
      className={`${styles.yearStatContainer} ${isTotal ? styles.isTotal : ''}`}
      onClick={() => onClick(year)}
    >
      <section {...eventHandlers} className={styles.yearStatSection}>
        {/* Year Title */}
        <div className={styles.yearTitle}>
          <span className={styles.yearValue}>{year}</span>
          <span className={styles.yearLabel}>
            {isTotal ? 'ALL TIME' : 'JOURNEY'}
          </span>
        </div>

        {/* Stats Grid */}
        <div className={styles.statsGrid}>
          <Stat
            value={stats.runCount}
            description="RUNS"
            isCard
            variant="coral"
            className={styles.statCard}
          />
          <Stat
            value={stats.sumDistance}
            description="KM"
            isCard
            variant="cyan"
            className={styles.statCard}
          />
          <Stat
            value={stats.avgPace}
            description="AVG PACE"
            isCard
            variant="yellow"
            className={styles.statCard}
          />
          <Stat
            value={`${stats.streak}d`}
            description="STREAK"
            isCard
            variant="default"
            className={styles.statCard}
          />
        </div>

        {/* Secondary Stats */}
        <div className={styles.secondaryStats}>
          {SHOW_ELEVATION_GAIN && (
            <div className={styles.secondaryStat}>
              <span className={styles.secondaryValue}>
                {stats.sumElevationGain}m
              </span>
              <span className={styles.secondaryLabel}>Elevation</span>
            </div>
          )}
          {stats.hasHeartRate && (
            <div className={styles.secondaryStat}>
              <span className={styles.secondaryValue}>
                {stats.avgHeartRate}
              </span>
              <span className={styles.secondaryLabel}>Avg HR</span>
            </div>
          )}
        </div>
      </section>

      {/* Year SVG on hover */}
      {year !== 'Total' && hovered && (
        <Suspense
          fallback={
            <div className={styles.svgLoading}>Loading chart...</div>
          }
        >
          <YearSVG className={styles.yearSvg} />
        </Suspense>
      )}
    </div>
  );
};

export default YearStat;
