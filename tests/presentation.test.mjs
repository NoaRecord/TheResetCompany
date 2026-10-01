import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

import { selectKrogMessages } from '../js/ui/krog-selector.js';
import { getMetricStatus, getMetricMarkers } from '../js/ui/metric-status.js';
import { parseCompatibleSave } from '../js/storage/save-state.js';

const krogMessages = JSON.parse(fs.readFileSync(new URL('../data/krog-messages.json', import.meta.url), 'utf8'));

test('Krog selects three fictional messages deterministically without mutating inputs', () => {
  const input = { category: 'calm', day: 8, uiSeed: 'display-seed' };
  const before = structuredClone(input);
  const first = selectKrogMessages(input, krogMessages);
  assert.deepEqual(first, selectKrogMessages(input, krogMessages));
  assert.equal(first.length, 3);
  assert.equal(new Set(first).size, 3);
  assert.deepEqual(input, before);
});

test('Krog selector safely falls back to calm and accepts a bounded count', () => {
  assert.equal(selectKrogMessages({ category: 'missing', day: 1 }, krogMessages, 99).length, krogMessages.calm.length);
  assert.deepEqual(selectKrogMessages({ category: 'calm', day: 1 }, krogMessages, 0), []);
});

test('incompatible development saves are discarded for schema 2', () => {
  const oldSave = JSON.stringify({ seed: 7, state: { schemaVersion: 1 } });
  const currentSave = JSON.stringify({ seed: 7, state: { schemaVersion: 2 } });
  assert.equal(parseCompatibleSave(oldSave, 2), null);
  assert.deepEqual(parseCompatibleSave(currentSave, 2), JSON.parse(currentSave));
  assert.equal(parseCompatibleSave('not-json', 2), null);
  assert.equal(parseCompatibleSave('', 2), null);
});

test('semantic gauge states and markers follow supplied Revision 1 thresholds', () => {
  const satisfaction = { normalMin: 70, cautionMin: 55, warningMin: 40 };
  const frustration = { cautionMin: 35, warningMin: 55, criticalMin: 75 };
  assert.deepEqual([39, 40, 54.9, 55, 69.9, 70].map((value) => getMetricStatus('satisfaction', value, satisfaction)),
    ['CRITICAL', 'WARNING', 'WARNING', 'CAUTION', 'CAUTION', 'NORMAL']);
  assert.deepEqual([34.9, 35, 54.9, 55, 74.9, 75].map((value) => getMetricStatus('frustration', value, frustration)),
    ['NORMAL', 'CAUTION', 'CAUTION', 'WARNING', 'WARNING', 'CRITICAL']);
  assert.deepEqual(getMetricMarkers('satisfaction', satisfaction).map((marker) => marker.value), [40, 55, 70]);
  assert.deepEqual(getMetricMarkers('expectation', frustration).map((marker) => marker.value), [35, 55, 75]);
});
