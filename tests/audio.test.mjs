import test from 'node:test';
import assert from 'node:assert/strict';

import { createAudioController } from '../js/audio/audio-controller.js';

test('audio starts enabled but can be muted and unmuted without blocking', async () => {
  const changes = [];
  const audio = createAudioController({ onMutedChange: (muted) => changes.push(muted) });

  assert.equal(audio.muted, false);
  assert.equal(audio.setMuted(true), true);
  assert.equal(audio.muted, true);
  assert.equal(audio.setMuted(false), false);
  await Promise.resolve();
  assert.equal(audio.muted, false);
  assert.deepEqual(changes, [true, false]);
});

test('audio reports semantic states and fails soft when Web Audio is unavailable', async () => {
  const audio = createAudioController();
  audio.setState('ATTENTION');

  assert.equal(audio.getSnapshot().state, 'ATTENTION');
  assert.equal(await audio.startAfterUserGesture(), false);
  assert.equal(await audio.momentarySilence(5), false);
  assert.equal(audio.getSnapshot().state, 'ATTENTION');
  assert.equal(audio.getSnapshot().available, false);
});
