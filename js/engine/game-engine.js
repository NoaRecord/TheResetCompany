import { drawFloats } from './rng.js';
import {
  assertStateInvariants,
  clamp,
  cloneState,
  getNetLostToKlaude,
  normalizeState,
  roundInt
} from './game-state.js';
import { calculateFinalScore, getSomEvaluation } from './scoring.js';

function isEventEligible(event, state, balance) {
  if (!event.repeatable && state.eventMemory.triggeredOnce[event.id]) return false;
  const lastDay = state.eventMemory.lastDayById[event.id];
  if (lastDay !== undefined && state.day - lastDay < event.cooldownDays) return false;

  const conditions = event.conditions ?? {};
  if (conditions.minDay !== undefined && state.day < conditions.minDay) return false;
  if (conditions.activeUsersRatioMin !== undefined) {
    const ratio = state.activeUsers / Math.max(balance.initial.activeUsers, 1);
    if (ratio < conditions.activeUsersRatioMin) return false;
  }
  return true;
}

function chooseWeightedEvent(events, roll) {
  const totalWeight = events.reduce((sum, event) => sum + event.weight, 0);
  if (totalWeight <= 0) return null;
  let cursor = roll * totalWeight;
  for (const event of events) {
    cursor -= event.weight;
    if (cursor < 0) return event;
  }
  return events.at(-1) ?? null;
}

function applyEventEffects(state, event, balance, bankGrantRoll) {
  let next = cloneState(state);
  const effects = event.effects ?? {};
  let bankedStockGranted = 0;

  if (effects.extraExhaustedAvailablePaidRate) {
    const availablePaid = Math.max(0, next.paidUsers - next.exhaustedUsers);
    next.exhaustedUsers += roundInt(availablePaid * effects.extraExhaustedAvailablePaidRate);
  }

  if (effects.directKlaudeLossPaidRate) {
    const lost = roundInt(next.paidUsers * effects.directKlaudeLossPaidRate);
    next.paidUsers -= lost;
    next.activeUsers -= lost;
    next.exhaustedUsers = Math.max(0, next.exhaustedUsers - lost);
    next.grossLostToKlaude += lost;
  }

  const grantProbability = effects.bankedStockGrantProbability ?? 1;
  if (effects.bankedStockGrant && bankGrantRoll < grantProbability) {
    const stockBefore = next.bankedResetStock;
    next.bankedResetStock += effects.bankedStockGrant;
    next = normalizeState(next, balance);
    bankedStockGranted = next.bankedResetStock - stockBefore;
  }

  next.satisfaction += effects.satisfactionDelta ?? 0;
  next.frustration += effects.frustrationDelta ?? 0;
  next.expectation += effects.expectationDelta ?? 0;

  next.eventMemory.lastDayById[event.id] = next.day;
  if (!event.repeatable) next.eventMemory.triggeredOnce[event.id] = true;

  next = normalizeState(next, balance);
  assertStateInvariants(next, balance);
  return { state: next, bankedStockGranted };
}

export function pressurePhase(state, balance, eventsData) {
  if (state.status !== 'RUNNING') throw new Error('Cannot process pressure for ended game');
  assertStateInvariants(state, balance);

  // Four seeded rolls reserve the fourth value for a possible Banked Stock grant.
  // This keeps event reward logic reproducible and independent of UI presentation.
  const draws = drawFloats(state.rngState, 4);
  const [usageRoll, eventRoll, eventPickRoll, bankGrantRoll] = draws.values;
  let next = cloneState(state);
  next.rngState = draws.state;
  const startOfDayActiveUsers = state.activeUsers;
  const grossLostBeforePressure = state.grossLostToKlaude;

  const availablePaidUsers = Math.max(0, next.paidUsers - next.exhaustedUsers);
  const usageNoise = balance.usage.noiseMin +
    (balance.usage.noiseMax - balance.usage.noiseMin) * usageRoll;
  const newExhausted = roundInt(availablePaidUsers * balance.usage.baseExhaustionRate * usageNoise);
  next.exhaustedUsers += newExhausted;

  const exhaustedRate = next.exhaustedUsers / Math.max(next.paidUsers, 1);
  const frustrationIncrease = balance.frustration.baseGrowth +
    balance.frustration.exhaustedWeight * exhaustedRate *
    (1 + balance.frustration.expectationMultiplier * next.expectation / 100);
  next.frustration += frustrationIncrease;
  next = normalizeState(next, balance);

  let randomEvent = null;
  if (eventRoll < balance.events.dailyChance) {
    const eligible = eventsData.events.filter((event) => isEventEligible(event, next, balance));
    const selected = chooseWeightedEvent(eligible, eventPickRoll);
    if (selected) {
      const result = applyEventEffects(next, selected, balance, bankGrantRoll);
      next = result.state;
      randomEvent = {
        id: selected.id,
        messageKey: selected.messageKey,
        tags: [...selected.tags],
        bankedStockGranted: result.bankedStockGranted
      };
    }
  }

  assertStateInvariants(next, balance);
  return {
    state: next,
    event: { type: 'DAY_PRESSURE_RESOLVED' },
    randomEvent,
    newExhausted,
    dailyContext: {
      startOfDayActiveUsers,
      directKlaudeLoss: next.grossLostToKlaude - grossLostBeforePressure
    },
    rolls: { usageRoll, eventRoll, eventPickRoll, bankGrantRoll }
  };
}

function applyBankedReset(state, balance) {
  if (state.bankedResetStock < 1) {
    return {
      state: cloneState(state),
      resolved: false,
      event: { type: 'BANKED_RESET_REJECTED', reason: 'NO_STOCK' }
    };
  }

  const cfg = balance.bankedReset;
  let next = cloneState(state);
  const recoveredUsers = roundInt(next.exhaustedUsers * cfg.exhaustedRecoveryRatio);
  next.exhaustedUsers -= recoveredUsers;
  next.frustration -= cfg.frustrationReduction;
  next.satisfaction += cfg.satisfactionGain;
  next.expectation += cfg.expectationGain;
  next.bankedResetStock -= 1;
  next.totalOperationalCost += cfg.operationalCost;
  next.bankedResetCount += 1;
  next = normalizeState(next, balance);
  assertStateInvariants(next, balance);

  return {
    state: next,
    resolved: true,
    event: { type: 'BANKED_RESET_APPLIED', recoveredUsers, tags: [] }
  };
}

function prepareGlobalReset(state, balance) {
  const cfg = balance.globalReset;
  if (state.resetEnergy < cfg.energyCost) {
    return {
      state: cloneState(state),
      resolved: false,
      event: { type: 'GLOBAL_RESET_REJECTED', reason: 'INSUFFICIENT_ENERGY' }
    };
  }

  const prepared = {
    type: 'GLOBAL_RESET',
    day: state.day,
    rngState: state.rngState,
    resetEnergy: state.resetEnergy,
    globalResetCount: state.globalResetCount,
    totalOperationalCost: state.totalOperationalCost,
    exhaustedUsers: state.exhaustedUsers,
    frustrationBefore: state.frustration,
    satisfactionBefore: state.satisfaction,
    expectationBefore: state.expectation,
    energyCost: cfg.energyCost
  };

  return {
    state: cloneState(state),
    resolved: false,
    prepared,
    event: {
      type: 'GLOBAL_RESET_PREPARED',
      day: state.day,
      activeUsers: state.activeUsers,
      paidUsers: state.paidUsers,
      exhaustedUsers: state.exhaustedUsers,
      frustrationBefore: state.frustration,
      satisfactionBefore: state.satisfaction,
      expectationBefore: state.expectation,
      resetEnergy: state.resetEnergy,
      energyCost: cfg.energyCost
    }
  };
}

export function resolvePlayerAction(state, action, balance) {
  if (state.status !== 'RUNNING') throw new Error('Cannot resolve action for ended game');
  assertStateInvariants(state, balance);

  if (action.type === 'WAIT') return { state: cloneState(state), resolved: true, event: { type: 'WAIT_APPLIED' } };
  if (action.type === 'BANKED_RESET') return applyBankedReset(state, balance);
  if (action.type === 'GLOBAL_RESET') return prepareGlobalReset(state, balance);
  throw new Error(`Unknown action: ${action.type}`);
}

export function getAvailableActions(state, balance) {
  const actions = ['WAIT'];
  if (state.bankedResetStock > 0) actions.push('BANKED_RESET');
  if (state.resetEnergy >= balance.globalReset.energyCost) actions.push('GLOBAL_RESET');
  return actions;
}

function assertPreparedTransactionMatches(state, prepared) {
  if (!prepared || prepared.type !== 'GLOBAL_RESET') throw new Error('Invalid Global Reset transaction');
  const matches = state.day === prepared.day &&
    state.rngState === prepared.rngState &&
    state.resetEnergy === prepared.resetEnergy &&
    state.globalResetCount === prepared.globalResetCount &&
    state.totalOperationalCost === prepared.totalOperationalCost &&
    state.exhaustedUsers === prepared.exhaustedUsers;
  if (!matches) throw new Error('Global Reset transaction is stale or already resolved');
}

export function cancelGlobalReset(state, prepared) {
  assertPreparedTransactionMatches(state, prepared);
  return { state: cloneState(state), resolved: false, event: { type: 'GLOBAL_RESET_CANCELLED' } };
}

export function commitGlobalReset(state, prepared, balance) {
  assertPreparedTransactionMatches(state, prepared);
  const cfg = balance.globalReset;
  if (state.resetEnergy < cfg.energyCost) throw new Error('Global Reset transaction is stale or already resolved');

  let next = cloneState(state);
  const exhaustedUsersBefore = next.exhaustedUsers;
  const frustrationBefore = next.frustration;
  const satisfactionBefore = next.satisfaction;
  const expectationBefore = next.expectation;
  const recoveredUsers = roundInt(exhaustedUsersBefore * cfg.exhaustedRecoveryRatio);

  next.exhaustedUsers -= recoveredUsers;
  next.frustration -= cfg.frustrationReduction;
  next.satisfaction += cfg.satisfactionGain;
  next.expectation += cfg.expectationGain;
  next.resetEnergy -= cfg.energyCost;
  next.totalOperationalCost += cfg.operationalCost;
  next.globalResetCount += 1;
  next = normalizeState(next, balance);
  assertStateInvariants(next, balance);

  return {
    state: next,
    resolved: true,
    event: {
      type: 'GLOBAL_RESET_APPLIED',
      tags: ['after_global_reset'],
      day: next.day,
      activeUsers: next.activeUsers,
      paidUsers: next.paidUsers,
      recoveredUsers,
      exhaustedUsersBefore,
      exhaustedUsersAfter: next.exhaustedUsers,
      frustrationBefore,
      frustrationAfter: next.frustration,
      satisfactionBefore,
      satisfactionAfter: next.satisfaction,
      expectationBefore,
      expectationAfter: next.expectation,
      resetEnergyAfter: next.resetEnergy
    }
  };
}

export function settleDay(state, balance, dailyContext = {}) {
  if (state.status !== 'RUNNING') throw new Error('Cannot settle ended game');
  assertStateInvariants(state, balance);
  let next = cloneState(state);

  const naturalRecoveredUsers = roundInt(next.exhaustedUsers * balance.naturalRecovery.dailyRate);
  next.exhaustedUsers -= naturalRecoveredUsers;

  const exhaustedRate = next.exhaustedUsers / Math.max(next.paidUsers, 1);
  const satisfactionDelta = balance.satisfaction.baseRecovery -
    balance.satisfaction.frustrationImpact * next.frustration / 100 -
    balance.satisfaction.exhaustionImpact * exhaustedRate;
  next.satisfaction = clamp(next.satisfaction + satisfactionDelta, 0, 100);

  const growthRate = Math.max(0,
    balance.growth.baseRate +
    balance.growth.satisfactionSensitivity * next.satisfaction / 100 -
    balance.growth.frustrationSensitivity * next.frustration / 100
  );
  const newUsers = roundInt(next.activeUsers * growthRate);
  const newPaidUsers = roundInt(newUsers * balance.growth.paidConversionRate);

  // Returns use only the Klaude pool that existed before today's new churn.
  const klaudePoolBeforeToday = getNetLostToKlaude(next);
  const returnRate = clamp(
    balance.klaudeReturn.baseRate +
      balance.klaudeReturn.satisfactionSensitivity * Math.max(0, next.satisfaction - 60) / 40 -
      balance.klaudeReturn.frustrationSensitivity * next.frustration / 100,
    0,
    balance.klaudeReturn.maxRate
  );
  const returningUsers = roundInt(klaudePoolBeforeToday * returnRate);

  const churnRate = balance.churn.baseRate +
    balance.churn.lowSatisfactionSensitivity * Math.max(0, 50 - next.satisfaction) / 50 +
    balance.churn.frustrationSensitivity * Math.max(0, next.frustration - 50) / 50;
  const grossLostToday = roundInt(next.paidUsers * churnRate);

  next.paidUsers -= grossLostToday;
  next.activeUsers -= grossLostToday;
  next.exhaustedUsers = Math.max(0, next.exhaustedUsers - grossLostToday);
  next.grossLostToKlaude += grossLostToday;

  next.activeUsers += newUsers + returningUsers;
  next.paidUsers += newPaidUsers + returningUsers;
  next.returnedFromKlaude += returningUsers;
  next.resetEnergy += balance.resetEnergy.dailyGain;
  next = normalizeState(next, balance);

  let event;
  if (next.day >= balance.game.maxDays) {
    next.status = 'ENDED';
    const finalScore = calculateFinalScore(next, balance);
    const somEvaluation = getSomEvaluation(next, finalScore, balance);
    event = { type: 'GAME_ENDED', finalScore, somEvaluation, seed: next.seed };
  } else {
    next.day += 1;
    event = { type: 'SETTLEMENT_COMPLETE' };
  }

  assertStateInvariants(next, balance);
  const startOfDayActiveUsers = dailyContext.startOfDayActiveUsers ?? state.activeUsers;
  const dayLostToKlaude = (dailyContext.directKlaudeLoss ?? 0) + grossLostToday;
  return {
    state: next,
    event,
    settlement: {
      satisfactionDelta,
      naturalRecoveredUsers,
      newUsers,
      newPaidUsers,
      returningUsers,
      grossLostToday,
      grossLostToKlaude: next.grossLostToKlaude,
      returnedFromKlaude: next.returnedFromKlaude,
      netLostToKlaude: getNetLostToKlaude(next),
      totalOperationalCost: next.totalOperationalCost,
      startOfDayActiveUsers,
      endOfDayActiveUsers: next.activeUsers,
      dailyReport: {
        day: state.day,
        newUsers,
        returnedFromKlaude: returningUsers,
        lostToKlaude: dayLostToKlaude,
        netChange: next.activeUsers - startOfDayActiveUsers,
        naturalResetRecovered: naturalRecoveredUsers
      }
    }
  };
}

export function getKrogSignal(state, transientTags = [], balance) {
  let severity = 'calm';
  if (state.frustration >= balance.krog.frustrationHigh) severity = 'frustration_high';
  else if (state.frustration >= balance.krog.frustrationMedium) severity = 'frustration_medium';
  return { severity, tags: [...transientTags] };
}
