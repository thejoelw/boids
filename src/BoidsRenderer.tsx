import * as PIXI from 'pixi.js';
import * as Honeycomb from 'honeycomb-grid';

import { TICK_INTERVAL_MS } from './config';

import Context from './Context';
import Boid from './Boid';
import Grid, { Hex, hexFactory } from './Grid';
import BoidsSimulation from './BoidsSimulation';
import CameraController from './CameraController';

class BoidsRenderer {
  private context: Context;

  public app: PIXI.Application;

  constructor(context: Context) {
    this.context = context;

    this.app = new PIXI.Application({
      transparent: true,
      antialias: true,
    });

    const gridGfx = this.renderGrid();
    this.show(gridGfx);

    let boidsGfx: PIXI.Graphics | undefined;
    let nextTick = Date.now();
    this.app.ticker.add((delta) => {
      if (nextTick < Date.now()) {
        if (boidsGfx) {
          this.hide(boidsGfx);
        }

        do {
          this.context.get(BoidsSimulation).tick();
          nextTick += TICK_INTERVAL_MS;
        } while (nextTick < Date.now());

        boidsGfx = this.renderBoids();
        this.show(boidsGfx);
      }

      context.get(CameraController).tick();
    });
  }

  renderGrid() {
    const grid = this.context.get(Grid);

    const gfx = new PIXI.Graphics();
    gfx.lineStyle(0.1, 0x222222, 1);

    grid.arr.forEach((hex) => {
      if (!hex.shouldRender) {
        return;
      }

      const point = hex.toPoint();
      this.drawHex(gfx, hex, hex.bgColor, 1);
    });

    return gfx;
  }

  renderBoids() {
    const grid = this.context.get(Grid);
    const boids = this.context.get(BoidsSimulation).boids;

    const gfx = new PIXI.Graphics();
    gfx.lineStyle(0.1, 0x222222, 1);

    boids.forEach((b) => {
      const color = b.getColor();
      this.drawHex(gfx, b.hex, color, 1);

      const start = b.hex.toPoint().add(b.hex.center());
      const end = b.hex
        .add({ x: b.brain.io.LOOK_AT[0], y: b.brain.io.LOOK_AT[1] })
        .toPoint()
        .add(b.hex.center());
      gfx.moveTo(start.x, start.y);
      gfx.lineTo(end.x, end.y);

      if (b.lookedAt) {
        this.drawHex(gfx, b.lookedAt, color, 0.2);
      }
    });

    return gfx;
  }

  drawHex(gfx: PIXI.Graphics, hex: Hex, color: number, opacity: number) {
    const point = hex.toPoint();
    const corners = hex
      .corners()
      .map((corner: Honeycomb.Point) => corner.add(point));
    const [firstCorner, ...otherCorners] = corners;

    gfx.beginFill(color, opacity);
    gfx.moveTo(firstCorner.x, firstCorner.y);
    otherCorners.forEach(({ x, y }: Honeycomb.Point) => gfx.lineTo(x, y));
    gfx.lineTo(firstCorner.x, firstCorner.y);
    gfx.endFill();
  }

  show(gfx: PIXI.Graphics) {
    this.app.stage.addChild(gfx);
  }

  hide(gfx: PIXI.Graphics) {
    this.app.stage.removeChild(gfx);
  }

  getView() {
    return this.app.view;
  }

  setSize(width: number, height: number) {
    this.app.renderer.resize(width, height);
  }
}

export default BoidsRenderer;
