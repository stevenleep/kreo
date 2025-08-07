const imgPromise = (imgBase64: string) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            resolve(img);
        };

        img.onerror = reject;
        img.src = imgBase64;
    });
};

export const captureFullPage = async () => {
    return new Promise((resolve, reject) => {
        (async () => {
            const totalHeight = document.body.scrollHeight;
            const viewportHeight = window.innerHeight;
            let currentY = 0;
            const images: any[] = [];

            while (currentY < totalHeight) {
                window.scrollTo(0, currentY);
                await sleep(500); // 等待渲染完成

                const dataUrl = await chrome.runtime.sendMessage({ type: "CAPTURE_TAB" });
                images.push(imgPromise(dataUrl));
                currentY += viewportHeight;
            }

            // 拼接图片
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");

            canvas.width = window.innerWidth;
            canvas.height = totalHeight;

            const list = await Promise.all(images);
            if (ctx) {
                // const bgImg = (await imgPromise(drawBase64)) as HTMLImageElement;
                // ctx.drawImage(bgImg, 0, 0, window.innerWidth, window.innerHeight);

                list.forEach((img, index) => {
                    ctx.drawImage(img, 0, index * viewportHeight, window.innerWidth, viewportHeight);
                });
            }
            resolve(canvas.toDataURL());
        })().catch(reject);
    });
};

const sleep = (ms: number) => {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
};
