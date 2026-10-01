import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

import * as engine from '../js/engine/game-engine.js';
import { createInitialState } from '../js/engine/game-state.js';
import { createAppController } from '../js/controllers/app-controller.js';

const balance = JSON.parse(fs.readFileSync(new URL('../data/balance.json', import.meta.url), 'utf8'));
const eventsData = JSON.parse(fs.readFileSync(new URL('../data/events.json', import.meta.url), 'utf8'));

function setup(runSequence, onRestart = () => {}) {
  const calls = [];
  const wrappedEngine = {
    ...engine,
    pressurePhase(...args) {
      calls.push('pressure');
      return engine.pressurePhase(...args);
    },
    resolvePlayerAction(...args) {
      calls.push(`resolve:${args[1].type}`);
      return engine.resolvePlayerAction(...args);
    },
    commitGlobalReset(...args) {
      calls.push('commit');
      return engine.commitGlobalReset(...args);
    },
    settleDay(...args) {
      calls.push('settle');
      return engine.settleDay(...args);
    }
  };
  const controller = createAppController({
    balance,
    eventsData,
    seed: 41,
    engine: wrappedEngine,
    runSequence,
    onRestart
  });
  return { controller, calls };
}

test('one Day runs pressure, one resolved action, then settlement in order', async () => {
  const { controller, calls } = setup(async () => {});

  controller.beginDay();
  assert.equal(controller.phase, 'DECISION');
  await controller.performAction('WAIT');

  assert.deepEqual(calls, ['pressure', 'resolve:WAIT', 'settle']);
  assert.equal(controller.phase, 'READY');
  assert.equal(controller.state.day, 2);
});

test('Global Reset commits at the trigger and settles only after sequence completion', async () => {
  let trigger;
  let finishSequence;
  const runSequence = (payload, handlers) => {
    trigger = handlers.onTrigger;
    return new Promise((resolve) => { finishSequence = resolve; });
  };
  const { controller, calls } = setup(runSequence);
  controller.state.resetEnergy = 90;
  controller.beginDay();
  const beforeReset = structuredClone(controller.state);
  const pendingAction = controller.performAction('GLOBAL_RESET');

  assert.deepEqual(calls, ['pressure', 'resolve:GLOBAL_RESET']);
  assert.equal(controller.phase, 'RESET_SEQUENCE');
  assert.deepEqual(controller.state, beforeReset);
  assert.deepEqual(controller.resetPayload, {
    activeUsers: beforeReset.activeUsers,
    exhaustedUsers: beforeReset.exhaustedUsers,
    frustration: beforeReset.frustration,
    target: 'PAID_USERS'
  });

  trigger();
  assert.equal(controller.state.globalResetCount, 1);
  assert.deepEqual(calls, ['pressure', 'resolve:GLOBAL_RESET', 'commit']);

  finishSequence();
  await pendingAction;
  assert.deepEqual(calls, ['pressure', 'resolve:GLOBAL_RESET', 'commit', 'settle']);
  assert.equal(controller.phase, 'READY');
});

test('Global Reset sequence failure does not settle the Day', async () => {
  const { controller, calls } = setup(async (_payload, handlers) => {
    handlers.onTrigger();
    throw new Error('visual sequence failed');
  });
  controller.state.resetEnergy = 90;
  controller.beginDay();

  await assert.rejects(controller.performAction('GLOBAL_RESET'), /visual sequence failed/);
  assert.deepEqual(calls, ['pressure', 'resolve:GLOBAL_RESET', 'commit']);
  assert.equal(controller.phase, 'ERROR');
});

test('Global Reset cannot settle if a sequence resolves without its trigger', async () => {
  const { controller, calls } = setup(async () => {});
  controller.state.resetEnergy = 90;
  controller.beginDay();

  await assert.rejects(controller.performAction('GLOBAL_RESET'), /without the CODE-X RESET trigger/);
  assert.deepEqual(calls, ['pressure', 'resolve:GLOBAL_RESET']);
  assert.equal(controller.state.globalResetCount, 0);
  assert.equal(controller.phase, 'ERROR');
});

test('rejected Banked Reset keeps the player in the same decision phase', async () => {
  const { controller, calls } = setup(async () => {});
  controller.beginDay();
  controller.state.resetEnergy = 0;
  const before = structuredClone(controller.state);

  const result = await controller.performAction('BANKED_RESET');
  assert.equal(result.resolved, false);
  assert.deepEqual(controller.state, before);
  assert.equal(controller.phase, 'DECISION');
  assert.deepEqual(calls, ['pressure', 'resolve:BANKED_RESET']);
});

test('Play Again resets the controller to a fresh persisted Day 1 state', () => {
  const savedStates = [];
  const { controller } = setup(async () => {}, (state) => savedStates.push(state));
  controller.state.day = 30;
  controller.state.status = 'ENDED';
  controller.phase = 'ENDED';
  controller.lastPressure = { stale: true };
  controller.lastAction = 'WAIT';
  controller.lastSettlement = { stale: true };
  controller.lastEnding = { stale: true };
  controller.restart(123);

  assert.equal(controller.phase, 'READY');
  assert.equal(controller.state.day, 1);
  assert.equal(controller.state.status, 'RUNNING');
  assert.equal(controller.state.seed, 123);
  assert.equal(controller.state.resetEnergy, balance.initial.resetEnergy);
  assert.equal(controller.lastPressure, null);
  assert.equal(controller.lastAction, null);
  assert.equal(controller.lastSettlement, null);
  assert.equal(controller.lastEnding, null);
  assert.equal(savedStates.length, 1);
  assert.equal(savedStates[0].day, 1);
});
