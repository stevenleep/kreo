import React, { createContext, ReactNode } from 'react';
import { SetState, useSetState } from './../utils';
import EditorWorkspace from './EditorWorkspace';
import History from './History';
import { DrawType } from '../toolBar/config';

export type ContextCanvas = fabric.Canvas & { historyPlugin?: History };

export type PenPropertyOption = {
    color: string;
    fill: string,
    strokeWidth: number;
};

export const defaultPenProperty: PenPropertyOption = {
    color: '#ff0000',
    fill: 'transparent',
    strokeWidth: 2,
};

interface CanvasContext {
    canvas: ContextCanvas | null;
    workspace: EditorWorkspace | null;
    // openTools: boolean;
    // openAttr: boolean;
    // selectDrawingOpen: boolean;
    // boothData: any;
    selectShape: fabric.Object | null;
    drawMode: DrawType | '';
    refreshTooList: null | object;
    // mainCodeRelevance: { [key: string]: string };
    // originalObjectIds: { [key: string]: boolean };
    historyUndoNum: number;
    historyRedoNum: number;
    penProperty: PenPropertyOption;
    setState: SetState<CanvasContext>;
}

export const Context = createContext<CanvasContext>({
    canvas: null,
    workspace: null,
    // uploadDrawingOpen: false,
    // selectDrawingOpen: false,
    // boothData: {},
    selectShape: null,
    // openCreateSpecialBooth: false,
    drawMode: '',
    // canvasLoading: false,
    // canvasLoadingText: '',
    refreshTooList: null,
    // beforeBoothData: { acCodePrefix: '' },
    historyUndoNum: 0,
    historyRedoNum: 0,
    penProperty: defaultPenProperty,
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
        // openAttr: false, // 右侧属性区是否打开
        selectShape: null, // 当前画布已选中的图形
        // openCreateSpecialBooth: false, // 创建异形摊位 modal open
        drawMode: '', // 当前画笔模式
        // canvasLoading: false, // 全局loading
        // canvasLoadingText: '加载中', // 全局loading text
        // boothForm: null, // 摊位form
        // projectForm: null, // 规划form
        refreshTooList: null, // 刷新摊位列表
        historyUndoNum: 0,
        historyRedoNum: 0,
        penProperty: defaultPenProperty,
    });

    const value: CanvasContext = {
        ...state,
        setState,
    };
    return <Context.Provider value={value}>{children}</Context.Provider>;
};
