import type { RelicId, Run } from '../../shared/game';
import { Hud } from '../Hud';
import { Scene } from '../Scene';

type RunProps = {
  run: Run;
  roomIndex: number;
  selected: number;
  light: number;
  reward: number;
  relics: RelicId[];
  used: RelicId[];
  onSelect: (index: number) => void;
  onWalk: () => void;
  onStats: () => void;
};

export const RunView = ({
  run,
  roomIndex,
  selected,
  light,
  reward,
  relics,
  used,
  onSelect,
  onWalk,
  onStats,
}: RunProps) => {
  const room = run.rooms[roomIndex]!;
  const arch = room.arches[selected] ?? room.arches[0]!;
  return (
    <>
      <Scene
        room={room}
        roomIndex={roomIndex}
        selected={selected}
        onSelect={onSelect}
        light={light}
        reward={reward}
      />
      <Hud
        light={light}
        reward={reward}
        nextCost={arch.cost}
        relics={relics}
        used={used}
        action="Walk through"
        sub={`${arch.kind === 'narrow' ? 'Narrow' : 'Wide'} arch · -${arch.cost} light`}
        onAction={onWalk}
        onStats={onStats}
      />
    </>
  );
};
