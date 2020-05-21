import React from 'react';

import Context from './Context';
import BoidsRenderer from './BoidsRenderer';

const App = () => {
  const context = React.useRef<Context | null>(null);
  const getContext = () => {
    if (context.current === null) {
      context.current = new Context();
    }
    return context.current!;
  };

  const containerRef = React.useCallback((node) => {
    const view = getContext()
      .get(BoidsRenderer)
      .getView();

    view.parentNode?.removeChild(view);

    if (node !== null) {
      const { width, height } = node.getBoundingClientRect();
      getContext()
        .get(BoidsRenderer)
        .setSize(width, height);
      node.appendChild(view);
    }
  }, []);

  return (
    <div style={{ width: '100%', height: '100%' }} ref={containerRef}></div>
  );
};

export default App;
