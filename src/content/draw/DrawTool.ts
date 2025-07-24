import { fabric } from 'fabric';
// import { DrawType } from '../components/tool/config';
import EditorWorkspace from './EditorWorkspace';
import { DrawType } from '../toolBar/config';
// import initGuidelines from './initGuidelines';
// import { getRandomColor } from '@/utils/tools';

type LineCoords = [fabric.Point, fabric.Point];
type OffListener = (ev: fabric.IEvent) => void;

function getObjectSizeWithStroke(object: any) {
    var stroke = new fabric.Point(
        object.strokeUniform ? 1 / object.scaleX : 1, 
        object.strokeUniform ? 1 / object.scaleY : 1
    ).multiply(object.strokeWidth);
    return new fabric.Point(object.width + stroke.x, object.height + stroke.y);
}

function actionHandler(eventData: any, transform: any, x: number, y: number) {
    var polygon = transform.target,
        currentControl = polygon.controls[polygon.__corner],
        mouseLocalPosition = polygon.toLocalPoint(new fabric.Point(x, y), 'center', 'center'),
    polygonBaseSize = getObjectSizeWithStroke(polygon),
            size = polygon._getTransformedDimensions(0, 0),
            finalPointPosition = {
                x: mouseLocalPosition.x * polygonBaseSize.x / size.x + polygon.pathOffset.x,
                y: mouseLocalPosition.y * polygonBaseSize.y / size.y + polygon.pathOffset.y
            };
    polygon.points[currentControl.pointIndex] = finalPointPosition;
    return true;
}

function anchorWrapper(anchorIndex: any, fn: any) {
    return function(eventData, transform, x, y) {
      var fabricObject = transform.target,
          absolutePoint = fabric.util.transformPoint({
              x: (fabricObject.points[anchorIndex].x - fabricObject.pathOffset.x),
              y: (fabricObject.points[anchorIndex].y - fabricObject.pathOffset.y),
          }, fabricObject.calcTransformMatrix()),
          actionPerformed = fn(eventData, transform, x, y),
          newDim = fabricObject._setPositionDimensions({}),
          polygonBaseSize = getObjectSizeWithStroke(fabricObject),
          newX = (fabricObject.points[anchorIndex].x - fabricObject.pathOffset.x) / polygonBaseSize.x,
  		    newY = (fabricObject.points[anchorIndex].y - fabricObject.pathOffset.y) / polygonBaseSize.y;
      fabricObject.setPositionByOrigin(absolutePoint, newX + 0.5, newY + 0.5);
      return actionPerformed;
    }
  }

  	// this function will be used both for drawing and for interaction.
	function polygonPositionHandler(dim, finalMatrix, fabricObject) {
        var x = (fabricObject.points[this.pointIndex].x - fabricObject.pathOffset.x),
              y = (fabricObject.points[this.pointIndex].y - fabricObject.pathOffset.y);
          return fabric.util.transformPoint(
              { x: x, y: y },
        fabric.util.multiplyTransformMatrices(
          fabricObject.canvas.viewportTransform,
          fabricObject.calcTransformMatrix()
        )
          );
      }
  

/**
 * StraightLine 直线
 * ArcLine 弧线
 * RectLine 画矩形
 * StraightMergeLine 自动闭合
 */
export type LineType = 'StraightLine' | 'ArcLine' | 'RectLine' | 'StraightMergeLine';

class DrawTool {
    canvas: fabric.Canvas; // canvas实例
    workspace: EditorWorkspace | undefined;
    isDrawing = false; // 是否处于绘画模式
    drawMode: string | null = null; // 绘画类型
    endCallback: (() => void) | undefined; // 绘制完成的回调
    // 线----------------------------------------------
    anchors: fabric.Circle[] = []; // 所有circle的集合
    tempLine: fabric.Line | null = null; // 当前正在绘制的线
    lastPoint: fabric.Point | null = null; // 最后一次绘制的点
    lines: fabric.Line[] = []; // 所有线的集合
    points: fabric.Point[] = []; // 所有点的集合
    // 圆弧---------------------------------------------
    arcStartCircle: fabric.Circle | null = null;
    arcEndCircle: fabric.Circle | null = null;
    arcCircle: fabric.Circle | null = null;
    arcLine: fabric.Line | null = null;
    arcPath: fabric.Path | null = null; // 圆弧
    downRadius = 0;
    // 房间---------------------------------------------
    rectLineStartCircle: fabric.Circle | null = null;
    rectLineEndCircle: fabric.Circle | null = null;
    rectLinePath: fabric.Path | null = null;

    constructor(canvas: fabric.Canvas, workspace?: EditorWorkspace) {
        this.canvas = canvas;
        this.workspace = workspace;
    }

    /**
     * 创建一个圆
     */
    createAnchor = (position: fabric.Point) => {
        return new fabric.Circle({
            radius: 3,
            left: position.x,
            top: position.y,
            fill: 'rgb(255,95,95)',
            scaleX: 2 / this.canvas.getZoom(),
            scaleY: 2 / this.canvas.getZoom(),
            strokeWidth: 2 / this.canvas.getZoom(),
            originX: 'center',
            originY: 'center',
            evented: false,
            selectable: false,
        });
    };
    /**
     * 创建一个线
     */
    createLine = (coors: LineCoords) => {
        const [p1, p2] = coors;
        return new fabric.Line([p1.x, p1.y, p2.x, p2.y], {
            fill: '#000',
            stroke: '#000',
            strokeWidth: 2,
            selectable: false,
            evented: false,
        });
    };

    /**
     * 创建一个线
     */
    createPolyLine = (points: fabric.Point[]) => {
        console.log(11111)
        const line = new fabric.Polyline(points, {
            fill: undefined,
            stroke: '#000',
            strokeWidth: 1,
            lockRotation: true,
            // evented: tr,
            // hasBorders: false,
            strokeUniform: true,
            selectable: false
        });

        const lastControl = points.length - 1;

        line.controls = points.reduce((acc: any, point, index) => {
            acc['p' + index] = new fabric.Control({
                positionHandler: polygonPositionHandler,
                actionHandler: anchorWrapper(index > 0 ? index - 1 : lastControl, actionHandler),
                actionName: 'modifyPolygon',
                // pointIndex: index
            });
            return acc;
        }, {});

        return line;
    };
    /**
     * 创建多边形
     */
    createPolygon = (points: fabric.Point[], props?: fabric.IPolylineOptions) => {
        return new fabric.Polygon(this.points, {
            fill: '',
            stroke: '#000',
            strokeWidth: 1,
            ...props,
        });
    };
    /**
     * 修改所有点的层级
     */
    // ensureAnchorsForward = () => {
    //     this.anchors.forEach((item: fabric.Circle) => {
    //         item.bringToFront();
    //     });
    //     this.rectLineStartCircle && this.rectLineStartCircle.bringToFront();
    //     this.rectLineEndCircle && this.rectLineEndCircle.bringToFront();
    //     this.arcStartCircle && this.arcStartCircle.bringToFront();
    //     this.arcEndCircle && this.arcEndCircle.bringToFront();
    // };
    shiftAngle = (start: fabric.Point, end: fabric.Point) => {
        const startX = start.x;
        const startY = start.y;
        const x2 = end.x - startX;
        const y2 = end.y - startY;
        const r = Math.sqrt(x2 * x2 + y2 * y2);
        let angle = (Math.atan2(y2, x2) / Math.PI) * 180;
        angle = ~~(((angle + 7.5) % 360) / 90) * 90;

        const cosx = r * Math.cos((angle * Math.PI) / 180);
        const sinx = r * Math.sin((angle * Math.PI) / 180);

        return {
            x: cosx + startX,
            y: sinx + startY,
        };
    };
    /**
     * 获取鼠标相近最近的点，用于自动吸附
     */
    getAroundCircle = (ev: fabric.IEvent<MouseEvent>) => {
        const mouseX = ev.absolutePointer?.x || 0;
        const mouseY = ev.absolutePointer?.y || 0;
        for (let i = 0; i < this.anchors.length - 1; i++) {
            const item = this.anchors[i];
            const left = Number(item.left);
            const top = Number(item.top);
            const radius = Number(item.radius);
            // 计算鼠标位置到圆形中心的距离
            const distance = Math.sqrt(Math.pow(mouseX - left - radius, 2) + Math.pow(mouseY - top - radius, 2));
            // 判断鼠标是否在圆形边界的一定范围内
            if (distance <= radius + 10) {
                return item;
            }
        }
    };
    /**
     * 创建
     */
    confirmBuildPath = (noStop?: boolean) => {
        if (!this.canvas) return;
        const isMerge = this.drawMode === DrawType.straightMergeLine; // 是否要闭合
        if (isMerge && this.points.length >= 3) {
            // // 画店铺
            // const booth = this.createPolygon(this.points, {
            //     fill: getRandomColor(),
            //     stroke: '',
            // });
            // const shape = this.workspace?.drawShape.createBoothGroup(booth);
            // if (shape) {
            //     shape.isEditPoint = true;
            //     this.canvas.add(shape);
            // }
        } else if (this.drawMode === DrawType.straightLine && this.points.length >= 2) {
            // 画墙
            // let t = '';
            // this.points.forEach((item: fabric.Point, index: number) => {
            //     t += `${index === 0 ? 'M' : 'L'} ${item.x} ${item.y}`;
            // });
            // debugger
            const line = this.createPolyLine(this.points);
            this.canvas.add(line);
            // this.sendToBack(shape);
        }

        if (noStop) return;
        this.stop();
    };
    /**
     * 获取事件
     */
    getEvents = () => {
        const type = this.drawMode as LineType;
        return {
            [DrawType.straightLine]: {
                down: this.downStraightLineHandler,
                move: this.moveStraightLineHandler,
                cancel: this.cancelStraightLineListener,
            },
            // [DrawType.straightMergeLine]: {
            //     down: this.downStraightLineHandler,
            //     move: this.moveStraightLineHandler,
            //     cancel: this.cancelStraightLineListener,
            // },
            // [DrawType.arcLine]: {
            //     down: this.downArcLineHandler,
            //     move: this.moveArcLineHandler,
            //     cancel: this.cancelArcLineListener,
            // },
            // [DrawType.rectLine]: {
            //     down: this.downRectLineHandler,
            //     move: this.moveRectLineHandler,
            //     cancel: this.cancelRectLineHandler,
            // },
        }[type];
    };
    // 画矩形按下
    downRectLineHandler = (ev: fabric.IEvent<MouseEvent>): void => {
        if (this.workspace && this.workspace.dragMode) return;
        if (!this.isTriggerEvent(DrawType.rectLine)) return;
        const absPointer = ev.absolutePointer || new fabric.Point(0, 0);
        if (!this.rectLineStartCircle) {
            this.rectLineStartCircle = this.createAnchor(absPointer);
            this.canvas.add(this.rectLineStartCircle).renderAll();
        } else {
            this.rectLinePath && this.sendToBack(this.rectLinePath);
            this.setAllObjectSlectable(false);
            this.clearRectLine().renderAll();
        }
    };
    // 画矩形移动
    moveRectLineHandler = (ev: fabric.IEvent<MouseEvent>): void => {
        if (!this.isTriggerEvent(DrawType.rectLine)) return;
        if (!this.rectLineStartCircle) return;
        const absPointer = ev.absolutePointer || new fabric.Point(0, 0);
        const { x, y } = this.rectLineStartCircle.getCenterPoint();
        // 计算 X 轴的距离
        const distanceX = Math.abs(absPointer.x - x);

        // 计算 Y 轴的距离
        const distanceY = Math.abs(absPointer.y - y);

        if (this.rectLinePath) {
            this.canvas.remove(this.rectLinePath);
        }
        let t = '';
        if (absPointer.x > x && absPointer.y > y) {
            // 右下
            t = `M ${x} ${y} L ${x + distanceX} ${y} L ${absPointer.x} ${absPointer.y} L ${x} ${y + distanceY} Z`;
        } else if (absPointer.x < x && absPointer.y > y) {
            // 左下
            t = `M ${x} ${y} L ${x - distanceX} ${y} L ${absPointer.x} ${absPointer.y} L ${x} ${y + distanceY} Z`;
        } else if (absPointer.x > x && absPointer.y < y) {
            // 右上
            t = `M ${x} ${y} L ${x} ${y - distanceY} L ${absPointer.x} ${absPointer.y} L ${x + distanceX} ${y} Z`;
        } else if (absPointer.x < x && absPointer.y < y) {
            // 左上
            t = `M ${x} ${y} L ${x} ${y - distanceY} L ${absPointer.x} ${absPointer.y} L ${x - distanceX} ${y} Z`;
        }
        if (!this.rectLineEndCircle) {
            this.rectLineEndCircle = this.createAnchor(absPointer);
            this.canvas.add(this.rectLineEndCircle);
        } else {
            this.rectLineEndCircle.set({
                left: absPointer.x,
                top: absPointer.y,
            });
        }
        if (t) {
            const path = this.createPath(t);
            this.rectLinePath = path;
            this.canvas.add(path);
            // this.ensureAnchorsForward();
            this.canvas.requestRenderAll();
        }
    };
    // rectLine stop
    cancelRectLineHandler = (evt: KeyboardEvent) => {
        if (!this.isTriggerEvent(DrawType.rectLine)) return;
        if (['Escape', 'Enter'].includes(evt.key)) {
            if (this.rectLinePath) {
                this.canvas.remove(this.rectLinePath);
            }
            this.stop();
        }
    };
    /**
     * 绘制直线鼠标按下事件
     */
    downStraightLineHandler = (ev: fabric.IEvent<MouseEvent>): void => {
        if (this.workspace && this.workspace.dragMode) return;
        if (!this.isTriggerEvent([DrawType.straightLine, DrawType.straightMergeLine])) return;
        const absPointer = ev.absolutePointer || new fabric.Point(0, 0); // 获取鼠标位置
        const confirmPoint = new fabric.Point(absPointer.x, absPointer.y);
        const anchor = this.createAnchor(absPointer); // 画点
        const circle = this.getAroundCircle(ev); // 获取鼠标附近的点
        let x = 0;
        let y = 0;
        if (circle) {
            // 如果鼠标附近有可以吸附的点去获取点位置
            const point = circle.getCenterPoint();
            x = point.x;
            y = point.y;
        }
        if (!this.tempLine) {
            // 第一次点击
            const tempPoint = new fabric.Point(absPointer.x, absPointer.y);
            this.tempLine = this.createLine([tempPoint, tempPoint]);
            this.canvas.add(this.tempLine);
            this.anchors.push(anchor);
            this.canvas.add(anchor);
        } else if (circle && this.lastPoint) {
            // 附近有可以吸附的点
            const newPoint = new fabric.Point(x, y);
            const line = this.createLine([this.lastPoint, newPoint]);
            this.lines.push(line);
            this.tempLine.set({
                x1: x,
                y1: y,
                x2: x,
                y2: y,
            });
            this.canvas.add(line);
            if (this.drawMode === DrawType.lineSegment) {
                this.confirmBuildPath(true);
                this.clearPoints();
                this.anchors = [];
                this.tempLine && this.canvas.remove(this.tempLine);
                this.tempLine = null;
                this.lastPoint = null;
                this.clearLines();
                this.lines = [];
                this.points = [];
                this.setAllObjectSlectable(false);
                return;
            }
        } else {
            // 其余点击
            // ev.e.shiftKey && confirmPoint.setXY(this.tempLine.x2!, this.tempLine.y2!);
            const { x, y } = anchor.getCenterPoint();
            this.anchors.push(anchor);
            this.canvas.add(anchor);
            anchor.set({ left: x, top: y });
            this.tempLine.set({
                x1: x,
                y1: y,
                x2: x,
                y2: y,
            });
        }
        // 画上一个线，起始位置：自动吸附的点 > 鼠标点击的点
        if (this.lastPoint && !circle) {
            const line = this.createLine([this.lastPoint, confirmPoint]);
            this.lines.push(line);
            this.canvas.add(line);
        }
        // 如果有自动吸附的点从吸附的点开始画，没有就从点击的位置开始画
        this.lastPoint = circle ? new fabric.Point(x, y) : confirmPoint;
        this.points.push(this.lastPoint);
        // this.ensureAnchorsForward();
        this.canvas.renderAll();
    };
    /**
     * 绘制直线鼠标移动事件
     */
    moveStraightLineHandler = (ev: fabric.IEvent<MouseEvent>): void => {
        if (!this.isTriggerEvent([DrawType.straightLine, DrawType.straightMergeLine])) return;
        if (!this.tempLine) return;
        const absPoint = ev.absolutePointer || new fabric.Point(0, 0);
        const circle = this.getAroundCircle(ev);
        if (circle) {
            // 有相近的点，吸附一下
            const { x, y } = circle.getCenterPoint();
            this.tempLine.set({
                x2: x,
                y2: y,
            });
        } 
        // else if (ev.e.shiftKey && this.lastPoint) {
        //     // 按下了shift，设置只能画直线
        //     const point = this.shiftAngle(this.lastPoint, absPoint);
        //     this.tempLine.set({
        //         x2: point.x,
        //         y2: point.y,
        //     });
        // }
        else {
            // 有引导线也进行吸附
            if (this.lastPoint) {
                const absPointer = ev.absolutePointer || new fabric.Point(0, 0);
                const dx = absPointer.x - this.lastPoint.x;
                const dy = absPointer.y - this.lastPoint.y;

                if (dx !== 0) {
                    const horizontalAngle = Math.abs(Math.atan(dy / dx)) * 180 / Math.PI;  // 弧度值
                    // 小于5度
                    if (horizontalAngle < 1) {
                        this.tempLine.set({
                            x2: absPointer.x,
                            y2: this.lastPoint.y,
                        });
                    } else if (horizontalAngle > 89) {
                        this.tempLine.set({
                            x2: this.lastPoint.x,
                            y2: absPointer.y,
                        });
                    } else {
                        // 自由画线
                        this.tempLine.set({
                            x2: absPoint.x,
                            y2: absPoint.y,
                        });
                    }
                } else {
                    // 自由画线
                    this.tempLine.set({
                        x2: absPoint.x,
                        y2: absPoint.y,
                    });
                }
            } else {
                // 自由画线
                this.tempLine.set({
                    x2: absPoint.x,
                    y2: absPoint.y,
                });
            }
        }
        this.canvas.renderAll();
    };
    // line stop
    cancelStraightLineListener = (evt: KeyboardEvent) => {
        if (!this.isTriggerEvent([DrawType.straightLine, DrawType.straightMergeLine])) return;
        if (['Escape', 'Enter'].includes(evt.key)) {
            this.confirmBuildPath();
        }
    };
    // create path
    createPath(t: string, props?: fabric.IPathOptions) {
        return new fabric.Path(t, {
            fill: 'transparent',
            stroke: '#000',
            strokeWidth: 1,
            selectable: false,
            hoverCursor: 'default',
            strokeUniform: true,
            ...props,
        });
    }

    /**
     * 画弧线按下
     */
    downArcLineHandler = (ev: fabric.IEvent<MouseEvent>): void => {
        if (this.workspace && this.workspace.dragMode) return;
        if (!this.isTriggerEvent(DrawType.arcLine)) return;
        const absPointer = ev.absolutePointer || new fabric.Point(0, 0);
        const point = new fabric.Point(absPointer.x, absPointer.y);
        const anchor = this.createAnchor(point);
        if (!this.arcStartCircle) {
            this.arcStartCircle = anchor;
            this.canvas.add(anchor);
        } else if (!this.arcEndCircle) {
            this.arcEndCircle = anchor;
            // point1和point2
            const point1 = this.arcStartCircle.getCenterPoint();
            const point2 = this.arcEndCircle.getCenterPoint();
            // 计算半径
            const radius = point1.distanceFrom(point2) / 2;
            this.downRadius = radius;
            // 创建半圆
            const path = this.createPath(`M${point1.x},${point1.y} A${radius},${radius} 0 0 1 ${point2.x},${point2.y}`);
            if (this.arcLine) {
                this.canvas.remove(this.arcLine);
                this.arcLine = null;
            }
            this.canvas.add(anchor);
            this.canvas.add(path);
            this.arcPath = path;
        } else {
            this.arcPath && this.sendToBack(this.arcPath);
            this.setAllObjectSlectable(false);
            this.clearArcLine().renderAll();
        }
        // this.ensureAnchorsForward();
        this.canvas.renderAll();
    };
    /**
     * 获取半径
     * @param point1
     * @param point2
     * @param point3
     * @returns
     */
    getCircleRadius = (point1: fabric.Point, point2: fabric.Point, point3: fabric.Point) => {
        const { x: x1, y: y1 } = point1;
        const { x: x2, y: y2 } = point2;
        const { x: x3, y: y3 } = point3;
        // 计算三条边长
        const a = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
        const b = Math.sqrt(Math.pow(x3 - x2, 2) + Math.pow(y3 - y2, 2));
        const c = Math.sqrt(Math.pow(x1 - x3, 2) + Math.pow(y1 - y3, 2));

        // 计算半周长
        const s = (a + b + c) / 2;

        // 计算三角形的面积
        const area = Math.sqrt(s * (s - a) * (s - b) * (s - c));

        // 计算外接圆的半径
        return (a * b * c) / (4 * area);
    };
    /**
     * 画弧线移动
     */
    moveArcLineHandler = (ev: fabric.IEvent<MouseEvent>): void => {
        if (!this.isTriggerEvent(DrawType.arcLine)) return;
        if (!this.arcStartCircle) return;
        const absPointer = ev.absolutePointer || new fabric.Point(0, 0);
        const point1 = this.arcStartCircle.getCenterPoint(); // 起始点
        if (this.arcStartCircle && !this.arcEndCircle) {
            if (!this.arcLine) {
                this.arcLine = this.createLine([point1, absPointer]);
                this.canvas.add(this.arcLine);
            } else {
                this.arcLine.set({
                    x2: absPointer.x,
                    y2: absPointer.y,
                });
            }
            // this.ensureAnchorsForward();
            this.canvas.requestRenderAll();
            return;
        }
        if (!this.arcEndCircle) return;
        const point2 = this.arcEndCircle.getCenterPoint(); // 结束点
        const radius = this.getCircleRadius(point1, point2, absPointer); // 计算圆的半径
        const p = point1.midPointFrom(point2); // 获取起始点和结束点的中间点
        const w = absPointer.distanceFrom(new fabric.Point(p.x, p.y)); // 获取鼠标到中心点的距离
        const s = w < this.downRadius ? 0 : 1; // 小圆弧or大圆弧
        if (!point1 || !point2 || !this.arcPath) return;
        // 更新圆弧上的圆
        if (!this.arcCircle) {
            this.arcCircle = this.createAnchor(absPointer);
            this.canvas.add(this.arcCircle);
        } else {
            this.arcCircle.set({ left: absPointer.x, top: absPointer.y });
        }
        let c = 1; // 顺时针or逆时针
        const calcX = Math.abs(point1.x - point2.x);
        const calcY = Math.abs(point1.y - point2.y);
        if (calcX < calcY) {
            c = absPointer.x < p.x ? 0 : 1;
        } else {
            c = absPointer.y < p.y ? 1 : 0;
        }
        const path = this.createPath(`M${point1.x},${point1.y} A${radius},${radius} 0 ${s} ${c} ${point2.x},${point2.y}`); // 绘制
        if (this.arcPath) {
            this.canvas.remove(this.arcPath); // 把上一次的删除
        }
        this.canvas.add(path); // 添加到画布上
        this.arcPath = path;
        // this.ensureAnchorsForward();
        this.canvas.requestRenderAll();
    };
    // arcLine stop
    cancelArcLineListener = (evt: KeyboardEvent) => {
        if (!this.isTriggerEvent(DrawType.arcLine)) return;
        if (['Escape', 'Enter'].includes(evt.key)) {
            this.stop();
        }
    };
    // 是否能触发事件
    isTriggerEvent = (type: string | string[]) => {
        return this.canvas && this.isDrawing && Array.isArray(type) ? type.includes(this.drawMode as string) : this.drawMode === type;
    };
    /**
     * 绑定事件
     */
    bindEvent = () => {
        if (!this.canvas || !this.drawMode) return;
        const events = this.getEvents();
        if (!events) return;
        this.canvas.on('mouse:down', events.down);
        this.canvas.on('mouse:move', events.move);
        window.addEventListener('keydown', events.cancel);
    };

    /**
     * 解绑事件
     */
    unbindEvent = () => {
        if (!this.canvas || !this.drawMode) return;
        const evnets = this.getEvents();
        if (!evnets) return;
        this.canvas.off('mouse:down', evnets.down as OffListener);
        this.canvas.off('mouse:move', evnets.move as OffListener);
        window.removeEventListener('keydown', evnets.cancel);
    };
    /**
     * 删除所有线
     */
    clearLines = () => {
        if (!this.canvas) return;
        this.lines.forEach((item: fabric.Line) => {
            this.canvas.remove(item);
        });
    };
    /**
     * 删除所有点
     */
    clearPoints = () => {
        if (!this.canvas) return;
        this.anchors.forEach((item: fabric.Circle) => {
            this.canvas.remove(item);
        });
    };
    /**
     * 开始绘制直线
     */
    start = (type: LineType | string, callback?: () => void) => {
        this.stop();
        this.canvas.discardActiveObject();
        this.setAllObjectSlectable(false);
        this.canvas.renderAll();
        this.endCallback = callback;
        this.drawMode = type;
        this.isDrawing = true;
        this.bindEvent();
    };
    // arcCircle pause
    clearArcLine = () => {
        this.arcPath = null;
        this.downRadius = 0;
        this.arcStartCircle && this.canvas.remove(this.arcStartCircle);
        this.arcEndCircle && this.canvas.remove(this.arcEndCircle);
        this.arcStartCircle = null;
        this.arcEndCircle = null;
        this.arcLine = null;
        this.arcCircle && this.canvas.remove(this.arcCircle);
        this.arcCircle = null;
        return this.canvas;
    };
    // rectLine pause
    clearRectLine = () => {
        if (this.rectLineStartCircle) {
            this.canvas.remove(this.rectLineStartCircle);
        }
        if (this.rectLineEndCircle) {
            this.canvas.remove(this.rectLineEndCircle);
        }
        this.rectLineStartCircle = null;
        this.rectLineEndCircle = null;
        this.rectLinePath = null;
        return this.canvas;
    };
    // 设置所有元素可选中状态（不包括底图）
    setAllObjectSlectable = (v: boolean) => {
        if (!this.workspace) return;
        this.workspace.getObjects().forEach((item: fabric.Object) => {
            item.selectable = v;
            item.hasControls = v;
            item.hoverCursor = v ? 'move' : 'default';
        });
    };
    // 修改元素层级至最底
    sendToBack = (shape: fabric.Object) => {
        shape.sendToBack();
        this.workspace?.mainImg?.sendToBack();
        this.workspace?.workspace?.sendToBack();
    };
    /**
     * 取消绘制
     */
    stop = () => {
        if (!this.canvas) return;
        this.unbindEvent();
        this.drawMode = null;
        this.isDrawing = false;

        this.clearPoints();
        this.anchors = [];
        this.tempLine && this.canvas.remove(this.tempLine);
        this.tempLine = null;
        this.lastPoint = null;
        this.clearLines();
        this.lines = [];
        this.points = [];

        this.arcLine && this.canvas.remove(this.arcLine);
        this.arcPath && this.canvas.remove(this.arcPath);
        this.clearArcLine();

        this.rectLinePath && this.canvas.remove(this.rectLinePath);
        this.clearRectLine();

        this.setAllObjectSlectable(true);
        if (this.endCallback) {
            this.endCallback();
            this.endCallback = undefined;
        }
        this.canvas.renderAll();
        return this.canvas;
    };
}

export default DrawTool;