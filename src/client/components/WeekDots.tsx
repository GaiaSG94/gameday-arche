import { lastDays } from '../../shared/game';

export type WeekDotsProps = {
  day: string;
  days: string[];
};

export const WeekDots = ({ day, days }: WeekDotsProps) => (
  <div className="wk" aria-hidden="true">
    {lastDays(day, 7).map((cell) => (
      <i
        key={cell}
        className={`${days.includes(cell) ? 'on' : ''} ${cell === day ? 'today' : ''}`}
      />
    ))}
  </div>
);
