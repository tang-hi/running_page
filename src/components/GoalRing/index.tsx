import { useMemo } from 'react';
import styles from './style.module.css';

interface GoalRingProps {
  current: number;
  target: number;
  label: string;
  unit?: string;
  size?: number;
  strokeWidth?: number;
  color?: string;
}

const GoalRing = ({
  current,
  target,
  label,
  unit = 'km',
  size = 120,
  strokeWidth = 8,
  color = 'var(--nb-accent-cyan)',
}: GoalRingProps) => {
  const { percentage, circumference, strokeDashoffset, displayCurrent } =
    useMemo(() => {
      const pct = Math.min((current / target) * 100, 100);
      const radius = (size - strokeWidth) / 2;
      const circ = 2 * Math.PI * radius;
      const offset = circ - (pct / 100) * circ;

      return {
        percentage: pct,
        circumference: circ,
        strokeDashoffset: offset,
        displayCurrent: current.toFixed(0),
      };
    }, [current, target, size, strokeWidth]);

  const radius = (size - strokeWidth) / 2;
  const center = size / 2;

  return (
    <div className={styles.goalRing} style={{ width: size, height: size }}>
      <svg width={size} height={size} className={styles.ringSvg}>
        {/* Background circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth={strokeWidth}
          opacity={0.2}
        />
        {/* Progress circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          transform={`rotate(-90 ${center} ${center})`}
          className={styles.progressCircle}
        />
      </svg>
      <div className={styles.ringContent}>
        <div className={styles.percentage}>{percentage.toFixed(0)}%</div>
        <div className={styles.values}>
          <span className={styles.current}>{displayCurrent}</span>
          <span className={styles.separator}>/</span>
          <span className={styles.target}>{target}</span>
          <span className={styles.unit}>{unit}</span>
        </div>
        <div className={styles.label}>{label}</div>
      </div>
    </div>
  );
};

export default GoalRing;
