import type { Arch, Room } from '../../shared/game';
import { RoomMap } from './RoomMap';

type SceneProps = {
  room: Room;
  roomIndex: number;
  selected: number;
  onSelect: (index: number) => void;
};

const Floor = () => (
  <g className="faint">
    <g strokeWidth="2" opacity="0.16">
      <path d="M445 318L-160 384M445 318L80 384M445 318L300 384M445 318L590 384M445 318L810 384M445 318L1050 384" />
    </g>
    <path strokeWidth="3" opacity="0.45" d="M0 318H740" />
    <path strokeWidth="2.5" opacity="0.5" d="M375 326H515M360 334H530" />
    <path strokeWidth="2.5" opacity="0.38" d="M0 344q15-6 30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0" />
    <path strokeWidth="2.5" opacity="0.22" d="M-15 360q15-6 30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0" />
    <path strokeWidth="2.5" opacity="0.12" d="M0 376q15-6 30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0" />
  </g>
);

const TorchBearer = () => (
  <g transform="translate(404 210.4) scale(.78)">
    <path className="fig" d="M28 9a9 9 0 1 1 0 18a9 9 0 1 1 0-18zM17 33q11-7 22 0l3 8l11-25l4 2l-11 30l3 32l-5 2l-2 56h-8l-2-46l-2 46h-8l-1-56l-6-2z" />
    <path className="fig" d="M52 18l4-14l3 1l-4 14z" />
    <path className="flame" d="M58 4c-6-5-1-11-1-17c4 4 9 9 6 15c-1 2-3 3-5 2z" />
  </g>
);

const Token = ({ x, y, cost, reward }: { x: number; y: number; cost: number; reward: number }) => (
  <g>
    <circle className="tok" cx={x} cy={y} r="21" />
    <path className="tok-fl" d={`M${x} ${y - 16}c-3-3 0-6 0-8c3 2 4 5 2 8z`} />
    <text className="tok-txt" x={x} y={y + 8}>
      âˆ’{cost}
    </text>
    {reward > 0 && (
      <g>
        <circle className="tok rew" cx={x + 46} cy={y} r="21" />
        <text className="tok-txt rew" x={x + 46} y={y + 5}>
          +{reward}
        </text>
      </g>
    )}
  </g>
);

type ArchShapeProps = {
  arch: Arch;
  index: number;
  selected: boolean;
  onSelect: (index: number) => void;
};

const ArchShape = ({ arch, index, selected, onSelect }: ArchShapeProps) => {
  const narrow = arch.kind === 'narrow';
  const d = narrow ? 'M290 318V190A50 50 0 0 1 390 190V318Z' : 'M470 318V200A80 80 0 0 1 630 200V318';
  const ring = narrow
    ? 'M282 318V190A58 58 0 0 1 398 190V318'
    : 'M462 318V200A88 88 0 0 1 638 200V318';
  const signX = narrow ? 286 : 490;
  const signW = narrow ? 108 : 120;
  const signTextX = narrow ? 340 : 550;
  const tokenX = narrow ? 340 : 527;
  const tokenY = narrow ? 100 : 88;
  const arrowY = tokenY - 46;
  return (
    <g
      className="arch"
      role="button"
      tabIndex={0}
      aria-label={`${arch.kind} arch, cost ${arch.cost}`}
      onClick={() => onSelect(index)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onSelect(index);
      }}
    >
      {selected && <path className="ring" d={ring} />}
      <path className={selected ? 'arch-sel' : 'stroke'} d={d} />
      {selected && (
        <polygon className="ptr" points={`${tokenX - 12},${arrowY} ${tokenX + 12},${arrowY} ${tokenX},${arrowY + 14}`} />
      )}
      <Token x={tokenX} y={tokenY} cost={arch.cost} reward={arch.reward} />
      <rect className={`sign ${selected ? 'on' : ''}`} x={signX} y="330" width={signW} height="26" />
      <text className={`sign-txt ${selected ? 'on' : ''}`} x={signTextX} y="348">
        {narrow ? 'Narrow arch' : 'Wide arch'}
      </text>
      {arch.reward > 0 && (
        <text className="sign-sub" x={signTextX} y="374">
          +{arch.reward} light next room
        </text>
      )}
    </g>
  );
};

export const Scene = ({ room, roomIndex, selected, onSelect }: SceneProps) => (
  <section className="scene">
    <div className="bignum" aria-hidden="true">
      {roomIndex + 1}
      <small>/6</small>
    </div>
    <svg className="art" viewBox="0 0 740 384" aria-hidden="true">
      <Floor />
      <ArchShape arch={room.arches[0]!} index={0} selected={selected === 0} onSelect={onSelect} />
      <ArchShape arch={room.arches[1]!} index={1} selected={selected === 1} onSelect={onSelect} />
      <TorchBearer />
      <RoomMap roomIndex={roomIndex} />
    </svg>
    <div className="room">
      <span className="rk">Room {roomIndex + 1} of 6</span>
      <h2>{room.name}</h2>
      <p className="rule">Choose an arch. Reach room six with your torch still lit.</p>
    </div>
  </section>
);
