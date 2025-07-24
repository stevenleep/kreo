import ReactDOM from 'react-dom/client';
import ToolBar from './content/toolBar';
import Workspace from './content/workspace';
import { CanvasProvider } from './content/draw/Context';

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

ReactDOM.createRoot(document.getElementById('root')!).render(
    <App />
);
