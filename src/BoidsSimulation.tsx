import { MAX_LOOK_DISTANCE } from './config';

import Context from './Context';
import Grid, { CELL_EMPTY } from './Grid';
import Boid from './Boid';

const shuffleInPlace = <T,>(array: T[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
};

class BoidsSimulation {
  private context: Context;

  public boids: Boid[] = [];
  private luts: (Boid | undefined)[][] = [];

  constructor(context: Context) {
    this.context = context;

    this.boids.push(
      new Boid(
        {
          COLOR: ['vec3', 1, 0, 0],
          LOOK_AT: [
            'clamp_to_cell',
            [
              'if',
              'SAW_BOID',
              ['sub', ['add', 'LOOK_AT', 'SAW_MOVEMENT'], 'MOVED_MOVED'],
              [
                'add',
                ['mul', 'LOOK_AT', ['vec2', 0.9, 0.9]],
                ['random_vec2', 0, 2],
              ],
            ],
          ],
          MOVE_TOWARDS: 'LOOK_AT',
        },
        this.context.get(Grid).arr.length >> 1,
      ),
    );
  }

  tick() {
    const grid = this.context.get(Grid);
    const lut = new Array(grid.arr.length);

    const rejectMove = (b: Boid) => {
      // b.index = b.prevIndex;
      // if (lut[b.index]) {
      //   rejectMove(lut[b.index]);
      // }
    };

    shuffleInPlace(this.boids);
    this.boids.forEach((b) => {
      b.brain.tick();

      b.lookedAt = grid.getTowards(
        b.gridIndex,
        b.brain.io.LOOK_AT[0],
        b.brain.io.LOOK_AT[1],
        MAX_LOOK_DISTANCE,
      );

      b.prevHex = grid.getAtIndex(b.gridIndex);
      const candidateMove = grid.getTowards(
        b.gridIndex,
        b.brain.io.MOVE_TOWARDS[0],
        b.brain.io.MOVE_TOWARDS[1],
        1,
      );
      if (candidateMove.type === CELL_EMPTY) {
        b.gridIndex = grid.getHexIndex(candidateMove);
      }

      // SAW_EMPTY: 0,
      // SAW_OBSCURED: 0,
      // SAW_FOOD: 0,
      // SAW_WALL: 0,
      // SAW_BOID: 0,
      // SAW_MOVEMENT: [0, 0],
      // SAW_COLOR: [0, 0, 0],
      // FELT_EMPTY: 0,
      // FELT_FOOD: 0,
      // FELT_WALL: 0,
      // FELT_BOID: 0,
      // FELT_MOVEMENT: [0, 0],
      // MOVED_MOVED: [0, 0],
      // MOVED_BLOCKED: 0,

      // // Output
      // COLOR: [0, 0, 0],
      // LOOK_AT: [0, 0],
      // FEEL_TOWARDS: [0, 0],
      // MOVE_TOWARDS: [0, 0],
    });

    this.luts.unshift(lut);
    if (this.luts.length > 3) {
      this.luts.length = 3;
    }
  }
}

export default BoidsSimulation;
