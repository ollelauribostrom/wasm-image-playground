function timed(fn, config = {}) {
  const start = performance.now();
  try {
    const result = fn();
    return {
      result,
      time: performance.now() - start,
    };
  } catch (err) {
    if (config.debug) {
      console.error(err);
    }
    return {
      err,
      error: `Error when using ${config.language} to ${config.action}`,
      time: performance.now() - start,
    };
  }
}

export default timed;
