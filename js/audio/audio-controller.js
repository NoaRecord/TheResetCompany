const PATTERNS = {
  NORMAL: { notes: [55, 82.41, 55, 73.42], interval: 1800, volume: 0.055 },
  ATTENTION: { notes: [55, 82.41, 65.41, 98], interval: 470, volume: 0.024 },
  GLOBAL_RESET: { notes: [55, 110, 164.81, 220], interval: 360, volume: 0.035 }
};
const NORMAL_CADENCE = [
  { minimumFrustration: 75, interval: 800 },
  { minimumFrustration: 55, interval: 1100 },
  { minimumFrustration: 35, interval: 1400 },
  { minimumFrustration: 0, interval: 1800 }
];
const NORMAL_INTERVAL_STEP_MS = 250;

/** 手続き型の音をゲーム計算から分離し、音声機能の失敗はゲームへ伝播させない。 */
export function createAudioController({ muted = false, onMutedChange = () => {}, onStateChange = () => {} } = {}) {
  let context = null;
  let timer = null;
  let step = 0;
  let state = 'NORMAL';
  let isMuted = muted;
  let silenced = false;
  let frustration = 0;
  let targetNormalInterval = PATTERNS.NORMAL.interval;
  let currentNormalInterval = PATTERNS.NORMAL.interval;

  function playTick() {
    if (!context || context.state !== 'running' || isMuted || silenced) return;
    const pattern = PATTERNS[state];
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const now = context.currentTime;
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(pattern.notes[step % pattern.notes.length], now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(pattern.volume, now + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.24);
    step += 1;
  }

  function scheduleNextTick() {
    const interval = state === 'NORMAL' ? currentNormalInterval : PATTERNS[state].interval;
    timer = setTimeout(() => {
      if (state === 'NORMAL' && currentNormalInterval !== targetNormalInterval) {
        const difference = targetNormalInterval - currentNormalInterval;
        currentNormalInterval += Math.sign(difference) * Math.min(Math.abs(difference), NORMAL_INTERVAL_STEP_MS);
      }
      playTick();
      scheduleNextTick();
    }, interval);
  }

  function restartLoop() {
    if (timer) clearTimeout(timer);
    timer = null;
    if (!context || isMuted || silenced) return;
    playTick();
    scheduleNextTick();
  }

  async function momentarySilence(milliseconds = 420) {
    if (!context || context.state !== 'running' || isMuted) return false;
    silenced = true;
    if (timer) clearTimeout(timer);
    timer = null;
    await new Promise((resolve) => setTimeout(resolve, Math.max(0, milliseconds)));
    return true;
  }

  return {
    async startAfterUserGesture() {
      if (isMuted) return false;
      try {
        const AudioContextClass = globalThis.window?.AudioContext || globalThis.window?.webkitAudioContext;
        if (!AudioContextClass) return false;
        context ??= new AudioContextClass();
        if (context.state === 'suspended') await context.resume();
        if (context.state !== 'running') return false;
        restartLoop();
        return true;
      } catch {
        // 音声は任意機能のため、ブラウザーが拒否してもゲームを続行する。
        return false;
      }
    },
    setState(nextState) {
      if (!PATTERNS[nextState]) return;
      state = nextState;
      step = 0;
      silenced = false;
      onStateChange(state);
      restartLoop();
    },
    setFrustration(value) {
      if (!Number.isFinite(value)) return;
      frustration = Math.min(100, Math.max(0, value));
      targetNormalInterval = NORMAL_CADENCE.find((tier) => frustration >= tier.minimumFrustration).interval;
    },
    momentarySilence,
    setMuted(nextMuted) {
      isMuted = Boolean(nextMuted);
      if (isMuted) {
        if (timer) clearTimeout(timer);
        timer = null;
      } else {
        void this.startAfterUserGesture();
      }
      onMutedChange(isMuted);
      return isMuted;
    },
    getSnapshot() {
      return { state, muted: isMuted, available: Boolean(context), silenced };
    },
    async destroy() {
      if (timer) clearTimeout(timer);
      timer = null;
      try { await context?.close(); } catch { /* 終了時の音声解放はbest effort。 */ }
      context = null;
    },
    get muted() { return isMuted; }
  };
}
