import { timed } from '../utils/time';
import makeCv from '../../lib/opencv_js';
import { gaussianBlur, grayscale, boxBlur, sobel } from 'imutils';

let cv;

onmessage = async ({ data }) => {
  const action = {
    init,
    status,
    gaussianBlurWasm,
    gaussianBlurJs,
    grayscaleWasm,
    grayscaleJs,
    boxBlurWasm,
    boxBlurJs,
    sobelJs,
    sobelWasm,
  }[data.action];

  if (!action) {
    throw new Error(`Action ${data.action} does not exist in ImageEditor worker`);
  }
  action(data);
}

function init(data) {
  if (!cv) {
    console.log('Loading OpenCv..');
    try {
      makeCv()
        .then((instance) => {
          cv = instance;
          console.log('Finished loading OpenCv');
          postMessage({ info: 'Editor loaded', editorLoaded: true });
      })
    } catch (error) {
      console.error('Finished loading OpenCv');
      postMessage({ info: 'erroror loading editor', editorLoaded: true });
    }
  } else {
    postMessage({ editorLoaded: true, clearInfo: true })
  }
}

function status() {
  if (cv) {
    postMessage({ editorLoaded: true });
  } else {
    postMessage({ editorLoaded: false });
  }
}

function gaussianBlurWasm({ img }) {
  const { result, time, error } = timed(() => {
    if (!cv) {
      const cvError = new Error('OpenCv is not loaded');
      error.cvNotLoaded = true;
      throw cvError;
    }
    const image = cv.matFromImageData(img);
    const size = new cv.Size(9, 9);
    cv.GaussianBlur(image, image, size, 0, 0, cv.BORDER_DEFAULT);
    return imshowWrapper(image);
  }, {
    action: '(Gaussian) blur image',
    language: 'WebAssembly',    
  });
  postMessage({
    img: result,
    info: error || `(Gaussian) Blurred using WebAssembly in ${Math.round(time)}ms`,
    time
  });
}

function gaussianBlurJs({ img }) {
  const { result, time, error } = timed(() => {
    const blurred = gaussianBlur(img.data, img.width, img.height, 9);
    return new ImageData(Uint8ClampedArray.from(blurred), img.width, img.height);
  }, {
    action: '(Gaussian) blur image',
    language: 'JS',    
  });
  postMessage({
    img: result,
    info: error || `(Gaussian) Blurred using JS in ${Math.round(time)}ms`,
    time
  });
}

function grayscaleWasm({ img }) {
  const { result, time, error } = timed(() => {
    if (!cv) {
      const cvError = new Error('OpenCv is not loaded');
      error.cvNotLoaded = true;
      throw cvError;
    }
    const image = cv.matFromImageData(img);
    cv.cvtColor(image, image, cv.COLOR_RGBA2GRAY, 4);
    return imshowWrapper(image);
  }, {
    action: 'transform image to grayscale',
    language: 'WebAssembly',    
  });
  postMessage({
    img: result,
    info: error || `Transformed to grayscale using WebAssembly in ${Math.round(time)}ms`,
    time
  });
}

function grayscaleJs({ img }) {
  const { result, time, error } = timed(() => {
    const gray = grayscale(img.data, img.width, img.height, true);
    return new ImageData(gray, img.width, img.height);
  }, { 
    action: 'transform image to grayscale',
    language: 'JS',
  });
  postMessage({
    img: result,
    info: error || `Transformed to grayscale using JS in ${Math.round(time)}ms`,
    time
  });
}

function boxBlurJs({ img }) {
  const { result, time, error } = timed(() => {
    const blurred = boxBlur(img.data, img.width);
    return new ImageData(blurred, img.width, img.height);
  }, { 
    action: '(Box) blur image',
    language: 'JS',    
  });
  postMessage({
    img: result,
    info: error || `(Box) Blurred using JS in ${Math.round(time)}ms`,
    time
  });  
}

function boxBlurWasm({ img }) {
  const { result, time, error } = timed(() => {
    const size = new cv.Size(3, 3);
    const image = cv.matFromImageData(img);
    cv.blur(image, image, size);
    return imshowWrapper(image);
  }, { 
    action: '(Box) blur image',
    language: 'WebAssembly',    
  });
  postMessage({
    img: result,
    info: error || `(Box) Blurred using WebAssembly in ${Math.round(time)}ms`,
    time
  });    
}

function sobelJs({ img }) {
  const { result, time, error } = timed(() => {
    const output = sobel(img.data, img.width, img.height);
    return new ImageData(Uint8ClampedArray.from(output), img.width, img.height);
  }, { 
    action: 'applying sobel filter',
    language: 'JS',    
  });
  postMessage({
    img: result,
    info: error || `Applied Sobel filter using JS in ${Math.round(time)}ms`,
    time
  });    
}

function sobelWasm({ img }) {
  const { result, time, error } = timed(() => {
    const image = cv.matFromImageData(img);
    cv.cvtColor(image, image, cv.COLOR_RGBA2GRAY, 4);
    cv.Sobel(image, image, cv.CV_8U, 1, 0, 3, 1, 0, cv.BORDER_DEFAULT);
    return imshowWrapper(image)
  }, { 
    action: 'applying sobel filter',
    language: 'WebAssembly',    
  });
  postMessage({
    img: result,
    info: error || `Applied Sobel filter using WebAssembly in ${Math.round(time)}ms`,
    time
  });    
}

function imshowWrapper(imageMat) {
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