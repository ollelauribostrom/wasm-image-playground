import { gaussianBlur, grayscale, boxBlur, sobel } from 'imutils';
import { timed } from '../utils/time';
import { imshowWrapper } from '../utils/image';
import makeCv from '../../lib/opencv_js';

let cv;
let loadingCv;

onmessage = async ({ data }) => {
  const action = {
    init,
    boxBlurWasm,
    boxBlurJs,
    gaussianBlurWasm,
    gaussianBlurJs,
    grayscaleWasm,
    grayscaleJs,
    sobelWasm,
    sobelJs,
    hasFaceWasm,
    hasFaceJs,
    findFaceWasm,
    findFaceJs,
    findEyesWasm,
    findEyesJs
  }[data.action];

  if (!action) {
    throw new Error(`Action ${data.action} does not exist`);
  }
  action(data);
}

function init(data) {
  if (!cv && !loadingCv) {
    try {
      loadingCv = true;
      console.log('Loading OpenCv..');
      makeCv()
        .then((instance) => {
          cv = instance;
          loadingCv = false;
          console.log('Finished loading OpenCv');
          postMessage({ loaded: true })
        })
        .catch((error) => {
          loadingCv = false;
          console.error('Error loading OpenCv', error);
          postMessage({ error })
        });
    } catch (err) {
      // silently fail (errors caused by WebAssembly.instantiateStreaming not being supported)
    }
  }
}

function performAction(config, fn) {
  const { result, time, error } = timed(fn, config);
  if (config.returnResult) {
    return { result, time, error };
  }
  postMessage({
    result,
    info: error || `${config.info} in ${Math.round(time)}ms`,
    time
  });
}

function gaussianBlurWasm({ img }, returnResult) {
  return performAction({
    info: 'Applied (Gaussian) blur using WebAssembly',
    returnResult
  }, () => {
    const image = cv.matFromImageData(img);
    const size = new cv.Size(9, 9);
    cv.GaussianBlur(image, image, size, 0, 0, cv.BORDER_DEFAULT);
    return imshowWrapper(image, cv);
  });
}

function gaussianBlurJs({ img }, returnResult) {
  return performAction({
    info: 'Applied (Gaussian) blur using JS',
    returnResult
  }, () => {
    const blurred = gaussianBlur(img.data, img.width, img.height, 9);
    return new ImageData(Uint8ClampedArray.from(blurred), img.width, img.height);
  });
}

function grayscaleWasm({ img }, returnResult) {
  return performAction({
    info: 'Converted image to grayscale using WebAssembly',
    returnResult
  }, () => {
    const image = cv.matFromImageData(img);
    cv.cvtColor(image, image, cv.COLOR_RGBA2GRAY, 4);
    return imshowWrapper(image, cv);
  });
}

function grayscaleJs({ img }, returnResult) {
  return performAction({
    info: 'Converted image to grayscale using JS',
    returnResult
  }, () => {
    const gray = grayscale(img.data, img.width, img.height, true);
    return new ImageData(gray, img.width, img.height);
  });
}

function boxBlurWasm({ img }, returnResult) {
  return performAction({
    info: 'Applied (Box) blur using WebAssembly',
    returnResult
  }, () => {
    const size = new cv.Size(3, 3);
    const image = cv.matFromImageData(img);
    cv.blur(image, image, size);
    return imshowWrapper(image, cv);
  });  
}

function boxBlurJs({ img }, returnResult) {
  return performAction({
    info: 'Applied (Box) blur using JS',
    returnResult
  }, () => {
    const blurred = boxBlur(img.data, img.width);
    return new ImageData(blurred, img.width, img.height);
  });
}

function sobelWasm({ img }, returnResult) {
  return performAction({
    info: 'Applied Sobel filter using WebAssembly',
    returnResult
  }, () => {
    const image = cv.matFromImageData(img);
    cv.cvtColor(image, image, cv.COLOR_RGBA2GRAY, 4);
    cv.Sobel(image, image, cv.CV_8U, 1, 0, 3, 1, 0, cv.BORDER_DEFAULT);
    return imshowWrapper(image, cv)
  });  
}

function sobelJs({ img }, returnResult) {
  return performAction({
    info: 'Applied Sobel filter using JS',
    returnResult
  }, () => {
    const output = sobel(img.data, img.width, img.height);
    return new ImageData(Uint8ClampedArray.from(output), img.width, img.height);
  });   
}

function hasFaceWasm({ images }, returnResult) {
  return performAction({
    info: 'Found n images containing faces using WebAssembly',
    returnResult
  }, () => {
    // Detect face in images here
  });  
}

function hasFaceJs({ images }, returnResult) {
  return performAction({
    info: 'Found n images containing faces using WebAssembly',
    returnResult
  }, () => {
    // Detect face in images here
  });  
}

function findFaceWasm({ frame }) {
  return performAction({}, () => {
    // Find face
  });
}

function findFaceJs({ frame }) {
  return performAction({}, () => {
    // Find face
  });
}

function findEyesWasm({ frame }) {
  return performAction({}, () => {
    // Find eyes
  });
}

function findEyesJs({ frame }) {
  return performAction({}, () => {
    // Find eyes
  });
}
