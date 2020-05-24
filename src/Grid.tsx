import * as Honeycomb from 'honeycomb-grid';

import { GRID_RADIUS } from './config';

import Context from './Context';
import MapGenerator from './MapGenerator';
import Boid from './Boid';

const assert = (cond: boolean) => {
  if (!cond) {
    throw new Error(`Assertion failed!`);
  }
};

export const CELL_WALL = 1;
export const CELL_EMPTY = 2;

export const HIT_TARGET = 0;
export const HIT_WALL = 1;
export const HIT_LIMIT = 2;

export type Hex = Honeycomb.Hex<{
  type: typeof CELL_WALL | typeof CELL_EMPTY;
  shouldRender: boolean;
  bgColor: number;

  food: number;
  boid?: Boid;
}>;
export const hexFactory = Honeycomb.extendHex({
  size: 1,
  // origin: {
  //   x: Honeycomb.extendHex({ size: 1 })().width() / 2,
  //   y: Honeycomb.extendHex({ size: 1 })().height() / 2,
  // },

  type: CELL_WALL as (typeof CELL_WALL | typeof CELL_EMPTY),
  shouldRender: false,
  bgColor: 0xffffff,

  food: 0,
  boid: undefined,
});

export const swapHexes = (a: Hex, b: Hex) => {
  assert(a.shouldRender);
  assert(b.shouldRender);

  [a.type, b.type] = [b.type, a.type];
  [a.bgColor, b.bgColor] = [b.bgColor, a.bgColor];

  [a.food, b.food] = [b.food, a.food];
  [a.boid, b.boid] = [b.boid, a.boid];

  if (a.boid) {
    assert(a.boid.hex === b);
    a.boid.hex = a;
  }
  if (b.boid) {
    assert(b.boid.hex === a);
    b.boid.hex = b;
  }
};

class Grid {
  public size: number;
  public arr: Honeycomb.Grid<Hex>;

  constructor(context: Context) {
    const radius = GRID_RADIUS + 1;
    const center = hexFactory({ q: radius, r: radius, s: -2 * radius });

    this.size = radius * 2 + 1;
    this.arr = Honeycomb.defineGrid(hexFactory).parallelogram({
      width: this.size,
      height: this.size,
    });

    const mapGenerator = context.get(MapGenerator);

    this.arr.forEach((hex) => {
      const dist = center.distance(hex);

      hex.type =
        dist <= GRID_RADIUS && mapGenerator.isWall(hex)
          ? CELL_EMPTY
          : CELL_WALL;
      hex.shouldRender = dist <= GRID_RADIUS + 1;
      hex.bgColor = { [CELL_WALL]: 0x888888, [CELL_EMPTY]: 0xeeeeee }[hex.type];
    });
  }

  getAtIndex(index: number) {
    return this.arr[index]!;
  }

  getAtHex(hex: Hex) {
    return this.getAtIndex(this.getHexIndex(hex));
  }

  getHexIndex(hex: Hex) {
    return hex.q * this.size + hex.r;
  }

  getTowards(
    start: Hex,
    offsetX: number,
    offsetY: number,
    maxDistance: number,
  ) {
    const end = hexFactory(start.x + offsetX, start.y + offsetY);

    const distance = start.distance(end);
    const numSteps = Math.min(distance, maxDistance);
    const step = 1.0 / Math.max(distance, 1);

    for (let i = 1; i < numSteps; i++) {
      const res = this.getAtHex(start.lerp(end, step * i).round());
      if (res.type === CELL_WALL) {
        return { start, hex: res, hit: HIT_WALL };
      }
    }
    return {
      start,
      hex: this.getAtHex(start.lerp(end, step * numSteps).round()),
      hit: distance < maxDistance ? HIT_TARGET : HIT_LIMIT,
    };
  }
}

export default Grid;
