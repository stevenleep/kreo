import ReactDOM from "react-dom/client";
import ToolBar from "./content/toolBar";
import Workspace from "./content/workspace";
import { CanvasProvider } from "./content/draw/Context";
import Draggable from "./content/draggable";
import PropertyPanel from "./content/propertyPanel";
import { useEffect, useState } from "react";

const PROPERTY_PANEL_WIDTH = 250;

const App = () => {
    const [propertyLeft, setPropertyLeft] = useState(0);

    useEffect(() => {
        // 属性面板位置
        setPropertyLeft(window.innerWidth - PROPERTY_PANEL_WIDTH);

        // 监听窗口大小变化
        const handleResize = () => {
            setPropertyLeft(window.innerWidth - PROPERTY_PANEL_WIDTH);
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <div className="extension-root-container">
            <CanvasProvider>
                <ToolBar />
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
