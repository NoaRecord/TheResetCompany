import { normalizeSeed } from './rng.js';

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function roundInt(value) {
  return Math.floor(value + 0.5);
}

export function getNetLostToKlaude(state) {
  return Math.max(0, state.grossLostToKlaude - state.returnedFromKlaude);
}

export function cloneState(state) {
  return {
    ...state,
    eventMemory: {
      lastDayById: { ...(state.eventMemory?.lastDayById ?? {}) },
      triggeredOnce: { ...(state.eventMemory?.triggeredOnce ?? {}) }
    }
  };
}

export function createInitialState(balance, seed) {
  const normalizedSeed = normalizeSeed(seed);
  const state = {
    schemaVersion: balance.schemaVersion,
    day: 1,
    activeUsers: balance.initial.activeUsers,
    paidUsers: balance.initial.paidUsers,
    exhaustedUsers: balance.initial.exhaustedUsers,
    satisfaction: balance.initial.satisfaction,
    frustration: balance.initial.frustration,
    expectation: balance.initial.expectation,
    resetEnergy: balance.initial.resetEnergy,
    bankedResetStock: balance.initial.bankedResetStock,
    grossLostToKlaude: 0,
    returnedFromKlaude: 0,
    bankedResetCount: 0,
    globalResetCount: 0,
    totalOperationalCost: 0,
    seed: normalizedSeed,
    rngState: normalizedSeed,
    eventMemory: {
      lastDayById: {},
      triggeredOnce: {}
    },
    status: 'RUNNING'
  };
  assertStateInvariants(state, balance);
  return state;
}

export function normalizeState(state, balance) {
  const next = cloneState(state);
  next.activeUsers = Math.max(0, roundInt(next.activeUsers));
  next.paidUsers = clamp(roundInt(next.paidUsers), 0, next.activeUsers);
  next.exhaustedUsers = clamp(roundInt(next.exhaustedUsers), 0, next.paidUsers);
  next.satisfaction = clamp(next.satisfaction, 0, 100);
  next.frustration = clamp(next.frustration, 0, 100);
  next.expectation = clamp(next.expectation, 0, 100);
  next.resetEnergy = clamp(next.resetEnergy, 0, balance.resetEnergy.max);
  next.bankedResetStock = clamp(roundInt(next.bankedResetStock), 0, balance.bankedReset.stockMax);
  next.grossLostToKlaude = Math.max(0, roundInt(next.grossLostToKlaude));
  next.returnedFromKlaude = clamp(roundInt(next.returnedFromKlaude), 0, next.grossLostToKlaude);
  next.bankedResetCount = Math.max(0, roundInt(next.bankedResetCount));
  next.globalResetCount = Math.max(0, roundInt(next.globalResetCount));
  next.totalOperationalCost = Math.max(0, next.totalOperationalCost);
  next.rngState = Number(next.rngState) >>> 0;
  return next;
}

export function assertStateInvariants(state, balance) {
  const finiteFields = [
    'schemaVersion', 'day', 'activeUsers', 'paidUsers', 'exhaustedUsers', 'satisfaction',
    'frustration', 'expectation', 'resetEnergy', 'bankedResetStock', 'grossLostToKlaude',
    'returnedFromKlaude', 'bankedResetCount', 'globalResetCount', 'totalOperationalCost', 'seed', 'rngState'
  ];
  for (const field of finiteFields) {
    if (!Number.isFinite(state[field])) throw new Error(`Invalid finite value: ${field}`);
  }
  if (state.schemaVersion !== balance.schemaVersion) throw new Error('Incompatible save schema');
  if (state.day < 1 || state.day > balance.game.maxDays) throw new Error('Invalid day');
  if (state.activeUsers < 0) throw new Error('activeUsers must be >= 0');
  if (state.paidUsers < 0 || state.paidUsers > state.activeUsers) throw new Error('paidUsers invariant failed');
  if (state.exhaustedUsers < 0 || state.exhaustedUsers > state.paidUsers) throw new Error('exhaustedUsers invariant failed');
  for (const field of ['satisfaction', 'frustration', 'expectation']) {
    if (state[field] < 0 || state[field] > 100) throw new Error(`${field} out of range`);
  }
  if (state.resetEnergy < 0 || state.resetEnergy > balance.resetEnergy.max) throw new Error('resetEnergy out of range');
  if (state.bankedResetStock < 0 || state.bankedResetStock > balance.bankedReset.stockMax) throw new Error('bankedResetStock out of range');
  if (state.grossLostToKlaude < 0) throw new Error('grossLostToKlaude must be >= 0');
  if (state.returnedFromKlaude < 0 || state.returnedFromKlaude > state.grossLostToKlaude) throw new Error('Klaude return invariant failed');
  if (state.totalOperationalCost < 0) throw new Error('totalOperationalCost must be >= 0');
  if (!['RUNNING', 'ENDED'].includes(state.status)) throw new Error('Invalid status');
  return true;
}
