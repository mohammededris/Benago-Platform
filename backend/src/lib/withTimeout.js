/**
 * withTimeout — wraps any promise with a hard deadline using raw setTimeout.
 * Unlike Promise.race with a delay(), this works even when the wrapped promise's
 * underlying I/O (e.g. a native fetch call) doesn't respect AbortController.
 */
function withTimeout(promise, ms, label) {
  const timeout = new Promise((_, reject) => {
    const t = setTimeout(() => {
      reject(new Error(`[timeout] ${label} did not resolve within ${ms}ms`));
    }, ms);
    if (t.unref) t.unref(); // don't keep the event loop alive for this timer
  });
  return Promise.race([promise, timeout]);
}

module.exports = { withTimeout };
