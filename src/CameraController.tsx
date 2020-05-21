import * as PIXI from 'pixi.js';

import Context from './Context';
import BoidsRenderer from './BoidsRenderer';

class CameraController {
  private context: Context;

  private keys: { [key: string]: boolean } = {};

  private scale: number = 10.0;
  private dx: number = 0.0;
  private dy: number = 0.0;

  constructor(context: Context) {
    this.context = context;

    window.addEventListener('keydown', (e) => (this.keys[e.key] = true), false);
    window.addEventListener('keyup', (e) => (this.keys[e.key] = false), false);
  }

  tick() {
    if (this.keys.ArrowLeft) {
      this.dx += 8.0;
    }
    if (this.keys.ArrowRight) {
      this.dx -= 8.0;
    }
    if (this.keys.ArrowUp) {
      this.dy += 8.0;
    }
    if (this.keys.ArrowDown) {
      this.dy -= 8.0;
    }

    const stage = this.context.get(BoidsRenderer).app.stage;
    stage.x = this.dx;
    stage.y = this.dy;

    stage.scale.set(this.scale, this.scale);
  }
}

export default CameraController;
