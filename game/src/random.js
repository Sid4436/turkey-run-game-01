// A small seeded random number generator (mulberry32), so a run with ?seed=N plays the same
// obstacles every time, which keeps screenshots and bug reports reproducible.

export function createRandom(seed) {
  let state = (seed >>> 0) || 1;
  const next = () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    next,
    range: (min, max) => min + (max - min) * next(),
    int: (min, max) => Math.floor(min + (max - min + 1) * next()),
    chance: (p) => next() < p,
    pickWeighted(weights) {
      const entries = Object.entries(weights);
      const total = entries.reduce((sum, [, w]) => sum + w, 0);
      let roll = next() * total;
      for (const [key, w] of entries) {
        roll -= w;
        if (roll <= 0) return key;
      }
      return entries[entries.length - 1][0];
    },
  };
}
