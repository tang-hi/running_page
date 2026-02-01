import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { ProgressDataPoint } from './useProgressData';
import styles from './style.module.css';

interface HeartRateChartProps {
  data: ProgressDataPoint[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const value = payload[0].value;
    if (value === null || value === undefined) return null;
    return (
      <div className={styles.customTooltip}>
        <p className={styles.tooltipLabel}>{label}</p>
        <p className={styles.tooltipValue}>
          {Math.round(value)} bpm
        </p>
      </div>
    );
  }
  return null;
};

const HeartRateChart = ({ data }: HeartRateChartProps) => {
  const validData = data.filter((d) => d.heartRate !== null && d.heartRate > 0);

  if (validData.length === 0) {
    return <div className={styles.emptyState}>No heart rate data available</div>;
  }

  const formatXAxis = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  const heartRates = validData.map((d) => d.heartRate!);
  const minHR = Math.max(60, Math.floor(Math.min(...heartRates) / 10) * 10 - 10);
  const maxHR = Math.min(220, Math.ceil(Math.max(...heartRates) / 10) * 10 + 10);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={validData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.3} />
        <XAxis
          dataKey="date"
          tickFormatter={formatXAxis}
          tick={{ fontSize: 11, fontFamily: 'var(--font-mono)' }}
          stroke="var(--color-border)"
          interval="preserveStartEnd"
        />
        <YAxis
          domain={[minHR, maxHR]}
          tick={{ fontSize: 11, fontFamily: 'var(--font-mono)' }}
          stroke="var(--color-border)"
          width={40}
          label={{
            value: 'bpm',
            angle: -90,
            position: 'insideLeft',
            style: { fontSize: 11, fontFamily: 'var(--font-mono)' },
          }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="heartRate"
          stroke="var(--chart-color-heartrate)"
          strokeWidth={2}
          dot={{ fill: 'var(--chart-color-heartrate)', strokeWidth: 0, r: 3 }}
          activeDot={{ r: 5, strokeWidth: 2, stroke: 'var(--color-border)' }}
          connectNulls
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default HeartRateChart;
