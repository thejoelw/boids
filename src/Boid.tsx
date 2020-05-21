import { Hex } from './Grid';
import BoidBrain, { BoidDefnNode } from './BoidBrain';

class Boid {
  public brain: BoidBrain;

  public gridIndex: number;

  public prevHex: Hex | undefined;
  public lookedAt: Hex | undefined;

  constructor(defn: BoidDefnNode, gridIndex: number) {
    this.brain = new BoidBrain(defn);
    this.gridIndex = gridIndex;
  }

  getColor() {
    let [r, g, b] = this.brain.io.COLOR;

    r = Math.max(0, Math.min(255, Math.floor(r * 256)));
    g = Math.max(0, Math.min(255, Math.floor(g * 256)));
    b = Math.max(0, Math.min(255, Math.floor(b * 256)));

    return (r << 16) | (g << 8) | (b << 0);
  }
}

export default Boid;
