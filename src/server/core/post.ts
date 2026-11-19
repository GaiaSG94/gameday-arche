import { reddit } from '@devvit/web/server';
import { dayKeyUTC, generateRun } from '../../shared/game';

export const createPost = async () => {
  const day = dayKeyUTC();
  const run = generateRun(day);
  return await reddit.submitCustomPost({
    title: `Arche · Day ${run.dayNumber} — ${run.rooms[0]?.name ?? 'a new run'}`,
  });
};
