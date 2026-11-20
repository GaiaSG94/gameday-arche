import { lastDays } from '../../shared/game';

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export type CalendarProps = {
  day: string;
  days: string[];
};

export const Calendar = ({ day, days }: CalendarProps) => {
  const cells = lastDays(day, 28);
  return (
    <div className="cal">
      {WEEKDAYS.map((label, i) => (
        <span key={`${label}-${i}`}>{label}</span>
      ))}
      {cells.map((cell) => (
        <i
          key={cell}
          className={`${days.includes(cell) ? 'on' : ''} ${cell === day ? 'today' : ''}`}
        />
      ))}
    </div>
  );
};
