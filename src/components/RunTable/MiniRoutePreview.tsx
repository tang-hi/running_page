import React, { useMemo } from 'react';
import { pathForRun, Activity } from '@/utils/utils';
import styles from './style.module.css';

interface MiniRoutePreviewProps {
  activity: Activity;
  size?: number;
}

const MiniRoutePreview: React.FC<MiniRoutePreviewProps> = ({
  activity,
  size = 32,
}) => {
  const pathData = useMemo(() => {
    if (!activity.summary_polyline) {
      return null;
    }

    const path = pathForRun(activity);
    if (path.length < 2) {
      return null;
    }

    // Calculate bounding box
    const lats = path.map((point) => point[1]);
    const lngs = path.map((point) => point[0]);

    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    // Add padding to bounds
    const padding = 0.0005;
    const boundsWidth = maxLng - minLng + padding * 2;
    const boundsHeight = maxLat - minLat + padding * 2;

    // SVG dimensions with padding
    const svgPadding = 2;
    const drawSize = size - 2 * svgPadding;

    // Convert coordinate to SVG coordinate
    const coordToSvg = (lng: number, lat: number): [number, number] => {
      const x = svgPadding + ((lng - minLng + padding) / boundsWidth) * drawSize;
      const y =
        svgPadding + ((maxLat + padding - lat) / boundsHeight) * drawSize;
      return [x, y];
    };

    // Generate path string
    const pathString = path
      .map((coord, index) => {
        const [x, y] = coordToSvg(coord[0], coord[1]);
        return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');

    // Start and end points
    const startPoint = coordToSvg(path[0][0], path[0][1]);
    const endPoint = coordToSvg(
      path[path.length - 1][0],
      path[path.length - 1][1]
    );

    return { pathString, startPoint, endPoint };
  }, [activity, size]);

  if (!pathData) {
    return (
      <div
        className={styles.miniRouteEmpty}
        style={{ width: size, height: size }}
      >
        <span>—</span>
      </div>
    );
  }

  return (
    <div
      className={styles.miniRoutePreview}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size}>
        {/* Route line */}
        <path
          d={pathData.pathString}
          fill="none"
          stroke="var(--chart-color-distance)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Start point (green) */}
        <circle
          cx={pathData.startPoint[0]}
          cy={pathData.startPoint[1]}
          r="2"
          fill="var(--trend-positive)"
        />
        {/* End point (red) */}
        <circle
          cx={pathData.endPoint[0]}
          cy={pathData.endPoint[1]}
          r="2"
          fill="var(--trend-negative)"
        />
      </svg>
    </div>
  );
};

export default MiniRoutePreview;
