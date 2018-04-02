export function timed(fn) {
  const start = performance.now();
  const result = fn();
  const time = performance.now() - start;
  return { result, time };
}