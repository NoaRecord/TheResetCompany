import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { bindPlayAgainRequest } from '../js/ui/ending-report.js';

const read = (path) => fs.readFileSync(new URL(path, import.meta.url), 'utf8');

test('production social labels and reset target use the approved fictional wording', () => {
  const employeeHtml = read('../game.html');
  const resetHtml = read('../prototypes/reset-sequence/index.html');
  assert.match(employeeHtml, /KROG SOCIAL MONITOR/);
  assert.match(resetHtml, /SOCIAL FRUSTRATION/);
  assert.doesNotMatch(employeeHtml, /KROG X MONITOR|X FRUSTRATION RATE/);
  assert.doesNotMatch(resetHtml, /X FRUSTRATION RATE/);
});

test('Krog message data meets the approved per-category variety and exact catchphrase policy', () => {
  const messages = JSON.parse(read('../data/krog-messages.json'));
  const expectedCounts = {
    calm: 9,
    frustration_medium: 9,
    frustration_high: 10,
    after_global_reset: 9,
    klaude_event: 9,
    bug_incident: 9,
    tybo_posted: 9
  };
  for (const [category, count] of Object.entries(expectedCounts)) {
    assert.equal(messages[category].length, count, category);
  }
  const all = Object.values(messages).flat().join('\n');
  assert.match(all, /Give me a reset, plz!/);
  assert.match(all, /Give us a reset, plz!/);
});

test('ending report exposes user voices and a controller-owned replay request', () => {
  const employeeHtml = read('../game.html');
  const main = read('../js/main.js');
  assert.match(employeeHtml, /USER VOICES/);
  assert.match(employeeHtml, /id="play-again-button"/);
  assert.match(main, /onPlayAgain/);
  assert.match(main, /app\.restart\(/);
});

test('audio attention state is based on incident decision context, not metric thresholds', () => {
  const main = read('../js/main.js');
  assert.match(main, /report\.randomEvent\s*\?\s*'ATTENTION'\s*:\s*'NORMAL'/);
  assert.doesNotMatch(main, /frustration\s*>=\s*balance\.krog\.frustrationMedium\s*\|\|\s*report\.randomEvent/);
});

test('ending UI emits one play-again request and re-enables after callback failure', async () => {
  const button = { disabled: false, addEventListener(_type, handler) { this.handler = handler; } };
  let requests = 0;
  bindPlayAgainRequest(button, { onPlayAgain: () => { requests += 1; } });
  await button.handler();
  await button.handler();
  assert.equal(requests, 1);
  assert.equal(button.disabled, true);

  const retryButton = { disabled: false, addEventListener(_type, handler) { this.handler = handler; } };
  bindPlayAgainRequest(retryButton, { onPlayAgain: () => { throw new Error('restart failed'); } });
  await retryButton.handler();
  assert.equal(retryButton.disabled, false);
});
