import { MAX_LIGHT } from '../../shared/game';

const FlameLabel = () => (
  <svg viewBox="0 0 9 12" aria-hidden="true">
    <path d="M4.5 12C1 10 0 7 2 4c1 1 1 2 2 2c0-2 0-4 2-6c0 3 3 5 3 8c0 2-2 4-4.5 4z" />
  </svg>
);

export type TorchProps = {
  light: number;
  cost: number;
  note?: string;
  label?: string | null;
  plain?: boolean;
};

export const Torch = ({ light, cost, note = 'after this arch', label = 'Torch', plain = false }: TorchProps) => (
  <div>
    {label && (
      <span className="lbl">
        <FlameLabel />
        {label}
      </span>
    )}
    <div className="segs">
      {Array.from({ length: MAX_LIGHT }, (_, i) => (
        <i key={i} className={i < light ? 'on' : i === light ? 'lose' : ''} />
      ))}
    </div>
    {plain ? (
      <div className="cnt">
        <b>{light}</b>
        <small>{note}</small>
      </div>
    ) : (
      <div className="cnt">
        <b>{light}</b>
        <span>â†’</span>
        <em>{Math.max(0, light - cost)}</em>
        <small>{note}</small>
      </div>
    )}
  </div>
);
