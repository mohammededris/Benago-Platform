function withTimeout(promise, ms, label) {
  const timeout = new Promise((_, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`[timeout] ${label} did not resolve within ${ms}ms`));
    }, ms);
    if (timer.unref) timer.unref();
  });

  return Promise.race([promise, timeout]);
}

module.exports = { withTimeout };
