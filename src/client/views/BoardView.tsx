import { Calendar } from '../components/Calendar';
import type { Init } from '../types';

const NARROW = 'M3 14V7a3 3 0 0 1 6 0v7';
const WIDE = 'M1 14V8a5 5 0 0 1 10 0v6';

type BoardProps = {
  init: Init;
  onBack: () => void;
  onDiscuss: () => void;
};

type RankRowProps = {
  place: number;
  user: string;
  light: number;
  path: number[];
  mine?: boolean;
  hidden?: boolean;
};

const PathIcons = ({ path, hidden }: { path: number[]; hidden: boolean }) => {
  if (hidden) return <span className="sp-bar" />;
  return (
    <span className="pgs">
      {path.map((kind, i) => (
        <svg className="pg" key={i} viewBox="0 0 12 15" aria-hidden="true">
          <path d={kind === 1 ? WIDE : NARROW} />
        </svg>
      ))}
    </span>
  );
};

const RankRow = ({ place, user, light, path, mine = false, hidden = false }: RankRowProps) => (
  <tr className={mine ? 'me' : ''}>
    <td>{place}</td>
    <td>{mine ? 'You' : `u/${user}`}</td>
    <td className="p">
      <PathIcons path={path} hidden={hidden} />
    </td>
    <td className="l">{light} light</td>
  </tr>
);

const streakTitle = (streak: number): string => {
  const names = ['No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'];
  if (streak === 0) return 'No streak yet.';
  const name = names[streak] ?? String(streak);
  return `${name} day${streak > 1 ? 's' : ''} lit.`;
};

export const BoardView = ({ init, onBack, onDiscuss }: BoardProps) => {
  const walked = init.stats.walkers;
  const pct = walked ? Math.round((init.stats.finished / walked) * 100) : 0;
  const avg = init.stats.finished ? (init.stats.lightsum / init.stats.finished).toFixed(1) : '0.0';
  const me = init.board.me;
  const hidden = !init.solvedToday;
  return (
    <>
      <section className="scene">
        <div className="bignum" aria-hidden="true">
          {init.streak}
        </div>
        <div className="room">
          <span className="rk">Your streak</span>
          <h2>{streakTitle(init.streak)}</h2>
          <p className="rule">
            {init.streak > 0
              ? `Best: ${init.best} days. Walk once a day to keep it going.`
              : 'Walk today’s six rooms to light your first day.'}
          </p>
          <Calendar day={init.day} days={init.days} />
        </div>
        <div className="col-r rank">
          <span className="lbl">
            Today’s ranking · Day {init.dayNumber}
          </span>
          <table className="rk-t">
            <tbody>
              {init.board.top.map((row, i) => (
                <RankRow
                  key={`${row.user}-${i}`}
                  place={row.rank}
                  user={row.user}
                  light={row.light}
                  path={row.path}
                  hidden={hidden}
                />
              ))}
              <tr className="gap">
                <td colSpan={4}>· · ·</td>
              </tr>
              {me ? (
                <RankRow
                  place={init.board.rank}
                  user={init.user}
                  light={me.light}
                  path={me.path}
                  mine
                />
              ) : (
                <tr className="ghost">
                  <td>—</td>
                  <td colSpan={3}>You haven’t walked today</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
      <footer className="hud two">
        <div>
          <span className="lbl">Today on Arche</span>
          <div className="stats3">
            <div className="stat">
              <b>{walked.toLocaleString('en-US')}</b>
              <span>walked</span>
            </div>
            <div className="stat">
              <b>{pct}%</b>
              <span>reached room six</span>
            </div>
            <div className="stat">
              <b>{avg}</b>
              <span>average light left</span>
            </div>
          </div>
        </div>
        <div>
          <button className="cta" onClick={init.solvedToday ? onDiscuss : onBack}>
            <b>
              {init.solvedToday ? 'Discuss today' : 'Light the torch'} <span>→</span>
            </b>
            <span>
              {init.solvedToday ? 'One tap · adds a comment' : `Day ${init.dayNumber} · about 90 seconds`}
            </span>
          </button>
        </div>
      </footer>
    </>
  );
};
