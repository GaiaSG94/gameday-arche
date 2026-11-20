import { MAX_LIGHT } from '../../shared/game';

const BAR_W = 25;
const STEP = 33;
const BASE_Y = 120;
const MAX_H = 104;

export type HistogramProps = {
  hist: Record<string, number>;
  you: number;
};

export const Histogram = ({ hist, you }: HistogramProps) => {
  const counts = Array.from({ length: MAX_LIGHT }, (_, i) => hist[String(i + 1)] ?? 0);
  const peak = Math.max(1, ...counts);
  return (
    <svg className="hist" width="332" height="140" viewBox="0 0 332 140" aria-hidden="true">
      {counts.map((count, i) => {
        const h = Math.round((count / peak) * MAX_H);
        const x = 4 + i * STEP;
        const mine = you === i + 1;
        return (
          <g key={i}>
            <rect className={`bar ${mine ? 'you' : ''}`} x={x} y={BASE_Y - h} width={BAR_W} height={h} />
            {mine && <text className="you-t" x={x + BAR_W / 2} y="8">YOU</text>}
            <text className="hx" x={x + BAR_W / 2} y="136">
              {i + 1}
            </text>
          </g>
        );
      })}
    </svg>
  );
};
