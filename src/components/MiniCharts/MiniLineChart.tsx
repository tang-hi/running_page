import { useMemo } from 'react';
import styles from './style.module.css';

interface LineData {
  value: number;
  label?: string;
}

interface MiniLineChartProps {
  data: LineData[];
  height?: number;
  color?: string;
  fillColor?: string;
}

const MiniLineChart = ({
  data,
  height = 40,
  color = 'var(--nb-accent-coral)',
  fillColor = 'rgba(255, 107, 107, 0.2)',
}: MiniLineChartProps) => {
  const { pathD, areaD, viewBox } = useMemo(() => {
    if (data.length < 2) {
      return { pathD: '', areaD: '', viewBox: '0 0 100 40' };
    }

    const maxValue = Math.max(...data.map((d) => d.value), 1);
    const minValue = Math.min(...data.map((d) => d.value), 0);
    const range = maxValue - minValue || 1;

    const width = 100;
    const chartHeight = 40;
    const padding = 2;

    const points = data.map((d, i) => {
      const x = (i / (data.length - 1)) * width;
      const y =
        chartHeight -
        padding -
        ((d.value - minValue) / range) * (chartHeight - padding * 2);
      return { x, y };
    });

    // Create SVG path
    const pathPoints = points
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
      .join(' ');

    // Create area fill path
    const areaPoints = [
      `M ${points[0].x} ${chartHeight}`,
      ...points.map((p) => `L ${p.x} ${p.y}`),
      `L ${points[points.length - 1].x} ${chartHeight}`,
      'Z',
    ].join(' ');

    return {
      pathD: pathPoints,
      areaD: areaPoints,
      viewBox: `0 0 ${width} ${chartHeight}`,
    };
  }, [data]);

  if (data.length < 2) {
    return (
      <div className={styles.emptyChart} style={{ height }}>
        Not enough data
      </div>
    );
  }

  return (
    <div className={styles.miniLineChart} style={{ height }}>
      <svg
        viewBox={viewBox}
        preserveAspectRatio="none"
        className={styles.lineSvg}
      >
        {/* Area fill */}
        <path d={areaD} fill={fillColor} />
        {/* Line */}
        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
};

export default MiniLineChart;
