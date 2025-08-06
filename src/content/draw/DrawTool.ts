import { DrawType } from "./../toolBar/config";
import Point from "./Point";
import { ContextCanvas, defaultPenProperty, PenPropertyOption } from "./Context";
import { fabric } from "fabric";

const linearDistance = (point1: { x: any; y: any }, point2: { x: any; y: any }) => {
    let xs = point2.x - point1.x;
    let ys = point2.y - point1.y;
    return Math.sqrt(xs * xs + ys * ys);
};

class DrawTool {
    drawMode: DrawType | "" = "";
    drawShaps: any[] = [];
    tempLine: Point[] = []; // 当前正在绘制的线
    points: Point[] = [];
    canvas: ContextCanvas;
    private penProperty: PenPropertyOption = defaultPenProperty;
    constructor(canvas: ContextCanvas) {
        this.canvas = canvas;
    }

    setPen(pen: PenPropertyOption) {
        this.penProperty = pen;
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
            strokeWidth: this.penProperty.strokeWidth,
            stroke: this.penProperty.color,
            fill: this.penProperty.fill,
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

    drawText(pointer: Point) {
        const textbox = new fabric.Textbox("", {
            left: pointer.x,
            top: pointer.y,
            originX: "left",
            originY: "top",
            stroke: this.penProperty.color,
            fill: this.penProperty.color,
            selectable: true,
            evented: true,
            fontSize: this.penProperty.fontSize,
            fontStyle: this.penProperty.italic ? "italic" : "normal",
            fontWeight: this.penProperty.bold ? "bold" : "normal",
            underline: this.penProperty.underline,
        });
        this.canvas.add(textbox);
        this.canvas.setActiveObject(textbox);
        textbox.enterEditing();
        // this.deactive();
    }

    drawStartEllipse(pointer: Point) {
        this.drawShaps[0] = new fabric.Ellipse({
            left: pointer.x,
            top: pointer.y,
            rx: 0,
            ry: 0,
            originX: "left",
            originY: "top",
            strokeWidth: this.penProperty.strokeWidth,
            stroke: this.penProperty.color,
            fill: this.penProperty.fill,
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
            strokeWidth: this.penProperty.strokeWidth,
            stroke: this.penProperty.color,
            fill: this.penProperty.fill,
            selectable: false,
            evented: false,
            radius: 1,
        });
        this.canvas.add(this.drawShaps[0]);
    }

    drawMoveCircle(pointer: Point) {
        this.drawShaps[0].set({
            radius: linearDistance(this.points[0], pointer),
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
            stroke: this.penProperty.color,
            strokeWidth: this.penProperty.strokeWidth,
            fill: this.penProperty.fill,
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
            strokeDashArray: this.penProperty.lineType === "dash" ? [5, 5] : undefined,
            strokeWidth: this.penProperty.strokeWidth,
            fill: "transparent",
            stroke: this.penProperty.color,
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
                case DrawType.text:
                    this.drawText(pointer);
                    this.drawEnd();
                    break;
                case DrawType.polyLine:
                    if (!this.drawShaps.length) {
                        this.drawStartLine();
                    } else {
                        this.drawMoveLine();
                    }
                    break;
                default:
                    console.error("type not complate");
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
                case DrawType.polyLine:
                    this.drawMoveLine(pointer);
                    break;
                default:
                    console.error("type not complate");
            }
            this.canvas.renderAll();
        }
    }

    drawEnd() {
        if (this.drawMode) {
            if (this.drawMode === DrawType.polyLine) {
                this.points.pop();
                this.drawMoveLine();
            } else if (this.drawMode !== DrawType.text) {
                if (this.drawShaps[0].width === 0 && this.drawShaps[0].height === 0) {
                    this.canvas.remove(this.drawShaps[0]);
                    this.canvas.renderAll();
                }
            }
            this.points.length = 0;
            this.drawShaps.length = 0;
        }
    }

    deactive() {
        this.drawMode = "";
        this.canvas.isDrawingMode = false;
    }
}

export default DrawTool;
