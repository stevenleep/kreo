import React, { useCallback, useContext, useState } from "react";
import styles from './index.module.less';
import { Context } from "../draw/Context";
import { DrawType } from "./config";

const ToolBar = () => {
    const { workspace, canvas, drawMode, setState } = useContext(Context);
    const [active, setActive] = useState('');

    const stop = () => {
        if (!workspace) {
            return;
        }

        setState({ drawMode: '' });
        workspace.drawTool.stop();
    };

    const drawPenceil = useCallback((type: string) => {
        if (!workspace) {
            return;
        }

        if (drawMode === type) {
            stop();
        } else {
            workspace.drawTool.start(type, () => {
                setState({ drawMode: '' });
            });
            setState({ drawMode: type });
        }
    }, [ workspace, drawMode ]);

    const handlerDraw = (type: string) => {
        if (!workspace || !canvas) return;
        setActive(type);
        drawPenceil(type);
    };

    // 清空
    const handlerClear = () => {
        if (workspace) {
            workspace.clearAllObject();
        }
    };

    // 导出图片
    const handlerExport = () => {

    };

    const handlerUndo = () => {
        stop();
        canvas?.historyPlugin?.undo();
    };

    const handlerRedo = () => {
        stop();
        canvas?.historyPlugin?.redo();
    };

    return (
        <div className={styles.tool_bar}>
            {/* <!-- 主要工具组 --> */}
            <div className={styles.toolbar_group}>
                <button className={`${styles.tool_btn} ${styles.active}`} title="选择工具 (V)">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M4 2L12 10L8 14L6.4 10L4 2Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                    </svg>
                </button>
                <button className={`${styles.tool_btn} ${DrawType.straightLine === active ? styles.active : ''}`} data-mode="pen" title="画笔工具 (P)">
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor">
                        <g strokeWidth="1.5"><path clipRule="evenodd" d="m7.643 15.69 7.774-7.773a2.357 2.357 0 1 0-3.334-3.334L4.31 12.357a3.333 3.333 0 0 0-.977 2.357v1.953h1.953c.884 0 1.732-.352 2.357-.977Z"></path><path d="m11.25 5.417 3.333 3.333"></path></g>
                    </svg>
                </button>
                <button className={styles.tool_btn} data-mode="text" title="文字工具 (T)">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M3 4H13V6H9V14H7V6H3V4Z" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
                </button>
            </div>
            <div className={styles.divider}></div>
            {/* <!-- 形状工具组 --> */}
            <div className={`${styles.toolbar_group} ${styles.shape_group}`}>
                <button className={styles.tool_btn} title="形状工具 (S)">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <rect x="3" y="3" width="10" height="10" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                    </svg>
                    <svg className={styles.dropdown_arrow} width="8" height="8" viewBox="0 0 8 8" fill="none">
                        <path d="M2 3L4 5L6 3" stroke="currentColor" strokeWidth="1.5"/>
                    </svg>
                </button>
                <div className={styles.shape_dropdown}>
                    <button className={styles.tool_btn} title="矩形 (R)">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <rect x="3" y="3" width="10" height="10" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                        </svg>
                    </button>
                    <button className={styles.tool_btn} title="圆 (O)" onClick={() => handlerDraw(DrawType.straightLine)}>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                        </svg>
                    </button>
                    <button className={styles.tool_btn} title="椭圆 (O)" onClick={() => handlerDraw(DrawType.straightLine)}>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <ellipse cx="8" cy="8" rx="6.5" ry="4.5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                        </svg>
                    </button>
                    <button className={styles.tool_btn} title="直线 (L)" onClick={() => handlerDraw(DrawType.straightLine)}>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <line x1="3" y1="13" x2="13" y2="3" stroke="currentColor" strokeWidth="1.5"/>
                        </svg>
                    </button>
                    <button className={styles.tool_btn} title="箭头 (A)">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M3 13L13 3M13 3L13 8M13 3L8 3" stroke="currentColor" strokeWidth="1.5"/>
                        </svg>
                    </button>
                    <button className={styles.tool_btn} title="三角形">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <polygon points="8,3 13,13 3,13" stroke="currentColor" strokeWidth="1.5" fill="none"/>
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
                <button className={styles.tool_btn} title="撤销 (Ctrl+Z)" onClick={handlerUndo}>
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor">
                        <path d="M7.5 10.833 4.167 7.5 7.5 4.167M4.167 7.5h9.166a3.333 3.333 0 0 1 0 6.667H12.5" strokeWidth="2"></path>
                    </svg>
                </button>
                <button className={styles.tool_btn} title="重做" onClick={handlerRedo}>
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor">
                        <path d="M12.5 10.833 15.833 7.5 12.5 4.167M15.833 7.5H6.667a3.333 3.333 0 1 0 0 6.667H7.5" strokeWidth="2"></path>
                    </svg>
                </button>
                <button className={styles.tool_btn} title="清空画布" onClick={handlerClear}>
                    <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                        <path d="M5 5L11 11M11 5L5 11" stroke="currentColor" strokeWidth="1.5"/>
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
                <button className={styles.tool_btn} title="打开">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeWidth="2" d="m9.257 6.351.183.183H15.819c.34 0 .727.182 1.051.506.323.323.505.708.505 1.05v5.819c0 .316-.183.7-.52 1.035-.337.338-.723.522-1.037.522H4.182c-.352 0-.74-.181-1.058-.5-.318-.318-.499-.705-.499-1.057V5.182c0-.351.181-.736.5-1.054.32-.321.71-.503 1.057-.503H6.53l2.726 2.726Z"></path>
                    </svg>
                </button>
                <button className={styles.tool_btn} title="保存到...">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeWidth="2" d="M3.333 14.167v1.666c0 .92.747 1.667 1.667 1.667h10c.92 0 1.667-.746 1.667-1.667v-1.666M5.833 9.167 10 13.333l4.167-4.166M10 3.333v10"></path>
                    </svg>
                </button>
                <button className={styles.tool_btn} title="导出图片" onClick={handlerExport}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <g strokeWidth="2"><path stroke="none" d="M0 0h24v24H0z" fill="none"></path><path d="M15 8h.01"></path><path d="M12 20h-5a3 3 0 0 1 -3 -3v-10a3 3 0 0 1 3 -3h10a3 3 0 0 1 3 3v5"></path><path d="M4 15l4 -4c.928 -.893 2.072 -.893 3 0l4 4"></path><path d="M14 14l1 -1c.617 -.593 1.328 -.793 2.009 -.598"></path><path d="M19 16v6"></path><path d="M22 19l-3 3l-3 -3"></path></g>
                    </svg>
                </button>
            </div>
        </div>
    )
}

export default ToolBar;