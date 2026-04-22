import { clamp, round } from '@/utils/numbers';

export interface ProgressRingProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  caption?: string;
}

export function ProgressRing({ value, max = 100, size = 120, strokeWidth = 12, label, caption }: ProgressRingProps) {
  const boundedValue = clamp(value, 0, max);
  const ratio = max === 0 ? 0 : boundedValue / max;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - ratio);

  return (
    <figure className="progress-ring" aria-label={label ?? 'Průběh pokroku'}>
      <svg height={size} width={size} viewBox={`0 0 ${size} ${size}`} role="img">
        <circle
          className="progress-ring-track"
          cx={size / 2}
          cy={size / 2}
          fill="none"
          r={radius}
          strokeWidth={strokeWidth}
        />
        <circle
          className="progress-ring-value"
          cx={size / 2}
          cy={size / 2}
          fill="none"
          r={radius}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          strokeWidth={strokeWidth}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        <text className="progress-ring-number" x="50%" y="50%" dominantBaseline="middle" textAnchor="middle">
          {round(ratio * 100)} %
        </text>
      </svg>
      {caption ? <figcaption className="text-body progress-ring-caption">{caption}</figcaption> : null}
    </figure>
  );
}
