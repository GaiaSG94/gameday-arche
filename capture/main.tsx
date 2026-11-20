import '../src/client/index.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { generateRun, replay, type RunChoices } from '../src/shared/game';
import { TopBar } from '../src/client/components/TopBar';
import type { Finish, Init } from '../src/client/types';
import { BoardView } from '../src/client/views/BoardView';
import { EndView } from '../src/client/views/EndView';
import { PostView } from '../src/client/views/PostView';
import { RunView } from '../src/client/views/RunView';

const DAY = '2026-11-20';
const run = generateRun(DAY);
const choices: RunChoices = { drafts: ['ember', 'compass', 'veil'], arches: [0, 0, 1, 0, 0, 1] };
const result = replay(run, choices);

const HIST = { 1: 190, 2: 260, 3: 329, 4: 380, 5: 282, 6: 190, 7: 110, 8: 51, 9: 26, 10: 11 };

const PATHS = [
  [0, 0, 1, 0, 0, 0],
  [0, 0, 1, 0, 0, 0],
  [0, 1, 0, 1, 0, 0],
  [0, 0, 0, 1, 0, 0],
  [1, 0, 0, 1, 0, 0],
];

const init: Init = {
  type: 'init',
  day: DAY,
  dayNumber: run.dayNumber,
  user: 'arche_keeper',
  streak: 10,
  best: 14,
  solvedToday: true,
  days: [
    '2026-11-10', '2026-11-11', '2026-11-12', '2026-11-13', '2026-11-14',
    '2026-11-15', '2026-11-16', '2026-11-17', '2026-11-18', '2026-11-19', '2026-11-20',
  ],
  nextRun: '07:42:10',
  run,
  stats: { walkers: 4812, finished: 1829, lightsum: 6590, hist: HIST },
  board: {
    top: [
      { user: 'lowtide', light: 9, path: PATHS[0]!, rank: 1 },
      { user: 'salt_and_ash', light: 9, path: PATHS[1]!, rank: 2 },
      { user: 'quietstair', light: 8, path: PATHS[2]!, rank: 3 },
      { user: 'ember_lane', light: 8, path: PATHS[3]!, rank: 4 },
      { user: 'nightwalker_09', light: 8, path: PATHS[4]!, rank: 5 },
    ],
    rank: 670,
    total: 4812,
    me: { light: 8, path: [0, 0, 1, 0, 0, 1] },
  },
};

const finish: Finish = {
  type: 'finish',
  ...result,
  comment: 'Arche · Day 5 · Room 6 · 4/10 light · 10-day streak\nPath hidden as a spoiler.',
  streak: 10,
  best: 14,
  stats: init.stats,
  board: init.board,
};

const screen = new URLSearchParams(location.search).get('screen') ?? 'post';

const frames = {
  post: (
    <>
      <TopBar day={init.day} dayNumber={init.dayNumber} chip="About 90 seconds" />
      <PostView init={init} onStart={() => undefined} />
    </>
  ),
  jeu: (
    <>
      <TopBar day={init.day} dayNumber={init.dayNumber} chip="4,812 walked today" />
      <RunView
        run={run}
        roomIndex={2}
        selected={0}
        light={7}
        relics={['ember', 'compass', 'veil']}
        used={['ember', 'veil']}
        ready={['compass']}
        onSelect={() => undefined}
        onWalk={() => undefined}
      />
    </>
  ),
  fin: (
    <>
      <TopBar day={init.day} dayNumber={init.dayNumber} chip="Next run in 07:42:10" />
      <EndView init={init} finish={finish} onBoard={() => undefined} onComment={() => undefined} commentDone={false} />
    </>
  ),
  series: (
    <>
      <TopBar day={init.day} dayNumber={init.dayNumber} chip="Same seed for everyone" />
      <BoardView init={init} onBack={() => undefined} onDiscuss={() => undefined} />
    </>
  ),
};

const chosen = frames[screen as keyof typeof frames] ?? frames.post;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <div className="game">{chosen}</div>
  </StrictMode>,
);
