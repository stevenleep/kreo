import React, { useCallback, useContext, useRef, useState } from "react";
import styles from "./index.module.less";
import { Context, defaultPenProperty } from "../draw/Context";
import { DrawType } from "./config";
import { getRGBA } from "../propertyPanel/utils";
import { captureFullPage } from "./utils";
import {
    MousePointer2,
    Pencil,
    Type,
    Square,
    Circle,
    Minus,
    Triangle,
    Undo2,
    Redo2,
    Trash2,
    FolderOpen,
    Download,
    Image,
    ChevronDown,
    GripVertical,
} from "lucide-react";

const DROPDOWN_HIDE_DELAY = 200; // dropdown hide delay (ms)

const ToolBar = () => {
    const { workspace, canvas, drawMode, setState, penProperty, historyUndoNum, historyRedoNum } = useContext(Context);
    const [selectAble, setSelectAble] = useState(false);
    const [hide, setHide] = useState(false);
    const [showShapeDropdown, setShowShapeDropdown] = useState(false);
    const [dropdownDirection, setDropdownDirection] = useState<"down" | "up">("down");

    const checkDropdownDirection = () => {
        if (!shapeGroupRef.current) {
            return;
        }
        const rect = shapeGroupRef.current.getBoundingClientRect();
        const dropdownHeight = 150; // approximate dropdown height
        const bottomSpace = window.innerHeight - rect.bottom;
        setDropdownDirection(bottomSpace < dropdownHeight ? "up" : "down");
    };
    const uploadRef = useRef<HTMLInputElement>(null);
    const shapeGroupRef = useRef<HTMLDivElement>(null);
    const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const stop = () => {
        if (!workspace) {
            return;
        }
        setState({ drawMode: "" });
        workspace.drawTool.deactive();
    };

    const drawPenceil = () => {
        if (workspace?.drawTool.drawMode) {
            workspace?.drawTool.deactive();
        }
        if (drawMode === DrawType.pencil) {
            setState({ drawMode: "" });
            if (canvas) {
                canvas.isDrawingMode = false;
            }
        } else {
            setState({ drawMode: DrawType.pencil });
            if (canvas) {
                canvas.isDrawingMode = true;
                canvas.freeDrawingBrush.width = penProperty.strokeWidth;
                canvas.freeDrawingBrush.color = getRGBA(penProperty.color, penProperty.alpha);
            }
        }
    };

    const draw = useCallback(
        (type: DrawType) => {
            if (!workspace) {
                return;
            }

            if (drawMode === type) {
                stop();
            } else {
                workspace.drawTool.active(type);
                setState({ drawMode: type });
                if (canvas) {
                    canvas.isDrawingMode = false;
                }
            }
        },
        [workspace, drawMode],
    );

    const handlerDraw = (type: DrawType) => {
        if (selectAble) {
            handlerChangeSelectable();
        } else {
            const shapeList = canvas?.getObjects() || [];
            shapeList.forEach((shape) => {
                shape.selectable = false;
                shape.evented = false;
            });
        }

        if (!workspace || !canvas) {
            return;
        }
        workspace.drawTool.setPen(defaultPenProperty);
        canvas.discardActiveObject();
        canvas.renderAll();
        setState({ selectShape: null });
        if (type === DrawType.pencil) {
            drawPenceil();
        } else {
            draw(type);
        }
    };

    const handleShapeGroupEnter = () => {
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
            hoverTimeoutRef.current = null;
        }
        checkDropdownDirection();
        setShowShapeDropdown(true);
    };

    const handleShapeGroupLeave = () => {
        hoverTimeoutRef.current = setTimeout(() => {
            setShowShapeDropdown(false);
        }, DROPDOWN_HIDE_DELAY);
    };

    const handleDropdownEnter = () => {
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
            hoverTimeoutRef.current = null;
        }
    };

    const handleDropdownLeave = () => {
        hoverTimeoutRef.current = setTimeout(() => {
            setShowShapeDropdown(false);
        }, DROPDOWN_HIDE_DELAY);
    };

    const handlerClear = () => {
        if (workspace) {
            workspace.clearAllObject();
        }
    };

    const handlerExport = async () => {
        if (canvas) {
            setHide(true);
            const dataURL = await captureFullPage();
            setHide(false);
            if (typeof dataURL === "string" && dataURL) {
                const link = document.createElement("a");
                link.href = dataURL;
                link.download = "canvas.png";
                link.click();
            }
        }
    };

    const handlerUpload = () => {
        if (uploadRef.current) {
            uploadRef.current.click();
        }
    };

    const handlerExportJson = () => {
        if (!canvas) {
            return;
        }
        const json = JSON.stringify(canvas.toJSON());
        const blob = new Blob([json], { type: "application/json" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "canvas.json";
        link.click();
    };

    const handlerUndo = () => {
        stop();
        setState({
            selectShape: null,
        });
        canvas?.historyPlugin?.undo();
    };

    const handlerRedo = () => {
        stop();
        setState({
            selectShape: null,
        });
        canvas?.historyPlugin?.redo();
    };

    const handlerChangeSelectable = () => {
        workspace?.drawTool.deactive();
        if (selectAble) {
            setState({ drawMode: "", selectShape: null });
            canvas?.discardActiveObject();
            canvas?.renderAll();
        } else {
            setState({ drawMode: "select" });
        }
        if (canvas) {
            const shapeList = canvas?.getObjects();
            shapeList.forEach((shape) => {
                shape.selectable = !selectAble;
                shape.evented = !selectAble;
            });
            setSelectAble(!selectAble);
        }
    };

    const handlerFileChange = (e: any) => {
        const file = e.target.files[0];
        if (!file) {
            return;
        }

        const reader = new FileReader();
        reader.onload = (evt) => {
            if (!evt.target) {
                return;
            }
            try {
                const json = JSON.parse(typeof evt.target.result === "string" ? evt.target.result : "");
                canvas?.clear();
                canvas?.loadFromJSON(json, () => {
                    canvas.renderAll();
                    canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
                });
            } catch {
                // ignore parse error
            }
        };
        reader.readAsText(file);
    };

    const selectGroup = () => {
        if (!drawMode) {
            return false;
        }
        return [DrawType.rect, DrawType.circle, DrawType.ellipse, DrawType.polyLine, DrawType.triangle].includes(drawMode as DrawType);
    };

    return (
        <div className={`${styles.tool_bar} ${hide ? styles.hide : ""}`}>
            <input onChange={handlerFileChange} type="file" ref={uploadRef} className={styles.import_btn} accept=".json" />

            <div className={styles.drag_handle}>
                <GripVertical size={16} />
            </div>
            <div className={styles.toolbar_group}>
                <button className={`${styles.tool_btn} ${selectAble ? styles.active : ""}`} title="选择工具 (V)" onClick={handlerChangeSelectable}>
                    <MousePointer2 size={16} />
                </button>
                <button
                    className={`${styles.tool_btn} ${DrawType.pencil === drawMode ? styles.active : ""}`}
                    title="画笔工具 (P)"
                    onClick={() => handlerDraw(DrawType.pencil)}
                >
                    <Pencil size={16} />
                </button>
                <button
                    className={`${styles.tool_btn} ${DrawType.text === drawMode ? styles.active : ""}`}
                    title="文字工具 (T)"
                    onClick={() => handlerDraw(DrawType.text)}
                >
                    <Type size={16} />
                </button>
            </div>

            <div className={styles.divider}></div>

            <div
                className={`${styles.toolbar_group} ${styles.shape_group}`}
                ref={shapeGroupRef}
                onMouseEnter={handleShapeGroupEnter}
                onMouseLeave={handleShapeGroupLeave}
            >
                <button className={`${styles.tool_btn} ${selectGroup() ? styles.active : ""}`} title="形状工具 (S)">
                    <Square size={16} />
                    <ChevronDown className={styles.dropdown_arrow} size={8} />
                </button>
                <div
                    className={`${styles.shape_dropdown} ${showShapeDropdown ? styles.show : ""} ${dropdownDirection === "up" ? styles.up : ""}`}
                    onMouseEnter={handleDropdownEnter}
                    onMouseLeave={handleDropdownLeave}
                >
                    <button
                        className={`${styles.tool_btn} ${DrawType.rect === drawMode ? styles.active : ""}`}
                        title="矩形 (R)"
                        onClick={() => handlerDraw(DrawType.rect)}
                    >
                        <Square size={16} />
                    </button>
                    <button
                        className={`${styles.tool_btn} ${DrawType.circle === drawMode ? styles.active : ""}`}
                        title="圆 (O)"
                        onClick={() => handlerDraw(DrawType.circle)}
                    >
                        <Circle size={16} />
                    </button>
                    <button
                        className={`${styles.tool_btn} ${DrawType.ellipse === drawMode ? styles.active : ""}`}
                        title="椭圆 (E)"
                        onClick={() => handlerDraw(DrawType.ellipse)}
                    >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <ellipse cx="8" cy="8" rx="6" ry="4" />
                        </svg>
                    </button>
                    <button
                        className={`${styles.tool_btn} ${DrawType.polyLine === drawMode ? styles.active : ""}`}
                        title="直线 (L)"
                        onClick={() => handlerDraw(DrawType.polyLine)}
                    >
                        <Minus size={16} />
                    </button>
                    <button
                        className={`${styles.tool_btn} ${DrawType.triangle === drawMode ? styles.active : ""}`}
                        title="三角形 (T)"
                        onClick={() => handlerDraw(DrawType.triangle)}
                    >
                        <Triangle size={16} />
                    </button>
                </div>
            </div>

            <div className={styles.divider}></div>

            <div className={styles.toolbar_group}>
                <button className={`${styles.tool_btn} ${historyUndoNum === 0 ? styles.disable : ""}`} title="撤销 (Ctrl+Z)" onClick={handlerUndo}>
                    <Undo2 size={16} />
                </button>
                <button className={`${styles.tool_btn} ${historyRedoNum === 0 ? styles.disable : ""}`} title="重做 (Ctrl+Y)" onClick={handlerRedo}>
                    <Redo2 size={16} />
                </button>
                <button className={styles.tool_btn} title="清空画布" onClick={handlerClear}>
                    <Trash2 size={16} />
                </button>
            </div>

            <div className={styles.divider}></div>

            <div className={styles.toolbar_group}>
                <button className={styles.tool_btn} title="导入文件" onClick={handlerUpload}>
                    <FolderOpen size={16} />
                </button>
                <button className={styles.tool_btn} title="导出JSON" onClick={handlerExportJson}>
                    <Download size={16} />
                </button>
                <button className={styles.tool_btn} title="导出图片" onClick={handlerExport}>
                    <Image size={16} />
                </button>
            </div>
        </div>
    );
};

export default ToolBar;
