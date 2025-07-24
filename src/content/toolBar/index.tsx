import React, { useCallback, useContext } from "react";
import styles from './index.module.less';
import { Context } from "../draw/Context";
import { DrawType } from "./config";

const ToolBar = () => {
    const { workspace, canvas, drawMode, setState } = useContext(Context);

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
        drawPenceil(type);
    };

    return (
        <div className={styles.tool_bar}>
            {/* <!-- 主要工具组 --> */}
            <div className={styles.toolbar_group}>
                <button onClick={() => handlerDraw(DrawType.straightLine)} className={`${styles.tool_btn} ${styles.active}`} data-mode="select" title="选择工具 (V)">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M4 2L12 10L8 14L6.4 10L4 2Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                    </svg>
                </button>
                <button className={styles.tool_btn} data-mode="pen" title="画笔工具 (P)">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M2 14L14 2M14 2L10 2M14 2L14 6" stroke="currentColor" strokeWidth="1.5"/>
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
                <button className={styles.tool_btn} data-mode="rectangle" title="形状工具 (S)">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <rect x="3" y="3" width="10" height="10" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                    </svg>
                    <svg className={styles.dropdown_arrow} width="8" height="8" viewBox="0 0 8 8" fill="none">
                        <path d="M2 3L4 5L6 3" stroke="currentColor" strokeWidth="1.5"/>
                    </svg>
                </button>
                <div className={styles.shape_dropdown}>
                    <button className={styles.tool_btn} data-mode="rectangle" title="矩形 (R)">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <rect x="3" y="3" width="10" height="10" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                        </svg>
                    </button>
                    <button className={styles.tool_btn} data-mode="circle" title="椭圆 (O)">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <ellipse cx="8" cy="8" rx="5.5" ry="5.5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                        </svg>
                    </button>
                    <button className={styles.tool_btn} data-mode="line" title="直线 (L)">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <line x1="3" y1="13" x2="13" y2="3" stroke="currentColor" strokeWidth="1.5"/>
                        </svg>
                    </button>
                    <button className={styles.tool_btn} data-mode="arrow" title="箭头 (A)">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M3 13L13 3M13 3L13 8M13 3L8 3" stroke="currentColor" strokeWidth="1.5"/>
                        </svg>
                    </button>
                    <button className={styles.tool_btn} data-mode="triangle" title="三角形">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <polygon points="8,3 13,13 3,13" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                        </svg>
                    </button>
                    <button className={styles.tool_btn} data-mode="star" title="五角星">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <polygon points="8,3 9.6,7.2 13.6,7.8 10.8,11 11.6,15 8,13 4.4,15 5.2,11 2.4,7.8 6.4,7.2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                        </svg>
                    </button>
                </div>
            </div>
            <div className={styles.divider}></div>
            {/* <!-- 辅助工具组 --> */}
            <div className={styles.toolbar_group}>
                <button className={styles.tool_btn} data-mode="highlighter" title="荧光笔工具 (H)">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <rect x="3" y="11" width="10" height="3" fill="#FFD600" opacity="0.5"/>
                    <rect x="3" y="3" width="10" height="6" fill="#FFD600"/>
                </svg>
                </button>
                <button className={styles.tool_btn} data-mode="eraser" title="橡皮擦工具 (E)">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <rect x="3" y="11" width="6" height="3" fill="#E0E0E0"/>
                        <rect x="7" y="3" width="6" height="6" fill="#E0E0E0" opacity="0.5"/>
                    </svg>
                </button>
                <button className={styles.tool_btn} data-mode="hand-drawn" title="手绘风格">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <rect x="3" y="3" width="10" height="10" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                        <path d="M3 3 Q8 1 13 3 Q15 8 13 13 Q8 15 3 13 Q1 8 3 3 Z" stroke="currentColor" strokeWidth="1" fill="none"/>
                    </svg>
                </button>
            </div>
            <div className={styles.divider}></div>
            {/* <!-- 操作工具组 --> */}
            <div className={styles.toolbar_group}>
                <button className={styles.tool_btn} id="undo-btn" title="撤销 (Ctrl+Z)">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M6 3H4C3.44772 3 3 3.44772 3 4V12C3 12.5523 3.44772 13 4 13H12C12.5523 13 13 12.5523 13 12V4C13 3.44772 12.5523 3 12 3H10M6 3V7M6 3L10 7" stroke="currentColor" strokeWidth="1.5"/>
                    </svg>
                </button>
                <button className={styles.tool_btn} id="clear-btn" title="清空画布">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M5 5L11 11M11 5L5 11" stroke="currentColor" strokeWidth="1.5"/>
                    </svg>
                </button>
            </div>
            <div className={styles.divider}></div>
            {/* <!-- 功能工具组 --> */}
            <div className={styles.toolbar_group}>
                <button className={styles.tool_btn} id="capture-btn" title="截图">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M3 5C3 3.89543 3.89543 3 5 3H11C12.1046 3 13 3.89543 13 5V11C13 12.1046 12.1046 13 11 13H5C3.89543 13 3 12.1046 3 11V5Z" stroke="currentColor" strokeWidth="1.5"/>
                        <circle cx="6" cy="7" r="1.5" stroke="currentColor" strokeWidth="1.5"/>
                        <path d="M3 11L6 8L9 11" stroke="currentColor" strokeWidth="1.5"/>
                    </svg>
                </button>
                <button className={styles.tool_btn} id="toggle-props-btn" title="属性面板">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M3 3H13V5H3V3Z" stroke="currentColor" strokeWidth="1.5"/>
                        <path d="M3 7H13V9H3V7Z" stroke="currentColor" strokeWidth="1.5"/>
                        <path d="M3 11H13V13H3V11Z" stroke="currentColor" strokeWidth="1.5"/>
                    </svg>
                </button>
                <button className={styles.tool_btn} id="settings-btn" title="设置">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M8 10C9.10457 10 10 9.10457 10 8C10 6.89543 9.10457 6 8 6C6.89543 6 6 6.89543 6 8C6 9.10457 6.89543 10 8 10Z" stroke="currentColor" strokeWidth="1.5"/>
                        <path d="M8 2V4" stroke="currentColor" strokeWidth="1.5"/>
                        <path d="M8 12V14" stroke="currentColor" strokeWidth="1.5"/>
                        <path d="M14 8H12" stroke="currentColor" strokeWidth="1.5"/>
                        <path d="M4 8H2" stroke="currentColor" strokeWidth="1.5"/>
                        <path d="M13.5 3.5L12 5" stroke="currentColor" strokeWidth="1.5"/>
                        <path d="M4 11L2.5 12.5" stroke="currentColor" strokeWidth="1.5"/>
                        <path d="M11 11L12.5 12.5" stroke="currentColor" strokeWidth="1.5"/>
                        <path d="M5 3.5L6.5 2" stroke="currentColor" strokeWidth="1.5"/>
                    </svg>
                </button>
            </div>
        </div>
    )
}

export default ToolBar;