import { ContextCanvas } from "./Context";
import EditorWorkspace from "./EditorWorkspace";

/**
 * 画布历史管理
 */
class History {
    MAX_LEN = 50; // 存储最大数量
    canvas: ContextCanvas;
    workspace: EditorWorkspace;
    historyIndex = -1;
    historyList: Array<any> = [];
    loading = false;
    bindEvent = false;
    setState: any;

    constructor(canvas: ContextCanvas, workspace: EditorWorkspace, setState: any) {
        this.canvas = canvas;
        this.canvas.historyPlugin = this;
        this.workspace = workspace;
        this.setState = setState;
        this.initHistory();
    }
    watchHistory = () => {
        if (this.bindEvent) {
            // this.canvas.off('object:added', this.pushHistory);
            this.canvas.off("object:removed", this.pushHistory);
            this.canvas.off("object:modified", this.pushHistory);
        }
        this.bindEvent = true;
        // this.canvas.on('object:added', this.pushHistory);
        this.canvas.on("object:removed", this.pushHistory);
        this.canvas.on("object:modified", this.pushHistory);
    };
    pushHistory = (e?: any) => {
        if (this.loading) return;
        const canvasData = this.workspace.getJson();
        Promise.resolve().then(() => {
            this.setState((prev: any) => {
                if (this.historyList.length - 1 >= this.MAX_LEN) {
                    this.historyList.shift();
                }
                const push = () => {
                    const activeObject = this.canvas.getActiveObject() as any;
                    this.historyList.push({
                        canvasData,
                        boothData: { ...prev.boothData },
                        activeObjectId: activeObject ? activeObject.id : "",
                    });
                };
                if (this.historyIndex === this.historyList.length - 1) {
                    push();
                    this.historyIndex++;
                    prev.historyUndoNum = this.historyList.length - 1;
                    prev.historyRedoNum = 0;
                } else {
                    this.historyList = this.historyList.slice(0, this.historyIndex + 1);
                    push();
                    this.historyIndex = this.historyList.length - 1;
                    prev.historyUndoNum = this.historyList.length - 1;
                    prev.historyRedoNum = 0;
                }
                return prev;
            });
        });
    };
    loadFromJSON = (index: number) => {
        const { canvasData, activeObjectId } = this.historyList[index] || {};
        if (this.loading || !canvasData) return;
        this.loading = true;
        this.canvas.loadFromJSON(canvasData, () => {
            this.canvas.getObjects().forEach((item: any) => {
                // 恢复选中元素
                if (activeObjectId && item.id === activeObjectId) {
                    this.canvas.setActiveObject(item);
                }
                item.selectable = true;
                item.hasControls = true;
                item.hoverCursor = "move";
            });
            this.historyIndex = index;
            this.canvas.renderAll();
            this.loading = false;
            this.setState((prev: any) => {
                return {
                    ...prev,
                    historyUndoNum: this.historyList.slice(0, this.historyIndex).length,
                    historyRedoNum: this.historyList.slice(this.historyIndex).length - 1,
                };
            });
        });
    };
    // 撤回
    undo = () => {
        this.loadFromJSON(this.historyIndex - 1);
    };
    // 还原
    redo = () => {
        this.loadFromJSON(this.historyIndex + 1);
    };
    initHistory = () => {
        setTimeout(() => {
            this.historyIndex = -1;
            this.historyList = [];
            this.pushHistory();
            this.watchHistory();
        });
    };
}

export default History;
