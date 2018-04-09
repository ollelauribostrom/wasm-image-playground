import { gaussianBlur, grayscale, boxBlur, sobel, find } from 'imutils';
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
    containsFaceWasm,
    containsFaceJs,
    findFaceWasm,
    findFaceJs,
    findEyesWasm,
    findEyesJs,
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
          cv.FS_createPreloadedFile('/', 'haarcascade_frontalface_default.xml', '../lib/data/haarcascade_frontalface_default.xml', true, false);
          cv.FS_createPreloadedFile('/', 'haarcascade_eye.xml', '../lib/data/haarcascade_eye.xml', true, false);
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

function performFaceCount(config, fn) {
  const { result, time, error } = timed(fn, config);
  const { returnResult, language } = config;
  const images = result.filter(img => img.faceCount > 0).length;
  const faces = result.reduce((count, img) => count + img.faceCount, 0);
  const faceNoun = faces === 1 ? 'face' : 'faces';
  const imageNoun = images === 1 ? 'image' : 'images';
  const info = `Found ${faces} ${faceNoun} in ${images} ${imageNoun}`;
  if (returnResult) {
    return { result, time, error };
  }
  postMessage({
    result,
    info: error || `${language}: ${info} - ${Math.round(time)}ms`,
    time
  });
}

function containsFaceWasm({ images }, returnResult) {
  return performFaceCount({
    action: 'detect faces',
    language: 'WebAssembly',
    returnResult
  }, () => {
    const faceCascade = new cv.CascadeClassifier();
    faceCascade.load('haarcascade_frontalface_default.xml');
    return images.map(img => {
      const image = cv.matFromImageData(img.data);
      const faces = new cv.RectVector();
      cv.cvtColor(image, image, cv.COLOR_RGBA2GRAY);
      faceCascade.detectMultiScale(image, faces, 1.5, 2, 0|cv.CASCADE_SCALE_IMAGE, new cv.Size(50, 50));
      img.faceCount = faces.size();
      image.delete();
      faces.delete();
      return img;
    });
  });
}

function containsFaceJs({ images }, returnResult) {
  return performFaceCount({
    action: 'detect faces',
    language: 'WebAssembly',
    returnResult
  }, () => {
    return images.map(img => {
      const faces = find('face', img.data.data, img.data.width, img.data.height, {
        edgesDensity: 0.2,
        initialScale: 1.0,
        scaleFactor: 1.5,
        stepSize: 2
      });
      img.faces = faces;
      img.faceCount = faces.length;
      return img;
    });
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