import { useMemo } from 'react';
import styles from './style.module.css';

interface BarData {
  value: number;
  label?: string;
}

interface MiniBarChartProps {
  data: BarData[];
  height?: number;
  color?: string;
  showLabels?: boolean;
}

const MiniBarChart = ({
  data,
  height = 60,
  color = 'var(--nb-accent-cyan)',
  showLabels = false,
}: MiniBarChartProps) => {
  const { maxValue, normalizedData } = useMemo(() => {
    const max = Math.max(...data.map((d) => d.value), 1);
    const normalized = data.map((d) => ({
      ...d,
      heightPercent: (d.value / max) * 100,
    }));
    return { maxValue: max, normalizedData: normalized };
  }, [data]);

  if (data.length === 0) {
    return (
      <div className={styles.emptyChart} style={{ height }}>
        No data
      </div>
    );
  }

  return (
    <div className={styles.miniBarChart} style={{ height }}>
      <div className={styles.barsContainer}>
        {normalizedData.map((item, index) => (
          <div key={index} className={styles.barWrapper}>
            <div
              className={styles.bar}
              style={{
                height: `${item.heightPercent}%`,
                backgroundColor: color,
              }}
              title={`${item.value.toFixed(1)}`}
            />
            {showLabels && item.label && (
              <span className={styles.barLabel}>{item.label}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MiniBarChart;
