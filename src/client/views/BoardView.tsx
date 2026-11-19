import { Hud } from '../Hud';
import type { Init } from '../types';

type BoardProps = {
  init: Init;
  onBack: () => void;
  onDiscuss: () => void;
};

const Calendar = ({ streak }: { streak: number }) => (
  <div className="calendar" aria-label={`${streak} day streak`}>
    {Array.from({ length: 28 }, (_, i) => (
      <i
        key={i}
        className={i < Math.min(streak, 28) ? 'on' : i === Math.min(streak, 28) ? 'now' : ''}
      />
    ))}
  </div>
);

const RankRow = ({ place, user, light, you }: { place: number; user: string; light: number; you?: boolean }) => (
  <div className={`rankrow ${you ? 'you' : ''}`}>
    <span>{String(place).padStart(2, '0')}</span>
    <span>{you ? 'You' : `u/${user}`}</span>
    <b>{light} light</b>
  </div>
);

export const BoardView = ({ init, onBack, onDiscuss }: BoardProps) => {
  const top = init.board.top;
  return (
    <>
      <section className="scene">
        <div className="bignum" aria-hidden="true">{init.streak}<small>d</small></div>
        <div className="panel">
          <span className="rk">Same seed for everyone · Day {init.dayNumber}</span>
          <div style={{ display: 'grid', gridTemplateColumns: '190px 1fr', gap: 18 }}>
            <div>
              <h3>Your streak</h3>
              <p style={{ marginTop: 8 }}>
                {init.streak > 0
                  ? `${init.streak} days lit. Best: ${init.best}. Walk once a day to keep it going.`
                  : 'No streak yet. Walk today’s six rooms to light your first day.'}
              </p>
              <div style={{ marginTop: 12 }}><Calendar streak={init.streak} /></div>
            </div>
            <div>
              <span className="rk">Today’s ranking</span>
              <div className="ranklist" style={{ marginTop: 6 }}>
                {top.map((row, i) => (
                  <RankRow key={`${row.user}-${i}`} place={i + 1} user={row.user} light={row.light} />
                ))}
                {top.length === 0 && <div className="rankrow you"><span>01</span><span>You</span><b>first walker</b></div>}
                {init.board.rank > 5 && (
                  <RankRow place={init.board.rank} user={init.user} light={0} you />
                )}
              </div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 'auto' }}>
            <div className="kv"><span>Walked</span><b>{init.stats.walkers}</b></div>
            <div className="kv"><span>Reached six</span><b>{init.stats.finished}</b></div>
            <div className="kv"><span>Avg. light</span><b>{init.stats.finished ? (init.stats.lightsum / init.stats.finished).toFixed(1) : '0.0'}</b></div>
          </div>
        </div>
      </section>
      <Hud
        light={init.streak}
        reward={0}
        nextCost={0}
        relics={[]}
        used={[]}
        action={init.solvedToday ? 'Back to result' : 'Light the torch'}
        sub={init.solvedToday ? 'Today’s run is complete' : 'Day ' + init.dayNumber + ' · about 90 seconds'}
        onAction={onBack}
      />
      <button className="link" style={{ position: 'absolute', right: 24, bottom: 20 }} onClick={onDiscuss}>
        Discuss today
      </button>
    </>
  );
};
