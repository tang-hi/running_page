import { intComma } from '@/utils/utils';

type StatVariant = 'default' | 'coral' | 'cyan' | 'yellow';

interface IStatProperties {
  value: string | number;
  description: string;
  className?: string;
  citySize?: number;
  onClick?: () => void;
  variant?: StatVariant;
  trend?: number; // percentage change, positive or negative
  isCard?: boolean;
}

const variantClasses: Record<StatVariant, string> = {
  default: 'bg-[var(--color-background)]',
  coral: 'bg-[var(--nb-accent-coral)]',
  cyan: 'bg-[var(--nb-accent-cyan)]',
  yellow: 'bg-[var(--nb-accent-yellow)]',
};

const TrendIndicator = ({ trend }: { trend: number }) => {
  if (trend === 0) return null;
  const isPositive = trend > 0;
  return (
    <span
      className={`trend-indicator ml-2 ${isPositive ? 'trend-positive' : 'trend-negative'}`}
    >
      {isPositive ? '↑' : '↓'}
      {Math.abs(trend).toFixed(1)}%
    </span>
  );
};

const Stat = ({
  value,
  description,
  className = 'pb-2 w-full',
  citySize,
  onClick,
  variant = 'default',
  trend,
  isCard = false,
}: IStatProperties) => {
  if (isCard) {
    return (
      <div
        className={`stat-card ${variantClasses[variant]} ${onClick ? 'cursor-pointer' : ''} ${className}`}
        onClick={onClick}
      >
        <div className="stat-card-label">{description}</div>
        <div className="stat-card-value">
          {intComma(value.toString())}
          {trend !== undefined && <TrendIndicator trend={trend} />}
        </div>
      </div>
    );
  }

  // Original inline style for backward compatibility
  return (
    <div className={`${className}`} onClick={onClick}>
      <span className={`font-mono text-${citySize || 4}xl font-bold`}>
        {intComma(value.toString())}
      </span>
      <span className="font-mono text-base font-medium">{description}</span>
    </div>
  );
};

export default Stat;
