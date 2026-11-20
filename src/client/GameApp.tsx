import { showToast } from '@devvit/web/client';
import { useCallback, useEffect, useState } from 'react';
import {
  commentFor,
  MAX_LIGHT,
  START_LIGHT,
  type RelicId,
  type RunResult,
} from '../shared/game';
import { TopBar } from './components/TopBar';
import { asError, type Finish, type Init, type View } from './types';
import { BoardView } from './views/BoardView';
import { DraftView } from './views/DraftView';
import { EndView } from './views/EndView';
import { RunView } from './views/RunView';

type Phase = {
  view: View;
  roomIndex: number;
  selected: number;
  light: number;
};

const beginning = (): Phase => ({ view: 'draft', roomIndex: 0, selected: 0, light: START_LIGHT });

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

const draftBefore = (nextRoom: number): number => (nextRoom === 2 ? 1 : nextRoom === 4 ? 2 : -1);

export const GameApp = () => {
  const [init, setInit] = useState<Init | null>(null);
  const [phase, setPhase] = useState<Phase>(beginning());
  const [drafts, setDrafts] = useState<RelicId[]>([]);
  const [relics, setRelics] = useState<RelicId[]>([]);
  const [used, setUsed] = useState<RelicId[]>([]);
  const [compass, setCompass] = useState(false);
  const [veil, setVeil] = useState(false);
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

  const sendFinish = useCallback(
    async (fullPath: number[]) => {
      try {
        const data = await post<Finish>('/api/finish', {
          choices: { drafts, arches: [...fullPath, ...Array(6 - fullPath.length).fill(0)] },
        });
        setFinish(data);
        setPhase((p) => ({ ...p, view: 'end' }));
      } catch (err) {
        setError(asError(err));
      }
    },
    [drafts],
  );

  const pickDraft = (id: RelicId) => {
    setDrafts((d) => [...d, id]);
    setRelics((r) => [...r, id]);
    if (id === 'ember') {
      setUsed((u) => [...u, 'ember']);
      setPhase((p) => ({ ...p, light: Math.min(MAX_LIGHT, p.light + 2) }));
    }
    if (id === 'compass') setCompass(true);
    if (id === 'veil') setVeil(true);
    setPhase((p) => ({ ...p, view: 'run' }));
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
    if (compass) {
      setUsed((u) => [...u, 'compass']);
      setCompass(false);
    }
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
    const gain = arch.reward + (veil ? 1 : 0);
    if (veil) {
      setUsed((u) => [...u, 'veil']);
      setVeil(false);
    }
    setPhase({
      view: draftBefore(nextRoom) >= 0 ? 'draft' : 'run',
      roomIndex: nextRoom,
      selected: 0,
      light: Math.min(MAX_LIGHT, light + gain),
    });
    setPath(walked);
  };

  const commentText = (): string => {
    if (finish) return finish.comment;
    const me = init?.board.me;
    if (!init || !me) return '';
    const result: RunResult = {
      won: true,
      reachedRoom: 6,
      light: me.light,
      path: me.path,
      costs: [],
      usedRelics: [],
      comment: '',
    };
    return commentFor(result, init.run, init.streak);
  };

  const postComment = async () => {
    const text = commentText();
    if (!text) {
      showToast('Walk today’s six rooms first');
      return;
    }
    try {
      await post('/api/comment', { text });
      setCommentDone(true);
      showToast('Result posted in the comments');
    } catch (err) {
      showToast(asError(err));
    }
  };

  const goBoard = () => setPhase((p) => ({ ...p, view: 'board' }));
  const goRun = () => setPhase((p) => ({ ...p, view: 'draft' }));

  if (error) return <div className="error">Arche could not start: {error}</div>;
  if (!init) return <div className="error">Lighting the torch…</div>;

  const ready = [...(compass ? ['compass' as RelicId] : []), ...(veil ? ['veil' as RelicId] : [])];

  if (phase.view === 'board') {
    return (
      <div className="game">
        <TopBar day={init.day} dayNumber={init.dayNumber} chip="Same seed for everyone" />
        <BoardView init={init} onBack={goRun} onDiscuss={() => void postComment()} />
      </div>
    );
  }
  if (phase.view === 'end' && finish) {
    return (
      <div className="game">
        <TopBar day={init.day} dayNumber={init.dayNumber} chip={`Next run in ${init.nextRun}`} />
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
        <TopBar day={init.day} dayNumber={init.dayNumber} chip="Same seed for everyone" />
        <DraftView run={init.run} step={drafts.length} light={phase.light} onPick={pickDraft} />
      </div>
    );
  }
  return (
    <div className="game">
      <TopBar day={init.day} dayNumber={init.dayNumber} chip={`${init.stats.walkers.toLocaleString('en-US')} walked today`} />
      <RunView
        run={init.run}
        roomIndex={phase.roomIndex}
        selected={phase.selected}
        light={phase.light}
        relics={relics}
        used={used}
        ready={ready}
        onSelect={(i) => setPhase((p) => ({ ...p, selected: i }))}
        onWalk={walk}
      />
    </div>
  );
};
