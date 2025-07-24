import { fabric } from 'fabric';
// import { divide, subtract, bignumber } from 'mathjs';
// import { throttle } from 'lodash';
import DrawTool from './DrawTool';
// import DrawShape from './DrawShape';
// import ControlsPlugin from './initControls';
// import { CalcWidth, PageType } from './config/type';
// import { EventsTypes, events } from '@/utils/events';
import { ContextCanvas } from './Context';

declare type ExtCanvas = ContextCanvas & {
    isDragging: boolean;
    lastPosX: number;
    lastPosY: number;
};
export const DefaultWorkSpaceColor = 'rgba(255,255,255,1)';

class EditorWorkspace {
    canvas: ContextCanvas;
    workspaceEl: HTMLElement;
    workspace: fabric.Rect | null;
    dragMode: boolean;
    fill: string;
    width: number | undefined;
    height: number | undefined;
    scale: number | undefined;
    drawTool!: DrawTool;
    // drawShape: DrawShape;
    mainImg: fabric.Image | null = null;
    mode: string | undefined;
    prevSelectObject: fabric.Object | null = null;
    loadJson = false;

    constructor(canvas: ContextCanvas) {
        this.canvas = canvas;
        this.workspaceEl = this.canvas.getElement();
        // if (option.workspaceId) {
        //     this.workspaceEl = document.querySelector(option.workspaceId) as HTMLElement;
        // } else {
            
        // }
        this.workspace = null;
        this.dragMode = false;
        this.fill = DefaultWorkSpaceColor;
        this.drawTool = new DrawTool(canvas, this);
        // this.drawShape = new DrawShape(canvas, this);
        // new ControlsPlugin(canvas);
        this.initBackground();
        this.initResizeObserve();
        this.initDring();
    }

    // 初始化背景
    initBackground() {
        this.width = this.workspaceEl.offsetWidth;
        this.height = this.workspaceEl.offsetHeight;
        this.canvas.setWidth(this.workspaceEl.offsetWidth);
        this.canvas.setHeight(this.workspaceEl.offsetHeight);
    }

    // 处理新数据
    handleNewData(json: any) {
        if (!json.objects || !json.objects.length) return Promise.resolve();
        return new Promise((resolve, reject) => {
            const src = json.objects.find((item: { id: string }) => item.id === 'mainImg')?.src;
            const image = new Image();
            image.src = src;
            image.crossOrigin = 'anonymous';
            image.onload = () => {
                this.canvas.loadFromJSON(json, () => {
                    const objects = this.canvas.getObjects();
                    objects.forEach((item: any) => {
                        if (item.id === 'workspace') {
                            this.workspace = item;
                        } else if (item.id === 'mainImg') {
                            this.mainImg = item;
                        }
                    });
                    if (this.workspace) {
                        this.setSize(this.workspace.width as number, this.workspace.height as number);
                    }
                    this.loadJson = true;
                    resolve(true);
                });
            };
            image.onerror = (err) => {
                reject(err);
            };
        });
    }

    inPointsToBooths = (list: any) => {
        // list.forEach((item: any) => {
        //     const group = this.jsonToGroup(item);
        //     this.canvas.add(group);
        // });
        this.canvas.renderAll();
    };

    jsonToGroup = (item: any) => {
        const arrPoints = item.boothMapData.split(',');
        const points: any = arrPoints
            .map((point: string, index: number) => {
                if (index % 2 === 0) {
                    return {
                        x: parseInt(point),
                        y: parseInt(arrPoints[index + 1]),
                    };
                }
            })
            .filter((x: any) => x);
        const polygon = new fabric.Polygon(points, {
            fill: item.boothMapColour,
        });
        // const group = this.drawShape.createBoothGroup(polygon, {
        //     boothClass: item.brandId ? item.brandName : '',
        //     boothCode: item.boothCode,
        //     boothArea: item.rentArea ? `${item.rentArea}㎡` : '',
        // });
        // group.id = item.id;
        // group.isEditPoint = true;
        // return group;
    };

    // rect and image
    initRect(src: string) {
        return new Promise((resolve, reject) => {
            fabric.Image.fromURL(
                src,
                (img: fabric.Image) => {
                    if (!img || !img.width || !img.height) {
                        reject(null);
                        return ; //message.warning('摊位图纸加载失败，请刷新页面重试');
                    }
                    this.canvas.discardActiveObject();
                    this.clearAllObject();
                    // img.set({
                    //     type: 'image',
                    //     left: 0,
                    //     top: 0,
                    //     id: 'mainImg',
                    //     selectable: false,
                    //     hasControls: false,
                    //     hoverCursor: 'default',
                    // });
                    this.width = img.width;
                    this.height = img.height;
                    const workspace = new fabric.Rect({
                        fill: this.fill,
                        width: this.width,
                        height: this.height,
                        // id: 'workspace',
                        selectable: false,
                        hasBorders: false,
                        hoverCursor: 'default',
                    });
                    this.mainImg = img;
                    this.workspace = workspace;
                    this.canvas.add(workspace);
                    this.canvas.add(img);
                    this.canvas.renderAll();
                    // this.auto();
                    resolve(true);
                    this.loadJson = true;
                },
                { crossOrigin: 'anonymous' }
            );
        });
    }
    /**
     * 设置画布中心到指定对象中心点上
     * @param {Object} obj 指定的对象
     */
    setCenterFromObject(obj: fabric.Rect) {
        const { canvas } = this;
        const objCenter = obj.getCenterPoint();
        const viewportTransform = canvas.viewportTransform;
        if (canvas.width === undefined || canvas.height === undefined || !viewportTransform) return;
        viewportTransform[4] = canvas.width / 2 - objCenter.x * viewportTransform[0];
        viewportTransform[5] = canvas.height / 2 - objCenter.y * viewportTransform[3];
        canvas.setViewportTransform(viewportTransform);
        canvas.renderAll();
    }

    // 初始化监听器
    initResizeObserve() {
        // const resizeObserver = new ResizeObserver(
        //     throttle(() => {
        //         this.auto();
        //     }, 50)
        // );
        // resizeObserver.observe(this.workspaceEl);
    }

    isNumber = (value: string | number) => {
        return typeof value === 'number';
    };

    setSize(width: number | string, height: number | string) {
        this.initBackground();
        this.width = (this.isNumber(width) ? width : +width) as number;
        this.height = (this.isNumber(height) ? height : +height) as number;
        // 重新设置workspace
        this.workspace = this.canvas.getObjects().find((item: any) => item.id === 'workspace') as fabric.Rect;
        this.workspace.set('width', this.width);
        this.workspace.set('height', this.height);
        // this.auto();
    }

    setZoomAuto(scale: number, cb?: (left?: number, top?: number) => void) {
        const { workspaceEl } = this;
        const width = workspaceEl.offsetWidth;
        const height = workspaceEl.offsetHeight;
        this.canvas.setWidth(width);
        this.canvas.setHeight(height);
        this.scale = scale;
        const center = this.canvas.getCenter();
        this.canvas.setViewportTransform(fabric.iMatrix.concat());
        this.canvas.zoomToPoint(new fabric.Point(center.left, center.top), scale);
        if (!this.workspace) return;
        this.setCenterFromObject(this.workspace);

        // 超出画布不展示
        this.workspace.clone((cloned: fabric.Rect) => {
            this.canvas.clipPath = cloned;
            this.canvas.requestRenderAll();
        });
        if (cb) cb(this.workspace.left, this.workspace.top);
    }

    getScale() {
        const viewPortWidth = this.workspaceEl.offsetWidth;
        const viewPortHeight = this.workspaceEl.offsetHeight;
        const width = this.width || 0;
        const height = this.height || 0;
        if (!width || !height) return 0;
        // 按照宽度
        // if (viewPortWidth / viewPortHeight < width / height) {
        //     return Number(subtract(divide(bignumber(viewPortWidth), bignumber(width)), 0.02));
        // } // 按照宽度缩放
        return 1;//Number(subtract(divide(bignumber(viewPortHeight), bignumber(height)), 0.02));
    }

    // // 自动缩放
    // auto() {
    //     const scale = this.getScale();
    //     if (scale) {
    //         this.scale = scale;
    //         this.setZoomAuto(scale);
    //     }
    // }

    // // 放大
    // big() {
    //     let zoomRatio = this.canvas.getZoom();
    //     zoomRatio += 0.05;
    //     if (zoomRatio >= 5) zoomRatio = 5;
    //     this.scale = zoomRatio;
    //     const center = this.canvas.getCenter();
    //     this.canvas.zoomToPoint(new fabric.Point(center.left, center.top), zoomRatio);
    //     events.emit(EventsTypes.ZoomScale);
    // }

    // // 缩小
    // small() {
    //     let zoomRatio = this.canvas.getZoom();
    //     zoomRatio -= 0.05;
    //     if (zoomRatio <= 0.1) zoomRatio = 0.1;
    //     this.scale = zoomRatio;
    //     const center = this.canvas.getCenter();
    //     this.canvas.zoomToPoint(new fabric.Point(center.left, center.top), zoomRatio);
    //     events.emit(EventsTypes.ZoomScale);
    // }

    // 开始拖拽
    startDring() {
        if (this.mainImg) {
            this.mainImg.set('hoverCursor', 'grab');
        }
        this.prevSelectObject = this.canvas.getActiveObject();
        this.dragMode = true;
        this.canvas.defaultCursor = 'grab';
        this.canvas.renderAll();
    }

    endDring() {
        if (this.mainImg) {
            this.mainImg.set('hoverCursor', 'default');
        }
        if (this.prevSelectObject) {
            this.canvas.setActiveObject(this.prevSelectObject);
        }
        this.dragMode = false;
        this.canvas.defaultCursor = 'default';
        this.canvas.renderAll();
    }

    // 拖拽模式
    initDring() {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const that = this;
        this.canvas.on('mouse:down', function (this: ExtCanvas, opt) {
            const evt = opt.e;
            if (evt.altKey || that.dragMode) {
                that.canvas.defaultCursor = 'grabbing';
                that.canvas.discardActiveObject();
                that.setDring();
                this.isDragging = true;
                this.lastPosX = evt.clientX;
                this.lastPosY = evt.clientY;
                this.requestRenderAll();
            }
        });

        this.canvas.on('mouse:move', function (this: ExtCanvas, opt) {
            if (this.isDragging) {
                that.canvas.discardActiveObject();
                that.canvas.defaultCursor = 'grabbing';
                const { e } = opt;
                if (!this.viewportTransform) return;
                const vpt = this.viewportTransform;
                vpt[4] += e.clientX - this.lastPosX;
                vpt[5] += e.clientY - this.lastPosY;
                this.lastPosX = e.clientX;
                this.lastPosY = e.clientY;
                this.requestRenderAll();
            }
        });

        this.canvas.on('mouse:up', function (this: ExtCanvas) {
            if (!this.viewportTransform) return;
            this.setViewportTransform(this.viewportTransform);
            this.isDragging = false;
            // if (!that.drawLine.isDrawing) {
            //     that.getObjects().forEach((obj) => {
            //         obj.selectable = true;
            //         obj.lockMovementX = false;
            //         obj.lockMovementY = false;
            //     });
            // }
            that.canvas.defaultCursor = 'default';
            this.requestRenderAll();
        });

        // 鼠标缩放事件
        this.canvas.on('mouse:wheel', function (this: ContextCanvas, opt) {
            if (!that.loadJson) return;
            const delta = opt.e.deltaY;
            let zoom = this.getZoom();
            zoom *= 0.999 ** delta;
            if (zoom > 5) zoom = 5;
            if (zoom < 0.1) zoom = 0.1;
            that.scale = zoom;
            const center = this.getCenter();
            this.zoomToPoint(new fabric.Point(center.left, center.top), zoom);
            opt.e.preventDefault();
            opt.e.stopPropagation();
            // events.emit(EventsTypes.ZoomScale);
        });
    }

    setDring() {
        this.canvas.defaultCursor = 'grab';
        this.getObjects().forEach((obj) => {
            obj.selectable = false;
            obj.lockMovementX = true;
            obj.lockMovementY = true;
        });
        this.canvas.requestRenderAll();
    }

    // 清空全部对象
    clearAllObject() {
        this.canvas.getObjects().forEach((item: fabric.Object) => {
            this.canvas.remove(item);
        });
        return this.canvas;
    }

    // 获取json
    getJson() {
        return this.canvas.toJSON(['id', 'cType', 'selectable', 'hasControls', 'groupFill', 'hoverCursor', 'isEditPoint']);
    }

    // 获取图片
    getBase64Image() {
        const workspace = this.workspace;
        if (!workspace) return;
        const { left, top, width, height } = workspace;
        const option = {
            format: 'png',
            quality: 1,
            left,
            top,
            width,
            height,
        };
        const scale = this.canvas.getZoom();
        this.canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
        const dataUrl = this.canvas.toDataURL(option);
        this.setZoomAuto(scale);
        return dataUrl;
    }

    getObjects() {
        return this.canvas.getObjects().filter((item: any) => !['workspace', 'mainImg', 'maskRect'].includes(item.id || ''));
    }
}

export default EditorWorkspace;
