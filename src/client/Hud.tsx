import type { RelicId } from '../shared/game';
import { RELIC_ICON } from './types';

type HudProps = {
  light: number;
  reward: number;
  nextCost: number;
  relics: RelicId[];
  used: RelicId[];
  action: string;
  sub: string;
  disabled?: boolean;
  onAction: () => void;
  onStats?: () => void;
};

const FlameLabel = () => (
  <svg viewBox="0 0 9 12" aria-hidden="true">
    <path d="M4.5 12C1 10 0 7 2 4c1 1 1 2 2 2c0-2 0-4 2-6c0 3 3 5 3 8c0 2-2 4-4.5 4z" />
  </svg>
);

const RelicSlot = ({ id, used }: { id: RelicId; used: boolean }) => {
  const name = id === 'ember' ? 'Ember Ring' : id === 'compass' ? 'Salt Compass' : 'Ash Veil';
  const badge = id === 'compass' ? '-1 next' : id === 'veil' ? '+1 next' : '+2 now';
  return (
    <div className={`slot ${used ? 'used' : ''}`}>
      {!used && <span className="badge">{badge}</span>}
      <div className="box">
        <svg viewBox="0 0 26 26" aria-hidden="true" dangerouslySetInnerHTML={{ __html: RELIC_ICON[id] }} />
      </div>
      <b>{name}</b>
    </div>
  );
};

export const Hud = ({
  light,
  reward,
  nextCost,
  relics,
  used,
  action,
  sub,
  disabled = false,
  onAction,
  onStats,
}: HudProps) => (
  <footer className="hud">
    <div>
      <span className="lbl"><FlameLabel />Torch</span>
      <div className="torch-row">
        <div className="segs">
          {Array.from({ length: 10 }, (_, i) => (
            <i key={i} className={i < light ? 'on' : i === light ? 'lose' : ''} />
          ))}
        </div>
      </div>
      <div className="cnt">
        <b>{light}</b><span>→</span><em>{Math.max(0, light - nextCost)}</em>
        <small>after this arch</small>
      </div>
      {reward > 0 && <div className="rk" style={{ marginTop: 4, color: 'var(--flame)' }}>+{reward} light next room</div>}
    </div>
    <div>
      <span className="lbl">Relics</span>
      <div className="slots">
        {relics.map((id, i) => (
          <RelicSlot key={`${id}-${i}`} id={id} used={used.includes(id)} />
        ))}
      </div>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <button className="cta" disabled={disabled} onClick={onAction}>
        <b>{action} <span>→</span></b>
        <span>{sub}</span>
      </button>
      {onStats && (
        <button className="link" onClick={onStats} style={{ color: 'var(--g)', borderColor: 'var(--d)' }}>
          Streaks &amp; ranking
        </button>
      )}
    </div>
  </footer>
);
