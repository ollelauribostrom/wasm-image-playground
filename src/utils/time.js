export function timed(fn, { action, language }) {
  const start = performance.now();
  try {
    const result = fn();
    return {
      result,
      time: performance.now() - start,
    }
  } catch (err) {
    console.error(err);
    return {
      err,
      error: err.cvNotLoaded ? err.message : `Error when using ${language} to ${action}`,
      time: performance.now() - start,
    }
  }
}