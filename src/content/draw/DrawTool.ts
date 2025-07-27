// import { nanoid } from "nanoid";
import { DrawType } from "./../toolBar/config";
import Point from "./Point";
import { ContextCanvas } from './Context';
import { fabric } from 'fabric';

const linearDistance = (point1: { x: any; y: any; }, point2: { x: any; y: any; }) => {
  let xs = point2.x - point1.x;
  let ys = point2.y - point1.y;
  return Math.sqrt(xs * xs + ys * ys);
};

class DrawTool {
    drawMode: DrawType | '' = '';
    drawShaps: any[] = [];
    tempLine: Point[] = []; // 当前正在绘制的线
    points: Point[] = [];
    lastPoint: Point | null = null;
    canvas: ContextCanvas;
    constructor(canvas: ContextCanvas) {
        this.canvas = canvas;
    }

    active(drawMode: DrawType) {
        this.drawMode = drawMode;
        this.points = [];
        this.drawShaps = [];
    }

    drawStartTriangle(pointer: Point) {
        this.drawShaps[0] = new fabric.Triangle({
            left: pointer.x,
            top: pointer.y,
            originX: "left",
            originY: "top",
            strokeWidth: 1,
            stroke: '#000',
            fill: 'transparent',
            width: 0,
            height: 0,
            selectable: false,
            evented: false,
        });
        this.canvas.add(this.drawShaps[0]);
    }

    // drawMoveTriangle(pointer: Point) {
    //     if (this.points[0].x > pointer.x) {
    //        this.drawShaps[0].set({ left: Math.abs(pointer.x) });
    //     }
    //     if (this.points[0].y > pointer.y) {
    //         this.drawShaps[0].set({ top: Math.abs(pointer.y) });
    //     }
    //     this.drawShaps[0].set({ width: Math.abs(this.points[0].x - pointer.x) });
    //     this.drawShaps[0].set({ height: Math.abs(this.points[0].y - pointer.y) });
    //     this.drawShaps[0].setCoords();
    // }

    drawStartEllipse(pointer: Point) {
        this.drawShaps[0] = new fabric.Ellipse({
            left: pointer.x,
            top: pointer.y,
            rx: 0,
            ry: 0,
            originX: "left",
            originY: "top",
            strokeWidth: 1,
            stroke: '#000',
            fill: 'transparent',
            selectable: false,
            evented: false,
        });
        this.canvas.add(this.drawShaps[0]);
    }

    drawMoveEllipse(pointer: Point) {
        if (this.points[0].x > pointer.x) {
           this.drawShaps[0].set({ left: Math.abs(pointer.x) });
        }
        if (this.points[0].y > pointer.y) {
            this.drawShaps[0].set({ top: Math.abs(pointer.y) });
        }
        this.drawShaps[0].set({ rx: Math.abs(this.points[0].x - pointer.x) / 2 });
        this.drawShaps[0].set({ ry: Math.abs(this.points[0].y - pointer.y) / 2 });
        this.drawShaps[0].setCoords();
    }

    drawStartCircle(pointer: Point) {
        this.drawShaps[0] = new fabric.Circle({
            left: pointer.x,
            top: pointer.y,
            originX: "center",
            originY: "center",
            strokeWidth: 1,
            stroke: '#000',
            fill: 'transparent',
            selectable: false,
            evented: false,
            radius: 1,
        });
        this.canvas.add(this.drawShaps[0]);
    }

    drawMoveCircle(pointer: Point) {
        this.drawShaps[0].set({
            radius: linearDistance( this.points[0], pointer ),
        });
        this.drawShaps[0].setCoords();
    }

    drawStartRect(pointer: Point) {
        this.drawShaps[0] = new fabric.Rect({
            left: pointer.x,
            top: pointer.y,
            originX: "left",
            originY: "top",
            width: 0,
            height: 0,
            stroke: '#000',
            strokeWidth: 1,
            fill: 'transparent',
            transparentCorners: false,
            selectable: false,
            evented: false,
            strokeUniform: true,
            noScaleCache: false,
            angle: 0,
        });
        this.canvas.add(this.drawShaps[0]);
    }

    drawStartLine() {
        this.drawShaps[0] = new fabric.Polyline(this.points, {
            strokeWidth: 1,
            fill: 'transparent',
            stroke: '#000',
            originX: "center",
            originY: "center",
            selectable: false,
            evented: false,
        });

        this.canvas.add(this.drawShaps[0]);
    }

    drawMoveLine(pointer?: Point) {
        if (pointer) {
            this.drawShaps[0].set({ points: [...this.points, pointer] });
        } else {
            this.drawShaps[0].set({ points: this.points });
        }
        
        this.drawShaps[0].setCoords();
    }

    drawMoveRect(pointer: Point) {
        if (this.points[0].x > pointer.x) {
           this.drawShaps[0].set({ left: Math.abs(pointer.x) });
        }
        if (this.points[0].y > pointer.y) {
            this.drawShaps[0].set({ top: Math.abs(pointer.y) });
        }
        this.drawShaps[0].set({ width: Math.abs(this.points[0].x - pointer.x) });
        this.drawShaps[0].set({ height: Math.abs(this.points[0].y - pointer.y) });
        this.drawShaps[0].setCoords();
    }

    draw(ev: React.MouseEvent) {
        if (this.drawMode) {
            let pointer = this.canvas.getPointer(ev as unknown as Event);
            this.points.push(pointer);
            switch (this.drawMode) {
                case DrawType.circle:
                    this.drawStartCircle(pointer);
                    break;
                case DrawType.rect:
                    this.drawStartRect(pointer);
                    break;
                case DrawType.ellipse:
                    this.drawStartEllipse(pointer);
                    break;
                case DrawType.triangle:
                    this.drawStartTriangle(pointer);
                    break;
                case DrawType.ployLine:
                    if (!this.drawShaps.length) {
                        this.drawStartLine();
                    } else {
                        this.drawMoveLine();
                    }
                    break;
                default:
                    console.error('type not complate');
            }
        }
        // if (this.drawMode) {
        //     const absPointer = new Point(ev.clientX, ev.clientY); // 获取鼠标位置
        //     const confirmPoint = new Point(absPointer.x, absPointer.y);
        //     let x = 0;
        //     let y = 0;

        //     if (!this.points.length) {
        //         // 第一次点击
        //         // const tempPoint = new Point(absPointer.x, absPointer.y);
        //         // this.tempLine = [tempPoint, tempPoint];
        //         // this.anchors.push(anchor);
        //         // this.drawLayer.add(anchor);
        //     } else if (this.lastPoint) {
        //         if ([DrawType.rect, DrawType.circle, DrawType.triangle, DrawType.ellipse].includes(this.drawMode)) {
        //             this.points.push(absPointer);
        //             return this.drawEnd();
        //         }
        //         // else if (circle && this.lastPoint) {
        //         // 附近有可以吸附的点
        //         // const newPoint = new Point(x, y);
        //         // const line = [this.lastPoint, newPoint];
        //         // this.lines.push(line);
        //         this.tempLine = [
        //             new Point(x, y),
        //             new Point(x, y)
        //         ];
        //     } else {
        //         // 其余点击
        //         // ev.evt.shiftKey && confirmPoint.setXY(this.tempLine.x2!, this.tempLine.y2!);
        //         // const { x, y } = anchor.getCenterPoint();
        //         // this.anchors.push(anchor);
        //         // this.canvas.add(anchor);
        //         // anchor.set({ left: x, top: y });
        //         // this.tempLine.set({
        //         //     x1: x,
        //         //     y1: y,
        //         //     x2: x,
        //         //     y2: y,
        //         // });
        //         // this.tempLine = [
        //         //     new Point(x, y),
        //         //     new Point(x, y)
        //         // ];
        //     }

        // //     // 画上一个线，起始位置：自动吸附的点 > 鼠标点击的点
        //     if (this.lastPoint) {
        //         // const line = this.createLine([this.lastPoint, confirmPoint]);
        //         // this.lines.push(line);
        //         // this.drawLayer.add(line);
        //     }
        //     this.points.push(confirmPoint);

        //     if (this.drawShaps.length) {
        //         this.drawShaps[0].pointUnits = this.points.map(point => [point.x, point.y]).flat();
        //     } else {
        //         if (this.drawMode === DrawType.rect) {
        //             this.drawShaps.push(
        //                 {
        //                     type: this.drawMode,
        //                     x: absPointer.x,
        //                     y: absPointer.y,
        //                     width: 0,
        //                     height: 0
        //                 }
        //             );
        //         } else if (this.drawMode === DrawType.circle) {
        //             this.drawShaps.push(
        //                 {
        //                     type: this.drawMode,
        //                     x: absPointer.x,
        //                     y: absPointer.y,
        //                     radius: 0
        //                 }
        //             );
        //         } else {
        //             this.drawShaps.push(
        //                 {
        //                     type: this.drawMode,
        //                     pointUnits: [absPointer.x, absPointer.y, absPointer.x, absPointer.y]
        //                 }
        //             );
        //         }                
        //     }
        // }
    }

    drawMove(ev: React.MouseEvent) {
        if (this.drawMode && this.drawShaps.length) {
            let pointer = this.canvas.getPointer(ev as unknown as Event);
            // this.points.push(pointer);
            switch (this.drawMode) {
                case DrawType.circle:
                    this.drawMoveCircle(pointer);
                    break;
                case DrawType.rect:
                    this.drawMoveRect(pointer);
                    break;
                case DrawType.ellipse:
                    this.drawMoveEllipse(pointer);
                    break;
                case DrawType.triangle:
                    this.drawMoveRect(pointer);
                    break;
                case DrawType.ployLine:
                    this.drawMoveLine(pointer);
                    break;
                default:
                    console.error('type not complate');
            }
            this.canvas.renderAll();
            // const absPointer = new Point(ev.clientX, ev.clientY); // 获取鼠标位置

            // if (this.drawMode === DrawType.rect) {
            //     if (this.lastPoint) {
            //         this.drawShaps[0].width = Math.abs(absPointer.x - this.lastPoint.x);
            //         this.drawShaps[0].height = Math.abs(absPointer.y - this.lastPoint.y);
            //         this.drawShaps[0].x = Math.min(absPointer.x, this.lastPoint.x);
            //         this.drawShaps[0].y = Math.min(absPointer.y, this.lastPoint.y);
            //     }
            // } else if (this.drawMode === DrawType.circle) {
            //     if (this.lastPoint) {
            //         const dx = absPointer.x - this.lastPoint.x;
            //         const dy = absPointer.y - this.lastPoint.y;
            //         const radius = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
            //         this.drawShaps[0].radius = radius;
            //     }
            // } else {
            //     let tempPoint = absPointer;
            //     if (ev.shiftKey && this.lastPoint) {
            //         // 按下了shift，设置只能画直线
            //         // const point = this.shiftAngle(this.lastPoint, absPoint);
            //         // tempPoint = point;
            //     }

            //     this.drawShaps[0].pointUnits = [...this.points, tempPoint].map(point => [point.x, point.y]).flat();
            // }
        }
    }

    drawEnd(ev: React.MouseEvent) {
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
            // if (this.drawMode === DrawType.ployLine) {
            //     if (this.points.length >= 2) {
            //         const line = this.createPolyLine();
            //         // this.drawEndCallBack([line]);
            //     }
            // } else if (this.drawMode === DrawType.line && this.points.length >= 2) {
            //     if (this.points.length >= 2) {
            //         const lines = this.createLines();
            //         // this.drawEndCallBack(lines);
            //     }
            // } else if (this.drawMode === DrawType.rect) {
            //     const rect = this.createRect();
            //     // this.drawEndCallBack([rect]);
            // } else if (this.drawMode === DrawType.circle) {
            //     const circle = this.createCircle();
            //     // this.drawEndCallBack([circle]);
            // }

            // if (noStop) return;
            // this.stop();
            this.points.length = 0;
            this.drawShaps.length = 0;
            this.lastPoint = null;
            // this.deactive();
        }
    }

    // createPolyLine = () => {
    //     const pointUnits = this.points.map(p => [p.x, p.y]).flat();

    //     return {
    //         type: DrawType.ployLine,
    //         id: nanoid(),
    //         points: this.points.slice(0),
    //         pointUnits,
    //     };
    // }

    // createRect = () => {
    //     const points = this.points;
    //     const width = Math.abs(points[0].x - points[1].x);
    //     const height = Math.abs(points[0].y - points[1].y);
    //     const x = Math.min(points[0].x, points[1].x);
    //     const y = Math.min(points[0].y, points[1].y);

    //     return {
    //         type: DrawType.rect,
    //         id: nanoid(),
    //         points: this.points.slice(0),
    //         width,
    //         height,
    //         x,
    //         y 
    //     };
    // }

    // createCircle = () => {
    //     const points = this.points;

    //     const dx = points[0].x - points[1].x;
    //     const dy = points[0].y - points[1].y;
    //     const radius = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));

    //     return {
    //         type: DrawType.circle,
    //         id: nanoid(),
    //         points: this.points.slice(0),
    //         x: points[0].x,
    //         y: points[0].y,
    //         radius
    //     };
    // }

    // createLines = () => {
    //     const lines = [];
    //     for (let i = 0; i < this.points.length - 1;i++) {
    //         const p1 = this.points[i];
    //         const p2 = this.points[i + 1];
    //         const line = {
    //             type: DrawType.line,
    //             id: nanoid(),
    //             points: [p1, p2],
    //             pointUnits: [p1.x, p1.y, p2.x, p2.y],
    //         }
    //         lines.push(line)
    //     }

    //     return lines;
    // }

    deactive() {
        this.drawMode = '';
    }
};

export default DrawTool;