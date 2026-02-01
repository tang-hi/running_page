import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { ProgressDataPoint, formatDistance } from './useProgressData';
import styles from './style.module.css';

interface DistanceChartProps {
  data: ProgressDataPoint[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className={styles.customTooltip}>
        <p className={styles.tooltipLabel}>{label}</p>
        <p className={styles.tooltipValue}>
          Total: {formatDistance(payload[0].value)} km
        </p>
        {payload[0].payload.distance && (
          <p className={styles.tooltipValue} style={{ fontSize: '0.875rem', opacity: 0.8 }}>
            This run: {formatDistance(payload[0].payload.distance)} km
          </p>
        )}
      </div>
    );
  }
  return null;
};

const DistanceChart = ({ data }: DistanceChartProps) => {
  if (data.length === 0) {
    return <div className={styles.emptyState}>No data available</div>;
  }

  const formatXAxis = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  const formatYAxis = (value: number) => {
    return `${Math.round(value)}`;
  };

  const maxDistance = Math.max(...data.map((d) => d.cumulativeDistance));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
        <defs>
          <linearGradient id="distanceGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--chart-color-distance)" stopOpacity={0.8} />
            <stop offset="95%" stopColor="var(--chart-color-distance)" stopOpacity={0.1} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.3} />
        <XAxis
          dataKey="date"
          tickFormatter={formatXAxis}
          tick={{ fontSize: 11, fontFamily: 'var(--font-mono)' }}
          stroke="var(--color-border)"
          interval="preserveStartEnd"
        />
        <YAxis
          domain={[0, Math.ceil(maxDistance / 100) * 100]}
          tickFormatter={formatYAxis}
          tick={{ fontSize: 11, fontFamily: 'var(--font-mono)' }}
          stroke="var(--color-border)"
          width={50}
          label={{
            value: 'km',
            angle: -90,
            position: 'insideLeft',
            style: { fontSize: 11, fontFamily: 'var(--font-mono)' },
          }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="cumulativeDistance"
          stroke="var(--chart-color-distance)"
          strokeWidth={3}
          fill="url(#distanceGradient)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default DistanceChart;
