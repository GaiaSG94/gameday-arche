import { showToast } from '@devvit/web/client';
import { useCallback, useEffect, useState } from 'react';
import { MAX_LIGHT, START_LIGHT, type RelicId } from '../shared/game';
import { asError, type Finish, type Init, type View } from './types';
import { BoardView } from './views/BoardView';
import { DraftView } from './views/DraftView';
import { EndView } from './views/EndView';
import { RunView } from './views/RunView';

type Phase = {
  view: View;
  draftStep: number;
  roomIndex: number;
  selected: number;
  light: number;
  reward: number;
};

const beginning = (): Phase => ({
  view: 'draft', draftStep: 0, roomIndex: 0, selected: 0, light: START_LIGHT, reward: 0,
});

const post = async <T,>(url: string, body: unknown): Promise<T> => {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = (await res.json()) as T & { status?: string; message?: string };
  if (data.status === 'error') throw new Error(data.message ?? 'request failed');
  return data;
};

const Header = ({ day, walkers, clock }: { day: number; walkers: number; clock: string }) => (
  <header className="g-top">
    <span className="wm">ARCHE</span>
    <span className="top-mid">
      <span className="chip">Day {day}</span>
      <span className="chip dim"><i />{walkers} walked today</span>
    </span>
    <span className="chip dim">{clock}</span>
  </header>
);

export const GameApp = () => {
  const [init, setInit] = useState<Init | null>(null);
  const [phase, setPhase] = useState<Phase>(beginning());
  const [drafts, setDrafts] = useState<RelicId[]>([]);
  const [relics, setRelics] = useState<RelicId[]>([]);
  const [used, setUsed] = useState<RelicId[]>([]);
  const [compass, setCompass] = useState(false);
  const [path, setPath] = useState<number[]>([]);
  const [finish, setFinish] = useState<Finish | null>(null);
  const [commentDone, setCommentDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/init');
        const data = (await res.json()) as Init;
        if (data.type !== 'init') throw new Error('bad init response');
        setInit(data);
        setPhase({ ...beginning(), view: data.solvedToday ? 'board' : 'draft' });
      } catch (err) {
        setError(asError(err));
      }
    };
    void load();
  }, []);

  const sendFinish = useCallback(async (fullPath: number[]) => {
    try {
      const data = await post<Finish>('/api/finish', {
        choices: { drafts, arches: [...fullPath, ...Array(6 - fullPath.length).fill(0)] },
      });
      setFinish(data);
      setPhase((p) => ({ ...p, view: 'end' }));
    } catch (err) {
      setError(asError(err));
    }
  }, [drafts]);

  const pickDraft = (id: RelicId) => {
    const nextDrafts = [...drafts, id];
    setDrafts(nextDrafts);
    setRelics((r) => [...r, id]);
    if (id === 'ember') setPhase((p) => ({ ...p, light: Math.min(MAX_LIGHT, p.light + 2) }));
    if (id === 'veil') {
      setPhase((p) => ({ ...p, light: Math.min(MAX_LIGHT, p.light + 1) }));
      setUsed((u) => [...u, 'veil']);
    }
    if (id === 'compass') setCompass(true);
    setPhase((p) => ({ ...p, draftStep: p.draftStep + 1, view: p.draftStep + 1 < 3 ? 'draft' : 'run' }));
  };

  const endRun = (walked: number[]) => {
    setPath(walked);
    void sendFinish(walked);
  };

  const walk = () => {
    if (!init) return;
    const room = init.run.rooms[phase.roomIndex];
    if (!room) return;
    const arch = room.arches[phase.selected] ?? room.arches[0]!;
    const cost = Math.max(0, arch.cost - (compass ? 1 : 0));
    if (compass) setUsed((u) => [...u, 'compass']);
    setCompass(false);
    const light = phase.light - cost;
    const walked = [...path, phase.selected];
    if (light <= 0) {
      endRun(walked);
      return;
    }
    const nextRoom = phase.roomIndex + 1;
    if (nextRoom === 6) {
      endRun(walked);
      return;
    }
    const nextLight = Math.min(MAX_LIGHT, light + arch.reward);
    const nextDraft = nextRoom === 2 ? 1 : nextRoom === 4 ? 2 : phase.draftStep;
    setPhase({
      view: nextDraft !== phase.draftStep ? 'draft' : 'run',
      draftStep: nextDraft,
      roomIndex: nextRoom,
      selected: 0,
      light: nextLight,
      reward: 0,
    });
    setPath(walked);
  };

  const postComment = async () => {
    if (!finish) return;
    try {
      await post('/api/comment', { text: finish.comment });
      setCommentDone(true);
      showToast('Result posted in the comments');
    } catch (err) {
      showToast(asError(err));
    }
  };

  const goBoard = () => setPhase((p) => ({ ...p, view: 'board' }));
  const goBack = () => setPhase((p) => ({ ...p, view: finish ? 'end' : 'run' }));

  if (error) return <div className="error">Arche could not start: {error}</div>;
  if (!init) return <div className="error">Lighting the torch…</div>;
  if (phase.view === 'board') {
    return (
      <div className="game">
        <Header day={init.dayNumber} walkers={init.stats.walkers} clock={init.nextRun} />
        <BoardView init={init} onBack={goBack} onDiscuss={() => void postComment()} />
      </div>
    );
  }
  if (phase.view === 'end' && finish) {
    return (
      <div className="game">
        <Header day={init.dayNumber} walkers={init.stats.walkers} clock={init.nextRun} />
        <EndView
          init={init}
          finish={finish}
          onBoard={goBoard}
          onComment={() => void postComment()}
          commentDone={commentDone}
        />
      </div>
    );
  }
  if (phase.view === 'draft') {
    return (
      <div className="game">
        <Header day={init.dayNumber} walkers={init.stats.walkers} clock={init.nextRun} />
        <DraftView run={init.run} step={phase.draftStep} stars={phase.light} onPick={pickDraft} onStats={goBoard} />
      </div>
    );
  }
  return (
    <div className="game">
      <Header day={init.dayNumber} walkers={init.stats.walkers} clock={init.nextRun} />
      <RunView
        run={init.run}
        roomIndex={phase.roomIndex}
        selected={phase.selected}
        light={phase.light}
        reward={phase.reward}
        relics={relics}
        used={used}
        onSelect={(i) => setPhase((p) => ({ ...p, selected: i }))}
        onWalk={walk}
        onStats={goBoard}
      />
    </div>
  );
};
