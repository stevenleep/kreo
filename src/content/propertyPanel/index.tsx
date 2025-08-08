import React, { useContext, useState, useEffect } from "react";
import { fabric } from "fabric";
import styles from "./index.module.less";
import { Context } from "../draw/Context";
import { DrawType } from "../toolBar/config";
import { colorToRgba, getRGBA } from "./utils";

const PropertyPanel = () => {
    const { selectShape, canvas, penProperty, setState } = useContext(Context);
    const [localObject, setLocalObject] = useState<fabric.Object | null>(null);
    const [showFill, setShowFill] = useState(false);

    const initProps = (shape: fabric.Object) => {
        let color = shape.get("stroke") as string;
        let fill = shape.get("fill") as string;
        let strokeWidth = shape.get("strokeWidth") as number;
        let alpha = 100;
        let fontSize = 24;
        let textProps = {};
        if (shape.type === DrawType.text) {
            setShowFill(false);
            fontSize = (shape as fabric.Textbox).get("fontSize") || 12;
            textProps = {
                bold: (shape as fabric.Textbox).get("fontWeight") === "normal",
                underline: (shape as fabric.Textbox).get("underline"),
                italic: (shape as fabric.Textbox).get("fontStyle") === "italic",
            };
        } else if (shape.type === DrawType.pencil || shape.type === DrawType.polyLine) {
            const obj = colorToRgba(color);
            color = obj.hex;
            alpha = obj.alpha;
            setShowFill(false);
        } else {
            const obj = colorToRgba(fill);
            fill = obj.hex;
            alpha = obj.alpha;
            setShowFill(true);
        }

        setState({
            penProperty: {
                color,
                strokeWidth,
                fill,
                alpha,
                lineType: "",
                fontSize,
                ...textProps,
            },
        });
    };

    useEffect(() => {
        if (selectShape) {
            setLocalObject(selectShape);
            initProps(selectShape);
        } else {
            setLocalObject(null);
        }
    }, [selectShape]);

    if (!localObject) {
        return null;
    }

    const handlerChangeColor = (evt: any) => {
        const color = evt.target.value;
        setState({
            penProperty: { ...penProperty, color },
        });
        localObject.set({ stroke: color });
        if (localObject.type === DrawType.text) {
            localObject.set({ fill: color });
        }
        canvas?.renderAll();
        saveHistory();
    };

    const handlerChangeLineType = (evt: any) => {
        const dash = evt.target.value === "dash";
        setState({
            penProperty: {
                ...penProperty,
                lineType: evt.target.value,
            },
        });
        if (dash) {
            localObject.set({ strokeDashArray: [5, 5] });
        } else {
            localObject.set({ strokeDashArray: undefined });
        }

        canvas?.renderAll();
        saveHistory();
    };

    const handlerChangeStyle = (type: "underline" | "italic" | "bold") => {
        if (type === "bold") {
            (localObject as fabric.Textbox).set({ fontWeight: penProperty.bold ? "normal" : "bold" });
            setState({
                penProperty: {
                    ...penProperty,
                    bold: !penProperty.bold,
                },
            });
        } else if (type === "italic") {
            (localObject as fabric.Textbox).set({ fontStyle: penProperty.italic ? "normal" : "italic" });
            setState({
                penProperty: {
                    ...penProperty,
                    italic: !penProperty.italic,
                },
            });
        } else if (type === "underline") {
            (localObject as fabric.Textbox).set({ underline: !penProperty.underline });
            setState({
                penProperty: {
                    ...penProperty,
                    underline: !penProperty.underline,
                },
            });
        }
        canvas?.renderAll();
        saveHistory();
    };

    const handlerChangeFontSize = (evt: any) => {
        const fontSize = Number(evt.target.value);
        setState({
            penProperty: {
                ...penProperty,
                fontSize,
            },
        });
        (localObject as fabric.Textbox).set({ fontSize });

        canvas?.renderAll();
        saveHistory();
    };

    const handlerChangeAlpha = (evt: any) => {
        const alpha = Number(evt.target.value);
        setState({
            penProperty: {
                ...penProperty,
                alpha,
            },
        });
        if (localObject.type === DrawType.pencil || localObject.type === DrawType.polyLine || localObject.type === DrawType.text) {
            const stroke = getRGBA(penProperty.color, alpha);
            localObject.set({ stroke });
            if (localObject.type === DrawType.text) {
                localObject.set({ fill: stroke });
            }
        } else {
            const fill = getRGBA(penProperty.fill, alpha);
            localObject.set({ fill });
        }

        canvas?.renderAll();
        saveHistory();
    };

    const handlerBorderWidth = (evt: any) => {
        const strokeWidth = Number(evt.target.value);
        setState({
            penProperty: {
                ...penProperty,
                strokeWidth,
            },
        });
        localObject.set({ strokeWidth });
        canvas?.renderAll();
        saveHistory();
    };

    const handlerChangeBgColor = (evt: any) => {
        const fill = evt.target.value;
        setState({
            penProperty: {
                ...penProperty,
                fill,
            },
        });
        localObject.set({ fill });
        canvas?.renderAll();
        saveHistory();
    };

    const saveHistory = () => {
        if (canvas?.historyPlugin) {
            // canvas.historyPlugin.pushHistory();
        }
    };

    return (
        <div className={styles.wrap}>
            <div className={styles.props_section}>
                <div className={styles.props_group}>
                    <div className={styles.props_group_label}>颜色</div>
                    <input onChange={handlerChangeColor} type="color" className={styles.props_input} value={penProperty.color} />
                </div>
                {DrawType.text !== localObject.type && (
                    <div className={styles.props_group}>
                        <div className={styles.props_group_label}>线宽</div>
                        <input
                            onChange={handlerBorderWidth}
                            type="range"
                            className={styles.props_slider}
                            min="1"
                            max="100"
                            value={penProperty.strokeWidth}
                        />
                        <span className={styles.props_value}>{penProperty.strokeWidth}</span>
                    </div>
                )}
                {showFill && (
                    <div className={styles.props_group}>
                        <div className={styles.props_group_label}>填充</div>
                        <input onChange={handlerChangeBgColor} type="color" className={styles.props_input} value={penProperty.fill} />
                    </div>
                )}
                <div className={styles.props_group}>
                    <div className={styles.props_group_label}>透明度</div>
                    <input
                        onChange={handlerChangeAlpha}
                        type="range"
                        className={styles.props_slider}
                        min="0"
                        max="100"
                        step="1"
                        value={penProperty.alpha}
                    />
                    <span className={styles.props_value}>{penProperty.alpha}%</span>
                </div>
                {DrawType.polyLine === localObject.type && (
                    <div className={styles.props_group}>
                        <div className={styles.props_group_label}>线条类型</div>
                        <select value={penProperty.lineType} onChange={handlerChangeLineType}>
                            <option value="">实线</option>
                            <option value="dash">虚线</option>
                        </select>
                    </div>
                )}
                {DrawType.text === localObject.type && (
                    <div className={styles.props_group}>
                        <div className={styles.props_group_label}>字体大小</div>
                        <input
                            onChange={handlerChangeFontSize}
                            type="range"
                            className={styles.props_slider}
                            min="12"
                            max="72"
                            value={penProperty.fontSize}
                        />
                        <span className={styles.props_value}>{penProperty.fontSize}</span>
                        <div className={styles.props_group_label}>字体样式</div>
                        <div className={styles.props_buttons}>
                            <button
                                onClick={() => handlerChangeStyle("bold")}
                                className={`${styles.props_btn} ${styles.bold} ${penProperty.bold ? styles.active : ""}`}
                                title="粗体"
                            >
                                B
                            </button>
                            <button
                                onClick={() => handlerChangeStyle("italic")}
                                className={`${styles.props_btn} ${styles.italic} ${penProperty.italic ? styles.active : ""}`}
                                title="斜体"
                            >
                                I
                            </button>
                            <button
                                onClick={() => handlerChangeStyle("underline")}
                                className={`${styles.props_btn} ${styles.underline} ${penProperty.underline ? styles.active : ""}`}
                                title="下划线"
                            >
                                A
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PropertyPanel;
