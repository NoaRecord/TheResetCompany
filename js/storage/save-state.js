/** Development saves are intentionally invalidated when their schema is no longer current. */
export function parseCompatibleSave(raw, schemaVersion) {
  if (!raw) return null;
  try {
    const saved = JSON.parse(raw);
    if (saved?.state?.schemaVersion !== schemaVersion || !Number.isFinite(saved?.seed)) return null;
    return saved;
  } catch {
    return null;
  }
}
