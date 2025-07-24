import { createRef } from 'react';
import ReactDOM from 'react-dom/client';
import ToolBar from './toolBar';
import Workspace from './workspace';
import { CanvasProvider } from './draw/Context';
// import Panel from './panel';
// import btn_img from '../../public/images/app.jpg';

// export interface ShowMessageConfig {
//   type: 'error' | 'success';
//   text: string;
//   link?: {
//     text: string;
//     href: string;
//   };
// }

const App = () => {
  return (
    <div className='extension-root-container'>
      <CanvasProvider>
          <ToolBar />
          <Workspace />
      </CanvasProvider>
    </div>
  );
};

export function createContentScriptApp(rootDiv: HTMLElement) {
  // const div = document.createElement('div');
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
