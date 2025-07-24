import { nanoid } from "nanoid";
import { DrawType } from "./../toolBar/config";
import Point from "./Point";

class DrawTool {
    drawMode: string = '';
    drawShaps: any[] = [];
    tempLine: Point[] = []; // 当前正在绘制的线
    points: Point[] = [];
    lastPoint: Point | null = null;
    drawEndCallBack: Function;
    constructor(drawEndCallBack: Function) {
        this.drawEndCallBack = drawEndCallBack;
    }

    active(drawMode: string) {
        this.drawMode = drawMode;
    }

    draw(ev: any) {
        if (this.drawMode) {
            const absPointer = new Point(ev.target.pointerPos.x, ev.target.pointerPos.y); // 获取鼠标位置

            const confirmPoint = new Point(absPointer.x, absPointer.y);
            const anchorPoint = this.getAroundCircle(absPointer); // 获取鼠标附近的点
            let x = 0;
            let y = 0;
            if (anchorPoint) {
                // 如果鼠标附近有可以吸附的点去获取点位置
                x = anchorPoint.x;
                y = anchorPoint.y;
            }
            if (!this.points.length) {
                // 第一次点击
                // const tempPoint = new Point(absPointer.x, absPointer.y);
                // this.tempLine = [tempPoint, tempPoint];
                // this.anchors.push(anchor);
                // this.drawLayer.add(anchor);
            } else if (this.lastPoint) {
                if ([DrawType.rect, DrawType.circle].includes(this.drawMode)) {
                    this.points.push(absPointer);
                    return this.drawEnd();
                }
                // else if (circle && this.lastPoint) {
                // 附近有可以吸附的点
                // const newPoint = new Point(x, y);
                // const line = [this.lastPoint, newPoint];
                // this.lines.push(line);
                // this.tempLine = [
                //     new Point(x, y),
                //     new Point(x, y)
                // ];
            } else {
                // 其余点击
                // ev.evt.shiftKey && confirmPoint.setXY(this.tempLine.x2!, this.tempLine.y2!);
                // const { x, y } = anchor.getCenterPoint();
                // this.anchors.push(anchor);
                // this.canvas.add(anchor);
                // anchor.set({ left: x, top: y });
                // this.tempLine.set({
                //     x1: x,
                //     y1: y,
                //     x2: x,
                //     y2: y,
                // });
                // this.tempLine = [
                //     new Point(x, y),
                //     new Point(x, y)
                // ];
            }

        //     // 画上一个线，起始位置：自动吸附的点 > 鼠标点击的点
            if (this.lastPoint && !anchorPoint) {
                // const line = this.createLine([this.lastPoint, confirmPoint]);
                // this.lines.push(line);
                // this.drawLayer.add(line);
            }
            // 如果有自动吸附的点从吸附的点开始画，没有就从点击的位置开始画
            this.lastPoint = anchorPoint ? new Point(x, y) : confirmPoint;
            this.points.push(this.lastPoint);

            if (this.drawShaps.length) {
                this.drawShaps[0].pointUnits = this.points.map(point => [point.x, point.y]).flat();
            } else {
                if (this.drawMode === DrawType.rect) {
                    this.drawShaps.push(
                        {
                            type: this.drawMode,
                            x: absPointer.x,
                            y: absPointer.y,
                            width: 0,
                            height: 0
                        }
                    );
                } else if (this.drawMode === DrawType.circle) {
                    this.drawShaps.push(
                        {
                            type: this.drawMode,
                            x: absPointer.x,
                            y: absPointer.y,
                            radius: 0
                        }
                    );
                } else {
                    this.drawShaps.push(
                        {
                            type: this.drawMode,
                            pointUnits: [absPointer.x, absPointer.y, absPointer.x, absPointer.y]
                        }
                    );
                }                
            }
        }
    }

    getAroundCircle(curPoint: Point) {
        for (let i = 0; i < this.points.length - 1; i++) {
            const point = this.points[i];
            // const radius = Number(item.radius);
            // 计算鼠标位置到圆形中心的距离
            const distance = Math.sqrt(Math.pow(curPoint.x - point.x, 2) + Math.pow(curPoint.y - point.y, 2));
            // 判断鼠标是否在圆形边界的一定范围内
            if (distance <= 10) {
                return point;
            }
        }
        return null;
    }

    drawMove(ev: any) {
        if (this.drawMode && this.drawShaps.length) {
            const absPointer = new Point(ev.target.pointerPos.x, ev.target.pointerPos.y); // 获取鼠标位置

            if (this.drawMode === DrawType.rect) {
                if (this.lastPoint) {
                    this.drawShaps[0].width = Math.abs(absPointer.x - this.lastPoint.x);
                    this.drawShaps[0].height = Math.abs(absPointer.y - this.lastPoint.y);
                    this.drawShaps[0].x = Math.min(absPointer.x, this.lastPoint.x);
                    this.drawShaps[0].y = Math.min(absPointer.y, this.lastPoint.y);
                }
            } else if (this.drawMode === DrawType.circle) {
                if (this.lastPoint) {
                    const dx = absPointer.x - this.lastPoint.x;
                    const dy = absPointer.y - this.lastPoint.y;
                    const radius = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
                    this.drawShaps[0].radius = radius;
                }
            } else {
                let tempPoint = absPointer;
                const anchorPoint = this.getAroundCircle(absPointer);
                if (anchorPoint) {
                    // 有相近的点，吸附一下
                    tempPoint = anchorPoint;
                } else if (ev.evt.shiftKey && this.lastPoint) {
                    // 按下了shift，设置只能画直线
                    // const point = this.shiftAngle(this.lastPoint, absPoint);
                    // tempPoint = point;
                } else {
                    // 有引导线也进行吸附
                    if (this.lastPoint) {
                        const dx = absPointer.x - this.lastPoint.x;
                        const dy = absPointer.y - this.lastPoint.y;

                        if (dx !== 0) {
                            const horizontalAngle = Math.abs(Math.atan(dy / dx)) * 180 / Math.PI;  // 弧度值
                            // 小于1度
                            if (horizontalAngle < 1) {
                                tempPoint = new Point(absPointer.x, this.lastPoint.y);
                            } else if (horizontalAngle > 89) {
                                tempPoint = new Point(this.lastPoint.x, absPointer.y);
                            }
                        }
                    }
                }

                this.drawShaps[0].pointUnits = [...this.points, tempPoint].map(point => [point.x, point.y]).flat();
            }
        }
    }

    drawEnd() {
        if (this.drawMode) {
            // const isMerge = this.drawMode === DrawType.straightMergeLine; // 是否要闭合
            // if (isMerge && this.points.length >= 3) {
            //     // // 画店铺
            //     // const booth = this.createPolygon(this.points, {
            //     //     fill: getRandomColor(),
            //     //     stroke: '',
            //     // });
            //     // const shape = this.workspace?.drawShape.createBoothGroup(booth);
            //     // if (shape) {
            //     //     shape.isEditPoint = true;
            //     //     this.canvas.add(shape);
            //     // }
            // }
            if (this.drawMode === DrawType.ployLine) {
                if (this.points.length >= 2) {
                    const line = this.createPolyLine();
                    this.drawEndCallBack([line]);
                }
            } else if (this.drawMode === DrawType.line && this.points.length >= 2) {
                if (this.points.length >= 2) {
                    const lines = this.createLines();
                    this.drawEndCallBack(lines);
                }
            } else if (this.drawMode === DrawType.rect) {
                const rect = this.createRect();
                this.drawEndCallBack([rect]);
            } else if (this.drawMode === DrawType.circle) {
                const circle = this.createCircle();
                this.drawEndCallBack([circle]);
            }

            // if (noStop) return;
            // this.stop();
            this.points.length = 0;
            this.drawShaps.length = 0;
            this.lastPoint = null;
            this.deactive();
        }
    }

    createPolyLine = () => {
        const pointUnits = this.points.map(p => [p.x, p.y]).flat();

        return {
            type: DrawType.ployLine,
            id: nanoid(),
            points: this.points.slice(0),
            pointUnits,
        };
    }

    createRect = () => {
        const points = this.points;
        const width = Math.abs(points[0].x - points[1].x);
        const height = Math.abs(points[0].y - points[1].y);
        const x = Math.min(points[0].x, points[1].x);
        const y = Math.min(points[0].y, points[1].y);

        return {
            type: DrawType.rect,
            id: nanoid(),
            points: this.points.slice(0),
            width,
            height,
            x,
            y 
        };
    }

    createCircle = () => {
        const points = this.points;

        const dx = points[0].x - points[1].x;
        const dy = points[0].y - points[1].y;
        const radius = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));

        return {
            type: DrawType.circle,
            id: nanoid(),
            points: this.points.slice(0),
            x: points[0].x,
            y: points[0].y,
            radius
        };
    }

    createLines = () => {
        const lines = [];
        for (let i = 0; i < this.points.length - 1;i++) {
            const p1 = this.points[i];
            const p2 = this.points[i + 1];
            const line = {
                type: DrawType.line,
                id: nanoid(),
                points: [p1, p2],
                pointUnits: [p1.x, p1.y, p2.x, p2.y],
            }
            lines.push(line)
        }

        return lines;
    }

    deactive() {
        this.drawMode = '';
    }
};

export default DrawTool;