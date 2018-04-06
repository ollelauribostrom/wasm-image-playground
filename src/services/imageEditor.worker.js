import { timed, rounded } from '../utils/time';
import makeCv from '../../lib/opencv_js';
import { gaussianBlur, grayscale } from 'imutils'; 

let cv;

onmessage = async ({ data }) => {
  const action = { init, status, blurWasm, blurJs, bwWasm, bwJs }[data.action]
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

function blurWasm({ img }) {
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
    action: 'blur image',
    language: 'WebAssembly',    
  });
  postMessage({
    img: result,
    info: error || `Blurred using WebAssembly in ${Math.round(time)}ms`,
    time
  });
}

function blurJs({ img }) {
  const { result, time, error } = timed(() => {
    const blurred = gaussianBlur(img.data, img.width, img.height, 9);
    return new ImageData(Uint8ClampedArray.from(blurred), img.width, img.height);
  }, {
    action: 'blur image',
    language: 'JS',    
  });
  postMessage({
    img: result,
    info: error || `Blurred using JS in ${Math.round(time)}ms`,
    time
  });
}

function bwWasm({ img }) {
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
    action: 'transform image to BW',
    language: 'WebAssembly',    
  });
  postMessage({
    img: result,
    info: error || `Transformed to BW using WebAssembly in ${Math.round(time)}ms`,
    time
  });
}

function bwJs({ img }) {
  const { result, time, error } = timed(() => {
    const bw = grayscale(img.data, img.width, img.height, true);
    return new ImageData(bw, img.width, img.height);
  }, { 
    action: 'transform image to BW',
    language: 'JS',
  });
  postMessage({
    img: result,
    info: error || `Transformed to BW using JS in ${Math.round(time)}ms`,
    time
  });
}

function imshowWrapper(mat) {
  if(!(mat instanceof cv.Mat)) {
    throw new Error("Please input the valid cv.Mat instance.");
  }
  const img = new cv.Mat();
  const depth = mat.type() % 8;
  const scale = depth <= cv.CV_8S ? 1 : depth <= cv.CV_32S ? 1 / 256 : 255;
  const shift = depth === cv.CV_8S || depth === cv.CV_16S ? 128 : 0;
  mat.convertTo(img, cv.CV_8U, scale, shift);
  switch(img.type()) {
    case cv.CV_8UC1:
      cv.cvtColor(img, img, cv.COLOR_GRAY2RGBA);
      break;
    case cv.CV_8UC3:
      cv.cvtColor(img, img, cv.COLOR_RGB2RGBA);
      break;
    case cv.CV_8UC4:
      break;
    default:
      throw new Error("Bad number of channels (Source image must have 1, 3 or 4 channels)");
  }
  const imgData = new ImageData(new Uint8ClampedArray(img.data), img.cols, img.rows);
  img.delete();
  mat.delete();
  return imgData;
}