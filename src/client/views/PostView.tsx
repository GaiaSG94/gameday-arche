import type { MouseEvent } from 'react';
import { Corridor } from '../components/Corridor';
import { SixRooms } from '../components/SixRooms';
import { WeekDots } from '../components/WeekDots';
import type { Init } from '../types';

export type PostViewProps = {
  init: Init;
  onStart: (event: MouseEvent<HTMLButtonElement>) => void;
};

export const PostView = ({ init, onStart }: PostViewProps) => {
  const walked = init.stats.walkers;
  const pct = walked ? Math.round((init.stats.finished / walked) * 100) : 0;
  return (
    <>
      <section className="post-scene">
        <div className="bignum" aria-hidden="true">
          {init.dayNumber}
        </div>
        <Corridor />
        <div className="room">
          <span className="rk">Today’s run</span>
          <h2>
            Six rooms.
            <br />
            Three relics.
            <br />
            One torch.
          </h2>
          <p className="rule">
            Same arches for everyone today. Reach room six with your torch still lit.
          </p>
        </div>
        <div className="col-r stats">
          <div className="stat">
            <b>{walked.toLocaleString('en-US')}</b>
            <span>walked today</span>
          </div>
          <div className="stat">
            <b>{pct}%</b>
            <span>reached room six</span>
          </div>
          <div className="stat">
            <b>{init.nextRun}</b>
            <span>until the next run</span>
          </div>
        </div>
      </section>
      <footer className="hud">
        <div>
          <span className="lbl">Six rooms</span>
          <SixRooms />
        </div>
        <div>
          <span className="lbl">Your streak</span>
          <div className="st-row">
            <b>{init.streak}</b>
            <span>days · best {init.best}</span>
          </div>
          <WeekDots day={init.day} days={init.days} />
        </div>
        <div>
          <button className="cta" onClick={onStart}>
            <b>
              Light the torch <span>→</span>
            </b>
            <span>
              Day {init.dayNumber} · same seed for all
            </span>
          </button>
        </div>
      </footer>
    </>
  );
};
