import { createRef, useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import ToolBar from './toolBar';
import Workspace from './workspace';
import { CanvasProvider } from './draw/Context';
import Draggable from './draggable';
import PropertyPanel from './propertyPanel';

const App = () => {
  const [properyLeft, setProperyLeft] = useState(0);

  useEffect(() => {
    setProperyLeft(window.innerWidth - 250);
  }, []);

  return (
    <div className='extension-root-container'>
      <CanvasProvider>
          <Draggable left={20} top={20}>
            <ToolBar />
          </Draggable>
          <Workspace />
          {properyLeft && <Draggable left={properyLeft} top={20}>
            <PropertyPanel />
          </Draggable>}
      </CanvasProvider>
    </div>
  );
};

export function createContentScriptApp(rootDiv: HTMLElement) {
  const contentScriptRef = createRef<any>();
  const root = ReactDOM.createRoot(rootDiv);
  root.render(
    <App />
  );
  // @ts-ignore
  // window._draw_app.rootContainer.appendChild(div);
  return {
    ref: contentScriptRef,
    remove: () => {
      root.unmount();
      // @ts-ignore
      window._draw_app.rootContainer.removeChild(rootDiv);
    },
  };
}
