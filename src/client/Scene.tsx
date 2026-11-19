import type { Arch, Room } from '../shared/game';

type SceneProps = {
  room: Room;
  roomIndex: number;
  selected: number;
  onSelect: (index: number) => void;
  light: number;
  reward: number;
};

const Floor = () => (
  <g className="faint">
    <g strokeWidth="2" opacity="0.16">
      <path d="M445 318L-160 384M445 318L80 384M445 318L300 384M445 318L590 384M445 318L810 384M445 318L1050 384" />
    </g>
    <path strokeWidth="3" opacity="0.45" d="M0 318H740" />
    <path strokeWidth="2.5" opacity="0.5" d="M375 326H515M360 334H530" />
    <path strokeWidth="2.5" opacity="0.38" d="M0 344q15-6 30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0" />
    <path strokeWidth="2.5" opacity="0.22" d="M-15 360q15-6 30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0" />
  </g>
);

const TorchBearer = () => (
  <g transform="translate(404 210.4) scale(.78)">
    <path className="fig" d="M28 9a9 9 0 1 1 0 18a9 9 0 1 1 0-18zM17 33q11-7 22 0l3 8l11-25l4 2l-11 30l3 32l-5 2l-2 56h-8l-2-46l-2 46h-8l-1-56l-6-2z" />
    <path className="fig" d="M52 18l4-14l3 1l-4 14z" />
    <path className="flame" d="M58 4c-6-5-1-11-1-17c4 4 9 9 6 15c-1 2-3 3-5 2z" />
  </g>
);

const RoomMap = ({ roomIndex }: { roomIndex: number }) => (
  <g>
    <path className="map-l" stroke="#fff" d="M708 40V136" />
    <path className="map-l" stroke="#3d3d3d" d="M708 136V280" />
    {[0, 1, 2, 3, 4, 5].map((i) => {
      const state = i < roomIndex ? 'done' : i === roomIndex ? 'now' : 'next';
      const y = 48 + i * 48;
      return (
        <g key={i}>
          <path className={`node ${state}`} d={`M700 ${y}V${y - 10}a8 8 0 0 1 16 0v10z`} />
          {i === roomIndex && (
            <path className="tok-fl" d={`M708 ${y - 2}c-4-3-1-8 0-10c3 3 4 7 0 10z`} />
          )}
          <text className={`map-n ${state}`} x="688" y={y - 2}>
            {String(i + 1).padStart(2, '0')}
          </text>
        </g>
      );
    })}
  </g>
);

const Token = ({ x, cost, reward }: { x: number; cost: number; reward: number }) => (
  <g>
    <circle className="tok" cx={x} cy="88" r="21" />
    <path className="tok-fl" d={`M${x} 72c-3-3 0-6 0-8c3 2 4 5 2 8z`} />
    <text className="tok-txt" x={x} y="96">-{cost}</text>
    {reward > 0 && (
      <g>
        <circle className="tok rew" cx={x + 46} cy="88" r="21" />
        <text className="tok-txt rew" x={x + 46} y="93">+{reward}</text>
      </g>
    )}
  </g>
);

const ArchShape = ({
  arch,
  index,
  selected,
  onSelect,
}: {
  arch: Arch;
  index: number;
  selected: boolean;
  onSelect: (index: number) => void;
}) => {
  const narrow = arch.kind === 'narrow';
  const d = narrow
    ? 'M290 318V190A50 50 0 0 1 390 190V318Z'
    : 'M470 318V200A80 80 0 0 1 630 200V318';
  const signX = narrow ? 286 : 490;
  const signW = narrow ? 108 : 120;
  const signTextX = narrow ? 340 : 550;
  const tokenX = narrow ? 340 : 527;
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
      {selected && <path className="ring" d={narrow ? 'M282 318V190A58 58 0 0 1 398 190V318' : 'M462 318V200A88 88 0 0 1 638 200V318'} />}
      <path className={selected ? 'arch-sel' : 'stroke'} d={d} />
      {selected && narrow && <polygon className="ptr" points="328,54 352,54 340,68" />}
      <Token x={tokenX} cost={arch.cost} reward={arch.reward} />
      <rect className={`sign ${selected ? 'on' : ''}`} x={signX} y="330" width={signW} height="26" />
      <text className={`sign-txt ${selected ? 'on' : ''}`} x={signTextX} y="348">
        {narrow ? 'Narrow arch' : 'Wide arch'}
      </text>
      {arch.reward > 0 && (
        <text className="sign-sub" x={signTextX} y="374">+{arch.reward} light next room</text>
      )}
    </g>
  );
};

export const Scene = ({ room, roomIndex, selected, onSelect, light, reward }: SceneProps) => (
  <section className="scene">
    <div className="bignum" aria-hidden="true">
      {roomIndex + 1}<small>/6</small>
    </div>
    <svg className="art" viewBox="0 0 740 384" aria-hidden="true">
      <Floor />
      <ArchShape arch={room.arches[0]!} index={0} selected={selected === 0} onSelect={onSelect} />
      <ArchShape arch={room.arches[1]!} index={1} selected={selected === 1} onSelect={onSelect} />
      <TorchBearer />
      <RoomMap roomIndex={roomIndex} />
    </svg>
    <div className="room-copy">
      <span className="rk">Room {roomIndex + 1} of 6</span>
      <h2>{room.name}</h2>
      <p className="rule">Choose an arch. Reach room six with your torch still lit.</p>
      <p className="rule" style={{ borderLeftColor: 'var(--flame)', marginTop: 6 }}>
        {reward > 0 ? `+${reward} light carried in · ${light} now` : `${light} light in the torch`}
      </p>
    </div>
  </section>
);
