import { useState } from 'react';
import { RELICS, type RelicId, type Run } from '../../shared/game';
import { Hud } from '../Hud';
import { RELIC_ICON } from '../types';

type DraftProps = {
  run: Run;
  step: number;
  stars: number;
  onPick: (id: RelicId) => void;
  onStats: () => void;
};

const roman = ['I', 'II', 'III'];

const Card = ({ id, selected, onSelect }: { id: RelicId; selected: boolean; onSelect: () => void }) => {
  const relic = RELICS.find((r) => r.id === id)!;
  return (
    <button className={`card ${selected ? 'sel' : ''}`} onClick={onSelect}>
      <span className="ic">
        <svg viewBox="0 0 26 26" aria-hidden="true" dangerouslySetInnerHTML={{ __html: RELIC_ICON[id] }} />
      </span>
      <b>{relic.name}</b>
      <small>{relic.effect}</small>
    </button>
  );
};

export const DraftView = ({ run, step, stars, onPick, onStats }: DraftProps) => {
  const [choice, setChoice] = useState<RelicId | null>(null);
  const offers = run.relicOffers[step] ?? [];
  const relic = RELICS.find((r) => r.id === choice);
  return (
    <>
      <section className="scene">
        <div className="bignum" aria-hidden="true">{roman[step] ?? 'I'}<small>/III</small></div>
        <div className="panel">
          <span className="rk">Before room {step === 0 ? 1 : step === 1 ? 3 : 5} of 6</span>
          <h3>Draft a relic.</h3>
          <p>One relic per draft. Pick what carries you further down the corridor.</p>
          <div className="card-row">
            {offers.map((id) => (
              <Card key={id} id={id} selected={choice === id} onSelect={() => setChoice(id)} />
            ))}
          </div>
        </div>
      </section>
      <Hud
        light={stars}
        reward={0}
        nextCost={0}
        relics={[]}
        used={[]}
        action="Take relic"
        sub={relic ? `${relic.name} · ${relic.effect}` : 'Choose one of the relics above'}
        disabled={choice === null}
        onAction={() => choice && onPick(choice)}
        onStats={onStats}
      />
    </>
  );
};
