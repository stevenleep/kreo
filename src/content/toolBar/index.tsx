import React from "react";
import styles from './index.module.less';

const ToolBar = () => {
    const handlerDraw = () => {
        alert(1);
    };

    return (
        <div className={styles.tool_bar}>
            <div onClick={handlerDraw}>rect</div>
        </div>
    )
}

export default ToolBar;