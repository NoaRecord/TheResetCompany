import { clamp, getNetLostToKlaude, roundInt } from './game-state.js';

export function calculateFinalScore(state, balance) {
  const initial = balance.initial;
  const score = balance.score;
  const paidRetention = score.paidRetentionWeight * clamp(
    state.paidUsers / Math.max(initial.paidUsers, 1), 0, 1
  );
  const activeGrowthRatio = (state.activeUsers - initial.activeUsers) / Math.max(initial.activeUsers, 1);
  const activeGrowthBonus = score.activeGrowthWeight * clamp(activeGrowthRatio, 0, score.activeGrowthCap);
  const satisfactionScore = score.satisfactionWeight * state.satisfaction;
  const frustrationPenalty = score.frustrationPenaltyWeight * state.frustration;
  const expectationPenalty = score.expectationPenaltyWeight * state.expectation;
  const grossKlaudePenalty = score.grossKlaudeLossWeight * clamp(
    state.grossLostToKlaude / Math.max(initial.paidUsers, 1), 0, 1
  );
  const netKlaudePenalty = score.netKlaudeLossWeight * clamp(
    getNetLostToKlaude(state) / Math.max(initial.paidUsers, 1), 0, 1
  );
  const operationalCostPenalty = score.operationalCostWeight * state.totalOperationalCost;
  const globalCountPenalty = score.globalResetCountPenalty * state.globalResetCount;

  return roundInt(Math.max(0,
    score.base + paidRetention + activeGrowthBonus + satisfactionScore - frustrationPenalty -
    expectationPenalty - grossKlaudePenalty - netKlaudePenalty - operationalCostPenalty - globalCountPenalty
  ));
}

export function getSomEvaluation(state, finalScore, balance) {
  const som = balance.som;
  const initialPaid = Math.max(balance.initial.paidUsers, 1);
  const netLostToKlaude = getNetLostToKlaude(state);

  if (netLostToKlaude / initialPaid >= som.klaudeNetExodusRatio ||
      state.grossLostToKlaude / initialPaid >= som.klaudeGrossExodusRatio) return 'KLAUDE_EXODUS';
  if (state.globalResetCount >= som.resetSpamGlobalCount ||
      state.totalOperationalCost >= som.resetSpamOperationalCost) return 'RESET_SPAM';
  if (state.satisfaction >= som.highSatisfaction && state.expectation >= som.highExpectation) {
    return 'HIGH_SAT_HIGH_EXPECTATION';
  }
  if (state.globalResetCount === 0 && state.bankedResetCount === 0) return 'RESET_MISER';
  if (finalScore >= som.highScore) return 'HIGH_SCORE';
  return 'NORMAL';
}
