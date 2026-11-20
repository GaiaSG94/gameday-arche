const NODE_BASIS = 48;

type RoomMapProps = {
  roomIndex: number;
};

export const RoomMap = ({ roomIndex }: RoomMapProps) => {
  const nowBase = NODE_BASIS + roomIndex * NODE_BASIS;
  return (
    <g>
      <path className="map-l" stroke="#fff" d={`M708 40V${nowBase - 8}`} />
      <path className="map-l" stroke="#3d3d3d" d={`M708 ${nowBase - 8}V280`} />
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const base = NODE_BASIS + i * NODE_BASIS;
        const now = i === roomIndex;
        const state = i < roomIndex ? 'done' : now ? 'now' : 'next';
        const d = now
          ? `M697 ${base + 4}V${base - 12}a11 11 0 0 1 22 0v16z`
          : `M700 ${base}V${base - 10}a8 8 0 0 1 16 0v10z`;
        return (
          <g key={i}>
            <path className={`node ${state}`} d={d} />
            {now && <path className="tok-fl" d={`M708 ${base + 2}c-4-3-1-8 0-10c3 3 4 7 0 10z`} />}
            <text className={`map-n ${state}`} x={now ? 686 : 688} y={now ? base : base - 2}>
              {String(i + 1).padStart(2, '0')}
            </text>
          </g>
        );
      })}
    </g>
  );
};
