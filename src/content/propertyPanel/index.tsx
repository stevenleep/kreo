import React, { useContext, useState, useEffect } from 'react';
import { fabric } from 'fabric';
import styles from './index.module.less';
import { Context, defaultPenProperty } from '../draw/Context';
import { DrawType } from '../toolBar/config';
import { colorToRgba, getRGBA } from './utils';

interface PropertyPanelProps {
    onDuplicate?: () => void;
    onPropertyChange?: (property: string, value: any) => void;
}

const PropertyPanel: React.FC<PropertyPanelProps> = ({
    onDuplicate,
    onPropertyChange
}) => {
    const { selectShape, canvas, penProperty, setState } = useContext(Context);
    const [localObject, setLocalObject] = useState<fabric.Object | null>(null);
    const [showFill, setShowFill] = useState(false);

    const initProps = (shape: fabric.Object) => {
        let color = shape.get('stroke') as string;
        let fill = shape.get('fill') as string;
        let strokeWidth = shape.get('strokeWidth') as number;
        let alpha = 100;
        if (shape.type === DrawType.text) {
            setShowFill(false);
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
            }
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
            penProperty: { ...penProperty, color }
        });
        localObject.set({ stroke: color });
        canvas?.renderAll();
    };

    const handlerChangeAlpha = (evt: any) => {
        const alpha = Number(evt.target.value);
        setState({
            penProperty: {
                ...penProperty,
                alpha
            }
        });
        if (localObject.type === DrawType.pencil || localObject.type === DrawType.polyLine) {
            const stroke = getRGBA(penProperty.color, alpha);;
            localObject.set({ stroke });
        } else {
            const fill = getRGBA(penProperty.fill, alpha);
            localObject.set({ fill });
        }
        
        canvas?.renderAll();
    };

    const handlerBorderWidth = (evt: any) => {
        const strokeWidth = Number(evt.target.value);
        setState({
            penProperty: {
                ...penProperty,
                strokeWidth
            }
        });
        localObject.set({ strokeWidth });
        canvas?.renderAll();
    };

    const handlerChangeBgColor = (evt: any) => {
        const fill = evt.target.value;
        setState({
            penProperty: {
                ...penProperty,
                fill
            }
        });
        localObject.set({ fill });
        canvas?.renderAll();
    };

    return (
        <div className={styles.wrap}>
            <div className={styles.props_section}>
                <div className={styles.props_group}>
                    <div className={styles.props_group_label}>颜色</div>
                    <input onChange={handlerChangeColor} type="color" className={styles.props_input} value={penProperty.color} />
                </div>
                <div className={styles.props_group}>
                    <div className={styles.props_group_label}>线条粗细</div>
                    <input onChange={handlerBorderWidth} type="range" className={styles.props_slider} min="1" max="100" value={penProperty.strokeWidth} />
                    <span className={styles.props_value}>{penProperty.strokeWidth}</span>
                </div>
                {showFill && <div className={styles.props_group}>
                    <div className={styles.props_group_label}>填充</div>
                    <input onChange={handlerChangeBgColor} type="color" className={styles.props_input} value={penProperty.fill} />
                </div>}
                <div className={styles.props_group}>
                    <div className={styles.props_group_label}>透明度</div>
                    <input onChange={handlerChangeAlpha} type="range" className={styles.props_slider} min="1" max="100" step="1" value={penProperty.alpha} />
                    <span className={styles.props_value}>{penProperty.alpha}%</span>
                </div>
                {DrawType.text === localObject.type && <div className={styles.props_group}>
                    <div className={styles.props_group_label}>字体大小</div>
                    <input type="range" className={styles.props_slider} min="8" max="72" value="16" />
                    <span className={styles.props_value}>16</span>
                    
                    <div className={styles.props_group_label}>文本对齐</div>
                    <div className={styles.props_buttons}>
                    <button className={`${styles.props_btn} ${styles.active}`} data-align="left" title="左对齐">L</button>
                    <button className={`${styles.props_btn} ${styles.active}`} data-align="center" title="居中">C</button>
                    <button className={`${styles.props_btn} ${styles.active}`} data-align="right" title="右对齐">R</button>
                    </div>
                    
                    <div className={styles.props_group_label}>字体粗细</div>
                    <div className={styles.props_buttons}>
                    <button className={`${styles.props_btn} ${styles.active}`} data-weight="normal" title="正常">N</button>
                    <button className={`${styles.props_btn} ${styles.active}`} data-weight="bold" title="粗体">B</button>
                    </div>
                </div>}
            </div>
        </div>
    );
};

export default PropertyPanel;