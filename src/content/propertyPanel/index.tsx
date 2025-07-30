import React, { useContext, useState, useEffect } from 'react';
import { fabric } from 'fabric';
import styles from './index.module.less';
import { Context, defaultPenProperty } from '../draw/Context';
import { DrawType } from '../toolBar/config';

interface PropertyPanelProps {
    onDuplicate?: () => void;
    onPropertyChange?: (property: string, value: any) => void;
}

const PropertyPanel: React.FC<PropertyPanelProps> = ({
    onDuplicate,
    onPropertyChange
}) => {
    const { selectShape } = useContext(Context);
    const [localObject, setLocalObject] = useState<fabric.Object | null>(null);
    const [propertyInfo, setPropertyInfo] = useState(defaultPenProperty);

    useEffect(() => {
        if (selectShape) {
            setLocalObject(selectShape);
        }
    }, [selectShape]);

    if (!localObject) {
        return null;
    }

    const handlerChangeColor = () => {
        // localObject.set('')
    };

    const handlerBorderWidth = () => {

    };

    const handlerChangeBgColor = () => {

    };

    return (
        <div className={styles.wrap}>
            <div className={styles.props_section}>
                <div className={styles.props_group}>
                    <div className={styles.props_group_label}>颜色</div>
                    <input onChange={handlerChangeColor} type="color" className={styles.props_input} value={propertyInfo.color} />
                </div>
                <div className={styles.props_group}>
                    <div className={styles.props_group_label}>线条粗细</div>
                    <input onChange={handlerBorderWidth} type="range" className={styles.props_slider} min="1" max="20" value="5" />
                    <span className={styles.props_value} id="stroke-width-value">5</span>
                </div>
                <div className={styles.props_group}>
                    <div className={styles.props_group_label}>填充</div>
                    <input onChange={handlerChangeBgColor} type="color" className={styles.props_input} value={propertyInfo.color} />
                </div>
                <div className={styles.props_group}>
                    <div className={styles.props_group_label}>透明度</div>
                    <input type="range" className={styles.props_slider} min="0.1" max="1" step="0.1" value="1" />
                    <span className={styles.props_value} id="opacity-value">100%</span>
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