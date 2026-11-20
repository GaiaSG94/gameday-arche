const NARROW = 'M3 14V7a3 3 0 0 1 6 0v7';
const WIDE = 'M1 14V8a5 5 0 0 1 10 0v6';

export type PathBoxesProps = {
  path: number[];
  costs: number[];
};

export const PathBoxes = ({ path, costs }: PathBoxesProps) => (
  <div className="path">
    {Array.from({ length: 6 }, (_, i) => {
      const kind = path[i];
      if (kind === undefined) {
        return (
          <div key={i} className="off">
            <svg className="pg" viewBox="0 0 12 15" aria-hidden="true">
              <path d={NARROW} />
            </svg>
            —
          </div>
        );
      }
      return (
        <div key={i}>
          <svg className="pg" viewBox="0 0 12 15" aria-hidden="true">
            <path d={kind === 1 ? WIDE : NARROW} />
          </svg>
          −{costs[i] ?? 0}
        </div>
      );
    })}
  </div>
);
