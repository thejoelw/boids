import { LOOK_DISTANCE } from './config';

import Context from './Context';
import Grid, { Hex, CELL_EMPTY, CELL_WALL } from './Grid';
import Boid from './Boid';

const assert = (cond: boolean) => {
  if (!cond) {
    throw new Error(`Assertion failed!`);
  }
};

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

    const makeRandomIndex = () =>
      Math.floor(Math.random() * this.context.get(Grid).arr.length);

    for (let i = 0; i < 20; i++) {
      this.addBoid(
        new Boid(
          'plant',
          {
            COLOR: ['vec3', 0, 1, 0],
            LOOK_AT: [
              'switch',
              'SAW_ITEM',
              {
                ITEM_BOID: [
                  'if',
                  ['eq', 'SAW_OFFSET', ['vec2', 0, 0]],
                  ['random_vec2', 4],
                  [
                    'sub',
                    ['add', 'SAW_OFFSET', 'SAW_MOVEMENT'],
                    'MOVED_MOVEMENT',
                  ],
                ],
                default: ['random_vec2', 4],
              },
            ],
            MOVE_TOWARDS: ['vec2', 0, 0],
          },
          this.context.get(Grid).getAtIndex(makeRandomIndex()),
        ),
      );
    }

    this.addBoid(
      new Boid(
        'herbivore',
        {
          COLOR: ['vec3', 1, 0, 0],
          LOOK_AT: [
            'clamp_to_cell',
            [
              'switch',
              'SAW_ITEM',
              {
                ITEM_EMPTY: [
                  'add',
                  ['mul', 'LOOK_AT', ['vec2', 0.9, 0.9]],
                  ['random_vec2', 2],
                ],
                ITEM_BOID: [
                  'if',
                  ['eq', 'SAW_OFFSET', ['vec2', 0, 0]],
                  [
                    'add',
                    ['mul', 'LOOK_AT', ['vec2', 0.9, 0.9]],
                    ['random_vec2', 2],
                  ],
                  [
                    'sub',
                    ['add', 'SAW_OFFSET', 'SAW_MOVEMENT'],
                    'MOVED_MOVEMENT',
                  ],
                ],
                default: ['vec2', 0, 0],
              },
            ],
          ],
          MOVE_TOWARDS: 'LOOK_AT',
        },
        this.context.get(Grid).getAtIndex(makeRandomIndex()),
      ),
    );
  }

  addBoid(b: Boid) {
    if (b.hex.boid === undefined && b.hex.type === CELL_EMPTY) {
      b.hex.boid = b;
      this.boids.push(b);
    }
  }

  tick() {
    const grid = this.context.get(Grid);

    const obstruction = {} as Boid;
    const obstructedHexes: Hex[] = [];

    this.boids.forEach((b) => {
      assert(b.hex.boid === b);
      b.hex.boid = undefined;
    });

    this.boids.forEach((b) => {
      b.prevHex = b.hex;
    });

    const rollbackBoid = (b: Boid) => {
      if (b.hex !== b.prevHex) {
        if (b.prevHex.boid) {
          rollbackBoid(b.prevHex.boid);
        }
        b.hex = b.prevHex;
      }

      b.prevHex.boid = b;
    };

    this.boids.forEach((b) => {
      if (
        isFinite(b.brain.io.MOVE_TOWARDS[0]) &&
        isFinite(b.brain.io.MOVE_TOWARDS[1])
      ) {
        const moveTo = grid.getTowards(
          b.hex,
          b.brain.io.MOVE_TOWARDS[0],
          b.brain.io.MOVE_TOWARDS[1],
          1,
        );

        if (moveTo.hex === b.hex) {
          b.restingTicks++;
        } else {
          b.restingTicks = 0;
        }

        if (moveTo.hex.type === CELL_WALL) {
          rollbackBoid(b);
        } else if (moveTo.hex.boid) {
          if (moveTo.hex.boid !== obstruction) {
            rollbackBoid(moveTo.hex.boid);

            moveTo.hex.boid = obstruction;
            obstructedHexes.push(moveTo.hex);
          }

          rollbackBoid(b);
        } else {
          moveTo.hex.boid = b;
          b.hex = moveTo.hex;
        }
      } else {
        rollbackBoid(b);
      }
    });

    this.boids.forEach((b) => b.brain.tick());

    // This could also perhaps be at the beginning
    this.boids.forEach((b) => {
      if (isFinite(b.brain.io.LOOK_AT[0]) && isFinite(b.brain.io.LOOK_AT[1])) {
        const las =
          LOOK_DISTANCE /
          Math.sqrt(
            b.brain.io.LOOK_AT[0] * b.brain.io.LOOK_AT[0] +
              b.brain.io.LOOK_AT[1] * b.brain.io.LOOK_AT[1],
          );

        const lookRes = grid.getTowards(
          b.hex,
          b.brain.io.LOOK_AT[0] * las,
          b.brain.io.LOOK_AT[1] * las,
          Infinity,
        );
        b.lookedAt = lookRes.hex;

        b.brain.io.SAW_OBJECT = lookRes.hitObject;
        b.brain.io.SAW_OFFSET = [
          lookRes.hex.x - lookRes.start.x,
          lookRes.hex.y - lookRes.start.y,
        ];

        if (lookRes.hex.type === CELL_WALL) {
          b.brain.io.SAW_ITEM = 'ITEM_WALL';
        } else if (lookRes.hex.boid) {
          b.brain.io.SAW_ITEM = 'ITEM_BOID';
          b.brain.io.SAW_COLOR = [...lookRes.hex.boid.brain.io.COLOR];
          b.brain.io.SAW_MOVEMENT = [...lookRes.hex.boid.brain.io.MOVE_TOWARDS];
        } else if (lookRes.hex.food) {
          b.brain.io.SAW_ITEM = 'ITEM_FOOD';
          b.brain.io.SAW_FOOD = lookRes.hex.food;
        } else {
          b.brain.io.SAW_ITEM = 'ITEM_EMPTY';
        }
      }
    });

    obstructedHexes.forEach((hex) => (hex.boid = undefined));
  }
}

export default BoidsSimulation;
