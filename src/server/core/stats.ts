import { redis } from '@devvit/web/server';
import { dayKeyUTC } from '../../shared/game';

export type BoardEntry = { user: string; light: number };

export type Stats = { walkers: number; finished: number; lightsum: number };

export type Streak = { streak: number; best: number; solvedToday: boolean };

const DAY_MS = 86400000;

const statsKey = (day: string): string => `arche:stats:${day}`;
const boardKey = (day: string): string => `arche:board:${day}`;

export const readStreak = async (user: string, day: string): Promise<Streak> => {
  const yesterday = dayKeyUTC(new Date(Date.parse(`${day}T00:00:00Z`) - DAY_MS));
  const [streakRaw, lastRaw, solvedRaw, bestRaw] = await Promise.all([
    redis.get(`arche:streak:${user}`),
    redis.get(`arche:lastday:${user}`),
    redis.get(`arche:solved:${user}:${day}`),
    redis.get(`arche:best:${user}`),
  ]);
  const streak = Number.parseInt(streakRaw ?? '0', 10) || 0;
  const valid = lastRaw === day || lastRaw === yesterday;
  return {
    streak: valid ? streak : 0,
    best: Number.parseInt(bestRaw ?? '0', 10) || 0,
    solvedToday: solvedRaw === '1',
  };
};

export const readStats = async (day: string): Promise<Stats> => {
  const raw = await redis.hGetAll(statsKey(day));
  return {
    walkers: Number.parseInt(raw.walkers ?? '0', 10) || 0,
    finished: Number.parseInt(raw.finished ?? '0', 10) || 0,
    lightsum: Number.parseInt(raw.lightsum ?? '0', 10) || 0,
  };
};

export const readBoard = async (day: string, user: string): Promise<{
  top: BoardEntry[];
  rank: number;
  total: number;
}> => {
  const [rows, total, rank] = await Promise.all([
    redis.zRange(boardKey(day), 0, 4, { by: 'rank', reverse: true }),
    redis.zCard(boardKey(day)),
    redis.zRank(boardKey(day), user),
  ]);
  return {
    top: rows.map((row) => ({ user: row.member.replace(/^u\//, ''), light: row.score })),
    rank: rank === undefined ? 0 : total - rank,
    total,
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
): Promise<void> => {
  const best = await redis.get(`arche:best:${user}`);
  const bestValue = Number.parseInt(best ?? '0', 10) || 0;
  await Promise.all([
    redis.set(`arche:streak:${user}`, String(streak)),
    redis.set(`arche:lastday:${user}`, day),
    redis.set(`arche:solved:${user}:${day}`, '1'),
    redis.set(`arche:best:${user}`, String(Math.max(bestValue, streak))),
    redis.zAdd(boardKey(day), { member: `u/${user}`, score: light }),
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
