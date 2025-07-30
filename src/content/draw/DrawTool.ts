import { DrawType } from "./../toolBar/config";
import Point from "./Point";
import { ContextCanvas, PenPropertyOption } from './Context';
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
    canvas: ContextCanvas;
    penProperty: PenPropertyOption;
    constructor(canvas: ContextCanvas, penProperty: PenPropertyOption) {
        this.canvas = canvas;
        this.penProperty = penProperty;
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
        this.drawShaps[0] = new fabric.Polyline([...this.points], {
            strokeWidth: 1,
            fill: 'transparent',
            stroke: '#000',
            // originX: "left",
            // originY: "top",
            selectable: false,
            strokeUniform: true,
            evented: false,
        });

        this.canvas.add(this.drawShaps[0]);
    }

    drawMoveLine(pointer?: Point) {        
        const newPoints = pointer ? [...this.points, pointer] : [...this.points];
        this.drawShaps[0].set({ points: newPoints });
        this.drawShaps[0].initialize(newPoints);
        
        this.drawShaps[0].setCoords();
        this.canvas.renderAll();
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
    }

    drawMove(ev: React.MouseEvent) {
        if (this.drawMode && this.drawShaps.length) {
            let pointer = this.canvas.getPointer(ev as unknown as Event);
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
        }
    }

    drawEnd() {
        if (this.drawMode) {
            if (this.drawMode === DrawType.ployLine) {
                this.points.pop();
                this.drawMoveLine();
            }

            // this.canvas.setActiveObject(this.drawShaps[0]);
            // this.drawShaps[0].setCoords();     // 更新坐标缓存
            // this.canvas.requestRenderAll();
            this.points.length = 0;
            this.drawShaps.length = 0;
        }
    }

    deactive() {
        this.drawMode = '';
    }
};

export default DrawTool;