import { intComma } from '@/utils/utils';

interface IStatProperties {
  value: string | number;
  description: string;
  className?: string;
  citySize?: number;
  onClick?: () => void;
}

const Stat = ({
  value,
  description,
  className = 'pb-2 w-full',
  citySize,
  onClick,
}: IStatProperties) => (
  <div className={`${className}`} onClick={onClick}>
    <span className={`font-mono text-${citySize || 4}xl font-bold`}>
      {intComma(value.toString())}
    </span>
    <span className="font-mono text-base font-medium">{description}</span>
  </div>
);

export default Stat;
