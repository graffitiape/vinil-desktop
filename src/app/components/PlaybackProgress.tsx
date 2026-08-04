import { formatDuration } from '@/app/utils/format';

interface PlaybackProgressProps {
  value: number;
  maximum: number;
  onChange: (value: number) => void;
  large?: boolean;
}

export const PlaybackProgress = ({
  value,
  maximum,
  onChange,
  large = false,
}: PlaybackProgressProps) => {
  const safeMaximum = Math.max(maximum, 0);
  const safeValue = Math.min(Math.max(value, 0), safeMaximum || 0);
  const percentage = safeMaximum > 0 ? (safeValue / safeMaximum) * 100 : 0;

  return (
    <div className={`progress-track${large ? ' lg' : ''} focus-within:outline-2 focus-within:outline-offset-4 focus-within:outline-[var(--clay)]`}>
      <div className="progress-fill" style={{ width: `${percentage}%` }} aria-hidden="true" />
      <div className="progress-thumb" style={{ left: `${percentage}%` }} aria-hidden="true" />
      <input
        type="range"
        min={0}
        max={Math.max(safeMaximum, 1)}
        step={1}
        value={safeValue}
        disabled={safeMaximum <= 0}
        onChange={(event) => onChange(Number(event.target.value))}
        aria-label="Playback position"
        aria-valuetext={`${formatDuration(Math.floor(safeValue))} of ${formatDuration(Math.floor(safeMaximum))}`}
        className="absolute inset-x-0 -inset-y-3 h-7 w-full cursor-pointer opacity-0 disabled:cursor-default"
      />
    </div>
  );
};
