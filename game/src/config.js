// Tuning for Gobble Getaway: every number that shapes the feel of a run lives here, so the
// rest of the code reads as rules and the balance can be changed in one place.

export const VIEW = { width: 960, height: 540 };

// Ground line in screen pixels, and where the turkey stands horizontally.
export const GROUND_Y = 452;
export const TURKEY_X = 330;

// 10 world pixels make one metre on the distance counter.
export const PX_PER_METRE = 10;

export const PHYSICS = {
  gravity: 2350,
  jumpVelocity: -840,
  flapVelocity: -640,
  maxFlaps: 1,
  standHeight: 64,
  duckHeight: 36,
  bodyWidth: 46,
};

export const RUN = {
  lives: 3,
  invulnSeconds: 1.3,
  stumbleSeconds: 0.7,
  stumbleFactor: 0.5,
  mudFactor: 0.62,
  dashFactor: 1.55,
  dashSeconds: 0.9,
  dashCooldown: 4.5,
  startGap: 250,
  maxGap: 560,
  nearMissPixels: 16,
};

export const SCORE = {
  perMetre: 1,
  corn: 25,
  nearMiss: 15,
  hideFromLantern: 120,
  escapeBonus: 1000,
  perLifeLeft: 250,
};

// The three stages of the escape. `end` is the distance in metres where the stage gives way to
// the next; reaching the last one's end through the kitchen's back door is an escape.
export const STAGES = [
  {
    id: 'farmyard',
    name: 'The Farmyard',
    end: 700,
    speed: 400,
    farmerFactor: 0.955,
    spawnEvery: [1.05, 1.6],
    lanternEvery: [11, 15],
    obstacles: { hay: 4, fence: 2, mud: 2, pumpkins: 2, haystack: 1, thrownKnife: 2 },
  },
  {
    id: 'barn',
    name: 'The Old Barn',
    end: 1450,
    speed: 440,
    farmerFactor: 0.97,
    spawnEvery: [0.9, 1.35],
    lanternEvery: [7, 10],
    obstacles: { hay: 3, fence: 1, swingKnife: 3, haystack: 2, thrownKnife: 3, mud: 1 },
  },
  {
    id: 'kitchen',
    name: 'The Kitchen',
    end: 2200,
    speed: 480,
    farmerFactor: 0.985,
    spawnEvery: [0.8, 1.2],
    lanternEvery: [8, 11],
    obstacles: { oven: 4, chopKnife: 3, thrownKnife: 2, pot: 2, haystack: 1 },
  },
];

export const ESCAPE_METRES = STAGES[STAGES.length - 1].end;

export const COLORS = {
  ink: '#2b1608',
  cream: '#fbeed2',
  pumpkin: '#e8771f',
  rust: '#b5481c',
  gold: '#f2b632',
  cranberry: '#9e1f2f',
  leaf: '#c9611d',
  moss: '#6f7a2c',
  sky: ['#f6b86a', '#f39a55', '#d96a3c'],
};
