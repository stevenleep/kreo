import React from 'react';
import { createContentScriptApp } from './root';

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

  /**
   * 是否在操作选取，如 ocr 截屏、dom 选取
   */
  // public isOperateSelecting = false;

  // public removeWordMark: any = () => {
  //   //
  // };

  constructor() {
    this.initRoot();
    // 注入 inject-content-script.js
    // const script = document.createElement('script');
    // // script.src = chrome.runtime.getURL('content-script.js');
    // // document.body.append(script);
    // // script.onload = () => {
    // //   script.parentNode?.removeChild(script);
    // // };
    // 保存原始的insertBefore方法
    // const originalInsertBeforeChild = document.head.insertBefore;
    // const originalRemoveChild = document.head.removeChild;
    // const originalInsertBeforeChild = document.head.add;


    // 覆盖insertBefore方法
    // @ts-ignore
    const that = this;
    // @ts-ignore
    document.head.insertBefore = function(s, t) {
      // console.log('insertBefore被调用了');  // 在这里可以添加你的拦截逻辑
      // console.log(s)

      // 如果你想阻止appendChild，你可以在这里直接return，不调用原始的appendChild方法
      // return;

      // 否则，你可以调用原始的appendChild方法
      that.shadowRoot.appendChild(s);
    };

    // @ts-ignore
    document.head.removeChild = function(t) {
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
    const div = document.createElement('div');
    div.id = 'draw-extension-root-container';
    div.classList.add('draw-extension-root-container-class');
    const css = chrome.runtime.getURL('content.css');
    fetch(css)
      .then(response => response.text())
      .then(cssContent => {
        const style = document.createElement('style');
        style.textContent = cssContent;
        // 获取影子节点
        const shadowRoot = div.attachShadow({ mode: 'open' });
        this._shadowRoot = shadowRoot;
        // 创建根节点，所有注入页面的内容都必须挂到这个根节点下
        const root = document.createElement('div');
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

  async toggleSidePanel(visible?: boolean) {
    this.contentScriptAppRef?.current?.toggleSidePanel(visible);
  }
}

export default App;