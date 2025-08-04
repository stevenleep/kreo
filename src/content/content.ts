// import { ContentController } from "./ContentController";
// const controller = new ContentController();
import './content.less';
import App from './App';

const initSandbox = () => {
  // @ts-ignore
  window._draw_app = window._draw_app || new App();
}

let isActive = false;
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "toggle") {
    // const isActive = controller.getStatus();
    if (isActive) {
        return
    }
    isActive = true;
    initSandbox();
    // sendResponse({
    //       success: true,
    //       active: isActive,
    //       message: `Drawing mode ${isActive ? "activated" : "deactivated"}`,
    // });
    // controller
    //   .toggle()
    //   .then(() => {
    //     const isActive = controller.getStatus();
    //     sendResponse({
    //       success: true,
    //       active: isActive,
    //       message: `Drawing mode ${isActive ? "activated" : "deactivated"}`,
    //     });
    //   })
    //   .catch((error) => {
    //     sendResponse({
    //       success: false,
    //       error: error instanceof Error ? error.message : "Unknown error",
    //     });
    //   });

    return true;
  }

  return false;
});

// export { controller as default };

// (window as any).debugToggle = () => controller.debugToggle();
// (window as any).getStatus = () => controller.getStatus();
