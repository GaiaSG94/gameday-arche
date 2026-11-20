import { useState } from 'react';
import { RELICS, type RelicId, type Run } from '../../shared/game';
import { RELIC_ICON } from '../types';
import { Torch } from '../components/Torch';

type DraftProps = {
  run: Run;
  step: number;
  light: number;
  onPick: (id: RelicId) => void;
};

const roman = ['I', 'II', 'III'];

const Card = ({ id, selected, onSelect }: { id: RelicId; selected: boolean; onSelect: () => void }) => {
  const relic = RELICS.find((r) => r.id === id);
  return (
    <button className={`card ${selected ? 'sel' : ''}`} onClick={onSelect}>
      <span className="ic">
        <svg viewBox="0 0 26 26" aria-hidden="true" dangerouslySetInnerHTML={{ __html: RELIC_ICON[id] }} />
      </span>
      <b>{relic?.name ?? id}</b>
      <small>{relic?.effect ?? ''}</small>
    </button>
  );
};

export const DraftView = ({ run, step, light, onPick }: DraftProps) => {
  const [choice, setChoice] = useState<RelicId | null>(null);
  const offers = run.relicOffers[step] ?? [];
  const relic = RELICS.find((r) => r.id === choice);
  const room = step === 0 ? 1 : step === 1 ? 3 : 5;
  return (
    <>
      <section className="scene">
        <div className="bignum" aria-hidden="true">
          {roman[step] ?? 'I'}
          <small>/III</small>
        </div>
        <div className="panel">
          <span className="rk">Before room {room} of 6</span>
          <h3>Draft a relic.</h3>
          <p>One relic per draft. Pick what carries you further down the corridor.</p>
          <div className="card-row">
            {offers.map((id) => (
              <Card key={id} id={id} selected={choice === id} onSelect={() => setChoice(id)} />
            ))}
          </div>
        </div>
      </section>
      <footer className="hud two">
        <Torch light={light} cost={0} note="in the torch" />
        <div>
          <button className="cta" disabled={choice === null} onClick={() => choice && onPick(choice)}>
            <b>
              Take relic <span>→</span>
            </b>
            <span>{relic ? `${relic.name} · ${relic.effect}` : 'Choose one of the relics above'}</span>
          </button>
        </div>
      </footer>
    </>
  );
};
