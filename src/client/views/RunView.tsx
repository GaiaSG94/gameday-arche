import type { RelicId, Run } from '../../shared/game';
import { Relics } from '../components/Relics';
import { Scene } from '../components/Scene';
import { Torch } from '../components/Torch';

type RunProps = {
  run: Run;
  roomIndex: number;
  selected: number;
  light: number;
  relics: RelicId[];
  used: RelicId[];
  ready: RelicId[];
  onSelect: (index: number) => void;
  onWalk: () => void;
};

export const RunView = ({
  run,
  roomIndex,
  selected,
  light,
  relics,
  used,
  ready,
  onSelect,
  onWalk,
}: RunProps) => {
  const room = run.rooms[roomIndex]!;
  const arch = room.arches[selected] ?? room.arches[0]!;
  return (
    <>
      <Scene room={room} roomIndex={roomIndex} selected={selected} onSelect={onSelect} />
      <footer className="hud">
        <Torch light={light} cost={arch.cost} />
        <Relics relics={relics} used={used} ready={ready} />
        <div>
          <button className="cta" onClick={onWalk}>
            <b>
              Walk through <span>→</span>
            </b>
            <span>
              {arch.kind === 'narrow' ? 'Narrow' : 'Wide'} arch · −{arch.cost} light
            </span>
          </button>
        </div>
      </footer>
    </>
  );
};
