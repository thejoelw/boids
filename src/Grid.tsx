import * as Honeycomb from 'honeycomb-grid';

import { GRID_RADIUS, GRID_PADDING } from './config';

import Context from './Context';

export const CELL_WALL = 1;
export const CELL_EMPTY = 2;

export type Hex = Honeycomb.Hex<{
  type: typeof CELL_WALL | typeof CELL_EMPTY;
  shouldRender: boolean;
  bgColor: number;
}>;
export const hexFactory = Honeycomb.extendHex({
  size: 1,
  // origin: {
  //   x: Honeycomb.extendHex({ size: 1 })().width() / 2,
  //   y: Honeycomb.extendHex({ size: 1 })().height() / 2,
  // },

  type: CELL_WALL as (typeof CELL_WALL | typeof CELL_EMPTY),
  shouldRender: false as boolean,
  bgColor: 0xffffff as number,
});

class Grid {
  public size: number;
  public arr: Honeycomb.Grid<Hex>;

  constructor(context: Context) {
    const radius = GRID_RADIUS + GRID_PADDING;
    const center = hexFactory({ q: radius, r: radius, s: -2 * radius });

    this.size = radius * 2 + 1;
    this.arr = Honeycomb.defineGrid(hexFactory).parallelogram({
      width: this.size,
      height: this.size,
    });

    this.arr.forEach((hex) => {
      const dist = center.distance(hex);

      hex.type = dist <= GRID_RADIUS ? CELL_EMPTY : CELL_WALL;
      hex.shouldRender = dist <= GRID_RADIUS + 1;
      hex.bgColor = { [CELL_WALL]: 0x888888, [CELL_EMPTY]: 0xeeeeee }[hex.type];
    });
  }

  getAtIndex(index: number) {
    return this.arr.get(index)!;
  }

  getAtHex(hex: Hex) {
    return this.getAtIndex(this.getHexIndex(hex));
  }

  getHexIndex(hex: Hex) {
    return hex.q * this.size + hex.r;
  }

  getTowards(
    index: number,
    offsetX: number,
    offsetY: number,
    maxDistance: number,
  ) {
    const start = this.arr[index].nudge();
    const end = hexFactory(start.x + offsetX, start.y + offsetY).nudge();

    const distance = start.distance(end);
    const numSteps = Math.min(distance, maxDistance);
    console.log(numSteps);
    const step = 1.0 / Math.max(distance, 1);

    for (let i = 1; i < numSteps; i++) {
      const res = this.getAtHex(start.lerp(end, step * i).round());
      if (res.type === CELL_WALL) {
        return res;
      }
    }
    return this.getAtHex(start.lerp(end, step * numSteps).round());
  }
}

export default Grid;
