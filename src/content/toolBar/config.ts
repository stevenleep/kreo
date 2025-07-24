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

export const DrawType = {
    lineSegment: 'lineSegment',
    straightLine: 'straightLine',
    straightMergeLine: 'StraightMergeLine',
    arcLine: 'ArcLine',
    rectLine: 'RectLine',
    rect: 'Rect',
    circle: 'Circle',
    ellipse: 'Ellipse',
    triangle: 'Triangle',
    starBooth: 'StarBooth',
    rectPlaceholder: 'RectPlaceholder',
    circlePlaceholder: 'CirclePlaceholder',
    specialBooth: 'CustomSpecialBooth',
};

export const noDraggableList = [DrawType.straightLine];
// export const noDraggableList = [DrawType.straightLine, DrawType.straightMergeLine, DrawType.arcLine, DrawType.rectLine, DrawType.starBooth];
