const ARCHES = [
  { d: 'M376.0 221V187.2A26.0 26.0 0 0 1 428.0 187.2V221', w: 2, o: 0.18 },
  { d: 'M367.0 230V184.5A35.0 35.0 0 0 1 437.0 184.5V230', w: 2.2, o: 0.28 },
  { d: 'M355.0 243V181.9A47.0 47.0 0 0 1 449.0 181.9V243', w: 2.6, o: 0.4 },
  { d: 'M338.0 262V178.8A64.0 64.0 0 0 1 466.0 178.8V262', w: 3, o: 0.55 },
  { d: 'M314.0 290V175.6A88.0 88.0 0 0 1 490.0 175.6V290', w: 3.5, o: 0.75 },
  { d: 'M282.0 330V174.0A120.0 120.0 0 0 1 522.0 174.0V330', w: 4, o: 1 },
];

export const Corridor = () => (
  <svg className="art" viewBox="0 0 740 384" aria-hidden="true">
    <path
      className="faint"
      strokeWidth="2"
      opacity="0.16"
      d="M402 214L-200 384M402 214L60 384M402 214L250 384M402 214L490 384M402 214L680 384M402 214L940 384"
    />
    <path className="faint" strokeWidth="3" opacity="0.45" d="M0 330H740" />
    {ARCHES.map((arch) => (
      <path
        key={arch.d}
        fill="none"
        stroke="#fff"
        strokeWidth={arch.w}
        opacity={arch.o}
        strokeLinejoin="round"
        d={arch.d}
      />
    ))}
    <g transform="translate(378.6 222.4) scale(.78)">
      <path
        className="fig"
        d="M28 9a9 9 0 1 1 0 18a9 9 0 1 1 0-18zM17 33q11-7 22 0l3 8l11-25l4 2l-11 30l3 32l-5 2l-2 56h-8l-2-46l-2 46h-8l-1-56l-6-2z"
      />
      <path className="fig" d="M52 18l4-14l3 1l-4 14z" />
      <path className="flame" d="M58 4c-6-5-1-11-1-17c4 4 9 9 6 15c-1 2-3 3-5 2z" />
    </g>
  </svg>
);
