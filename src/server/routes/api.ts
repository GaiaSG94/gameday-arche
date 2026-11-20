import { Hono } from 'hono';
import { context, reddit } from '@devvit/web/server';
import type { Context } from 'hono';
import type { ErrorResponse } from '../../shared/api';
import {
  commentFor,
  dayKeyUTC,
  generateRun,
  isValidChoices,
  nextRunIn,
  replay,
  type RunChoices,
} from '../../shared/game';
import {
  readBoard,
  readStats,
  readStreak,
  recordLoss,
  recordWalk,
  recordWin,
} from '../core/stats';

export const api = new Hono();

const error = (c: Context, message: string): Response =>
  c.json<ErrorResponse>({ status: 'error', message }, 400);

const handleInit = async (c: Context): Promise<Response> => {
  if (!context.postId) return error(c, 'postId is required');
  try {
    const day = dayKeyUTC();
    const user = (await reddit.getCurrentUsername()) ?? 'anonymous';
    const run = generateRun(day);
    const [streak, stats, board] = await Promise.all([
      readStreak(user, day),
      readStats(day),
      readBoard(day, user),
    ]);
    return c.json({
      type: 'init',
      day,
      dayNumber: run.dayNumber,
      user,
      streak: streak.streak,
      best: streak.best,
      solvedToday: streak.solvedToday,
      days: streak.days,
      nextRun: nextRunIn(),
      run,
      stats,
      board,
    });
  } catch (err) {
    return error(c, `init failed: ${err instanceof Error ? err.message : 'unknown error'}`);
  }
};

const handleFinish = async (c: Context): Promise<Response> => {
  if (!context.postId) return error(c, 'postId is required');
  const day = dayKeyUTC();
  const run = generateRun(day);
  const body = await c.req.json<{ choices?: RunChoices }>();
  if (!body.choices || !isValidChoices(run, body.choices)) return error(c, 'invalid run');
  try {
    const user = (await reddit.getCurrentUsername()) ?? 'anonymous';
    const result = replay(run, body.choices);
    const previous = await readStreak(user, day);
    await recordWalk(day, user);

    let streak = previous.streak;
    if (result.won && !previous.solvedToday) {
      streak += 1;
      await recordWin(day, user, result.light, streak, result.path);
    } else if (!result.won && !previous.solvedToday) {
      await recordLoss(day, user);
      streak = 0;
    }

    const [stats, board] = await Promise.all([readStats(day), readBoard(day, user)]);
    return c.json({
      type: 'finish',
      ...result,
      comment: commentFor(result, run, streak),
      streak,
      best: Math.max(previous.best, streak),
      stats,
      board,
    });
  } catch (err) {
    return error(c, `finish failed: ${err instanceof Error ? err.message : 'unknown error'}`);
  }
};

const handleBoard = async (c: Context): Promise<Response> => {
  const day = dayKeyUTC();
  const user = (await reddit.getCurrentUsername()) ?? 'anonymous';
  const [stats, board, streak] = await Promise.all([
    readStats(day),
    readBoard(day, user),
    readStreak(user, day),
  ]);
  return c.json({ type: 'board', day, stats, board, streak });
};

const handleComment = async (c: Context): Promise<Response> => {
  if (!context.postId) return error(c, 'postId is required');
  const body = await c.req.json<{ text?: string }>();
  const text = typeof body.text === 'string' ? body.text.slice(0, 400) : '';
  if (!text) return error(c, 'text is required');
  try {
    await reddit.submitComment({ id: context.postId, text, runAs: 'USER' });
    return c.json({ type: 'comment', ok: true });
  } catch (err) {
    return error(c, `comment failed: ${err instanceof Error ? err.message : 'unknown error'}`);
  }
};

api.get('/init', handleInit);
api.post('/finish', handleFinish);
api.get('/board', handleBoard);
api.post('/comment', handleComment);
