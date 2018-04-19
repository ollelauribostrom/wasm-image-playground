export function resizeImage(img, maxWidth, maxHeight) {
  if (img.width > maxWidth) {
    const scale = (maxWidth / img.width);
    img.width = img.width * scale;
    img.height = img.height * scale;
  }

  if (img.height > maxHeight) {
    const scale = (maxHeight / img.height);
    img.width = img.width * scale;
    img.height = img.height * scale;
  }

  return img;
}

export function imshowWrapper(imageMat, cv) {
  if(!(imageMat instanceof cv.Mat)) {
    throw new Error('Please input the valid cv.Mat instance.');
  }
  const outImageMat = new cv.Mat();
  const depth = imageMat.type() % 8;
  const scale = depth <= cv.CV_8S ? 1 : depth <= cv.CV_32S ? 1 / 256 : 255;
  const shift = depth === cv.CV_8S || depth === cv.CV_16S ? 128 : 0;
  imageMat.convertTo(outImageMat, cv.CV_8U, scale, shift);
  switch(outImageMat.type()) {
    case cv.CV_8UC1:
      cv.cvtColor(outImageMat, outImageMat, cv.COLOR_GRAY2RGBA);
      break;
    case cv.CV_8UC3:
      cv.cvtColor(outImageMat, outImageMat, cv.COLOR_RGB2RGBA);
      break;
    case cv.CV_8UC4:
      break;
    default:
      throw new Error('Bad number of channels (Source image must have 1, 3 or 4 channels)');
  }
  const imgData = new ImageData(new Uint8ClampedArray(outImageMat.data), outImageMat.cols, outImageMat.rows);
  outImageMat.delete();
  imageMat.delete();
  return imgData;
}

export async function imagesToUint8ClampedArray(images) {
  return Promise.all(images.map(async image => ({
    data: await imageToUint8ClampedArray(image.data),
    id: image.id
  })));
} 

export function imageToUint8ClampedArray(img) {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const image = new Image();
    const ctx = canvas.getContext('2d');
    image.onload = () => {
      canvas.width = image.width;
      canvas.height = image.height;
      ctx.drawImage(image, 0, 0);
      resolve(ctx.getImageData(0, 0, canvas.width, canvas.height));
    };
    image.src = img;
  });
}

export function Uint8ClampedArrayToImage(imageData) {
  const canvas = document.createElement('canvas');
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  const ctx = canvas.getContext('2d');
  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL();
}

export function calcEyesPosition(eyes = []) {
  let sortedEyes = eyes.sort((a, b) => a.x - b.x);
  if (!eyes.length) {
    return {};
  }
  return {
    x: sortedEyes[0].x,
    y: sortedEyes[0].y,
    width: (sortedEyes[eyes.length - 1].x - sortedEyes[0].x) * 2 ,
    height: sortedEyes[0].height
  }
}

export function calcFacePosition(faces = []) {
  let sortedFaces = faces.sort((a, b) => a.height - b.height);
  return sortedFaces[0] || {};
}