import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

import { drawFloats, nextUint32, nextFloat, normalizeSeed } from '../js/engine/rng.js';
import { createInitialState, assertStateInvariants, getNetLostToKlaude } from '../js/engine/game-state.js';
import {
  pressurePhase,
  resolvePlayerAction,
  commitGlobalReset,
  cancelGlobalReset,
  settleDay,
  getAvailableActions,
  getKrogSignal
} from '../js/engine/game-engine.js';
import { calculateFinalScore, getSomEvaluation } from '../js/engine/scoring.js';

const balance = JSON.parse(fs.readFileSync(new URL('../data/balance.json', import.meta.url), 'utf8'));
const eventsData = JSON.parse(fs.readFileSync(new URL('../data/events.json', import.meta.url), 'utf8'));

test('xorshift32 reference vectors remain stable', () => {
  let state = normalizeSeed(1);
  const values = [];
  for (let i = 0; i < 5; i += 1) { state = nextUint32(state); values.push(state); }
  assert.deepEqual(values, [270369, 67634689, 2647435461, 307599695, 2398689233]);
  assert.equal(normalizeSeed(0), 0x6D2B79F5);
  const float = nextFloat(12345);
  assert.equal(float.state, 3336926330);
  assert.equal(float.value, 3336926330 / 4294967296);
});

test('Revision 1 initial state uses schema 2 and approved reset resources', () => {
  const state = createInitialState(balance, 12345);
  assert.deepEqual({
    schemaVersion: state.schemaVersion,
    day: state.day,
    resetEnergy: state.resetEnergy,
    bankedResetStock: state.bankedResetStock,
    grossLostToKlaude: state.grossLostToKlaude,
    returnedFromKlaude: state.returnedFromKlaude,
    totalOperationalCost: state.totalOperationalCost,
    seed: state.seed
  }, {
    schemaVersion: 2,
    day: 1,
    resetEnergy: 60,
    bankedResetStock: 0,
    grossLostToKlaude: 0,
    returnedFromKlaude: 0,
    totalOperationalCost: 0,
    seed: 12345
  });
  assert.equal('totalResetCost' in state, false);
  assert.equal(getNetLostToKlaude(state), 0);
  assertStateInvariants(state, balance);
});

test('Pressure consumes four seeded rolls and repeats exactly for the same seed', () => {
  const initial = createInitialState(balance, 12345);
  const first = pressurePhase(initial, balance, eventsData);
  const second = pressurePhase(initial, balance, eventsData);
  assert.deepEqual(first, second);
  assert.equal(first.rolls.usageRoll, 3336926330 / 4294967296);
  assert.equal(first.state.rngState, drawFloats(12345, 4).state);
  assert.equal(first.randomEvent, null);
  assert.equal(first.newExhausted, 3509);
  assert.equal(first.state.exhaustedUsers, 9509);
  assert.equal(first.dailyContext.startOfDayActiveUsers, initial.activeUsers);
  assert.equal(first.dailyContext.directKlaudeLoss, 0);
});

test('USER_MILESTONE grants one Banked stock and respects the stock cap', () => {
  const forcedBalance = structuredClone(balance);
  forcedBalance.events.dailyChance = 1;
  const milestone = { events: eventsData.events.filter((event) => event.id === 'user_milestone') };
  const state = { ...createInitialState(forcedBalance, 91), activeUsers: 104000, bankedResetStock: 2 };
  const result = pressurePhase(state, forcedBalance, milestone);
  assert.equal(result.randomEvent.id, 'user_milestone');
  assert.equal(result.randomEvent.bankedStockGranted, 1);
  assert.equal(result.state.bankedResetStock, 3);

  const capped = pressurePhase({ ...state, bankedResetStock: 3 }, forcedBalance, milestone);
  assert.equal(capped.state.bankedResetStock, 3);
  assert.equal(capped.randomEvent.bankedStockGranted, 0);
});

test('SERVER_TROUBLE Banked grant is reproducible at the configured 25 percent', () => {
  const forcedBalance = structuredClone(balance);
  forcedBalance.events.dailyChance = 1;
  const serverTrouble = { events: eventsData.events.filter((event) => event.id === 'server_trouble') };
  const findSeed = (shouldGrant) => {
    for (let seed = 1; seed < 1000; seed += 1) {
      if ((drawFloats(seed, 4).values[3] < 0.25) === shouldGrant) return seed;
    }
    throw new Error('Could not find deterministic grant test seed');
  };
  const grant = pressurePhase(createInitialState(forcedBalance, findSeed(true)), forcedBalance, serverTrouble);
  const noGrant = pressurePhase(createInitialState(forcedBalance, findSeed(false)), forcedBalance, serverTrouble);
  assert.equal(grant.randomEvent.id, 'server_trouble');
  assert.equal(grant.randomEvent.bankedStockGranted, 1);
  assert.equal(grant.state.bankedResetStock, 1);
  assert.equal(noGrant.randomEvent.bankedStockGranted, 0);
  assert.equal(noGrant.state.bankedResetStock, 0);
});

test('Banked Reset spends Stock and operational cost but no Energy', () => {
  const state = {
    ...createInitialState(balance, 7), bankedResetStock: 1, resetEnergy: 60,
    exhaustedUsers: 10000, frustration: 50, satisfaction: 50, expectation: 20
  };
  const result = resolvePlayerAction(state, { type: 'BANKED_RESET' }, balance);
  assert.equal(result.resolved, true);
  assert.equal(result.event.recoveredUsers, 3500);
  assert.equal(result.state.exhaustedUsers, 6500);
  assert.equal(result.state.resetEnergy, 60);
  assert.equal(result.state.bankedResetStock, 0);
  assert.equal(result.state.frustration, 39);
  assert.equal(result.state.satisfaction, 54);
  assert.equal(result.state.expectation, 24);
  assert.equal(result.state.totalOperationalCost, 15);
  assert.equal(result.state.bankedResetCount, 1);
});

test('Banked Reset rejects without stock and leaves the state unchanged', () => {
  const state = createInitialState(balance, 7);
  const result = resolvePlayerAction(state, { type: 'BANKED_RESET' }, balance);
  assert.equal(result.resolved, false);
  assert.equal(result.event.reason, 'NO_STOCK');
  assert.deepEqual(result.state, state);
});

test('Global Reset requires 90 Energy; prepare does not mutate state and commit is single-use', () => {
  const short = { ...createInitialState(balance, 7), resetEnergy: 89 };
  assert.equal(resolvePlayerAction(short, { type: 'GLOBAL_RESET' }, balance).event.reason, 'INSUFFICIENT_ENERGY');

  const state = {
    ...createInitialState(balance, 7), resetEnergy: 90, exhaustedUsers: 10000,
    frustration: 70, satisfaction: 50, expectation: 20
  };
  const preparedResult = resolvePlayerAction(state, { type: 'GLOBAL_RESET' }, balance);
  assert.deepEqual(preparedResult.state, state);
  assert.equal(preparedResult.event.energyCost, 90);
  const cancelled = cancelGlobalReset(state, preparedResult.prepared);
  assert.deepEqual(cancelled.state, state);
  const committed = commitGlobalReset(state, preparedResult.prepared, balance);
  assert.equal(committed.event.recoveredUsers, 10000);
  assert.equal(committed.state.resetEnergy, 0);
  assert.equal(committed.state.frustration, 30);
  assert.equal(committed.state.satisfaction, 62);
  assert.equal(committed.state.expectation, 38);
  assert.equal(committed.state.totalOperationalCost, 65);
  assert.equal(committed.state.day, state.day);
  assert.throws(() => commitGlobalReset(committed.state, preparedResult.prepared, balance), /stale or already resolved/i);
});

test('Global Reset becomes READY after three Settlements from zero Energy', () => {
  let state = { ...createInitialState(balance, 19), resetEnergy: 0 };
  assert.deepEqual(getAvailableActions(state, balance), ['WAIT']);
  for (let i = 0; i < 2; i += 1) state = settleDay(state, balance).state;
  assert.equal(state.resetEnergy, 60);
  assert.deepEqual(getAvailableActions(state, balance), ['WAIT']);
  state = settleDay(state, balance).state;
  assert.equal(state.resetEnergy, 90);
  assert.deepEqual(getAvailableActions(state, balance), ['WAIT', 'GLOBAL_RESET']);
});

test('Settlement applies 20 percent Natural Recovery after every action', () => {
  const state = { ...createInitialState(balance, 12), exhaustedUsers: 10001 };
  const result = settleDay(state, balance);
  assert.equal(result.settlement.naturalRecoveredUsers, 2000);
  assert.equal(result.state.exhaustedUsers, 7911); // 20% natural recovery followed by 90 churned users.
});

test('Settlement separates New, Returning, and Lost users and supplies daily accounting', () => {
  const state = {
    ...createInitialState(balance, 22),
    activeUsers: 100000,
    paidUsers: 60000,
    exhaustedUsers: 2000,
    satisfaction: 100,
    frustration: 0,
    grossLostToKlaude: 1000,
    returnedFromKlaude: 0
  };
  const result = settleDay(state, balance, { startOfDayActiveUsers: 100000, directKlaudeLoss: 25 });
  const daily = result.settlement.dailyReport;
  assert.equal(result.settlement.returningUsers, 40);
  assert.equal(result.settlement.grossLostToday, 90);
  assert.equal(daily.newUsers, result.settlement.newUsers);
  assert.equal(daily.returnedFromKlaude, 40);
  assert.equal(daily.lostToKlaude, 115);
  assert.equal(daily.netChange, result.state.activeUsers - 100000);
  assert.equal(result.state.grossLostToKlaude, 1090);
  assert.equal(result.state.returnedFromKlaude, 40);
  assert.equal(daily.netChange, 650);
  assert.equal(getNetLostToKlaude(result.state), 1050);
  assertStateInvariants(result.state, balance);
});

test('score caps Active growth contribution at 125 and counts both Klaude measures/costs', () => {
  const state = {
    ...createInitialState(balance, 1),
    activeUsers: 150000,
    paidUsers: 60000,
    satisfaction: 80,
    frustration: 10,
    expectation: 20,
    totalOperationalCost: 100,
    globalResetCount: 1
  };
  assert.equal(calculateFinalScore(state, balance), 950);
});

test('Mr. Som uses Revision 1 category thresholds and priority', () => {
  const base = createInitialState(balance, 1);
  assert.equal(getSomEvaluation({ ...base, grossLostToKlaude: 12000 }, 900, balance), 'KLAUDE_EXODUS');
  assert.equal(getSomEvaluation({ ...base, globalResetCount: 5 }, 900, balance), 'RESET_SPAM');
  assert.equal(getSomEvaluation({ ...base, satisfaction: 80, expectation: 60 }, 900, balance), 'HIGH_SAT_HIGH_EXPECTATION');
  assert.equal(getSomEvaluation(base, 900, balance), 'RESET_MISER');
  assert.equal(getSomEvaluation({ ...base, globalResetCount: 1 }, 780, balance), 'HIGH_SCORE');
  assert.equal(getSomEvaluation({ ...base, globalResetCount: 1 }, 779, balance), 'NORMAL');
});

test('Krog severity uses Revision 1 thresholds and returns tags without post text', () => {
  const state = { ...createInitialState(balance, 1), frustration: 70 };
  assert.deepEqual(getKrogSignal(state, ['klaude_event'], balance), { severity: 'frustration_high', tags: ['klaude_event'] });
});

test('30-day fixed-seed run is deterministic and ends without advancing to Day 31', () => {
  const run = (seed) => {
    let state = createInitialState(balance, seed);
    const history = [];
    while (state.status === 'RUNNING') {
      const pressure = pressurePhase(state, balance, eventsData);
      state = pressure.state;
      let type = 'WAIT';
      if (state.resetEnergy >= balance.globalReset.energyCost && state.frustration >= 68) type = 'GLOBAL_RESET';
      else if (state.bankedResetStock > 0 && state.frustration >= 55) type = 'BANKED_RESET';
      const action = resolvePlayerAction(state, { type }, balance);
      if (type === 'GLOBAL_RESET') state = commitGlobalReset(action.state, action.prepared, balance).state;
      else state = action.state;
      const settlement = settleDay(state, balance, pressure.dailyContext);
      state = settlement.state;
      history.push({ day: state.day, rngState: state.rngState, action: type });
      assertStateInvariants(state, balance);
    }
    return { state, history };
  };
  const first = run(49374);
  assert.deepEqual(first, run(49374));
  assert.equal(first.history.length, 30);
  assert.equal(first.state.day, 30);
  assert.equal(first.state.status, 'ENDED');
});
