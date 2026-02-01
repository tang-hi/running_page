import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { ProgressDataPoint, formatPace } from './useProgressData';
import styles from './style.module.css';

interface PaceChartProps {
  data: ProgressDataPoint[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className={styles.customTooltip}>
        <p className={styles.tooltipLabel}>{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className={styles.tooltipValue} style={{ color: entry.color }}>
            {entry.name}: {formatPace(entry.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const PaceChart = ({ data }: PaceChartProps) => {
  if (data.length === 0) {
    return <div className={styles.emptyState}>No data available</div>;
  }

  const validData = data.filter((d) => d.pace > 0 && d.pace < 15);

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
          dot={{ fill: 'var(--chart-color-pace)', strokeWidth: 0, r: 3 }}
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
