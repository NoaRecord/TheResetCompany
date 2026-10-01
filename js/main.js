import { createAppController } from './controllers/app-controller.js';
import { assertStateInvariants } from './engine/game-state.js';
import { calculateFinalScore, getSomEvaluation } from './engine/scoring.js';
import { createAudioController } from './audio/audio-controller.js';
import { selectKrogMessages } from './ui/krog-selector.js';
import { getMetricMarkers, getMetricStatus } from './ui/metric-status.js';
import { parseCompatibleSave } from './storage/save-state.js';
import { bindPlayAgainRequest } from './ui/ending-report.js';

const SAVE_KEY = 'the-reset-company-v0.1';
const PREF_KEY = 'the-reset-company-preferences-v0.1';
const formatNumber = (value) => Math.round(value).toLocaleString();
const $ = (selector) => document.querySelector(selector);

const EVENT_COPY = {
  bug_fixed: 'BUG FIXED // Customer-facing optimism has been restored.',
  server_trouble: 'SERVER TROUBLE // Available capacity declined unexpectedly.',
  klaude_reset_everyone: 'KLAUDE RESET EVERYONE // Competitive activity detected.',
  tybo_posted: 'TYBO POSTED 👀 // Expectation increased across the user base.',
  user_milestone: 'USER MILESTONE // One Banked compensation stock has been issued.',
  new_model_released: 'NEW MODEL RELEASED // Demand increased ahead of capacity.'
};
const SOM_COPY = {
  KLAUDE_EXODUS: 'Mr. Som: “The competition appears to have benefited from our operational choices.”',
  RESET_SPAM: 'Mr. Som: “The RESET budget has become a recurring strategic dependency.”',
  HIGH_SAT_HIGH_EXPECTATION: 'Mr. Som: “Excellent satisfaction. The users now expect this every day.”',
  RESET_MISER: 'Mr. Som: “A conservative RESET policy. The ledger is impressed; the users are less certain.”',
  HIGH_SCORE: 'Mr. Som: “A strong operating result. Please do not make this the new baseline.”',
  NORMAL: 'Mr. Som: “The company completed its reporting period.”'
};

const HELP_SECTIONS = [
  ['DAILY FLOW', 'Each day runs Pressure → Player Decision → Settlement. Begin Day to reveal pressure, choose exactly one action, then review the Daily User Report. The game ends after Day 30 Settlement.'],
  ['WAIT', 'Uses no special reset resource. Settlement naturally recovers 20% of remaining Exhausted Users, while pressure and other operating effects continue.'],
  ['BANKED RESET', 'A Banked Reset uses one compensation Stock. Stock starts at zero and is awarded by selected events: USER MILESTONE always grants one, and SERVER TROUBLE has a 25% chance. Stock is capped at three.'],
  ['GLOBAL RESET', 'Global Reset requires 90 RESET Energy. The game starts with 60 Energy and adds 30 after each Settlement, up to 100. Its energy cost controls availability; its separate operational cost affects the Final Score.'],
  ['GLOBAL RESET HOLD', 'The physical RESET Unit appears only in the sequence. Hold the control to 100% to trigger CODE-X RESET. Releasing early resets the hold progress; you can try again in the same sequence.'],
  ['REPORTS AND SCORE', 'Daily User Report separates New, Returned, Lost, Net Change, and Natural Recovery. Krog posts are fictional. The Day 30 report gives the Final Score and Mr. Som evaluation.']
];

function readJson(path) {
  return fetch(path).then((response) => {
    if (!response.ok) throw new Error(`Could not load ${path} (${response.status}).`);
    return response.json();
  });
}

function safeStorageGet(key) {
  try { return localStorage.getItem(key); } catch { return null; }
}

function parseStoredJson(raw, fallback) {
  try { return raw ? JSON.parse(raw) : fallback; } catch { return fallback; }
}

function safeStorageRemove(key) {
  try { localStorage.removeItem(key); } catch { /* An unavailable storage area must not block a fresh session. */ }
}

function addLog(text, tone = '') {
  const log = $('#event-log');
  const item = document.createElement('li');
  item.textContent = text;
  if (tone) item.dataset.tone = tone;
  log.prepend(item);
  while (log.children.length > 6) log.lastElementChild.remove();
}

function makeSeed() {
  const values = new Uint32Array(1);
  globalThis.crypto?.getRandomValues?.(values);
  return values[0] || Math.floor(Math.random() * 0xffffffff) || 1;
}

function renderMetrics(state, balance) {
  const host = $('#metrics-list');
  host.replaceChildren();
  for (const name of ['satisfaction', 'frustration', 'expectation']) {
    const value = state[name];
    const status = getMetricStatus(name, value, balance.thresholds[name]);
    const metric = document.createElement('div');
    metric.className = 'metric';
    metric.dataset.status = status;

    const head = document.createElement('div');
    head.className = 'metric-head';
    const label = document.createElement('span');
    label.className = 'metric-name';
    label.textContent = name.replaceAll('_', ' ').toUpperCase();
    const number = document.createElement('b');
    number.className = 'metric-value';
    number.textContent = `${value.toFixed(1)}%`;
    const stateLabel = document.createElement('span');
    stateLabel.className = 'metric-status';
    stateLabel.textContent = status;
    head.append(label, number, stateLabel);

    const gauge = document.createElement('div');
    gauge.className = 'metric-gauge';
    gauge.setAttribute('role', 'img');
    gauge.setAttribute('aria-label', `${name} ${value.toFixed(1)} percent, ${status}`);
    const fill = document.createElement('div');
    fill.className = 'metric-fill';
    fill.style.width = `${Math.max(0, Math.min(100, value))}%`;
    gauge.appendChild(fill);
    for (const marker of getMetricMarkers(name, balance.thresholds[name])) {
      const mark = document.createElement('span');
      mark.className = 'threshold-marker';
      mark.dataset.label = marker.label;
      mark.setAttribute('aria-label', `${marker.label} threshold ${marker.value}`);
      mark.style.left = `${marker.value}%`;
      gauge.appendChild(mark);
    }
    metric.append(head, gauge);
    host.appendChild(metric);
  }
}

function renderDailyReport(report) {
  const host = $('#daily-report');
  host.replaceChildren();
  $('#report-day').textContent = report ? `DAY ${report.day}` : 'AWAITING SETTLEMENT';
  if (!report) {
    const placeholder = document.createElement('p');
    placeholder.className = 'placeholder';
    placeholder.textContent = 'PRESSURE → DECISION → SETTLEMENT';
    host.appendChild(placeholder);
    return;
  }
  const rows = [
    ['NEW USERS', report.newUsers, 'positive', true],
    ['RETURNED FROM KLAUDE', report.returnedFromKlaude, 'positive', true],
    ['LOST TO KLAUDE', report.lostToKlaude, 'negative', false],
    ['NET CHANGE', report.netChange, report.netChange < 0 ? 'negative' : 'positive', true],
    ['NATURAL RESET / RECOVERED', report.naturalResetRecovered, 'positive', true]
  ];
  for (const [label, value, tone, plus] of rows) {
    const row = document.createElement('div');
    row.className = 'report-row';
    row.dataset.tone = tone;
    const title = document.createElement('span');
    title.textContent = label;
    const amount = document.createElement('strong');
    const sign = value === 0 ? '' : (plus ? '+' : '-');
    amount.textContent = `${sign}${formatNumber(Math.abs(value))}`;
    row.append(title, amount);
    host.appendChild(row);
  }
}

function chooseKrogCategory(signal) {
  const priority = ['after_global_reset', 'klaude_event', 'tybo_posted', 'bug_incident'];
  return priority.find((tag) => signal.tags.includes(tag)) ?? signal.severity;
}

function renderKrog(signal, state, krogMessages) {
  const category = chooseKrogCategory(signal);
  $('#krog-category').textContent = category.replaceAll('_', ' ').toUpperCase();
  const feed = $('#krog-feed');
  feed.replaceChildren();
  const selected = selectKrogMessages({ category, day: state.day, uiSeed: `${state.seed}:KROG` }, krogMessages, 3);
  for (const message of selected) {
    const post = document.createElement('div');
    post.className = 'krog-post';
    post.textContent = `“${message}”`;
    feed.appendChild(post);
  }
}

function renderKlaude(state) {
  const gross = state.grossLostToKlaude;
  const returned = state.returnedFromKlaude;
  const net = gross - returned;
  $('#klaude-gross').textContent = formatNumber(gross);
  $('#klaude-returned').textContent = formatNumber(returned);
  $('#klaude-net').textContent = formatNumber(net);
  $('#klaude-net-bar').style.width = gross > 0 ? `${(net / gross) * 100}%` : '0%';
  $('#klaude-returned-bar').style.width = gross > 0 ? `${(returned / gross) * 100}%` : '0%';
  $('#klaude-net-bar').setAttribute('aria-label', `Still lost ${formatNumber(net)}`);
  $('#klaude-returned-bar').setAttribute('aria-label', `Returned ${formatNumber(returned)}`);
}

function openOverlay(overlay, panel, trigger) {
  overlay.hidden = false;
  overlay.dataset.returnFocus = trigger?.id ?? '';
  panel.focus();
}

function closeOverlay(overlay) {
  if (overlay.hidden) return;
  const returnFocus = overlay.dataset.returnFocus;
  overlay.hidden = true;
  if (returnFocus) $(`#${returnFocus}`)?.focus();
}

function renderEnding(report, state, krogMessages) {
  if (!report) return;
  $('#final-score').textContent = formatNumber(report.finalScore);
  $('#som-evaluation').textContent = report.somEvaluation.replaceAll('_', ' ');
  $('#final-paid').textContent = formatNumber(state.paidUsers);
  $('#final-klaude').textContent = `${formatNumber(state.grossLostToKlaude)} / ${formatNumber(state.returnedFromKlaude)} / ${formatNumber(state.grossLostToKlaude - state.returnedFromKlaude)}`;
  $('#final-operational-cost').textContent = formatNumber(state.totalOperationalCost);
  $('#final-reset-counts').textContent = `${state.bankedResetCount} / ${state.globalResetCount}`;
  $('#som-comment').textContent = SOM_COPY[report.somEvaluation] ?? SOM_COPY.NORMAL;
  const voices = selectKrogMessages(
    { category: 'ending_user_voices', day: state.day, uiSeed: `${state.seed}:ENDING` },
    { ending_user_voices: krogMessages.ending_user_voices },
    2
  );
  $('#user-voices').replaceChildren(...voices.map((voice) => {
    const line = document.createElement('p');
    line.textContent = `“${voice}”`;
    return line;
  }));
}

async function start() {
  try {
    const [balance, eventsData, krogMessages] = await Promise.all([
      readJson('data/balance.json'), readJson('data/events.json'), readJson('data/krog-messages.json')
    ]);
    const prefs = parseStoredJson(safeStorageGet(PREF_KEY), {});
    const rawSave = safeStorageGet(SAVE_KEY);
    let saved = parseCompatibleSave(rawSave, balance.schemaVersion);
    let restoredState = null;
    if (rawSave && !saved) safeStorageRemove(SAVE_KEY);
    if (saved?.state) {
      try {
        assertStateInvariants(saved.state, balance);
        restoredState = saved.state;
      } catch {
        saved = null;
        safeStorageRemove(SAVE_KEY);
      }
    }

    const muteButton = $('#mute-button');
    document.documentElement.dataset.audioState = 'NORMAL';
    const audio = createAudioController({
      muted: prefs.muted === true,
      onStateChange: (state) => { document.documentElement.dataset.audioState = state; }
    });
    function renderMute() {
      muteButton.textContent = audio.muted ? 'AUDIO: MUTED' : 'AUDIO: ON';
      muteButton.setAttribute('aria-pressed', String(audio.muted));
    }
    renderMute();
    muteButton.addEventListener('click', async () => {
      audio.setMuted(!audio.muted);
      renderMute();
      try { localStorage.setItem(PREF_KEY, JSON.stringify({ muted: audio.muted })); } catch { /* 設定保存は任意。 */ }
      if (!audio.muted) await audio.startAfterUserGesture();
    });

    const frame = $('#sequence-frame');
    const overlay = $('#sequence-overlay');
    const frameReady = new Promise((resolve) => {
      if (frame.contentDocument?.readyState === 'complete') resolve();
      else frame.addEventListener('load', resolve, { once: true });
    });
    async function runSequence(payload, handlers) {
      audio.setState('GLOBAL_RESET');
      overlay.hidden = false;
      frame.hidden = false;
      document.documentElement.dataset.uiState = 'RESET_SEQUENCE';
      await frameReady;
      const innerDocument = frame.contentDocument;
      innerDocument.querySelector('#start-sequence-button')?.setAttribute('hidden', '');
      innerDocument.querySelector('#sequence-status').textContent = 'EMPLOYEE MODE AUTHORIZED GLOBAL RESET';
      innerDocument.documentElement.dataset.uiState = 'NORMAL';
      const wrappedHandlers = {
        ...handlers,
        onBeforeTrigger: async () => audio.momentarySilence(),
        onAfterTrigger: () => audio.setState('GLOBAL_RESET'),
        onTrigger: () => {
          return handlers.onTrigger?.();
        }
      };
      try {
        return await frame.contentWindow.runGlobalResetSequence(payload, wrappedHandlers);
      } finally {
        overlay.hidden = true;
        frame.hidden = true;
        document.documentElement.dataset.uiState = 'NORMAL';
        audio.setState('NORMAL');
      }
    }

    const app = createAppController({
      balance,
      eventsData,
      seed: saved?.seed ?? makeSeed(),
      initialState: restoredState,
      runSequence,
      onSettled(state) {
        // Settlement済み状態だけを保存し、進行中のRESET取引は保存しない。
        try { localStorage.setItem(SAVE_KEY, JSON.stringify({ seed: state.seed, state })); } catch { /* 保存領域を使えない場合も進行を続ける。 */ }
      },
      onRestart(state) {
        // Replay後のDay 1を新しい保存状態として置き換える。
        try { localStorage.setItem(SAVE_KEY, JSON.stringify({ seed: state.seed, state })); } catch { /* 保存領域がなくても新しいrunは続行する。 */ }
      }
    });
    let lastLoggedReportDay = null;

    const helpOverlay = $('#help-overlay');
    const endingOverlay = $('#ending-overlay');
    const helpButton = $('#help-button');
    const endingButton = $('#ending-close');
    const helpHost = $('#help-content');
    for (const [title, body] of HELP_SECTIONS) {
      const section = document.createElement('section');
      section.className = 'help-section';
      const heading = document.createElement('h3');
      heading.textContent = title;
      const copy = document.createElement('p');
      copy.textContent = body;
      section.append(heading, copy);
      helpHost.appendChild(section);
    }
    helpButton.addEventListener('click', () => openOverlay(helpOverlay, helpOverlay.querySelector('[role="dialog"]'), helpButton));
    $('#help-close').addEventListener('click', () => closeOverlay(helpOverlay));
    endingButton.addEventListener('click', () => closeOverlay(endingOverlay));
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        if (!helpOverlay.hidden) closeOverlay(helpOverlay);
        else if (!endingOverlay.hidden) closeOverlay(endingOverlay);
      }
    });

    function render() {
      const state = app.state;
      audio.setFrustration(state.frustration);
      $('#day-value').textContent = String(state.day).padStart(2, '0');
      $('#active-users').textContent = formatNumber(state.activeUsers);
      $('#paid-users').textContent = formatNumber(state.paidUsers);
      $('#exhausted-users').textContent = formatNumber(state.exhaustedUsers);
      $('#energy-value').textContent = `${Math.round(state.resetEnergy)} / ${balance.resetEnergy.max}`;
      $('#energy-fill').style.width = `${(state.resetEnergy / balance.resetEnergy.max) * 100}%`;
      const threshold = balance.globalReset.energyCost;
      const thresholdPercent = (threshold / balance.resetEnergy.max) * 100;
      $('#ready-zone').style.left = `${thresholdPercent}%`;
      $('#ready-zone').style.width = `${100 - thresholdPercent}%`;
      $('#ready-threshold').style.left = `${thresholdPercent}%`;
      $('#energy-threshold-label').textContent = `THRESHOLD ${threshold}`;
      $('#banked-stock').textContent = `${state.bankedResetStock} / ${balance.bankedReset.stockMax}`;
      $('#global-energy-cost').textContent = String(balance.globalReset.energyCost);
      $('#global-operational-cost').textContent = String(balance.globalReset.operationalCost);
      $('#operational-cost-total').textContent = formatNumber(state.totalOperationalCost);
      $('#banked-count').textContent = String(state.bankedResetCount);
      $('#global-count').textContent = String(state.globalResetCount);
      $('#phase-indicator').textContent = app.phase.replaceAll('_', ' ');
      $('#status-message').textContent = app.message;
      $('#system-status').textContent = state.status === 'ENDED' ? 'PERIOD CLOSED' :
        (app.availableActions.includes('GLOBAL_RESET') ? 'GLOBAL READY' : 'SYSTEM NOMINAL');

      const highestRisk = Math.max(state.frustration, state.expectation);
      const status = $('.status-strip');
      status.dataset.tone = app.phase === 'ERROR' || highestRisk >= balance.thresholds.frustration.criticalMin
        ? 'red'
        : (app.phase === 'DECISION' || highestRisk >= balance.thresholds.frustration.warningMin ? 'amber' : '');
      const canBegin = app.phase === 'READY' && state.status === 'RUNNING';
      $('#begin-day-button').hidden = !canBegin;
      $('#begin-day-button strong').textContent = `BEGIN DAY ${state.day}`;
      document.querySelectorAll('[data-action]').forEach((button) => {
        button.disabled = !app.availableActions.includes(button.dataset.action);
      });

      const ready = app.availableActions.includes('GLOBAL_RESET');
      $('#global-ready').classList.toggle('is-ready', ready);
      $('#global-ready strong').textContent = ready ? 'GLOBAL RESET READY' : 'GLOBAL RESET NOT READY';
      renderMetrics(state, balance);
      renderDailyReport(app.lastSettlement?.settlement?.dailyReport ?? null);
      renderKlaude(state);
      renderKrog(app.krogSignal, state, krogMessages);

      $('#chappy-message').textContent = app.phase === 'ENDED'
        ? 'Chappy has archived the operating period and prepared the final report.'
        : app.phase === 'DECISION'
          ? (app.lastPressure?.randomEvent ? 'Chappy recommends reviewing the incident log before choosing an action.' : 'Chappy recommends one measured operational decision.')
          : app.phase === 'RESET_SEQUENCE'
            ? 'Chappy is waiting for CODE-X RESET and will not advance Settlement early.'
            : app.phase === 'ERROR' ? app.message : 'Chappy is checking the service ledger.';

      if (app.lastSettlement?.settlement?.dailyReport && lastLoggedReportDay !== app.lastSettlement.settlement.dailyReport.day) {
        const report = app.lastSettlement.settlement.dailyReport;
        addLog(`DAY ${String(report.day).padStart(2, '0')} REPORT // NET CHANGE ${report.netChange >= 0 ? '+' : ''}${formatNumber(report.netChange)}.`, report.netChange < 0 ? 'amber' : '');
        lastLoggedReportDay = report.day;
      }

      if (state.status === 'ENDED') {
        const report = app.lastEnding ?? {
          finalScore: calculateFinalScore(state, balance),
          somEvaluation: getSomEvaluation(state, calculateFinalScore(state, balance), balance)
        };
        renderEnding(report, state, krogMessages);
        if (endingOverlay.hidden) openOverlay(endingOverlay, endingOverlay.querySelector('[role="dialog"]'), document.activeElement?.id ? document.activeElement : helpButton);
      }
    }

    function beginDay() {
      void audio.startAfterUserGesture();
      const report = app.beginDay();
      if (report.randomEvent) {
        const stockText = report.randomEvent.bankedStockGranted ? ` // BANKED STOCK +${report.randomEvent.bankedStockGranted}` : '';
        addLog(`${EVENT_COPY[report.randomEvent.id] ?? report.randomEvent.id}${stockText}`, 'amber');
      } else addLog(`DAY ${String(app.state.day).padStart(2, '0')} PRESSURE RESOLVED // ${formatNumber(report.newExhausted)} additional exhausted users.`);
      audio.setState(report.randomEvent ? 'ATTENTION' : 'NORMAL');
      render();
    }

    $('#begin-day-button').addEventListener('click', beginDay);
    bindPlayAgainRequest($('#play-again-button'), {
      onPlayAgain() {
        app.restart(makeSeed());
        lastLoggedReportDay = null;
        $('#event-log').replaceChildren();
        endingOverlay.hidden = true;
        audio.setState('NORMAL');
        beginDay();
        $('[data-action="WAIT"]')?.focus();
      }
    });
    document.querySelectorAll('[data-action]').forEach((button) => button.addEventListener('click', async () => {
      const type = button.dataset.action;
      void audio.startAfterUserGesture();
      audio.setState(type === 'GLOBAL_RESET' ? 'GLOBAL_RESET' : (app.lastPressure?.randomEvent ? 'ATTENTION' : 'NORMAL'));
      try {
        const outcome = await app.performAction(type);
        if (!outcome.action.resolved && outcome.action.event.type !== 'GLOBAL_RESET_PREPARED') {
          addLog(`${type.replaceAll('_', ' ')} REJECTED // ${outcome.action.event.reason.replaceAll('_', ' ')}.`, 'amber');
        } else {
          if (type === 'GLOBAL_RESET') addLog('GLOBAL RESET COMPLETE // User service restored through authorized sequence.', 'red');
          else if (type === 'BANKED_RESET') addLog(app.message, 'amber');
          else addLog(`DAY ${String(app.lastPressure?.state.day ?? app.state.day).padStart(2, '0')} // WAIT recorded.`, '');
          addLog(app.state.status === 'ENDED' ? 'DAY 30 SETTLEMENT // Final report ready.' : `SETTLEMENT COMPLETE // Next operating day: ${app.state.day}.`);
        }
      } catch (error) {
        addLog(`INTEGRATION ERROR // ${error.message}`, 'red');
        $('#loading-error').textContent = `RESET integration error: ${error.message}`;
        $('#loading-error').hidden = false;
      } finally {
        audio.setState(app.phase === 'ERROR' ? 'ATTENTION' : 'NORMAL');
        render();
      }
    }));

    let justResetCount = 0;
    const justResetJokes = [
      'PLEASE, TYBO. THEY’RE ALREADY RESET.',
      'THEY HAVE MORE CODE-X THAN THEY CAN POSSIBLY USE.',
      'Chappy has filed this under “preventable ceremony.”',
      'The RESET Unit requests a short break. Request denied.'
    ];
    $('#just-reset-button').addEventListener('click', async () => {
      justResetCount += 1;
      $('#just-reset-count').textContent = String(justResetCount).padStart(2, '0');
      $('#just-reset-joke').textContent = justResetJokes[(justResetCount - 1) % justResetJokes.length];
      void audio.startAfterUserGesture();
      audio.setState('GLOBAL_RESET');
      try {
        await runSequence({ activeUsers: 2_841_291, exhaustedUsers: 0, frustration: 0, target: 'PAID_USERS' }, { onTrigger: () => {} });
      } catch (error) {
        $('#loading-error').textContent = `RESET sequence error: ${error.message}`;
        $('#loading-error').hidden = false;
      } finally {
        audio.setState('NORMAL');
      }
    });

    document.querySelectorAll('[data-mode]').forEach((button) => button.addEventListener('click', () => {
      const justReset = button.dataset.mode === 'just-reset';
      $('#employee-mode').hidden = justReset;
      $('#just-reset-mode').hidden = !justReset;
      document.querySelectorAll('[data-mode]').forEach((tab) => {
        const active = tab === button;
        tab.classList.toggle('is-active', active);
        if (active) tab.setAttribute('aria-current', 'page');
        else tab.removeAttribute('aria-current');
      });
      history.replaceState(null, '', justReset ? '#just-reset' : '#employee');
    }));

    render();
    if (app.phase === 'READY') beginDay();
    if (location.hash === '#just-reset') $('[data-mode="just-reset"]').click();
  } catch (error) {
    $('#loading-error').textContent = `Unable to load the local game: ${error.message}. Serve this folder over HTTP and reload.`;
    $('#loading-error').hidden = false;
  }
}

start();
