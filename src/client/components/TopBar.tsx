import { dayLabel } from '../../shared/game';

export type TopBarProps = {
  day: string;
  dayNumber: number;
  chip: string;
};

export const TopBar = ({ day, dayNumber, chip }: TopBarProps) => (
  <header className="g-top">
    <span className="wm">ARCHE</span>
    <span className="chip">Day {dayNumber} Â· {dayLabel(day)}</span>
    <span className="chip dim">
      <i />
      {chip}
    </span>
  </header>
);
