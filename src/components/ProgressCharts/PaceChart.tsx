import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceDot,
} from 'recharts';
import { ProgressDataPoint, formatPace } from './useProgressData';
import styles from './style.module.css';

interface PaceChartProps {
  data: ProgressDataPoint[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const isPR = payload[0]?.payload?.isPR;
    return (
      <div className={styles.customTooltip}>
        <p className={styles.tooltipLabel}>
          {label}
          {isPR && <span className={styles.prBadge}>PR</span>}
        </p>
        {payload.map((entry: any, index: number) => (
          <p
            key={index}
            className={styles.tooltipValue}
            style={{ color: entry.color }}
          >
            {entry.name}: {formatPace(entry.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Custom dot component to highlight PRs
const CustomDot = (props: any) => {
  const { cx, cy, payload } = props;
  if (payload?.isPR) {
    return (
      <g>
        {/* Outer glow */}
        <circle
          cx={cx}
          cy={cy}
          r={8}
          fill="var(--trend-positive)"
          opacity={0.3}
        />
        {/* Inner dot */}
        <circle
          cx={cx}
          cy={cy}
          r={5}
          fill="var(--trend-positive)"
          stroke="var(--color-background)"
          strokeWidth={2}
        />
      </g>
    );
  }
  return (
    <circle
      cx={cx}
      cy={cy}
      r={3}
      fill="var(--chart-color-pace)"
      strokeWidth={0}
    />
  );
};

const PaceChart = ({ data }: PaceChartProps) => {
  if (data.length === 0) {
    return <div className={styles.emptyState}>No data available</div>;
  }

  const validData = data.filter((d) => d.pace > 0 && d.pace < 15);

  // Find PR (fastest pace) and mark it
  const dataWithPR = useMemo(() => {
    if (validData.length === 0) return validData;

    let bestPace = Infinity;
    let bestIndex = -1;

    validData.forEach((d, index) => {
      if (d.pace > 0 && d.pace < bestPace) {
        bestPace = d.pace;
        bestIndex = index;
      }
    });

    return validData.map((d, index) => ({
      ...d,
      isPR: index === bestIndex,
    }));
  }, [validData]);

  const formatXAxis = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  const formatYAxis = (value: number) => {
    return formatPace(value);
  };

  const paces = validData.map((d) => d.pace).filter((p) => p > 0);
  const minPace = Math.max(3, Math.floor(Math.min(...paces)) - 1);
  const maxPace = Math.min(15, Math.ceil(Math.max(...paces)) + 1);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={dataWithPR}
        margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="var(--color-border)"
          opacity={0.3}
        />
        <XAxis
          dataKey="date"
          tickFormatter={formatXAxis}
          tick={{ fontSize: 11, fontFamily: 'var(--font-mono)' }}
          stroke="var(--color-border)"
          interval="preserveStartEnd"
        />
        <YAxis
          reversed
          domain={[minPace, maxPace]}
          tickFormatter={formatYAxis}
          tick={{ fontSize: 11, fontFamily: 'var(--font-mono)' }}
          stroke="var(--color-border)"
          width={50}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{
            fontSize: '12px',
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
          }}
        />
        <Line
          type="monotone"
          dataKey="pace"
          name="Pace"
          stroke="var(--chart-color-pace)"
          strokeWidth={2}
          dot={<CustomDot />}
          activeDot={{ r: 5, strokeWidth: 2, stroke: 'var(--color-border)' }}
        />
        <Line
          type="monotone"
          dataKey="movingAvgPace"
          name="7-Run Avg"
          stroke="#1a1a1a"
          strokeWidth={2}
          strokeDasharray="5 5"
          dot={false}
          connectNulls
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default PaceChart;
