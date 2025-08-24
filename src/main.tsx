import ReactDOM from "react-dom/client";
import ToolBar from "./content/toolBar";
import Workspace from "./content/workspace";
import { CanvasProvider } from "./content/draw/Context";
import Draggable from "./content/draggable";
import PropertyPanel from "./content/propertyPanel";
import { useEffect, useState } from "react";

const PROPERTY_PANEL_WIDTH = 250;
const TOOLBAR_DEFAULT_BOTTOM_MARGIN = 80;
const TOOLBAR_POSITION_KEY = "toolbar-position";

const App = () => {
    const [propertyLeft, setPropertyLeft] = useState(0);
    const [toolbarLeft, setToolbarLeft] = useState(0);

    useEffect(() => {
        setPropertyLeft(window.innerWidth - PROPERTY_PANEL_WIDTH);
        const toolbarWidth = 600;
        setToolbarLeft(Math.max(0, (window.innerWidth - toolbarWidth) / 2));
        const handleResize = () => {
            setPropertyLeft(window.innerWidth - PROPERTY_PANEL_WIDTH);
            const toolbarWidth = 600;
            setToolbarLeft(Math.max(0, (window.innerWidth - toolbarWidth) / 2));
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <div className="extension-root-container">
            <CanvasProvider>
                <Draggable left={toolbarLeft} top={window.innerHeight - TOOLBAR_DEFAULT_BOTTOM_MARGIN} persistKey={TOOLBAR_POSITION_KEY}>
                    <ToolBar />
                </Draggable>
                <Workspace />
                {propertyLeft && (
                    <Draggable left={propertyLeft} top={20}>
                        <PropertyPanel />
                    </Draggable>
                )}
            </CanvasProvider>
        </div>
    );
};

const rootElement = document.getElementById("root");
if (rootElement) {
    ReactDOM.createRoot(rootElement).render(<App />);
}
