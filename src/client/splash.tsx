import './index.css';

import { context, requestExpandedMode } from '@devvit/web/client';
import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import type { Init } from './types';

const Splash = () => {
  const [init, setInit] = useState<Init | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/init');
        const data = (await res.json()) as Init;
        if (data.type === 'init') setInit(data);
      } catch {
        setInit(null);
      }
    };
    void load();
  }, []);

  const day = init?.dayNumber ?? 0;
  const streak = init?.streak ?? 0;
  const walkers = init?.stats.walkers ?? 0;

  return (
    <div className="splash">
      <div className="splash-top">
        <span className="wm">ARCHE</span>
        <span className="chip">Day {day}</span>
      </div>
      <h1>Six rooms.<br />Three relics.<br />One torch.</h1>
      <p style={{ fontSize: 12.5, lineHeight: 1.4, color: 'var(--g)', maxWidth: 460 }}>
        Same arches for everyone today. Reach room six with your torch still lit. About 90 seconds.
      </p>
      <div className="corridor" aria-hidden="true">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <i key={i} className={i === 0 ? 'now' : ''} />
        ))}
      </div>
      <div className="stats3">
        <div><b>{walkers}</b><span>walked today</span></div>
        <div><b>{streak}</b><span>day streak</span></div>
        <div><b>{init?.nextRun ?? '--:--:--'}</b><span>next run</span></div>
      </div>
      <button
        className="cta"
        style={{ width: 260, alignSelf: 'flex-start' }}
        onClick={(e) => requestExpandedMode(e.nativeEvent, 'game')}
      >
        <b>Light the torch <span>→</span></b>
        <span>Day {day} · same seed for all · u/{context.username ?? 'you'}</span>
      </button>
    </div>
  );
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Splash />
  </StrictMode>,
);
