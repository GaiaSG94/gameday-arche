export type RelicId = 'ember' | 'compass' | 'veil';

export type Relic = {
  id: RelicId;
  name: string;
  effect: string;
};

export type Arch = {
  kind: 'narrow' | 'wide';
  cost: number;
  reward: number;
};

export type Room = {
  index: number;
  name: string;
  arches: [Arch, Arch];
};

export type Run = {
  day: string;
  dayNumber: number;
  rooms: Room[];
  relicOffers: RelicId[][];
};

export type RunChoices = {
  drafts: RelicId[];
  arches: number[];
};

export type RunResult = {
  won: boolean;
  reachedRoom: number;
  light: number;
  path: number[];
  costs: number[];
  usedRelics: RelicId[];
  comment: string;
};

export const RELICS: Relic[] = [
  { id: 'ember', name: 'Ember Ring', effect: '+2 light now' },
  { id: 'compass', name: 'Salt Compass', effect: '-1 on your next arch' },
  { id: 'veil', name: 'Ash Veil', effect: '+1 light next room' },
];

export const ROOM_NAMES = [
  'The Threshold',
  'The Hollow Hall',
  'The Drowned Stair',
  'The Ash Gallery',
  'The Silent Nave',
  'The Last Light',
];

export const START_LIGHT = 8;
export const MAX_LIGHT = 10;
export const EPOCH = Date.UTC(2026, 10, 16);

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const dayKeyUTC = (now: Date = new Date()): string => now.toISOString().slice(0, 10);

export const DAY_MS = 86400000;

export const lastDays = (day: string, count = 28): string[] => {
  const end = Date.parse(`${day}T00:00:00Z`);
  return Array.from({ length: count }, (_, i) =>
    dayKeyUTC(new Date(end - (count - 1 - i) * DAY_MS)),
  );
};

export const dayLabel = (day: string): string => {
  const date = new Date(`${day}T00:00:00Z`);
  return `${MONTHS[date.getUTCMonth()]} ${date.getUTCDate()}`;
};

export const dayNumber = (day: string): number =>
  Math.floor((Date.parse(`${day}T00:00:00Z`) - EPOCH) / 86400000) + 1;

export const dailySeed = (day: string): number => {
  let hash = 2166136261;
  const input = `arche:${day}`;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

export const mulberry32 = (seed: number): (() => number) => {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const buildArch = (rand: () => number, kind: 'narrow' | 'wide'): Arch => {
  const cost = kind === 'narrow' ? 1 + Math.floor(rand() * 2) : 3 + Math.floor(rand() * 2);
  const reward = kind === 'narrow' ? Math.floor(rand() * 3) : 3 + Math.floor(rand() * 3);
  return { kind, cost, reward };
};

export const generateRun = (day: string): Run => {
  const rand = mulberry32(dailySeed(day));
  const rooms: Room[] = ROOM_NAMES.map((name, index) => ({
    index,
    name,
    arches: [buildArch(rand, 'narrow'), buildArch(rand, 'wide')],
  }));
  const all = RELICS.map((relic) => relic.id);
  const shuffled = (): RelicId[] => [...all].sort(() => rand() - 0.5);
  return {
    day,
    dayNumber: dayNumber(day),
    rooms,
    relicOffers: [shuffled(), shuffled().slice(0, 2), shuffled().slice(0, 2)],
  };
};

export const isValidChoices = (run: Run, choices: RunChoices): boolean => {
  if (!Array.isArray(choices.drafts) || !Array.isArray(choices.arches)) return false;
  if (choices.drafts.length !== 3 || choices.arches.length !== run.rooms.length) return false;
  const offers = run.relicOffers;
  const draftsOk = choices.drafts.every((id, i) => offers[i]?.includes(id) === true);
  return draftsOk && choices.arches.every((a) => a === 0 || a === 1);
};

const credit = (light: number, amount: number): number => Math.min(MAX_LIGHT, light + amount);

export const commentFor = (result: RunResult, run: Run, streak: number): string => {
  const head = `Arche Â· Day ${run.dayNumber}`;
  if (!result.won) return `${head} Â· Torch out in room ${result.reachedRoom}`;
  const summary = `${head} Â· Room 6 Â· ${result.light}/${MAX_LIGHT} light Â· ${streak}-day streak`;
  return `${summary}\nPath hidden as a spoiler.`;
};

const finish = (
  reachedRoom: number,
  light: number,
  path: number[],
  costs: number[],
  usedRelics: RelicId[],
  won: boolean,
): RunResult => ({
  won,
  reachedRoom,
  light: Math.max(0, light),
  path,
  costs,
  usedRelics,
  comment: '',
});

export const replay = (run: Run, choices: RunChoices): RunResult => {
  let light = START_LIGHT;
  let pending = 0;
  let compass = false;
  let veil = false;
  let reachedRoom = 0;
  const path: number[] = [];
  const costs: number[] = [];
  const usedRelics: RelicId[] = [];

  for (const room of run.rooms) {
    light = credit(light, pending);
    if (veil) {
      light = credit(light, 1);
      usedRelics.push('veil');
      veil = false;
    }

    const draftStep = reachedRoom === 0 ? 0 : reachedRoom === 2 ? 1 : reachedRoom === 4 ? 2 : -1;
    const draft = draftStep < 0 ? undefined : choices.drafts[draftStep];
    if (draft === 'ember') {
      light = credit(light, 2);
      usedRelics.push('ember');
    }
    if (draft === 'compass') compass = true;
    if (draft === 'veil') veil = true;

    const arch = room.arches[choices.arches[reachedRoom] ?? 0] ?? room.arches[0]!;
    const cost = Math.max(0, arch.cost - (compass ? 1 : 0));
    if (compass) {
      usedRelics.push('compass');
      compass = false;
    }
    light -= cost;
    path.push(arch.kind === 'narrow' ? 0 : 1);
    costs.push(arch.cost);
    if (light <= 0) {
      reachedRoom += 1;
      return finish(reachedRoom, 0, path, costs, usedRelics, false);
    }
    pending = arch.reward;
    reachedRoom += 1;
  }
  return finish(reachedRoom, light, path, costs, usedRelics, true);
};

export const playRun = (run: Run, choices: RunChoices): RunResult => {
  const result = replay(run, choices);
  return { ...result, comment: commentFor(result, run, 0) };
};

export const nextRunIn = (now: Date = new Date()): string => {
  const next = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1);
  const left = Math.max(0, Math.floor((next - now.getTime()) / 1000));
  const h = String(Math.floor(left / 3600)).padStart(2, '0');
  const m = String(Math.floor((left % 3600) / 60)).padStart(2, '0');
  const s = String(left % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
};
