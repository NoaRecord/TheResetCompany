import {
  commitGlobalReset,
  getAvailableActions,
  getKrogSignal,
  pressurePhase,
  resolvePlayerAction,
  settleDay
} from '../engine/game-engine.js';
import { assertStateInvariants, cloneState, createInitialState } from '../engine/game-state.js';

/** 演出処理だけでDayが進まないよう、日次フローをここで管理する。 */
export function createAppController({
  balance,
  eventsData,
  seed = Date.now(),
  initialState = null,
  engine = { pressurePhase, resolvePlayerAction, commitGlobalReset, settleDay, getKrogSignal, getAvailableActions },
  runSequence = async () => {},
  onSettled = () => {},
  onRestart = () => {}
}) {
  let state = initialState ? cloneState(initialState) : createInitialState(balance, seed);
  assertStateInvariants(state, balance);

  const app = {
    phase: state.status === 'ENDED' ? 'ENDED' : 'READY',
    state,
    lastPressure: null,
    lastAction: null,
    lastSettlement: null,
    lastEnding: null,
    resetPayload: null,
    transientTags: [],
    message: 'SYSTEM READY',

    restart(seed = Date.now()) {
      if (this.phase !== 'ENDED' || this.state.status !== 'ENDED') {
        throw new Error('A new run can only start after the operating period has ended.');
      }
      this.state = createInitialState(balance, seed);
      this.phase = 'READY';
      this.lastPressure = null;
      this.lastAction = null;
      this.lastSettlement = null;
      this.lastEnding = null;
      this.resetPayload = null;
      this.transientTags = [];
      this.message = 'SYSTEM READY';
      onRestart(cloneState(this.state));
      return cloneState(this.state);
    },

    beginDay() {
      if (this.phase !== 'READY' || this.state.status !== 'RUNNING') {
        throw new Error('A new Day can only begin after the previous Settlement.');
      }
      const result = engine.pressurePhase(this.state, balance, eventsData);
      this.state = result.state;
      this.lastPressure = result;
      this.lastAction = null;
      this.lastSettlement = null;
      this.resetPayload = null;
      this.transientTags = result.randomEvent?.tags ?? [];
      this.phase = 'DECISION';
      this.message = result.randomEvent ? `RANDOM EVENT: ${result.randomEvent.id}` : 'PRESSURE RESOLVED. SELECT ONE ACTION.';
      return result;
    },

    async performAction(type) {
      if (this.phase !== 'DECISION') throw new Error('Player action is not available in this phase.');
      const result = engine.resolvePlayerAction(this.state, { type }, balance);
      if (!result.resolved && result.event.type !== 'GLOBAL_RESET_PREPARED') {
        this.message = result.event.reason === 'NO_STOCK'
          ? 'BANKED RESET unavailable: no compensation stock is available.'
          : `${type.replaceAll('_', ' ')} rejected: insufficient RESET ENERGY.`;
        return result;
      }

      this.lastAction = type;
      if (type === 'GLOBAL_RESET') {
        this.phase = 'RESET_SEQUENCE';
        this.resetPayload = {
          activeUsers: result.event.activeUsers,
          exhaustedUsers: result.event.exhaustedUsers,
          frustration: result.event.frustrationBefore,
          target: 'PAID_USERS'
        };
        let committed = false;
        this.message = 'GLOBAL RESET PREPARED. AWAITING CODE-X RESET.';
        try {
          await runSequence(this.resetPayload, {
            onTrigger: () => {
              if (committed) throw new Error('GLOBAL RESET trigger was called more than once.');
              const commit = engine.commitGlobalReset(this.state, result.prepared, balance);
              if (!commit.resolved) throw new Error('GLOBAL RESET commit did not resolve.');
              this.state = commit.state;
              this.transientTags = [...new Set([...this.transientTags, ...(commit.event.tags ?? [])])];
              committed = true;
              this.message = 'CODE-X RESET COMMITTED. PROPAGATION IN PROGRESS.';
              return commit;
            }
          });
          if (!committed) throw new Error('GLOBAL RESET sequence completed without the CODE-X RESET trigger.');
        } catch (error) {
          this.phase = 'ERROR';
          this.message = `INTEGRATION ERROR: ${error.message}`;
          throw error;
        }
      } else {
        this.state = result.state;
        if (result.event.tags?.length) {
          this.transientTags = [...new Set([...this.transientTags, ...result.event.tags])];
        }
        this.message = result.event.type === 'BANKED_RESET_APPLIED'
          ? `BANKED RESET COMPLETE. ${result.event.recoveredUsers.toLocaleString()} USERS RESTORED.`
          : 'WAIT RECORDED.';
      }

      this.phase = 'SETTLING';
      const settlement = engine.settleDay(this.state, balance, this.lastPressure?.dailyContext);
      this.state = settlement.state;
      this.lastSettlement = settlement;
      this.lastEnding = settlement.event.type === 'GAME_ENDED' ? settlement.event : null;
      this.phase = this.state.status === 'ENDED' ? 'ENDED' : 'READY';
      this.message = this.state.status === 'ENDED' ? 'DAY 30 SETTLEMENT COMPLETE.' : 'SETTLEMENT COMPLETE.';
      onSettled(cloneState(this.state), settlement);
      return { action: result, settlement };
    },

    get krogSignal() {
      return engine.getKrogSignal(this.state, this.transientTags, balance);
    },

    get availableActions() {
      return this.phase === 'DECISION' ? engine.getAvailableActions(this.state, balance) : [];
    }
  };
  return app;
}
