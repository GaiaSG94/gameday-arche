import type { Finish, Init } from '../types';
import { Hud } from '../Hud';

type EndProps = {
  init: Init;
  finish: Finish;
  onBoard: () => void;
  onComment: () => void;
  commentDone: boolean;
};

const Histogram = ({ finished }: { finished: number }) => (
  <div className="hist" aria-hidden="true">
    {[3, 5, 8, 12, 16, 14, 10, 7, 4, 2].map((h, i) => (
      <i key={i} style={{ height: `${Math.max(8, h * (finished > 0 ? 1 : 0.2))}%` }} />
    ))}
  </div>
);

export const EndView = ({ init, finish, onBoard, onComment, commentDone }: EndProps) => {
  const headline = finish.won ? 'Room six reached.' : `Torch out in room ${finish.reachedRoom}.`;
  const scoreLabel = finish.won ? 'light left · your score' : `light left · reached room ${finish.reachedRoom}`;
  return (
    <>
      <section className="scene">
        <div className="bignum" aria-hidden="true">{finish.won ? finish.light : finish.reachedRoom}<small>/6</small></div>
        <div className="panel">
          <span className="rk">Day {init.dayNumber} · Run complete</span>
          <h3>{headline}</h3>
          <p>{scoreLabel}</p>
          <span className="rk" style={{ marginTop: 4 }}>Your path</span>
          <div className="path">
            {finish.path.map((kind, i) => (
              <div key={i} className={kind === 1 ? 'wide' : ''}>
                {kind === 0 ? 'N' : 'W'}
                <small>{kind === 0 ? '-1/2' : '-3/4'}</small>
              </div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 160px', gap: 14 }}>
            <div>
              <span className="rk">Light left at room six</span>
              <Histogram finished={finish.stats.finished} />
              <span className="rk">YOU · #{finish.board.rank} of {finish.board.total || finish.stats.walkers} today</span>
            </div>
            <div>
              <div className="kv hi"><span>Day streak</span><b>{finish.streak}</b></div>
              <div className="kv"><span>Best</span><b>{finish.best}</b></div>
              <div className="kv"><span>Walkers</span><b>{finish.stats.walkers}</b></div>
              <div className="comment-preview">{finish.comment}</div>
            </div>
          </div>
        </div>
      </section>
      <Hud
        light={finish.light}
        reward={0}
        nextCost={0}
        relics={[]}
        used={finish.usedRelics}
        action={commentDone ? 'Result posted' : 'Post my result'}
        sub={commentDone ? 'Your comment is live' : 'One tap · adds a comment'}
        disabled={commentDone}
        onAction={onComment}
        onStats={onBoard}
      />
    </>
  );
};
