import './index.css';

import { requestExpandedMode } from '@devvit/web/client';
import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { TopBar } from './components/TopBar';
import type { Init } from './types';
import { PostView } from './views/PostView';

const Splash = () => {
  const [init, setInit] = useState<Init | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/init');
        const data = (await res.json()) as Init;
        if (data.type !== 'init') throw new Error('bad init response');
        setInit(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'unknown error');
      }
    };
    void load();
  }, []);

  if (error) return <div className="error">Arche could not start: {error}</div>;
  if (!init) return <div className="error">Lighting the torch…</div>;
  return (
    <div className="game">
      <TopBar day={init.day} dayNumber={init.dayNumber} chip="About 90 seconds" />
      <PostView
        init={init}
        onStart={(event) => {
          requestExpandedMode(event.nativeEvent, 'game');
        }}
      />
    </div>
  );
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Splash />
  </StrictMode>,
);
