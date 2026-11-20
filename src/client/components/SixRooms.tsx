const NODES = [16, 56, 96, 136, 176, 216];

export const SixRooms = () => (
  <svg className="six-rooms" viewBox="0 0 232 56" aria-hidden="true">
    <path className="map-l" stroke="#3d3d3d" d="M16 26H216" />
    {NODES.map((x, i) => (
      <g key={x}>
        <path
          className={`node ${i === 0 ? 'now' : 'next'}`}
          d={`M${x - 8} 30V20a8 8 0 0 1 16 0v10z`}
        />
        <text
          className="map-n"
          x={x}
          y="50"
          style={{ textAnchor: 'middle', fill: i === 0 ? '#fff' : '#3d3d3d' }}
        >
          {String(i + 1).padStart(2, '0')}
        </text>
      </g>
    ))}
  </svg>
);
