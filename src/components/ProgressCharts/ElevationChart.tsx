import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { ProgressDataPoint } from './useProgressData';
import styles from './style.module.css';

interface ElevationChartProps {
  data: ProgressDataPoint[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className={styles.customTooltip}>
        <p className={styles.tooltipLabel}>{label}</p>
        <p className={styles.tooltipValue}>{Math.round(payload[0].value)} m</p>
      </div>
    );
  }
  return null;
};

const ElevationChart = ({ data }: ElevationChartProps) => {
  const validData = data.filter((d) => d.elevation > 0);

  if (validData.length === 0) {
    return <div className={styles.emptyState}>No elevation data available</div>;
  }

  const formatXAxis = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  const maxElevation = Math.max(...validData.map((d) => d.elevation));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={validData}
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
          domain={[0, Math.ceil(maxElevation / 50) * 50]}
          tick={{ fontSize: 11, fontFamily: 'var(--font-mono)' }}
          stroke="var(--color-border)"
          width={40}
          label={{
            value: 'm',
            angle: -90,
            position: 'insideLeft',
            style: { fontSize: 11, fontFamily: 'var(--font-mono)' },
          }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar
          dataKey="elevation"
          fill="var(--chart-color-elevation)"
          stroke="var(--color-border)"
          strokeWidth={2}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default ElevationChart;
