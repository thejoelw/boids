import React from 'react';

import Context from './Context';
import BoidsRenderer from './BoidsRenderer';

const SceneContainer = ({ context }: { context: Context }) => {
  const containerRef = React.useCallback((node) => {
    const view = context.get(BoidsRenderer).getView();

    view.parentNode && view.parentNode.removeChild(view);

    if (node !== null) {
      const { width, height } = node.getBoundingClientRect();
      context.get(BoidsRenderer).setSize(width, height);
      node.appendChild(view);
    }
  }, []);

  return <div style={{ flex: 1, overflow: 'hidden' }} ref={containerRef}></div>;
};

export default SceneContainer;
