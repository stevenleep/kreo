import React, { useContext, useEffect, useRef } from 'react';
import { fabric } from 'fabric';
import EditorWorkspace from './draw/EditorWorkspace';
import { Context } from './draw/Context';
import { IEvent } from 'fabric/fabric-impl';
import styles from './workspace.module.less';
// import { EventsTypes, events } from '@/utils/events';
// import { useLatest } from 'ahooks';
// import { PageType } from '@/pages/basicsInfo/booth/projectVisual/core/config/type';
// import hotkeys from 'hotkeys-js';
// import { KeyNames } from '@/pages/basicsInfo/booth/projectVisual/core/config/hotEventKeys';
import History from './draw/History';
import { DrawType } from './toolBar/config';
// import { onFinishPointsChange, groupToEditPolygon } from '@/pages/basicsInfo/booth/projectVisual/utils';
// import './index.less';

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

    // useEvents({
    //     canvas,
    //     workspace,
    //     onSelect(actives) {
    //         if (actives.length === 1 && actives[0].cType === 'booth') {
    //             setState({
    //                 openAttr: true,
    //                 selectBooth: actives[0],
    //             });
    //         } else {
    //             setState({ selectBooth: null, openAttr: true });
    //         }
    //     },
    // });

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
        // canvas.on('mouse:down', clickCanvas); // 画布点击事件
        // canvas.on('object:added', watchAdded); // 新增元素事件
        // canvas.on('object:moving', watchMoveing); // 拖动元素事件
        canvas.on('mouse:dblclick', dblclick); // 双击事件
        canvas.on('selection:created', watchSelectionCreated); // 选择元素事件
        // events.on(EventsTypes.DeleteObject, deleteObject); // 删除元素事件
        // window.addEventListener('keydown', onKeyDown);
        // hotkeys(KeyNames.delete, deleteObject); // 绑定删除快捷键
        window.addEventListener('scroll', onScroll);
        return () => {
            // canvas.off('mouse:down', clickCanvas as OffListener);
            // canvas.off('object:added', watchAdded as OffListener);
            // canvas.off('object:moving', watchMoveing as OffListener);
            canvas.off('mouse:dblclick', dblclick as OffListener);
            canvas.off('selection:created', watchSelectionCreated as OffListener); // 选择元素事件
            // events.off(EventsTypes.DeleteObject, deleteObject);
            // window.removeEventListener('keydown', onKeyDown);
            window.removeEventListener('scroll', onScroll);
            // hotkeys.unbind(KeyNames.delete, deleteObject);
        };
    }, [canvas, workspace]);

    const onKeyDown = (e: KeyboardEvent) => {
        if (['TEXTAREA', 'INPUT'].includes(document.activeElement?.tagName as 'string')) return;
        if (!['Escape', 'Enter'].includes(e.code)) return;
        if (!canvas || !workspace) return;
        e.preventDefault();
        // onFinishPointsChange(canvas, workspace);
    };

    // 双击元素
    const dblclick = (e: IEvent<MouseEvent>) => {
        if (!e || !e.target || !canvas || !workspace) return;
        // if (PageType.view === type) return;
        // const target = e.target;
        // if (target.id === 'changePointsPoly') {
        //     onFinishPointsChange(canvas, workspace);
        // } else {
        //     groupToEditPolygon(canvas, e.target);
        // }
    };

    /**
     * 删除元素
     * @returns
     */
    // const deleteObject = () => {
    //     if (lastOpenCreateSpecialBooth.current) return;
    //     if (!canvas || type === PageType.view) return; // 查看模式下不能删除
    //     const object = canvas.getActiveObject();
    //     if (!object) return;
    //     // 处理其它元素
    //     if (!object.id) {
    //         canvas.remove(object);
    //         canvas.discardActiveObject();
    //         canvas.renderAll();
    //         return;
    //     }
    //     console.log('object:---', object);
    //     console.log('lastProjectData:---', lastProjectData);
    //     if (object.cType === 'booth' && lastOriginalObjectIds.current[object.id] && lastProjectData.current.operateType === 3) {
    //         return message.warning('不可删除摊位哦～');
    //     }
    //     // 这个摊位有被关联的子摊位，不让删除
    //     const values = Object.keys(lastMainCodeRelevance.current).map((key) => lastMainCodeRelevance.current[key]);
    //     if (values.includes(object.id as string)) {
    //         return message.warning('当前摊位下有正在关联的子摊位，请解绑后删除');
    //     }
    //     setState((prev) => {
    //         const { boothData } = prev;
    //         if (object.id && object.id in boothData) {
    //             canvas.remove(object);
    //             delete boothData[object.id];
    //         }
    //         if (object.id && object.id in prev.mainCodeRelevance) {
    //             delete prev.mainCodeRelevance[object.id];
    //         }
    //         return prev;
    //     });
    //     canvas.discardActiveObject();
    //     canvas.renderAll();
    // };

    const watchSelectionCreated = (e: IEvent<MouseEvent>) => {
        if (!canvas || !workspace) return;
        const target = e.selected?.[0];
        if (!target || !workspace || !canvas) return;
        if (!workspace.width || !workspace.height) return;
        if (target.left === undefined || target.top === undefined) return;
    
        setState({ selectShape: target });
    };

    /**
     * 监听拖拽
     * @param e
     * @returns
     */
    const watchMoveing = (e: IEvent<MouseEvent>) => {
        debugger
        console.log('ddddd')
        const target = e.target;
        if (!target || !workspace || !canvas) return;
        if (!workspace.width || !workspace.height) return;
        if (target.left === undefined || target.top === undefined) return;
        if (target.width === undefined || target.height === undefined) return;

        if (target.left < 0) {
            target.left = 0;
        }
        if (target.left + target.width > workspace.width) {
            target.left = workspace.width - target.width;
        }
        if (target.top < 0) {
            target.top = 0;
        }
        if (target.top + target.height > workspace.height) {
            target.top = workspace.height - target.height;
        }
        canvas.requestRenderAll();
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
            document.documentElement.clientHeight
        );

        const domWidth = Math.max(
            document.body.scrollWidth,
            document.documentElement.scrollWidth,
            document.body.offsetWidth,
            document.documentElement.offsetWidth,
            document.body.clientWidth,
            document.documentElement.clientWidth
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
        <div ref={containerRef} className={`${styles.container} ${drawMode ? styles.events : ''}`} onMouseDown={handlerDraw} onMouseMove={handlerMouseMove} onMouseUp={handlerMouseUp} onDoubleClick={handlerDbClick}>
            <canvas ref={canvasRef} />
        </div>
    );
};

export default Workspace;
