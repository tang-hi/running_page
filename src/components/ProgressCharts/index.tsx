import { useState } from 'react';
import {
  useProgressData,
  ActivityType,
  TimeRange,
  formatPace,
  formatDistance,
} from './useProgressData';
import PaceChart from './PaceChart';
import DistanceChart from './DistanceChart';
import HeartRateChart from './HeartRateChart';
import ElevationChart from './ElevationChart';
import styles from './style.module.css';

const ProgressCharts = () => {
  const [activityType, setActivityType] = useState<ActivityType>('Run');
  const [timeRange, setTimeRange] = useState<TimeRange>('1y');

  const { stats, chartData } = useProgressData(activityType, timeRange);

  return (
    <div className={styles.progressContainer}>
      <h1 className={styles.pageTitle}>Progress</h1>

      {/* Filters */}
      <div className={styles.filterSection}>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Activity Type</label>
          <select
            className={styles.filterSelect}
            value={activityType}
            onChange={(e) => setActivityType(e.target.value as ActivityType)}
          >
            <option value="Run">Running</option>
            <option value="Walk">Walking</option>
            <option value="Ride">Cycling</option>
            <option value="All">All</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Time Range</label>
          <select
            className={styles.filterSelect}
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as TimeRange)}
          >
            <option value="3m">3 Months</option>
            <option value="6m">6 Months</option>
            <option value="1y">1 Year</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Total Runs</div>
          <div className={styles.statValue}>{stats.totalRuns}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Total Distance</div>
          <div className={styles.statValue}>
            {formatDistance(stats.totalDistance)}
            <span className={styles.statUnit}>km</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Average Pace</div>
          <div className={styles.statValue}>
            {formatPace(stats.averagePace)}
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Best Pace</div>
          <div className={styles.statValue}>{formatPace(stats.bestPace)}</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className={styles.chartsGrid}>
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>
            <span className={`${styles.chartTitleIcon} ${styles.pace}`}></span>
            Pace Trend
          </h3>
          <div className={styles.chartWrapper}>
            <PaceChart data={chartData} />
          </div>
        </div>

        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>
            <span
              className={`${styles.chartTitleIcon} ${styles.distance}`}
            ></span>
            Cumulative Distance
          </h3>
          <div className={styles.chartWrapper}>
            <DistanceChart data={chartData} />
          </div>
        </div>

        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>
            <span
              className={`${styles.chartTitleIcon} ${styles.heartrate}`}
            ></span>
            Heart Rate
          </h3>
          <div className={styles.chartWrapper}>
            <HeartRateChart data={chartData} />
          </div>
        </div>

        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>
            <span
              className={`${styles.chartTitleIcon} ${styles.elevation}`}
            ></span>
            Elevation Gain
          </h3>
          <div className={styles.chartWrapper}>
            <ElevationChart data={chartData} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressCharts;
