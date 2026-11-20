import { redis } from '@devvit/web/server';
import { DAY_MS, dayKeyUTC, lastDays } from '../../shared/game';

export type BoardEntry = { user: string; light: number; path: number[]; rank: number };

export type Stats = {
  walkers: number;
  finished: number;
  lightsum: number;
  hist: Record<string, number>;
};

export type Streak = { streak: number; best: number; solvedToday: boolean; days: string[] };

export type Board = {
  top: BoardEntry[];
  rank: number;
  total: number;
  me: { light: number; path: number[] } | null;
};

const CALENDAR_DAYS = 28;

const statsKey = (day: string): string => `arche:stats:${day}`;
const histKey = (day: string): string => `arche:hist:${day}`;
const boardKey = (day: string): string => `arche:board:${day}`;
const pathKey = (day: string): string => `arche:paths:${day}`;
const timeKey = (day: string): string => `arche:times:${day}`;
const daysKey = (user: string): string => `arche:days:${user}`;

export const readStreak = async (user: string, day: string): Promise<Streak> => {
  const yesterday = dayKeyUTC(new Date(Date.parse(`${day}T00:00:00Z`) - DAY_MS));
  const [streakRaw, lastRaw, solvedRaw, bestRaw, daysRaw] = await Promise.all([
    redis.get(`arche:streak:${user}`),
    redis.get(`arche:lastday:${user}`),
    redis.get(`arche:solved:${user}:${day}`),
    redis.get(`arche:best:${user}`),
    redis.hGetAll(daysKey(user)),
  ]);
  const streak = Number.parseInt(streakRaw ?? '0', 10) || 0;
  const valid = lastRaw === day || lastRaw === yesterday;
  return {
    streak: valid ? streak : 0,
    best: Number.parseInt(bestRaw ?? '0', 10) || 0,
    solvedToday: solvedRaw === '1',
    days: lastDays(day, CALENDAR_DAYS).filter((d) => daysRaw[d] === '1'),
  };
};

export const readStats = async (day: string): Promise<Stats> => {
  const [raw, histRaw] = await Promise.all([
    redis.hGetAll(statsKey(day)),
    redis.hGetAll(histKey(day)),
  ]);
  const hist: Record<string, number> = {};
  for (const [light, count] of Object.entries(histRaw)) {
    hist[light] = Number.parseInt(count, 10) || 0;
  }
  return {
    walkers: Number.parseInt(raw.walkers ?? '0', 10) || 0,
    finished: Number.parseInt(raw.finished ?? '0', 10) || 0,
    lightsum: Number.parseInt(raw.lightsum ?? '0', 10) || 0,
    hist,
  };
};

type Scored = { member: string; score: number; time: number };

const parsePath = (raw: string | undefined): number[] =>
  (raw ?? '')
    .split('')
    .map((c) => Number.parseInt(c, 10))
    .filter((n) => n === 0 || n === 1);

export const readBoard = async (day: string, user: string): Promise<Board> => {
  const [rows, timesRaw, pathsRaw] = await Promise.all([
    redis.zRange(boardKey(day), 0, -1, { by: 'rank', reverse: true }),
    redis.hGetAll(timeKey(day)),
    redis.hGetAll(pathKey(day)),
  ]);
  const scored: Scored[] = rows.map((row) => ({
    member: row.member,
    score: row.score,
    time: Number.parseInt(timesRaw[row.member] ?? '0', 10) || 0,
  }));
  const ordered = [...scored].sort((a, b) => b.score - a.score || a.time - b.time);
  const rankOf = (score: number): number => ordered.filter((row) => row.score > score).length + 1;
  const entry = (row: Scored): BoardEntry => ({
    user: row.member.replace(/^u\//, ''),
    light: row.score,
    path: parsePath(pathsRaw[row.member.replace(/^u\//, '')]),
    rank: rankOf(row.score),
  });
  const mine = ordered.find((row) => row.member === `u/${user}`);
  return {
    top: ordered.slice(0, 5).map(entry),
    rank: mine ? rankOf(mine.score) : 0,
    total: ordered.length,
    me: mine ? { light: mine.score, path: parsePath(pathsRaw[user]) } : null,
  };
};

export const recordWalk = async (day: string, user: string): Promise<boolean> => {
  const key = `arche:walked:${user}:${day}`;
  const seen = await redis.get(key);
  if (seen === '1') return false;
  await redis.set(key, '1');
  await redis.hIncrBy(statsKey(day), 'walkers', 1);
  return true;
};

export const recordWin = async (
  day: string,
  user: string,
  light: number,
  streak: number,
  path: number[],
): Promise<void> => {
  const best = await redis.get(`arche:best:${user}`);
  const bestValue = Number.parseInt(best ?? '0', 10) || 0;
  await Promise.all([
    redis.set(`arche:streak:${user}`, String(streak)),
    redis.set(`arche:lastday:${user}`, day),
    redis.set(`arche:solved:${user}:${day}`, '1'),
    redis.set(`arche:best:${user}`, String(Math.max(bestValue, streak))),
    redis.zAdd(boardKey(day), { member: `u/${user}`, score: light }),
    redis.hIncrBy(histKey(day), String(light), 1),
    redis.hSet(pathKey(day), { [user]: path.join('') }),
    redis.hSet(timeKey(day), { [user]: String(Date.now()) }),
    redis.hSet(daysKey(user), { [day]: '1' }),
    redis.hIncrBy(statsKey(day), 'finished', 1),
    redis.hIncrBy(statsKey(day), 'lightsum', light),
  ]);
};

export const recordLoss = async (day: string, user: string): Promise<void> => {
  await Promise.all([
    redis.set(`arche:streak:${user}`, '0'),
    redis.set(`arche:lastday:${user}`, day),
  ]);
};
