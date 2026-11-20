import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  commentFor,
  dailySeed,
  dayKeyUTC,
  dayNumber,
  generateRun,
  isValidChoices,
  MAX_LIGHT,
  nextRunIn,
  playRun,
  replay,
  START_LIGHT,
  type Run,
  type RunChoices,
  type RunResult,
} from './game.ts';

const choices = (arches: number[], drafts: RunChoices['drafts'] = ['ember', 'compass', 'veil']): RunChoices => ({
  drafts,
  arches,
});

const allChoices = (): RunChoices[] => {
  const drafts: RunChoices['drafts'][] = [];
  for (const a of ['ember', 'compass', 'veil'])
    for (const b of ['ember', 'compass', 'veil'])
      for (const c of ['ember', 'compass', 'veil']) drafts.push([a, b, c]);
  const paths: number[][] = [];
  for (let mask = 0; mask < 64; mask++) {
    paths.push([0, 1, 2, 3, 4, 5].map((i) => ((mask >> i) & 1) as number));
  }
  return drafts.flatMap((d) => paths.map((p) => choices(p, d)));
};

test('seed et run deterministes sur 365 jours', () => {
  for (let i = 0; i < 365; i++) {
    const day = dayKeyUTC(new Date(Date.UTC(2026, 10, 17) + i * 86400000));
    assert.equal(dailySeed(day), dailySeed(day));
    assert.deepEqual(generateRun(day), generateRun(day));
    assert.equal(generateRun(day).rooms.length, 6);
  }
});

test('numerotation et format de jour', () => {
  assert.equal(dayNumber('2026-11-16'), 1);
  assert.equal(dayNumber('2026-12-09'), 24);
  assert.match(dayKeyUTC(new Date('2026-12-09T12:00:00Z')), /^2026-12-09$/);
  assert.match(nextRunIn(new Date('2026-12-09T12:00:00Z')), /^\d\d:\d\d:\d\d$/);
});

test('les arches sont dans les bornes et les deux types sont presents', () => {
  const run = generateRun('2026-12-01');
  for (const room of run.rooms) {
    const [narrow, wide] = room.arches;
    assert.equal(narrow.kind, 'narrow');
    assert.equal(wide.kind, 'wide');
    assert.ok(narrow.cost >= 1 && narrow.cost <= 2);
    assert.ok(wide.cost >= 3 && wide.cost <= 4);
    assert.ok(narrow.reward >= 0 && narrow.reward <= 2);
    assert.ok(wide.reward >= 3 && wide.reward <= 5);
  }
  assert.equal(run.relicOffers[0]?.length, 3);
  assert.equal(run.relicOffers[1]?.length, 2);
});

test('choix invalides rejetes', () => {
  const run = generateRun('2026-12-01');
  assert.ok(isValidChoices(run, choices([0, 0, 0, 0, 0, 0])));
  assert.ok(!isValidChoices(run, choices([0, 0, 0, 0, 0])));
  assert.ok(!isValidChoices(run, choices([0, 0, 0, 0, 0, 2])));
  assert.ok(!isValidChoices(run, choices([0, 0, 0, 0, 0, 0], ['ember', 'ember', 'ember'])));
});

test('Ember Ring ajoute de la lumiere immediate (plafonnee)', () => {
  const run = generateRun('2026-12-01');
  const withEmber = replay(run, choices([0, 0, 0, 0, 0, 0], ['ember', 'compass', 'veil']));
  const withoutEmber = replay(run, choices([0, 0, 0, 0, 0, 0], ['compass', 'compass', 'veil']));
  assert.ok(withEmber.light >= withoutEmber.light);
  assert.ok(withEmber.light <= MAX_LIGHT);
  assert.ok(withEmber.usedRelics.includes('ember'));
});

test('la torche eteinte arrete la partie des la salle courante', () => {
  const run = generateRun('2026-12-01');
  const result = replay(run, choices([1, 1, 1, 1, 1, 1], ['compass', 'compass', 'compass']));
  if (!result.won) {
    assert.ok(result.reachedRoom >= 1 && result.reachedRoom < 6);
    assert.equal(result.light, 0);
    assert.equal(result.path.length, result.reachedRoom);
  } else {
    assert.equal(result.reachedRoom, 6);
  }
});

test('une strategie gagnante existe chaque jour sur 365 jours', () => {
  for (let i = 0; i < 365; i++) {
    const day = dayKeyUTC(new Date(Date.UTC(2026, 10, 17) + i * 86400000));
    const run = generateRun(day);
    const winners = allChoices().filter((pick) => replay(run, pick).won);
    assert.ok(winners.length > 0, `aucune solution pour ${day}`);
    for (const pick of winners) {
      assert.equal(replay(run, pick).reachedRoom, 6);
    }
  }
});

test('le resultat ne depend que des choix, jamais d une valeur client', () => {
  const run: Run = generateRun('2026-12-09');
  const pick = choices([0, 1, 0, 1, 0, 1]);
  assert.deepEqual(replay(run, pick), replay(run, pick));
  const played = playRun(run, pick);
  assert.equal(played.comment, commentFor(replay(run, pick), run, 0));
});

test('le commentaire ne divulgue pas le chemin', () => {
  const run = generateRun('2026-12-09');
  const result = playRun(run, choices([0, 1, 0, 1, 0, 1]));
  const text = commentFor(result, run, 3);
  assert.match(text, /Day 24/);
  assert.match(text, /3-day streak/);
  assert.doesNotMatch(text.toLowerCase(), /narrow|wide|\barch\b/);
  assert.doesNotMatch(text, /[−-]\s?\d/);
  assert.match(text, /hidden as a spoiler/);
});

const twoRooms = (first: number, second: number): Run => ({
  day: 'test',
  dayNumber: 1,
  rooms: [
    { index: 0, name: 'A', arches: [{ kind: 'narrow', cost: first, reward: 0 }, { kind: 'wide', cost: first, reward: 0 }] },
    { index: 1, name: 'B', arches: [{ kind: 'narrow', cost: second, reward: 0 }, { kind: 'wide', cost: second, reward: 0 }] },
  ],
  relicOffers: [['veil', 'compass', 'ember'], ['compass'], ['compass']],
});

test('Ash Veil ajoute de la lumiere a la salle suivante, jamais la salle du draft', () => {
  const picks = (run: Run, drafts: RunChoices['drafts']): RunResult =>
    replay(run, { drafts, arches: [0, 0] });
  const tight = twoRooms(8, 1);
  const veiled = picks(tight, ['veil', 'compass', 'compass']);
  assert.equal(veiled.reachedRoom, 1);
  assert.ok(!veiled.won);
  const fair = twoRooms(5, 3);
  const withVeil = picks(fair, ['veil', 'compass', 'compass']);
  assert.ok(withVeil.won);
  assert.equal(withVeil.light, 1);
});

test('le depart est toujours le meme', () => {
  assert.equal(START_LIGHT, 8);
});
