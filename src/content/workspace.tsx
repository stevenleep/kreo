import React, { useContext, useEffect, useRef } from "react";
import { fabric } from "fabric";
import EditorWorkspace from "./draw/EditorWorkspace";
import { Context } from "./draw/Context";
import { IEvent } from "fabric/fabric-impl";
import styles from "./workspace.module.less";
// import { useLatest } from 'ahooks';
import History from "./draw/History";
import { DrawType } from "./toolBar/config";
// import { onFinishPointsChange, groupToEditPolygon } from '@/pages/basicsInfo/booth/projectVisual/utils';

type OffListener = (ev: fabric.IEvent) => void;

/**
 * 画布区域
 * @returns
 */
const Workspace = () => {
    const { canvas, workspace, setState, drawMode } = useContext(Context);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    // const lastMainCodeRelevance = useLatest(mainCodeRelevance);
    // const lastOpenCreateSpecialBooth = useLatest(openCreateSpecialBooth);
    // const lastOriginalObjectIds = useLatest(originalObjectIds);

    const onScroll = () => {
        const scrollTop = window.scrollY || document.body.scrollTo;
        if (containerRef.current) {
            containerRef.current.scrollTop = scrollTop as number;
        }
    };

    useEffect(() => {
        initCanvas();
    }, []);

    useEffect(() => {
        if (!canvas || !workspace) return;
        canvas.on("mouse:down", clickCanvas); // 画布点击事件
        canvas.on("selection:created", watchSelectionCreated); // 选择元素事件
        window.addEventListener("scroll", onScroll);
        window.addEventListener("keydown", onKeyDown);
        return () => {
            canvas.off("mouse:down", clickCanvas as OffListener);
            canvas.off("selection:created", watchSelectionCreated as OffListener); // 选择元素事件
            window.removeEventListener("keydown", onKeyDown);
        };
    }, [canvas, workspace]);

    const onKeyDown = (e: KeyboardEvent) => {
        if (['Backspace', 'Delete'].includes(e.code)) {
            if (e.target && (e.target as any).tagName.toLocaleLowerCase() !== 'textarea') {
                deleteObject();
            }
        }
        // if (!canvas || !workspace) return;
        // e.preventDefault();
        // onFinishPointsChange(canvas, workspace);
    };

    /**
     * 点击画布
     * @param e
     * @returns
     */
    const clickCanvas = (e: IEvent<MouseEvent>) => {
        if (!canvas || !workspace) return;
        const target = e.target;
        if (target === null) {
            setState({ selectShape: null });
        }
    };
    /**
     * 删除元素
     * @returns
     */
    const deleteObject = () => {
        if (!canvas) return;
        const object = canvas.getActiveObject();
        if (!object) return;
        setState({
            selectShape: null,
        });
        canvas.remove(object);
        canvas.discardActiveObject();
        canvas.renderAll();
    };

    const watchSelectionCreated = (e: IEvent<MouseEvent>) => {
        if (!canvas || !workspace) return;
        const target = e.selected?.[0];
        if (!target || !workspace || !canvas) return;
        if (!workspace.width || !workspace.height) return;
        if (target.left === undefined || target.top === undefined) return;

        setState({ selectShape: target });
    };

    /**
     * 初始化canvas
     */
    const initCanvas = async () => {
        const domHeight = Math.max(
            document.body.scrollHeight,
            document.documentElement.scrollHeight,
            document.body.offsetHeight,
            document.documentElement.offsetHeight,
            document.body.clientHeight,
            document.documentElement.clientHeight,
        );

        const domWidth = Math.max(
            document.body.scrollWidth,
            document.documentElement.scrollWidth,
            document.body.offsetWidth,
            document.documentElement.offsetWidth,
            document.body.clientWidth,
            document.documentElement.clientWidth,
        );

        const canvas = new fabric.Canvas(canvasRef.current, {
            fireRightClick: false,
            stopContextMenu: true,
            controlsAboveOverlay: true,
            width: domWidth,
            height: domHeight,
            selection: false,
        });
        const workspace = new EditorWorkspace(canvas);
        new History(canvas, workspace, setState);
        setState({ canvas, workspace });
    };

    const handlerDraw = (ev: React.MouseEvent) => {
        if (workspace?.drawTool.drawMode !== DrawType.pencil) {
            workspace?.drawTool && workspace?.drawTool.draw(ev);
        }
    };

    const handlerMouseMove = (ev: React.MouseEvent) => {
        workspace?.drawTool && workspace?.drawTool.drawMove(ev);
    };

    const handlerMouseUp = (ev: React.MouseEvent) => {
        if (workspace?.drawTool.drawMode !== DrawType.polyLine) {
            workspace?.drawTool && workspace?.drawTool.drawEnd();
        }
    };

    const handlerDbClick = (ev: React.MouseEvent) => {
        if (workspace?.drawTool.drawMode === DrawType.polyLine) {
            workspace?.drawTool && workspace?.drawTool.drawEnd();
        }
    };

    return (
        <div
            ref={containerRef}
            className={`${styles.container} ${drawMode ? styles.events : ""}`}
            onMouseDown={handlerDraw}
            onMouseMove={handlerMouseMove}
            onMouseUp={handlerMouseUp}
            onDoubleClick={handlerDbClick}
        >
            <canvas ref={canvasRef} />
        </div>
    );
};

export default Workspace;
