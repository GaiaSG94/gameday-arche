import type { RelicId, Run, RunResult } from '../shared/game';

export type BoardEntry = { user: string; light: number };

export type Stats = { walkers: number; finished: number; lightsum: number };

export type Board = { top: BoardEntry[]; rank: number; total: number };

export type Init = {
  type: 'init';
  day: string;
  dayNumber: number;
  user: string;
  streak: number;
  best: number;
  solvedToday: boolean;
  nextRun: string;
  run: Run;
  stats: Stats;
  board: Board;
};

export type Finish = RunResult & {
  type: 'finish';
  comment: string;
  streak: number;
  best: number;
  stats: Stats;
  board: Board;
};

export type View = 'draft' | 'run' | 'end' | 'board';

export const RELIC_ICON: Record<RelicId, string> = {
  ember: '<circle cx="13" cy="13" r="8"/>',
  compass: '<path d="M13 3l8 10-8 10-8-10z"/>',
  veil: '<path d="M13 5l9 16H4z"/>',
};

export const asError = (err: unknown): string =>
  err instanceof Error ? err.message : 'unknown error';
