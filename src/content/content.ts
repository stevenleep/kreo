import "./content.less";
import App from "./App";

const initSandbox = () => {
    // @ts-ignore
    window._draw_app = window._draw_app || new App();
};

let isActive = false;
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "toggle") {
        if (isActive) {
            // @ts-ignore
            if (window._draw_app) {
                // @ts-ignore
                window._draw_app.destroy();
                // @ts-ignore
                window._draw_app = null;
                isActive = false;
            }
        } else {
            isActive = true;
            initSandbox();
        }
        sendResponse({
              success: true,
              active: isActive,
              message: `Drawing mode ${isActive ? "activated" : "deactivated"}`,
        });

        return true;
    }

    return false;
});
