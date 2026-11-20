import { Histogram } from '../components/Histogram';
import { PathBoxes } from '../components/PathBoxes';
import { Torch } from '../components/Torch';
import type { Finish, Init } from '../types';

type EndProps = {
  init: Init;
  finish: Finish;
  onBoard: () => void;
  onComment: () => void;
  commentDone: boolean;
};

export const EndView = ({ init, finish, onBoard, onComment, commentDone }: EndProps) => {
  const won = finish.won;
  const score = won ? finish.light : 0;
  const walkers = finish.stats.walkers;
  const lines = finish.comment.split('\n');
  const summary = lines[0] ?? '';
  const masked = lines.length > 1;
  return (
    <>
      <section className="scene">
        <div className={`bignum ${won ? '' : 'dim'}`} aria-hidden="true">
          {score}
        </div>
        <div className="res">
          <span className="rk">
            Day {init.dayNumber} · Run complete
          </span>
          <h2>
            {won ? (
              <>
                Room six
                <br />
                reached.
              </>
            ) : (
              <>
                Torch out in
                <br />
                room {finish.reachedRoom}.
              </>
            )}
          </h2>
          <Torch
            light={score}
            cost={0}
            label={null}
            plain
            note={won ? 'light left · your score' : `light left · reached room ${finish.reachedRoom}`}
          />
          <span className="lbl" style={{ marginTop: 16 }}>
            Your path
          </span>
          <PathBoxes path={finish.path} costs={finish.costs} />
        </div>
        <div className="col-r com">
          <span className="lbl">Light left at room six · {finish.stats.finished.toLocaleString('en-US')} walkers</span>
          <Histogram hist={finish.stats.hist} you={won ? finish.light : 0} />
          <div className="duo">
            <div className="stat">
              <b>#{finish.board.rank || '—'}</b>
              <span>of {walkers.toLocaleString('en-US')} today</span>
            </div>
            <div className="stat">
              <b>{finish.streak}</b>
              <span>day streak · {won ? '+1' : 'reset'}</span>
            </div>
          </div>
          <button className="btn2" onClick={onBoard}>
            See today’s ranking <span>→</span>
          </button>
        </div>
      </section>
      <footer className="hud two">
        <div>
          <span className="lbl">Share in the comments</span>
          <div className="preview">
            <div>{summary}</div>
            {masked && (
              <div className="line2">
                Path <span className="sp" /> <small>hidden as a spoiler</small>
              </div>
            )}
          </div>
        </div>
        <div>
          <button className="cta" disabled={commentDone} onClick={onComment}>
            <b>
              {commentDone ? 'Result posted' : 'Post my result'} <span>→</span>
            </b>
            <span>{commentDone ? 'Your comment is live' : 'One tap · adds a comment'}</span>
          </button>
        </div>
      </footer>
    </>
  );
};
