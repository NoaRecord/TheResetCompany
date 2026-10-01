const ZERO_SEED_FALLBACK = 0x6D2B79F5;
const UINT32_RANGE = 4294967296;

export function normalizeSeed(seed) {
  const normalized = Number(seed) >>> 0;
  return normalized === 0 ? ZERO_SEED_FALLBACK : normalized;
}

export function nextUint32(state) {
  let x = Number(state) >>> 0;
  if (x === 0) x = ZERO_SEED_FALLBACK;
  x ^= (x << 13) >>> 0;
  x ^= x >>> 17;
  x ^= (x << 5) >>> 0;
  return x >>> 0;
}

export function nextFloat(state) {
  const nextState = nextUint32(state);
  return {
    state: nextState,
    value: nextState / UINT32_RANGE
  };
}

export function drawFloats(state, count) {
  const values = [];
  let nextState = state >>> 0;
  for (let i = 0; i < count; i += 1) {
    const draw = nextFloat(nextState);
    nextState = draw.state;
    values.push(draw.value);
  }
  return { state: nextState, values };
}
