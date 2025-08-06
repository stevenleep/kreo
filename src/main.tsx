import ReactDOM from "react-dom/client";
import ToolBar from "./content/toolBar";
import Workspace from "./content/workspace";
import { CanvasProvider } from "./content/draw/Context";
import Draggable from "./content/draggable";
import PropertyPanel from "./content/propertyPanel";
import { useEffect, useState } from "react";

const App = () => {
    const [propertyLeft, setPropertyLeft] = useState(0);

    useEffect(() => {
        setPropertyLeft(window.innerWidth - 250);
    }, []);

    return (
        <div className="extension-root-container">
            <CanvasProvider>
                <Draggable left={20} top={20}>
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
