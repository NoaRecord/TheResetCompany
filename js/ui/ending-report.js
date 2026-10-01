/** Ending UI only requests a replay; the application/controller owns the new run. */
export function bindPlayAgainRequest(button, { onPlayAgain } = {}) {
  let requested = false;
  button.addEventListener('click', async () => {
    if (requested || button.disabled) return;
    requested = true;
    button.disabled = true;
    try {
      if (typeof onPlayAgain !== 'function') throw new Error('Play Again handler is unavailable.');
      await onPlayAgain();
    } catch {
      requested = false;
      button.disabled = false;
    }
  });
}
