// Minimal pub-sub store shared by a Trio's three figures.
export function createState(initial) {
  let value = { ...initial };
  const listeners = new Set();

  return {
    get() {
      return value;
    },
    set(patch) {
      value = { ...value, ...patch };
      listeners.forEach((fn) => fn(value));
    },
    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
  };
}
