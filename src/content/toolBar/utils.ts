// let images = [];

// chrome.runtime.onMessage.addListener(async (msg) => {
//   if (msg.type === 'CAPTURE_FULL_PAGE') {
//     await captureFullPage();
//   }
// });

export const captureFullPage = async () =>  {
  const totalHeight = document.body.scrollHeight;
  const viewportHeight = window.innerHeight;
  let currentY = 0;

  while (currentY < totalHeight) {
    window.scrollTo(0, currentY);
    await sleep(300); // 等待渲染完成

    const dataUrl = await chrome.runtime.sendMessage({ type: 'CAPTURE_TAB' });
    // images.push(dataUrl);
    console.log(dataUrl);
    currentY += viewportHeight;
  }

  // // 拼接图片
  // const canvas = document.createElement('canvas');
  // const ctx = canvas.getContext('2d');

  // const img = new Image();
  // img.onload = async () => {
  //   canvas.width = img.width;
  //   canvas.height = img.height * images.length;

  //   for (let i = 0; i < images.length; i++) {
  //     const img2 = new Image();
  //     img2.src = images[i];
  //     await new Promise(r => img2.onload = r);
  //     ctx.drawImage(img2, 0, i * img2.height);
  //   }

  //   const finalUrl = canvas.toDataURL('image/png');
  //   const a = document.createElement('a');
  //   a.href = finalUrl;
  //   a.download = 'fullpage.png';
  //   a.click();

  //   // 重置状态
  //   images = [];
  //   currentY = 0;
  // };
  // img.src = images[0];
}

const sleep = async (ms: number) => {
  return new Promise(resolve => setTimeout(resolve, ms));
}


// async function nodeToPng(node) {
//   const svg = new XMLSerializer().serializeToString(node);
//   const blob = new Blob([`
//     <svg xmlns="http://www.w3.org/2000/svg" width="${node.offsetWidth}" height="${node.offsetHeight}">
//       <foreignObject width="100%" height="100%">
//         <div xmlns="http://www.w3.org/1999/xhtml">${svg}</div>
//       </foreignObject>
//     </svg>
//   `], { type: 'image/svg+xml' });

//   const img = new Image();
//   img.src = URL.createObjectURL(blob);
//   await img.decode();

//   const canvas = new OffscreenCanvas(img.width, img.height);
//   canvas.getContext('2d').drawImage(img, 0, 0);
//   return canvas.convertToBlob({ type: 'image/png' });
// }

// // 使用
// const pngBlob = await nodeToPng(document.querySelector('#target'));
// const a = document.createElement('a');
// a.href = URL.createObjectURL(pngBlob);
// a.download = 'native.png';
// a.click();