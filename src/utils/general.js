export function isFunction(x) {
  return Object.prototype.toString.call(x) == '[object Function]';
}