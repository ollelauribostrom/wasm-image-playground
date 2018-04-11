import { gaussianBlur, grayscale, boxBlur, find } from 'imutils';
import timed from '../utils/timed';
import { imshowWrapper } from '../utils/image';
import makeCv from '../../lib/opencv_js';

let cv;
let loadingCv;
let faceCascade;
let eyesCascade;

onmessage = async ({ data }) => {
  const action = {
    init,
    boxBlurWasm,
    boxBlurJs,
    gaussianBlurWasm,
    gaussianBlurJs,
    grayscaleWasm,
    grayscaleJs,
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
};

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
          postMessage({ loaded: true });
        })
        .catch((error) => {
          loadingCv = false;
          console.error('Error loading OpenCv', error);
          postMessage({ error });
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
    const output = new cv.Mat();
    const size = new cv.Size(9, 9);
    cv.GaussianBlur(image, output, size, 0, 0, cv.BORDER_DEFAULT);
    image.delete();
    return imshowWrapper(output, cv);
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
    const output = new cv.Mat();
    cv.cvtColor(image, output, cv.COLOR_RGBA2GRAY, 4);
    image.delete();
    return imshowWrapper(output, cv);
  });
}

function grayscaleJs({ img }, returnResult) {
  return performAction({
    info: 'Converted image to grayscale using JS',
    returnResult,
    debug: true
  }, () => {
    const gray = grayscale(img.data, img.width, img.height, true, {
      red: 0.299,
      green: 0.587,
      blue: 0.114,
      alpha: 255
    });
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
    const output = new cv.Mat();
    cv.blur(image, output, size);
    image.delete();
    return imshowWrapper(output, cv);
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

function loadFaceCascade() {
  if (faceCascade === undefined) {
    faceCascade = new cv.CascadeClassifier();
    faceCascade.load('haarcascade_frontalface_default.xml');
  }
}

function loadEyesCascade() {
  if (eyesCascade === undefined) {
    eyesCascade = new cv.CascadeClassifier();
    eyesCascade.load('haarcascade_eye.xml');
  }
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
  loadFaceCascade();
  return performFaceCount({
    action: 'detect faces',
    language: 'WebAssembly',
    returnResult
  }, () => {
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
    language: 'JS',
    returnResult
  }, () => {
    return images.map(img => {
      const faces = find('face', img.data.data, img.data.width, img.data.height, {
        edgesDensity: 0.1,
        initialScale: 4,
        scaleFactor: 1.25,
        stepSize: 2
      });
      img.faceCount = faces.length;
      return img;
    });
  });
}

function findFaceWasm({ frame }) {
  loadFaceCascade();
  const image = cv.matFromImageData(frame, 24);
  const faces = new cv.RectVector();
  const faceRects = [];
  faceCascade.detectMultiScale(image, faces, 1.6, 2, 0|cv.CASCADE_SCALE_IMAGE, new cv.Size(50, 50));
  for(let i = 0; i < faces.size(); i+= 1) {
    faceRects.push(faces.get(i));
  }
  image.delete();
  faces.delete();
  postMessage({
    face: faceRects,
    language: 'WebAssembly',
    type: 'face',
    time: performance.now()
  });
}

function findFaceJs({ frame }) {
  const face = find('face', frame.data, frame.width, frame.height, {
    edgesDensity: 0.1,
    initialScale: 4,
    scaleFactor: 1.25,
    stepSize: 2
  });
  postMessage({
    face,
    language: 'JS',
    type: 'face',
    time: performance.now()
  });
}

function findEyesWasm({ frame }) {
  loadFaceCascade();
  loadEyesCascade();
  const image = cv.matFromImageData(frame, 24);
  const imageGray = new cv.Mat();
  const faces = new cv.RectVector();
  const eyesRect = [];
  cv.cvtColor(image, imageGray, cv.COLOR_RGBA2GRAY, 0);
  faceCascade.detectMultiScale(imageGray, faces, 1.6, 2, 0|cv.CASCADE_SCALE_IMAGE, new cv.Size(50, 50));
  for(let i = 0; i < faces.size(); i+= 1) {
    const faceRect = faces.get(i)
    const faceGray = imageGray.roi(faceRect);
		const eyes = new cv.RectVector();
		eyesCascade.detectMultiScale(faceGray, eyes, 1.6, 2, 0);
		for (let j = 0; j < eyes.size(); j += 1) {
      let eyeRect = eyes.get(j);
			eyesRect.push({
        x: faceRect.x + eyeRect.x,
        y: faceRect.y + eyeRect.y,
        width: eyeRect.width,
        height: eyeRect.height
      });
		}
		eyes.delete();
  }
  image.delete();
  imageGray.delete();
  faces.delete();
  postMessage({
    eyes: eyesRect,
    language: 'WebAssembly',
    type: 'eyes',
    time: performance.now()
  });
}

function findEyesJs({ frame }) {
  const eyes = find('eye', frame.data, frame.width, frame.height, {
    edgesDensity: 0.1,
    initialScale: 4,
    scaleFactor: 1.6,
    stepSize: 2
  });
  postMessage({
    eyes,
    language: 'JS',
    type: 'eyes',
    time: performance.now()
  });
}
