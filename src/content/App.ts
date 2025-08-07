import React from "react";
import { createContentScriptApp } from "./root";

class App {
    /**
     * 插件注入页面的 dom 的父节点
     */
    private _rootContainer: HTMLDivElement | null = null;

    /**
     * shadowRoot 节点
     */
    private _shadowRoot: ShadowRoot | null = null;

    private contentScriptAppRef: React.RefObject<any> | null = null;

    constructor() {
        this.initRoot();
        // @ts-ignore
        const that = this;
        // @ts-ignore
        document.head.insertBefore = function (s, t) {
            // console.log('insertBefore被调用了');  // 在这里可以添加你的拦截逻辑
            // console.log(s)

            // 如果你想阻止appendChild，你可以在这里直接return，不调用原始的appendChild方法
            // return;

            // 否则，你可以调用原始的appendChild方法
            that.shadowRoot.appendChild(s);
        };

        // @ts-ignore
        document.head.removeChild = function (t) {
            that.shadowRoot.removeChild(t);
        };
    }

    get rootContainer(): HTMLDivElement {
        return this._rootContainer as HTMLDivElement;
    }

    get shadowRoot(): ShadowRoot {
        return this._shadowRoot as ShadowRoot;
    }

    private initRoot() {
        const div = document.createElement("div");
        div.id = "draw-extension-root-container";
        div.style.position = "relative";
        div.style.zIndex = "9999";
        const css = chrome.runtime.getURL("content.css");
        fetch(css)
            .then((response) => response.text())
            .then((cssContent) => {
                const style = document.createElement("style");
                style.textContent = cssContent;
                // 获取影子节点
                const shadowRoot = div.attachShadow({ mode: "open" });
                this._shadowRoot = shadowRoot;
                // 创建根节点，所有注入页面的内容都必须挂到这个根节点下
                const root = document.createElement("div");
                this._rootContainer = root;
                // 将 style、root 加入到影子节点中
                shadowRoot.appendChild(style);
                shadowRoot.appendChild(root);
                this._shadowRoot = shadowRoot;
                document.body.appendChild(div);
                const { ref } = createContentScriptApp(root);
                this.contentScriptAppRef = ref;
            });
    }

    destroy() {
        // 移除注入的根容器
        const rootContainer = document.getElementById("draw-extension-root-container");
        if (rootContainer && rootContainer.parentElement) {
            rootContainer.parentElement.removeChild(rootContainer);
        }

        // 清空引用
        this._rootContainer = null;
        this._shadowRoot = null;
        this.contentScriptAppRef = null;
    }
}

export default App;
