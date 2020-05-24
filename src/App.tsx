import React from 'react';

import Context from './Context';
import SceneContainer from './SceneContainer';
import BoidsSimulation from './BoidsSimulation';
import { Hex, CELL_EMPTY, CELL_WALL } from './Grid';
import Boid from './Boid';
import CameraController from './CameraController';

let targSteps = 0.0;
const context = new Context();

const Divider = () => (
  <hr
    style={{
      boxShadow: 'silver 0px 0px 2px 1px',
      border: 'none',
      margin: '16px 8px',
    }}
  />
);

const App = () => {
  const stepsRef = React.useRef(0);
  const [steps, setSteps] = React.useState(0);
  const [playing, setPlaying] = React.useState(false);
  const [speed, setSpeed] = React.useState(1);
  const [selected, setSelected] = React.useState<Hex | Boid | undefined>(
    undefined,
  );
  const hex = selected instanceof Boid ? selected.hex : selected;

  React.useEffect(() => {
    if (playing) {
      const time = Math.max(0.01, 1 / speed);
      const iv = setInterval(() => {
        targSteps += time * speed;
        while (stepsRef.current < targSteps) {
          context.get(BoidsSimulation).tick();
          stepsRef.current += 1;
        }
        setSteps(stepsRef.current);
      }, 1000 * time);
      return () => clearInterval(iv);
    }
  }, [playing, speed]);

  React.useEffect(() => {
    context.get(CameraController).onSelect(setSelected);
    return () => context.get(CameraController).offSelect(setSelected);
  }, []);

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex' }}>
      <SceneContainer context={context} />
      <div
        style={{
          width: '250px',
          backgroundColor: '#eeeeee',
          boxShadow: '0 0 8px 0 gray',
          zIndex: 2,
          padding: '8px',
          overflow: 'scroll',
          whiteSpace: 'nowrap',
        }}
      >
        <strong>Steps:</strong> {steps}
        <Divider />
        <div style={{ display: 'flex' }}>
          <button style={{ flex: 1 }} onClick={() => setPlaying(!playing)}>
            {playing ? 'Pause' : 'Play'}
          </button>
          <button
            style={{ flex: 1 }}
            onClick={() => {
              context.get(BoidsSimulation).tick();
              stepsRef.current += 1;
              setSteps(stepsRef.current);
            }}
          >
            Step
          </button>
        </div>
        <div style={{ display: 'flex' }}>
          <button
            style={{ flex: 1 }}
            onClick={() => setSpeed(1)}
            disabled={speed === 1}
          >
            1x
          </button>
          <button
            style={{ flex: 1 }}
            onClick={() => setSpeed(4)}
            disabled={speed === 4}
          >
            4x
          </button>
          <button
            style={{ flex: 1 }}
            onClick={() => setSpeed(16)}
            disabled={speed === 16}
          >
            16x
          </button>
        </div>
        <div style={{ display: 'flex' }}>
          <button
            style={{ flex: 1 }}
            onClick={() => setSpeed(64)}
            disabled={speed === 64}
          >
            64x
          </button>
          <button
            style={{ flex: 1 }}
            onClick={() => setSpeed(256)}
            disabled={speed === 256}
          >
            256x
          </button>
          <button
            style={{ flex: 1 }}
            onClick={() => setSpeed(1024)}
            disabled={speed === 1024}
          >
            1024x
          </button>
        </div>
        <Divider />
        {hex && (
          <div>
            <div>
              <strong>(q,r,s)</strong>
              {': '}
              {`(${hex.q},${hex.r},${hex.s})`}
            </div>
            <div>
              <strong>type</strong>
              {': '}
              {
                { [CELL_EMPTY]: 'CELL_EMPTY', [CELL_WALL]: 'CELL_WALL' }[
                  hex.type
                ]
              }
            </div>
            {hex.boid && (
              <>
                <Divider />
                {Object.entries(hex.boid.brain.io).map(([k, v]) =>
                  typeof v === 'number' ? (
                    <div key={k}>
                      <strong>{k}</strong>
                      {': '}
                      {v}
                    </div>
                  ) : typeof v === 'string' ? (
                    <div key={k}>
                      <strong>{k}</strong>
                      {': '}
                      {v}
                    </div>
                  ) : typeof v === 'boolean' ? (
                    <div key={k}>
                      <strong>{k}</strong>
                      {': '}
                      {v ? 'true' : 'false'}
                    </div>
                  ) : Array.isArray(v) ? (
                    <div key={k}>
                      <strong>{k}</strong>
                      {': '}
                      {v.join(',')}
                    </div>
                  ) : null,
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
