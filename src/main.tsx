import ReactDOM from 'react-dom/client';
import ToolBar from './content/toolBar';
import Workspace from './content/workspace';
import { CanvasProvider } from './content/draw/Context';
import Draggable from './content/draggable';
import PropertyPanel from './content/propertyPanel';

const App = () => {
  return (
    <div className='extension-root-container'>
      <CanvasProvider>
          <Draggable left={20} top={20}>
            <ToolBar />
          </Draggable>
          <Workspace />
          <Draggable left={150} top={20}>
            <PropertyPanel />
          </Draggable>
      </CanvasProvider>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
    <App />
);
