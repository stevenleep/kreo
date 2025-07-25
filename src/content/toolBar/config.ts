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
    ployLine = 'PloyLine',
    pencil= 'Pencil',
    rect= 'Rect',
    circle= 'Circle',
    ellipse= 'Ellipse',
    triangle= 'Triangle',
    text= 'Text'
};

// export type DrawType = typeof DrawType[keyof typeof DrawType];
// export const noDraggableList = [DrawType.straightLine];
// export const noDraggableList = [DrawType.straightLine, DrawType.straightMergeLine, DrawType.arcLine, DrawType.rectLine, DrawType.starBooth];
