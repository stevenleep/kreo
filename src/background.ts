// 截图
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === "CAPTURE_TAB") {
        chrome.tabs.captureVisibleTab({ format: "png" }).then(sendResponse);
        return true; // 异步响应
    }
    return false;
});

chrome.action.onClicked.addListener(async (tab) => {
    if (!tab.id) {
        return;
    }
    await sendMessageWithRetry(tab.id);
});

const RETRY_DELAY_MS = 200;

function delay(ms: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

async function sendMessageWithRetry(tabId: number, maxRetries: number = 3): Promise<boolean> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            await chrome.tabs.sendMessage(tabId, { action: "toggle" });
            return true;
        } catch {
            if (attempt === 1) {
                try {
                    await chrome.scripting.executeScript({
                        target: { tabId },
                        files: ["content.js"],
                    });
                    await delay(RETRY_DELAY_MS * 2);
                } catch {
                    return false;
                }
            } else if (attempt < maxRetries) {
                await delay(RETRY_DELAY_MS * attempt);
            }
        }
    }
    return false;
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "contentScriptReady") {
        sendResponse({ success: true });
    }
    return true;
});
