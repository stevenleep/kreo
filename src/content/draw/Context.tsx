import React, { createContext, ReactNode } from "react";
import { SetState, useSetState } from "./../utils";
import EditorWorkspace from "./EditorWorkspace";
import History from "./History";
import { DrawType } from "../toolBar/config";

export type ContextCanvas = fabric.Canvas & { historyPlugin?: History };

export type PenPropertyOption = {
    color: string;
    fill: string;
    strokeWidth: number;
    alpha: number;
    lineType: string;
    fontSize: number;
    bold?: boolean;
    underline?: boolean;
    italic?: boolean;
};

export const defaultPenProperty: PenPropertyOption = {
    color: "#ff0000",
    fill: "transparent",
    strokeWidth: 2,
    alpha: 100,
    fontSize: 24,
    lineType: "",
};

interface CanvasContext {
    canvas: ContextCanvas | null;
    workspace: EditorWorkspace | null;
    selectShape: fabric.Object | null;
    drawMode: DrawType | "" | "select";
    historyUndoNum: number;
    historyRedoNum: number;
    penProperty: PenPropertyOption;
    setState: SetState<CanvasContext>;
}

export const Context = createContext<CanvasContext>({
    canvas: null,
    workspace: null,
    selectShape: null,
    drawMode: "",
    historyUndoNum: 0,
    historyRedoNum: 0,
    penProperty: defaultPenProperty,
    setState: () => {},
});

type Props = {
    children?: ReactNode;
};

export const CanvasProvider = ({ children }: Props) => {
    const [state, setState] = useSetState<Omit<CanvasContext, "setState">>({
        canvas: null, // fabric实例
        workspace: null, // 工作区实例
        selectShape: null, // 当前画布已选中的图形
        drawMode: "", // 当前画笔模式
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
