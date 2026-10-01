function stableHash(input) {
  const text = String(input ?? '');
  let hash = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function greatestCommonDivisor(a, b) {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y) [x, y] = [y, x % y];
  return x || 1;
}

/** UI-only deterministic selection; this never reads or advances Game Engine RNG state. */
export function selectKrogMessages({ category = 'calm', day = 0, uiSeed = 'krog' }, messageData, count = 3) {
  const source = messageData?.[category] ?? messageData?.calm ?? [];
  const desired = Math.max(0, Math.min(Math.trunc(Number(count) || 0), source.length));
  if (desired === 0) return [];

  const key = `${category}|${day}|${uiSeed}`;
  let index = stableHash(key) % source.length;
  let step = (stableHash(`${key}|step`) % Math.max(1, source.length - 1)) + 1;
  while (source.length > 1 && greatestCommonDivisor(step, source.length) !== 1) step = (step % source.length) + 1;

  const selected = [];
  while (selected.length < desired) {
    selected.push(source[index]);
    index = (index + step) % source.length;
  }
  return selected;
}
