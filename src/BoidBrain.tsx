/*
const q = 1;
const r = radius * 2 + 1;

const parseCoordString = (str: string) => {
  if (!str || str === '0') {
    return 0;
  }
  const rx = /([+-]?)(\d*)([qrs])/y;
  let sum = 0;
  do {
    const found = rx.exec(str);
    if (found === null) {
      throw new Error(`Could not convert ${str} to a coordinate`);
    }
    const num = parseInt(found[1] + (found[2] || '1'));
    const units = { q: q, r: r, s: -q - r }[found[3] as ('q' | 'r' | 's')];
    sum += num * units;
  } while (rx.lastIndex !== str.length);
  return sum;
};
*/

const warrior = {
  COLOR: ['vec3', 1, 0, 0],
  LOOK_AT: [
    'clamp_to_cell',
    [
      'if',
      'SAW_BOID',
      ['sub', ['add', 'LOOK_AT', 'SAW_MOVEMENT'], 'MOVED_MOVED'],
      ['random_vec2', 0, 10],
    ],
  ],
  MOVE_TOWARDS: 'LOOK_AT',
};

/*
Border walls
Simplex walls
Plants spawn less nearby other plants, until a nice uniform density is reached.
Plants grow every so often, creating hotspots.
Moving onto a particle will convert it to food
Each plant or warrior is 1000 food.
moving vs eating vs sitting vs reproduction? mutations?
incapacitation?
*/

const randNormal = () => {
  const u = 1 - Math.random();
  const v = 1 - Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
};

const funcs = {
  vec2: (x: number, y: number) => [x, y],
  vec3: (x: number, y: number, z: number) => [x, y, z],
  vec4: (x: number, y: number, z: number, w: number) => [x, y, z, w],
  clamp_to_cell: (v2: [number, number]) => v2,
  if: (cond: boolean, ifTrue: any, ifFalse: any) => (cond ? ifTrue : ifFalse),
  add: (a: any, b: any) => {
    if (Array.isArray(a)) {
      if (!Array.isArray(b) || a.length !== b.length) {
        throw new Error(`Cannot add vectors ${a} and ${b}`);
      }
      return a.map((_, i) => a[i] + b[i]);
    } else {
      return a + b;
    }
  },
  sub: (a: any, b: any) => {
    if (Array.isArray(a)) {
      if (!Array.isArray(b) || a.length !== b.length) {
        throw new Error(`Cannot sub vectors ${a} and ${b}`);
      }
      return a.map((_, i) => a[i] - b[i]);
    } else {
      return a - b;
    }
  },
  mul: (a: any, b: any) => {
    if (Array.isArray(a)) {
      if (!Array.isArray(b) || a.length !== b.length) {
        throw new Error(`Cannot mul vectors ${a} and ${b}`);
      }
      return a.map((_, i) => a[i] * b[i]);
    } else {
      return a * b;
    }
  },
  random_vec2: (pos: number, scale: number) => [
    randNormal() * scale + pos,
    randNormal() * scale + pos,
  ],
};

export type BoidDefnMap = { [key: string]: BoidDefnNode };
export type BoidDefnArray = BoidDefnNode[];
export type BoidDefnNode = BoidDefnMap | BoidDefnArray | string | number;

class BoidBrain {
  public defn: BoidDefnNode;
  public io: { [key: string]: any };

  constructor(defn: BoidDefnNode) {
    this.defn = defn;

    this.io = {
      ...funcs,

      // Input
      SAW_EMPTY: 0,
      SAW_OBSCURED: 0,
      SAW_FOOD: 0,
      SAW_WALL: 0,
      SAW_BOID: 0,
      SAW_LOCATION: [0, 0],
      SAW_MOVEMENT: [0, 0],
      SAW_COLOR: [0, 0, 0],
      FELT_EMPTY: 0,
      FELT_FOOD: 0,
      FELT_WALL: 0,
      FELT_BOID: 0,
      FELT_MOVEMENT: [0, 0],
      MOVED_MOVED: [0, 0],
      MOVED_BLOCKED: 0,

      // Output
      COLOR: [0, 0, 0],
      LOOK_AT: [0, 0],
      FEEL_TOWARDS: [0, 0],
      MOVE_TOWARDS: [0, 0],

      // Neither (storage)
      STORAGE_0: 0,
      STORAGE_1: 0,
      STORAGE_2: 0,
      STORAGE_3: 0,
      STORAGE_4: 0,
      STORAGE_5: 0,
      STORAGE_6: 0,
      STORAGE_7: 0,
      STORAGE_8: 0,
      STORAGE_9: 0,
      STORAGE_10: 0,
      STORAGE_11: 0,
      STORAGE_12: 0,
      STORAGE_13: 0,
      STORAGE_14: 0,
      STORAGE_15: 0,
    };
  }

  tick() {
    const evaluate = (
      code: BoidDefnNode,
      input: { [key: string]: any },
    ): any => {
      if (Array.isArray(code)) {
        const [func, ...args] = code.map((a) => evaluate(a, input));
        return func(...args);
      } else if (typeof code === 'string') {
        if (input[code] === undefined) {
          throw new Error(`Unexpected key ${code}`);
        }
        return input[code];
      } else if (typeof code === 'number') {
        return code;
      } else if (typeof code === 'object') {
        return Object.fromEntries(
          Object.entries(code).map(([k, v]) => [k, evaluate(v, input)]),
        );
      }
    };

    this.io = { ...this.io, ...evaluate(this.defn, this.io) };
  }
}

export default BoidBrain;
