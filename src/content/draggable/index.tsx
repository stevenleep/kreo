import { ReactNode, useRef, useState } from "react";
import styles from './index.module.less';

type DraggableProps = {
    children?: ReactNode;
    left: number;
    top: number;
};

const Draggable = (props: DraggableProps) => {
    const [moveStyle, setMoveStyle] = useState({left: props.left, top: props.top});
    const containerRef = useRef<HTMLDivElement| null>(null);

    const handlerMouseDown = (e: any) => {
        if (containerRef.current) {
            if (['button', 'input', 'svg'].includes(e.target.tagName.toLocaleLowerCase())) {
                return;
            }
            const el = containerRef.current;
            let disX = e.pageX - el.offsetLeft;
            let disY = e.pageY - el.offsetTop;

            disX = e.pageX - el.offsetLeft;
            disY = e.pageY - el.offsetTop;

            document.onmousemove = function (e) {
            // if(isDisableDraggable(e)) return;
                let x = e.pageX - disX;
                let y = e.pageY - disY;

                let maxX = window.innerWidth - el.offsetWidth;
                let maxY = window.innerHeight - el.offsetHeight;

                if (x < 0) {
                    x = 0;
                } else if (x > maxX) {
                    x = maxX;
                }

                if (y < 0) {
                    y = 0;
                } else if (y > maxY) {
                    y = maxY;
                }

                setMoveStyle({
                    left: x,
                    top: y
                });
                // el.style.left = x + 'px';
                // el.style.top = y + 'px';
            };

            document.onmouseup = function () {
                document.onmousemove = document.onmouseup = null;
            };
            document.onmouseenter = function () {
                document.onmousemove = document.onmouseup = null;
            };
        };
    };

    return <div ref={containerRef} onMouseDown={handlerMouseDown} style={{ left: `${moveStyle.left}px`, top: `${moveStyle.top}px`, }} className={styles.drag}>{props.children}</div>;
};

export default Draggable;
 