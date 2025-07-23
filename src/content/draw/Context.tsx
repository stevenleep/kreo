import React, { createContext, ReactNode } from 'react';
import { SetState, useSetState } from './../utils';
import EditorWorkspace from './EditorWorkspace';
import History from './History';

export type ContextCanvas = fabric.Canvas & { historyPlugin?: History };

interface CanvasContext {
    canvas: ContextCanvas | null;
    workspace: EditorWorkspace | null;
    // openTools: boolean;
    // openAttr: boolean;
    // selectDrawingOpen: boolean;
    // boothData: any;
    // selectBooth: fabric.Object | null;
    drawMode: string;
    refreshTooList: null | object;
    // mainCodeRelevance: { [key: string]: string };
    // originalObjectIds: { [key: string]: boolean };
    historyUndoNum: number;
    historyRedoNum: number;
    setState: SetState<CanvasContext>;
}

export const Context = createContext<CanvasContext>({
    canvas: null,
    workspace: null,
    // openTools: false,
    // openAttr: false,
    // uploadDrawingOpen: false,
    // selectDrawingOpen: false,
    // boothData: {},
    // selectBooth: null,
    // openCreateSpecialBooth: false,
    drawMode: '',
    // canvasLoading: false,
    // canvasLoadingText: '',
    refreshTooList: null,
    // beforeBoothData: { acCodePrefix: '' },
    historyUndoNum: 0,
    historyRedoNum: 0,
    // mainCodeRelevance: {},
    // originalObjectIds: {}
    setState: () => {},
});

type Props = {
  children?: ReactNode;
};

export const CanvasProvider = ({ children }: Props) => {
    const [state, setState] = useSetState<Omit<CanvasContext, 'setState'>>({
        canvas: null, // fabric实例
        workspace: null, // 工作区实例
        // openTools: true, // 左侧工具区是否打开
        // openAttr: false, // 右侧属性区是否打开
        // selectBooth: null, // 当前画布已选中的摊位
        // openCreateSpecialBooth: false, // 创建异形摊位 modal open
        drawMode: '', // 当前画笔模式
        // boothData: {}, // 摊位信息
        // projectData: {}, // 规划信息
        // canvasLoading: false, // 全局loading
        // canvasLoadingText: '加载中', // 全局loading text
        // boothForm: null, // 摊位form
        // projectForm: null, // 规划form
        refreshTooList: null, // 刷新摊位列表
        // beforeBoothData: { acCodePrefix: '' }, // 摊位前缀
        // mainCodeRelevance: {}, // 记录主摊位编号
        // originalObjectIds: {}, // 记录原始摊位id
        historyUndoNum: 0,
        historyRedoNum: 0,
        // floorInfo: null,
    });

    const value: CanvasContext = {
        ...state,
        setState,
    };
    return <Context.Provider value={value}>{children}</Context.Provider>;
};
