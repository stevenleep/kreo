import React, { useContext, useEffect, useRef } from 'react';
import { fabric } from 'fabric';
import EditorWorkspace from './draw/EditorWorkspace';
import { Context } from './draw/Context';
// import useEvents from '@/pages/basicsInfo/booth/projectVisual/hooks/useEvents';
import { IEvent } from 'fabric/fabric-impl';
// import { getQueryString } from '@/utils/tools';
// import useInitDetail from '../../hooks/useInitDetail';
// import { EventsTypes, events } from '@/utils/events';
// import { useLatest } from 'ahooks';
// import { PageType } from '@/pages/basicsInfo/booth/projectVisual/core/config/type';
// import hotkeys from 'hotkeys-js';
// import { KeyNames } from '@/pages/basicsInfo/booth/projectVisual/core/config/hotEventKeys';
// import History from '@/pages/basicsInfo/booth/projectVisual/core/History';
// import { onFinishPointsChange, groupToEditPolygon } from '@/pages/basicsInfo/booth/projectVisual/utils';
// import './index.less';

type OffListener = (ev: fabric.IEvent) => void;

/**
 * 画布区域
 * @returns
 */
const Workspace = () => {
    const { canvas, workspace, setState } = useContext(Context);
    const container = useRef<HTMLDivElement | null>(null);
    // const type = getQueryString('type');
    // const { run: initDetail } = useInitDetail();
    // const lastLoading = useLatest(canvasLoading);
    // const lastProjectData = useLatest(projectData);
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

    useEffect(() => {
        initCanvas();
    }, []);

    useEffect(() => {
        if (!canvas || !workspace) return;
        canvas.on('mouse:down', clickCanvas); // 画布点击事件
        canvas.on('object:added', watchAdded); // 新增元素事件
        canvas.on('object:moving', watchMoveing); // 拖动元素事件
        canvas.on('mouse:dblclick', dblclick); // 双击事件
        // events.on(EventsTypes.DeleteObject, deleteObject); // 删除元素事件
        // window.addEventListener('keydown', onKeyDown);
        // hotkeys(KeyNames.delete, deleteObject); // 绑定删除快捷键
        return () => {
            canvas.off('mouse:down', clickCanvas as OffListener);
            canvas.off('object:added', watchAdded as OffListener);
            canvas.off('object:moving', watchMoveing as OffListener);
            canvas.off('mouse:dblclick', dblclick as OffListener);
            // events.off(EventsTypes.DeleteObject, deleteObject);
            window.removeEventListener('keydown', onKeyDown);
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
     * 点击画布
     * @param e
     * @returns
     */
    const clickCanvas = (e: IEvent<MouseEvent>) => {
        if (!canvas || !workspace) return;
        // 点击空白画布展示规划信息
        if (workspace.dragMode) return;
        // if (workspace.drawLine.isDrawing) return;
        const target = e.target;
        const objects = canvas.getObjects();
        // if ((target === null || ['mainImg', 'maskRect'].includes(target?.get('id') || '')) && objects.length) {
        //     setState({ selectBooth: null, openAttr: true });
        //     onFinishPointsChange(canvas, workspace);
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

    /**
     * 监听新增
     * @param e
     * @returns
     */
    const watchAdded = (e: IEvent<MouseEvent>) => {
        if (!canvas || !workspace) return;
        // if (lastLoading.current) return;
        if (!e.target || !(e.target as any).id) return;
        if (e.target.excludeFromExport) return;
        // if (e.target.cType !== 'booth' || e.target.type !== 'group') return;
        if (canvas.historyPlugin?.loading) return; // 正在撤回画布不处理
        const id = (e.target as any).id as string;
        // setState((prev) => {
        //     prev.boothData[id] = {
        //         boothPrefix: prev.beforeBoothData.acCodePrefix,
        //         effectiveDateBegin: prev.projectData.effectiveDateBegin,
        //         effectiveDateEnd: prev.projectData.effectiveDateEnd,
        //         boothMapColour: (e.target as fabric.Group).gruopFill,
        //         isDouble: '0',
        //         assetsNatureKey: '0',
        //         boothMark: 0,
        //         sharing: floorInfo?.sharing,
        //         boothLevelKey: undefined,
        //     };
        //     return prev;
        // });
    };

    /**
     * 监听拖拽
     * @param e
     * @returns
     */
    const watchMoveing = (e: IEvent<MouseEvent>) => {
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
        const canvas = new fabric.Canvas('fabric-canvas', {
            fireRightClick: false,
            stopContextMenu: true,
            controlsAboveOverlay: true,
            width: container.current?.offsetWidth,
            height: container.current?.offsetHeight,
            selection: false,
        });
        const workspace = new EditorWorkspace(canvas);
        // new History(canvas, workspace, setState);
        setState({ canvas, workspace });
        // const data = {
        //     planId: getQueryString('planId'),
        //     sourceType: getQueryString('sourceType'),
        // };
        // initDetail(workspace, data);
    };

    return (
        <div className="draw">
            <div ref={container} className="project-visual-draw" id="workspace">
                <div className="canvas-box">
                    <canvas className="fabric-canvas" id="fabric-canvas" />
                </div>
            </div>
        </div>
    );
};

export default Workspace;
