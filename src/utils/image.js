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
    throw new Error("Please input the valid cv.Mat instance.");
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
      throw new Error("Bad number of channels (Source image must have 1, 3 or 4 channels)");
  }
  const imgData = new ImageData(new Uint8ClampedArray(outImageMat.data), outImageMat.cols, outImageMat.rows);
  outImageMat.delete();
  imageMat.delete();
  return imgData;
}
