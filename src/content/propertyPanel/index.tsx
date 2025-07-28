import React, { useContext, useState, useEffect } from 'react';
import { fabric } from 'fabric';
import styles from './index.module.less';
import { Context } from '../draw/Context';
import { DrawType } from '../toolBar/config';

interface PropertyPanelProps {
    onClose?: () => void;
    onDuplicate?: () => void;
    onDelete?: () => void;
    onPropertyChange?: (property: string, value: any) => void;
}

const PropertyPanel: React.FC<PropertyPanelProps> = ({
    onClose,
    onDuplicate,
    onDelete,
    onPropertyChange
}) => {
    const { canvas, selectShape } = useContext(Context);
    const [localObject, setLocalObject] = useState<fabric.Object | null>(null);

    useEffect(() => {
        if (selectShape) {
            setLocalObject(selectShape);
        }
    }, [selectShape]);

    if (!localObject) {
        return null;
    }

    const isShapeObject = localObject.type !== DrawType.text;
    const isTextObject = localObject.type === DrawType.text;
    const obj = localObject as any;

    const handleInputChange = (property: string, value: any) => {
        if (onPropertyChange) {
            onPropertyChange(property, value);
        }
    };

    const handlePositionChange = (axis: 'x' | 'y', value: number) => {
        if (obj.startPoint) {
            const newPoint = { ...obj.startPoint };
            newPoint[axis] = value;
            obj.set({ left: newPoint.x, top: newPoint.y });
            canvas?.renderAll();
            handleInputChange(`position.${axis}`, value);
        }
    };

    const handleColorChange = (type: 'color' | 'fillColor', value: string) => {
        if (type === 'fillColor') {
            obj.set({ fill: value });
        } else {
            obj.set({ stroke: value });
        }
        canvas?.renderAll();
        handleInputChange(type, value);
    };

    const handleStrokeWidthChange = (value: number) => {
        obj.set({ strokeWidth: value });
        canvas?.renderAll();
        handleInputChange('strokeWidth', value);
    };

    const handleOpacityChange = (value: number) => {
        obj.set({ opacity: value });
        canvas?.renderAll();
        handleInputChange('opacity', value);
    };

    const handleTextChange = (property: string, value: any) => {
        obj.set({ [property]: value });
        canvas?.renderAll();
        handleInputChange(property, value);
    };

    const handleShadowChange = (property: string, value: any) => {
        const shadow = obj.shadow || new fabric.Shadow();
        shadow[property] = value;
        obj.set({ shadow });
        canvas?.renderAll();
        handleInputChange(`shadow.${property}`, value);
    };

    return (
        <div className={styles.wrap}>
            <div className={styles.header}>
                <h3 className={styles.title}>
                    属性
                </h3>
                <button 
                    id="close-panel" 
                    className={styles.close}
                    onClick={onClose}
                >
                    ✕
                </button>
            </div>

            <div className={styles.mb_xs}>
                <div className={styles.button_group}>
                    <button 
                        id="duplicate-btn" 
                        className={styles.primary_btn}
                        onClick={onDuplicate}
                    >
                        复制
                    </button>
                    <button 
                        id="delete-btn" 
                        className={styles.del_btn}
                        onClick={onDelete}
                    >
                        删除
                    </button>
                </div>
            </div>

            <div className={styles.mb_xs}>
                <label className={styles.label}>
                    位置
                </label>
                <div className={styles.input_group}>
                    <div className={styles.input_wrapper}>
                        <label className={styles.sub_label}>
                            X
                        </label>
                        <input 
                            type="number" 
                            id="pos-x" 
                            value={Math.round(obj.left || 0)} 
                            className={styles.input}
                            onChange={(e) => handlePositionChange('x', Number(e.target.value))}
                        />
                    </div>
                    <div className={styles.input_wrapper}>
                        <label className={styles.sub_label}>
                            Y
                        </label>
                        <input 
                            type="number" 
                            id="pos-y" 
                            value={Math.round(obj.top || 0)} 
                            className={styles.input}
                            onChange={(e) => handlePositionChange('y', Number(e.target.value))}
                        />
                    </div>
                </div>
            </div>

            <div className={styles.mb_xs}>
                <label className={styles.label}>
                    颜色
                </label>
                <div className={styles.input_group}>
                    <div className={styles.input_wrapper}>
                        <label className={styles.sub_label}>
                            主色
                        </label>
                        <input 
                            type="color" 
                            id="main-color" 
                            value={obj.stroke || '#000000'} 
                            className={styles.color_input}
                            onChange={(e) => handleColorChange('color', e.target.value)}
                        />
                    </div>
                    {isShapeObject && (
                        <div className={styles.input_wrapper}>
                            <label className={styles.sub_label}>
                                填充
                            </label>
                            <input 
                                type="color" 
                                id="fill-color" 
                                value={obj.fill || obj.stroke || '#000000'} 
                                className={styles.color_input}
                                onChange={(e) => handleColorChange('fillColor', e.target.value)}
                            />
                        </div>
                    )}
                </div>
                {isShapeObject && (
                    <label className={styles.checkbox_wrapper}>
                        <input 
                            type="checkbox" 
                            id="has-fill" 
                            checked={!!obj.fill} 
                            className={styles.checkbox}
                            onChange={(e) => {
                                if (e.target.checked) {
                                    handleColorChange('fillColor', obj.stroke || '#000000');
                                } else {
                                    obj.set({ fill: null });
                                    canvas?.renderAll();
                                }
                            }}
                        />
                        启用填充
                    </label>
                )}
            </div>

            {!isTextObject && (
                <div className={styles.mb_xs}>
                    <label className={styles.label}>
                        线条
                    </label>
                    <div style={{ marginBottom: '8px' }}>
                        <label className={styles.sub_label}>
                            粗细: {obj.strokeWidth || 1}px
                        </label>
                        <input 
                            type="range" 
                            id="stroke-width" 
                            min="1" 
                            max="20" 
                            value={obj.strokeWidth || 1} 
                            className={styles.range_input}
                            onChange={(e) => handleStrokeWidthChange(Number(e.target.value))}
                        />
                    </div>
                    <div>
                        <label className={styles.sub_label}>
                            透明度: {Math.round((obj.opacity || 1) * 100)}%
                        </label>
                        <input 
                            type="range" 
                            id="opacity" 
                            min="0" 
                            max="1" 
                            step="0.1" 
                            value={obj.opacity || 1} 
                            className={styles.range_input}
                            onChange={(e) => handleOpacityChange(Number(e.target.value))}
                        />
                    </div>
                </div>
            )}

            {isTextObject && (
                <div className={styles.mb_xs}>
                    <label className={styles.label}>
                        文字
                    </label>
                    <div style={{ marginBottom: '8px' }}>
                        <label className={styles.sub_label}>
                            内容
                        </label>
                        <input 
                            type="text" 
                            id="text-content" 
                            value={obj.text || ''} 
                            className={styles.input}
                            style={{ marginTop: '4px' }}
                            onChange={(e) => handleTextChange('text', e.target.value)}
                        />
                    </div>
                    <div className={styles.input_group}>
                        <div className={styles.input_wrapper}>
                            <label className={styles.sub_label}>
                                大小
                            </label>
                            <input 
                                type="number" 
                                id="font-size" 
                                min="8" 
                                max="72" 
                                value={obj.fontSize || 16} 
                                className={styles.input}
                                onChange={(e) => handleTextChange('fontSize', Number(e.target.value))}
                            />
                        </div>
                        <div className={styles.input_wrapper}>
                            <label className={styles.sub_label}>
                                字体
                            </label>
                            <select 
                                id="font-family" 
                                className={styles.select}
                                value={obj.fontFamily || 'Arial'}
                                onChange={(e) => handleTextChange('fontFamily', e.target.value)}
                            >
                                <option value="Arial">Arial</option>
                                <option value="Times New Roman">Times</option>
                                <option value="Courier New">Courier</option>
                                <option value="Helvetica">Helvetica</option>
                            </select>
                        </div>
                    </div>
                    <div className={styles.input_group}>
                        <select 
                            id="font-weight" 
                            className={styles.select}
                            value={obj.fontWeight || 'normal'}
                            onChange={(e) => handleTextChange('fontWeight', e.target.value)}
                        >
                            <option value="normal">普通</option>
                            <option value="bold">加粗</option>
                        </select>
                        <select 
                            id="text-align" 
                            className={styles.select}
                            value={obj.textAlign || 'left'}
                            onChange={(e) => handleTextChange('textAlign', e.target.value)}
                        >
                            <option value="left">左对齐</option>
                            <option value="center">居中</option>
                            <option value="right">右对齐</option>
                        </select>
                    </div>
                </div>
            )}

            <div style={{ marginBottom: '8px' }}>
                <label className={styles.label}>
                    阴影效果
                </label>
                <div className={styles.input_group}>
                    <div className={styles.input_wrapper}>
                        <label className={styles.sub_label}>
                            颜色
                        </label>
                        <input 
                            type="color" 
                            id="shadow-color" 
                            value={obj.shadow?.color || '#000000'} 
                            className={styles.color_input}
                            style={{ height: '28px' }}
                            onChange={(e) => handleShadowChange('color', e.target.value)}
                        />
                    </div>
                    <div className={styles.input_wrapper}>
                        <label className={styles.sub_label}>
                            模糊: {obj.shadow?.blur || 0}px
                        </label>
                        <input 
                            type="range" 
                            id="shadow-blur" 
                            min="0" 
                            max="20" 
                            value={obj.shadow?.blur || 0} 
                            className={styles.range_input}
                            onChange={(e) => handleShadowChange('blur', Number(e.target.value))}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PropertyPanel;