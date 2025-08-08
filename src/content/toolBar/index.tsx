import React, { useCallback, useContext, useRef, useState } from "react";
import styles from "./index.module.less";
import { Context, defaultPenProperty } from "../draw/Context";
import { DrawType } from "./config";
import { getRGBA } from "../propertyPanel/utils";
import { captureFullPage } from "./utils";

const ToolBar = () => {
    const { workspace, canvas, drawMode, setState, penProperty, historyUndoNum, historyRedoNum } = useContext(Context);
    const [selectAble, setSelectAble] = useState(false);
    const [hide, setHide] = useState(false);
    const uploadRef = useRef<HTMLInputElement>(null);

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

        if (!workspace || !canvas) return;
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

    // 清空
    const handlerClear = () => {
        if (workspace) {
            workspace.clearAllObject();
        }
    };

    // 导出图片
    const handlerExport = async () => {
        if (canvas) {
            setHide(true);
            // const base64 = canvas?.toDataURL({
            //     format: "png", // 也可改成 'jpeg'
            //     quality: 0.92, // jpeg 时才生效
            //     multiplier: 1, // 1 = 原尺寸；>1 = 放大（解决高屏模糊）
            // });
            const dataURL = await captureFullPage();
            setHide(false);
            if (typeof dataURL === "string" && dataURL) {
                // 触发下载
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
        // 1. 序列化画布（默认即可）
        if (canvas) {
            const json = JSON.stringify(canvas.toJSON()); // 第二个参数可选：要额外保留的自定义属性
            // 2. 生成 Blob
            const blob = new Blob([json], { type: "application/json" });
            // 3. 触发下载
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = "canvas.json";
            link.click();
        }
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
                // 3. 清空当前画布
                canvas?.clear();
                // 4. 载入 JSON
                canvas?.loadFromJSON(json, () => {
                    // 5. 渲染并可选居中
                    canvas.renderAll();
                    canvas.setViewportTransform([1, 0, 0, 1, 0, 0]); // 重置缩放
                    // 如需自动居中：
                    // canvas.viewportCenterObjects(canvas.getObjects());
                });
            } catch (err: any) {
                console.log(`JSON 解析失败：${err.message}`);
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
            {/* <!-- 主要工具组 --> */}
            <div className={styles.toolbar_group}>
                <button className={`${styles.tool_btn} ${selectAble ? styles.active : ""}`} title="选择工具 (V)" onClick={handlerChangeSelectable}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M4 2L12 10L8 14L6.4 10L4 2Z" stroke="currentColor" strokeWidth="1.5" fill="none" />
                    </svg>
                </button>
                <button
                    className={`${styles.tool_btn} ${DrawType.pencil === drawMode ? styles.active : ""}`}
                    data-mode="pen"
                    title="画笔工具 (P)"
                    onClick={() => handlerDraw(DrawType.pencil)}
                >
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor">
                        <g strokeWidth="1.5">
                            <path
                                clipRule="evenodd"
                                d="m7.643 15.69 7.774-7.773a2.357 2.357 0 1 0-3.334-3.334L4.31 12.357a3.333 3.333 0 0 0-.977 2.357v1.953h1.953c.884 0 1.732-.352 2.357-.977Z"
                            ></path>
                            <path d="m11.25 5.417 3.333 3.333"></path>
                        </g>
                    </svg>
                </button>
                <button
                    className={`${styles.tool_btn} ${DrawType.text === drawMode ? styles.active : ""}`}
                    data-mode="text"
                    title="文字工具 (T)"
                    onClick={() => handlerDraw(DrawType.text)}
                >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M3 4H13V6H9V14H7V6H3V4Z" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                </button>
            </div>
            <div className={styles.divider}></div>
            {/* <!-- 形状工具组 --> */}
            <div className={`${styles.toolbar_group} ${styles.shape_group}`}>
                <button className={`${styles.tool_btn} ${selectGroup() ? styles.active : ""}`} title="形状工具 (S)">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <rect x="3" y="3" width="10" height="10" stroke="currentColor" strokeWidth="1.5" fill="none" />
                    </svg>
                    <svg className={styles.dropdown_arrow} width="8" height="8" viewBox="0 0 8 8" fill="none">
                        <path d="M2 3L4 5L6 3" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                </button>
                <div className={styles.shape_dropdown}>
                    <button
                        className={`${styles.tool_btn} ${DrawType.rect === drawMode ? styles.active : ""}`}
                        title="矩形 (R)"
                        onClick={() => handlerDraw(DrawType.rect)}
                    >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <rect x="3" y="3" width="10" height="10" stroke="currentColor" strokeWidth="1.5" fill="none" />
                        </svg>
                    </button>
                    <button
                        className={`${styles.tool_btn} ${DrawType.circle === drawMode ? styles.active : ""}`}
                        title="圆 (O)"
                        onClick={() => handlerDraw(DrawType.circle)}
                    >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
                        </svg>
                    </button>
                    <button
                        className={`${styles.tool_btn} ${DrawType.ellipse === drawMode ? styles.active : ""}`}
                        title="椭圆 (O)"
                        onClick={() => handlerDraw(DrawType.ellipse)}
                    >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <ellipse cx="8" cy="8" rx="6.5" ry="4.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
                        </svg>
                    </button>
                    <button
                        className={`${styles.tool_btn} ${DrawType.polyLine === drawMode ? styles.active : ""}`}
                        title="直线 (L)"
                        onClick={() => handlerDraw(DrawType.polyLine)}
                    >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <line x1="3" y1="13" x2="13" y2="3" stroke="currentColor" strokeWidth="1.5" />
                        </svg>
                    </button>
                    {/* <button className={`${styles.tool_btn} ${DrawType.line === active ? styles.active : ''}`} title="箭头 (A)">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M3 13L13 3M13 3L13 8M13 3L8 3" stroke="currentColor" strokeWidth="1.5"/>
                        </svg>
                    </button> */}
                    <button
                        className={`${styles.tool_btn} ${DrawType.triangle === drawMode ? styles.active : ""}`}
                        title="三角形"
                        onClick={() => handlerDraw(DrawType.triangle)}
                    >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <polygon points="8,3 13,13 3,13" stroke="currentColor" strokeWidth="1.5" fill="none" />
                        </svg>
                    </button>
                </div>
            </div>
            {/* <div className={styles.divider}></div> */}
            {/* <!-- 辅助工具组 --> */}
            {/* <div className={styles.toolbar_group}>
                <button className={styles.tool_btn} title="橡皮擦工具 (E)">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <g strokeWidth="2"><path stroke="none" d="M0 0h24v24H0z" fill="none"></path><path d="M19 20h-10.5l-4.21 -4.3a1 1 0 0 1 0 -1.41l10 -10a1 1 0 0 1 1.41 0l5 5a1 1 0 0 1 0 1.41l-9.2 9.3"></path><path d="M18 13.3l-6.3 -6.3"></path></g>
                    </svg>
                </button>
            </div> */}
            <div className={styles.divider}></div>
            {/* <!-- 操作工具组 --> */}
            <div className={styles.toolbar_group}>
                <button className={`${styles.tool_btn} ${historyUndoNum === 0 ? styles.disable : ""}`} title="撤销 (Ctrl+Z)" onClick={handlerUndo}>
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor">
                        <path d="M7.5 10.833 4.167 7.5 7.5 4.167M4.167 7.5h9.166a3.333 3.333 0 0 1 0 6.667H12.5" strokeWidth="2"></path>
                    </svg>
                </button>
                <button className={`${styles.tool_btn} ${historyRedoNum === 0 ? styles.disable : ""}`} title="重做" onClick={handlerRedo}>
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor">
                        <path d="M12.5 10.833 15.833 7.5 12.5 4.167M15.833 7.5H6.667a3.333 3.333 0 1 0 0 6.667H7.5" strokeWidth="2"></path>
                    </svg>
                </button>
                <button className={styles.tool_btn} title="清空画布" onClick={handlerClear}>
                    <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                        <path d="M5 5L11 11M11 5L5 11" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                </button>
            </div>
            <div className={styles.divider}></div>
            {/* <!-- 功能工具组 --> */}
            <div className={styles.toolbar_group}>
                {/* <button className={styles.tool_btn} title="属性面板">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M3 3H13V5H3V3Z" stroke="currentColor" strokeWidth="1.5"/>
                        <path d="M3 7H13V9H3V7Z" stroke="currentColor" strokeWidth="1.5"/>
                        <path d="M3 11H13V13H3V11Z" stroke="currentColor" strokeWidth="1.5"/>
                    </svg>
                </button> */}
                <button className={styles.tool_btn} title="打开" onClick={handlerUpload}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path
                            strokeWidth="2"
                            d="m9.257 6.351.183.183H15.819c.34 0 .727.182 1.051.506.323.323.505.708.505 1.05v5.819c0 .316-.183.7-.52 1.035-.337.338-.723.522-1.037.522H4.182c-.352 0-.74-.181-1.058-.5-.318-.318-.499-.705-.499-1.057V5.182c0-.351.181-.736.5-1.054.32-.321.71-.503 1.057-.503H6.53l2.726 2.726Z"
                        ></path>
                    </svg>
                </button>
                <button className={styles.tool_btn} title="导出json" onClick={handlerExportJson}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path
                            strokeWidth="2"
                            d="M3.333 14.167v1.666c0 .92.747 1.667 1.667 1.667h10c.92 0 1.667-.746 1.667-1.667v-1.666M5.833 9.167 10 13.333l4.167-4.166M10 3.333v10"
                        ></path>
                    </svg>
                </button>
                <button className={styles.tool_btn} title="导出图片" onClick={handlerExport}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <g strokeWidth="2">
                            <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                            <path d="M15 8h.01"></path>
                            <path d="M12 20h-5a3 3 0 0 1 -3 -3v-10a3 3 0 0 1 3 -3h10a3 3 0 0 1 3 3v5"></path>
                            <path d="M4 15l4 -4c.928 -.893 2.072 -.893 3 0l4 4"></path>
                            <path d="M14 14l1 -1c.617 -.593 1.328 -.793 2.009 -.598"></path>
                            <path d="M19 16v6"></path>
                            <path d="M22 19l-3 3l-3 -3"></path>
                        </g>
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default ToolBar;
