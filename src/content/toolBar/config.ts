/**
 * 按钮
 */
export type panelItem = {
    title: string;
    subTitle?: string;
    type: string;
    icon: string;
    activeIcon: string;
    graphMapData?: string;
    json?: object;
};

export enum DrawType {
    polyLine = 'polyline',
    pencil= 'path',
    rect= 'rect',
    circle= 'circle',
    ellipse= 'ellipse',
    triangle= 'triangle',
    text= 'textbox'
};

// export type DrawType = typeof DrawType[keyof typeof DrawType];
// export const noDraggableList = [DrawType.straightLine];
// export const noDraggableList = [DrawType.straightLine, DrawType.straightMergeLine, DrawType.arcLine, DrawType.rectLine, DrawType.starBooth];
