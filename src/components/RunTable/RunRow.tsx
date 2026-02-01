import { useMemo } from 'react';
import {
  formatPace,
  titleForRun,
  formatRunTime,
  Activity,
  RunIds,
} from '@/utils/utils';
import { SHOW_ELEVATION_GAIN } from '@/utils/const';
import MiniRoutePreview from './MiniRoutePreview';
import styles from './style.module.css';

interface IRunRowProperties {
  elementIndex: number;
  locateActivity: (_runIds: RunIds) => void;
  run: Activity;
  runIndex: number;
  setRunIndex: (_ndex: number) => void;
}

// Get pace heat color based on pace value (min/km)
// Faster pace = green, slower pace = red
const getPaceHeatColor = (pace: number): string => {
  // Pace ranges (min/km): < 5 = very fast, 5-6 = fast, 6-7 = moderate, > 7 = slow
  if (pace <= 0) return 'inherit';

  if (pace < 5) {
    // Very fast - bright green
    return 'var(--trend-positive)';
  } else if (pace < 5.5) {
    // Fast - green
    return '#4caf50';
  } else if (pace < 6) {
    // Good - light green
    return '#8bc34a';
  } else if (pace < 6.5) {
    // Moderate - yellow-green
    return '#cddc39';
  } else if (pace < 7) {
    // Average - yellow
    return '#ffeb3b';
  } else if (pace < 7.5) {
    // Slow - orange
    return '#ff9800';
  } else {
    // Very slow - red-orange
    return '#ff5722';
  }
};

const RunRow = ({
  elementIndex,
  locateActivity,
  run,
  runIndex,
  setRunIndex,
}: IRunRowProperties) => {
  const distance = (run.distance / 1000.0).toFixed(2);
  const paceParts = run.average_speed ? formatPace(run.average_speed) : null;
  const heartRate = run.average_heartrate;
  const runTime = formatRunTime(run.moving_time);

  // Calculate pace in min/km for heat color
  const paceMinPerKm = useMemo(() => {
    if (!run.average_speed || run.average_speed <= 0) return 0;
    return 1000 / 60 / run.average_speed;
  }, [run.average_speed]);

  const paceColor = getPaceHeatColor(paceMinPerKm);

  const handleClick = () => {
    if (runIndex === elementIndex) {
      setRunIndex(-1);
      locateActivity([]);
      return;
    }
    setRunIndex(elementIndex);
    locateActivity([run.run_id]);
  };

  return (
    <tr
      className={`${styles.runRow} ${runIndex === elementIndex ? styles.selected : ''}`}
      key={run.start_date_local}
      onClick={handleClick}
    >
      <td className={styles.titleCell}>
        <div className={styles.titleCellContent}>
          <MiniRoutePreview activity={run} size={28} />
          <span className={styles.runTitle}>{titleForRun(run)}</span>
        </div>
      </td>
      <td>{distance}</td>
      {SHOW_ELEVATION_GAIN && <td>{(run.elevation_gain ?? 0.0).toFixed(1)}</td>}
      {paceParts && (
        <td className={styles.paceCell}>
          <span
            className={styles.paceValue}
            style={{
              color: paceColor,
              textShadow: paceColor !== 'inherit' ? '0 0 1px rgba(0,0,0,0.2)' : 'none',
            }}
          >
            {paceParts}
          </span>
        </td>
      )}
      <td>{heartRate && heartRate.toFixed(0)}</td>
      <td>{runTime}</td>
      <td className={styles.runDate}>{run.start_date_local}</td>
    </tr>
  );
};

export default RunRow;
