import { RELICS, type RelicId } from '../../shared/game';
import { RELIC_ICON } from '../types';

const BADGE: Partial<Record<RelicId, string>> = { compass: '-1 next', veil: '+1 next' };

type RelicSlotProps = {
  id: RelicId;
  used: boolean;
  ready: boolean;
};

const RelicSlot = ({ id, used, ready }: RelicSlotProps) => {
  const relic = RELICS.find((r) => r.id === id);
  const badge = BADGE[id];
  return (
    <div className={`slot ${used ? 'used' : ''}`}>
      {!used && ready && badge && <span className="badge">{badge}</span>}
      <div className="box">
        <svg viewBox="0 0 26 26" aria-hidden="true" dangerouslySetInnerHTML={{ __html: RELIC_ICON[id] }} />
      </div>
      <b>{relic?.name ?? id}</b>
    </div>
  );
};

export type RelicsProps = {
  relics: RelicId[];
  used: RelicId[];
  ready: RelicId[];
};

export const Relics = ({ relics, used, ready }: RelicsProps) => (
  <div>
    <span className="lbl">Relics</span>
    <div className="slots">
      {relics.map((id, i) => (
        <RelicSlot key={`${id}-${i}`} id={id} used={used.includes(id)} ready={ready.includes(id)} />
      ))}
    </div>
  </div>
);
