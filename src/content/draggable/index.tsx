import { ReactNode, useRef, useState, useEffect } from "react";
import styles from "./index.module.less";

const TOOLBAR_Z_INDEX = 2147483647;
const OTHER_Z_INDEX = 2147483646;
const TOOLBAR_POSITION_KEY = "toolbar-position";

type DraggableProps = {
    children?: ReactNode;
    left: number;
    top: number;
    persistKey?: string;
};

const Draggable = (props: DraggableProps) => {
    const { persistKey } = props;
    const getInitialPosition = () => {
        if (persistKey) {
            try {
                const savedPosition = localStorage.getItem(persistKey);
                if (savedPosition) {
                    const { left, top } = JSON.parse(savedPosition);
                    return { left, top };
                }
            } catch {
                /* ignored */
            }
        }
        return { left: props.left, top: props.top };
    };

    const [moveStyle, setMoveStyle] = useState(getInitialPosition);
    const containerRef = useRef<HTMLDivElement | null>(null);

    const savePosition = (left: number, top: number) => {
        if (persistKey) {
            try {
                localStorage.setItem(persistKey, JSON.stringify({ left, top }));
            } catch {
                /* ignored */
            }
        }
    };

    useEffect(() => {
        if (!persistKey) {
            setMoveStyle({ left: props.left, top: props.top });
        }
    }, [props.left, props.top, persistKey]);

    const handlerMouseDown = (e: any) => {
        if (containerRef.current) {
            const target = e.target as HTMLElement;
            const tagName = target.tagName.toLowerCase();

            const isDragHandle = target.closest("[class*='drag_handle']");
            if (!isDragHandle) {
                if (["button", "input", "svg", "path"].includes(tagName)) {
                    return;
                }
                if (target.closest("button") || target.closest("input")) {
                    return;
                }
                const toolBar = target.closest("[class*='tool_bar']");
                if (toolBar) {
                    const isEmptyArea = !target.closest("[class*='toolbar_group']") && !target.closest("[class*='shape_dropdown']");

                    if (!isEmptyArea) {
                        return;
                    }
                }
            }

            const el = containerRef.current;
            let disX = e.pageX - el.offsetLeft;
            let disY = e.pageY - el.offsetTop;
            let currentX = moveStyle.left;
            let currentY = moveStyle.top;

            disX = e.pageX - el.offsetLeft;
            disY = e.pageY - el.offsetTop;

            document.onmousemove = function (e) {
                let x = e.pageX - disX;
                let y = e.pageY - disY;

                const maxX = window.innerWidth - el.offsetWidth;
                const maxY = window.innerHeight - el.offsetHeight;

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

                currentX = x;
                currentY = y;
                setMoveStyle({
                    left: x,
                    top: y,
                });
            };

            document.onmouseup = function () {
                document.onmousemove = document.onmouseup = null;
                savePosition(currentX, currentY);
            };
            document.onmouseenter = function () {
                document.onmousemove = document.onmouseup = null;
            };
        }
    };

    return (
        <div
            ref={containerRef}
            onMouseDown={handlerMouseDown}
            style={{
                left: `${moveStyle.left}px`,
                top: `${moveStyle.top}px`,
                zIndex: persistKey === TOOLBAR_POSITION_KEY ? TOOLBAR_Z_INDEX : OTHER_Z_INDEX,
            }}
            className={styles.drag}
        >
            {props.children}
        </div>
    );
};

export default Draggable;
