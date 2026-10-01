(() => {
  'use strict';

  const PHASES = [
    'Authorization',
    'Core Charging',
    'Target Acquisition',
    'Safety System',
    'Console Deployment',
    'Final Safety',
    'HOLD TO RESET',
    'CODE-X RESET',
    'Propagation',
    'Complete',
  ];

  const REGIONS = [
    'SAN FRANCISCO',
    'NEW YORK',
    'LONDON',
    'TOKYO',
    'SINGAPORE',
    'SYDNEY',
  ];

  let activeRun = false;
  let holdCleanup = null;

  function speedFactor() {
    const globalSpeed = Number(window.__RESET_SEQUENCE_SPEED__);
    if (Number.isFinite(globalSpeed) && globalSpeed > 0) return globalSpeed;

    const querySpeed = Number(new URLSearchParams(window.location.search).get('speed'));
    if (Number.isFinite(querySpeed) && querySpeed > 0) return querySpeed;
    return 1;
  }

  const speed = speedFactor();
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, Math.max(12, ms * speed)));
  const holdDuration = Math.max(300, 1600 * speed);

  const $ = (selector) => document.querySelector(selector);

  function formatNumber(value) {
    return Number(value ?? 0).toLocaleString('en-US');
  }

  function formatTarget(value) {
    return String(value ?? 'PAID_USERS').replaceAll('_', ' ');
  }

  function setPhase(name) {
    if (!PHASES.includes(name)) throw new Error(`Unknown RESET phase: ${name}`);
    $('#phase-label').textContent = `Phase — ${name}`;
    document.documentElement.dataset.phase = name;
  }

  function setStatus(text) {
    $('#sequence-status').textContent = text;
  }

  function show(selector, visible = true) {
    const element = $(selector);
    if (element) element.hidden = !visible;
  }

  function resetView(payload) {
    if (holdCleanup) {
      holdCleanup();
      holdCleanup = null;
    }

    document.documentElement.dataset.uiState = 'RESET_SEQUENCE';
    document.documentElement.dataset.phase = '';

    setStatus('GLOBAL RESET AUTHORIZATION PENDING');
    $('#core-state').textContent = 'STANDBY';
    $('#core-charge').textContent = '0%';
    $('#target-scope').textContent = formatTarget(payload.target);
    $('#target-active-users').textContent = formatNumber(payload.activeUsers);
    $('#target-exhausted-users').textContent = formatNumber(payload.exhaustedUsers);
    const frustration = Number(payload.frustration ?? 0);
    const frustrationLabel = Number.isInteger(frustration) ? frustration : frustration.toFixed(1);
    $('#target-frustration').textContent = `${frustrationLabel}%`;
    $('#safety-lock-state').textContent = 'LOCKED';
    $('#hold-progress').textContent = '0%';
    $('#propagation-progress').textContent = '0%';
    $('#propagation-regions').replaceChildren();

    $('#safety-cover').dataset.coverState = 'closed';

    show('#core-panel', false);
    show('#target-panel', false);
    show('#safety-panel', false);
    show('#reset-unit', false);
    show('#release-safety-button', false);
    show('#open-cover-button', false);
    show('#hold-reset-button', false);
    show('#propagation-panel', false);

    $('#hold-reset-button').disabled = true;
    $('#start-sequence-button').disabled = true;
  }

  function waitForButtonClick(selector) {
    return new Promise((resolve) => {
      const button = $(selector);
      const onClick = () => {
        button.removeEventListener('click', onClick);
        resolve();
      };
      button.addEventListener('click', onClick);
    });
  }

  function waitForHoldCompletion() {
    return new Promise((resolve) => {
      const button = $('#hold-reset-button');
      let startTime = 0;
      let frameId = 0;
      let holding = false;
      let completed = false;

      const renderProgress = (fraction) => {
        const percent = Math.max(0, Math.min(100, Math.round(fraction * 100)));
        $('#hold-progress').textContent = `${percent}%`;
      };

      const cancelHold = () => {
        if (!holding || completed) return;
        holding = false;
        cancelAnimationFrame(frameId);
        renderProgress(0);
      };

      const step = (now) => {
        if (!holding || completed) return;
        const fraction = (now - startTime) / holdDuration;
        renderProgress(fraction);
        if (fraction >= 1) {
          completed = true;
          holding = false;
          renderProgress(1);
          cleanup();
          resolve();
          return;
        }
        frameId = requestAnimationFrame(step);
      };

      const beginHold = (event) => {
        if (completed || holding || button.disabled) return;
        if (event.type === 'pointerdown' && event.button !== 0) return;
        event.preventDefault();
        holding = true;
        startTime = performance.now();
        renderProgress(0);
        frameId = requestAnimationFrame(step);
      };

      const onKeyDown = (event) => {
        if ((event.code === 'Space' || event.code === 'Enter') && !event.repeat) {
          beginHold(event);
        }
      };

      const onKeyUp = (event) => {
        if (event.code === 'Space' || event.code === 'Enter') cancelHold();
      };

      const cleanup = () => {
        cancelAnimationFrame(frameId);
        button.removeEventListener('pointerdown', beginHold);
        window.removeEventListener('pointerup', cancelHold);
        window.removeEventListener('pointercancel', cancelHold);
        button.removeEventListener('keydown', onKeyDown);
        button.removeEventListener('keyup', onKeyUp);
        holdCleanup = null;
      };

      holdCleanup = cleanup;
      button.addEventListener('pointerdown', beginHold);
      window.addEventListener('pointerup', cancelHold);
      window.addEventListener('pointercancel', cancelHold);
      button.addEventListener('keydown', onKeyDown);
      button.addEventListener('keyup', onKeyUp);
    });
  }

  async function runCoreCharging() {
    setPhase('Core Charging');
    show('#core-panel');
    $('#core-state').textContent = 'CHARGING';
    for (const percent of [20, 55, 80, 100, 120]) {
      $('#core-charge').textContent = `${percent}%`;
      await delay(220);
    }
    $('#core-state').textContent = 'OVERCHARGED';
  }

  async function runPropagation() {
    setPhase('Propagation');
    show('#propagation-panel');
    const container = $('#propagation-regions');
    for (let index = 0; index < REGIONS.length; index += 1) {
      const row = document.createElement('p');
      row.textContent = `${REGIONS[index]} ........ RESET`;
      row.dataset.region = REGIONS[index];
      container.appendChild(row);
      $('#propagation-progress').textContent = `${Math.round(((index + 1) / REGIONS.length) * 100)}%`;
      await delay(260);
    }
  }

  async function runGlobalResetSequence(payload, { onBeforeTrigger, onTrigger, onAfterTrigger } = {}) {
    if (activeRun) {
      throw new Error('GLOBAL RESET sequence is already running');
    }

    activeRun = true;
    resetView(payload ?? {});

    try {
      setPhase('Authorization');
      setStatus('GLOBAL RESET AUTHORIZATION ACCEPTED');
      await delay(420);

      await runCoreCharging();

      setPhase('Target Acquisition');
      show('#target-panel');
      setStatus('GLOBAL TARGET ACQUISITION');
      await delay(700);

      setPhase('Safety System');
      show('#safety-panel');
      setStatus('SAFETY SYSTEM CHECK');
      await delay(600);

      setPhase('Console Deployment');
      show('#reset-unit');
      setStatus('RESET UNIT DEPLOYING');
      await delay(850);

      setPhase('Final Safety');
      setStatus('FINAL SAFETY .......... LOCKED');
      show('#release-safety-button');
      await waitForButtonClick('#release-safety-button');
      show('#release-safety-button', false);
      $('#safety-lock-state').textContent = 'RELEASED';
      setStatus('FINAL SAFETY .......... RELEASED');

      show('#open-cover-button');
      await waitForButtonClick('#open-cover-button');
      show('#open-cover-button', false);
      $('#safety-cover').dataset.coverState = 'open';

      setPhase('HOLD TO RESET');
      setStatus('HOLD TO RESET');
      show('#hold-reset-button');
      $('#hold-reset-button').disabled = false;
      await waitForHoldCompletion();
      $('#hold-reset-button').disabled = true;

      if (typeof onBeforeTrigger === 'function') await Promise.resolve(onBeforeTrigger());
      setPhase('CODE-X RESET');
      setStatus('CODE-X RESET!');
      if (typeof onTrigger === 'function') {
        await Promise.resolve(onTrigger());
      }
      await delay(450);
      if (typeof onAfterTrigger === 'function') await Promise.resolve(onAfterTrigger());

      await runPropagation();

      setPhase('Complete');
      setStatus(
        `GLOBAL RESET COMPLETE\n${formatNumber(payload.activeUsers)} developers refreshed.\n${formatNumber(payload.exhaustedUsers)} exhausted developers saved.`
      );
      // 100%完了の最終状態を一呼吸見せてから通常画面へ戻す。
      await delay(1000);
    } finally {
      if (holdCleanup) {
        holdCleanup();
        holdCleanup = null;
      }
      activeRun = false;
      document.documentElement.dataset.uiState = 'NORMAL';
      $('#start-sequence-button').disabled = false;
    }
  }

  const mockPayload = {
    activeUsers: 2_841_291,
    exhaustedUsers: 428_193,
    frustration: 87,
    target: 'PAID_USERS',
  };

  $('#start-sequence-button').addEventListener('click', () => {
    runGlobalResetSequence(mockPayload, {
      onTrigger: () => {
        document.documentElement.dataset.mockTriggered = 'true';
      },
    }).catch((error) => {
      console.error(error);
      setStatus(`ERROR: ${error.message}`);
    });
  });

  window.runGlobalResetSequence = runGlobalResetSequence;
  window.RESET_SEQUENCE_PHASES = Object.freeze([...PHASES]);
})();
