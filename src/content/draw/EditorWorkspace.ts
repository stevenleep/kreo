import { fabric } from "fabric";
import DrawTool from "./DrawTool.ts";
import { ContextCanvas } from "./Context";

class EditorWorkspace {
    canvas: ContextCanvas;
    workspaceEl: HTMLElement;
    // workspace: fabric.Rect | null;
    width: number | undefined;
    height: number | undefined;
    scale: number | undefined;
    drawTool!: DrawTool;
    // prevSelectObject: fabric.Object | null = null;

    constructor(canvas: ContextCanvas) {
        this.canvas = canvas;
        this.workspaceEl = this.canvas.getElement();
        this.drawTool = new DrawTool(canvas);
        // new ControlsPlugin(canvas);
        this.initBackground();
        this.initResizeObserve();
    }

    // 初始化背景
    initBackground() {
        this.width = this.workspaceEl.offsetWidth;
        this.height = this.workspaceEl.offsetHeight;
        this.canvas.setWidth(this.workspaceEl.offsetWidth);
        this.canvas.setHeight(this.workspaceEl.offsetHeight);
    }

    /**
     * 设置画布中心到指定对象中心点上
     * @param {Object} obj 指定的对象
     */
    setCenterFromObject(obj: fabric.Rect) {
        const { canvas } = this;
        const objCenter = obj.getCenterPoint();
        const viewportTransform = canvas.viewportTransform;
        if (canvas.width === undefined || canvas.height === undefined || !viewportTransform) return;
        viewportTransform[4] = canvas.width / 2 - objCenter.x * viewportTransform[0];
        viewportTransform[5] = canvas.height / 2 - objCenter.y * viewportTransform[3];
        canvas.setViewportTransform(viewportTransform);
        canvas.renderAll();
    }

    // 初始化监听器
    initResizeObserve() {
        // const resizeObserver = new ResizeObserver(
        //     throttle(() => {
        //         this.auto();
        //     }, 50)
        // );
        // resizeObserver.observe(this.workspaceEl);
    }

    isNumber = (value: string | number) => {
        return typeof value === "number";
    };

    getJson() {
        return this.canvas.toJSON();
    }

    // 清空全部对象
    clearAllObject() {
        this.canvas.getObjects().forEach((item: fabric.Object) => {
            this.canvas.remove(item);
        });
        return this.canvas;
    }
}

export default EditorWorkspace;
