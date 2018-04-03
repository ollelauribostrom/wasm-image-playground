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
    console.log('Loading OpenCv & Tracking.js..');
    try {
      makeCv()
        .then((instance) => {
          cv = instance;
          console.log('Finished loading OpenCv & Tracking.js');
          postMessage({ info: 'Editor loaded', editorLoaded: true });
      })
    } catch (err) {
      console.error('Finished loading OpenCv & Tracking.js');
      postMessage({ info: 'Error loading editor', editorLoaded: true });
    }
  } else {
    postMessage({ editorLoaded: true, clearInfo: true })
  }
}

function status(data) {
  if (cv) {
    postMessage({ editorLoaded: true });
  } else {
    postMessage({ editorLoaded: false });
  }
}

function blurWasm(data) {
  const { result, time, err } = timed(() => {
    if (!cv) {
      return {
        err: 'OpenCv is not loaded'
      }
    }
    try {
      const destination = new cv.Mat();
      const size = new cv.Size(9, 9);
      const image = cv.matFromImageData(data.img);
      cv.GaussianBlur(image, destination, size, 0, 0, cv.BORDER_DEFAULT);
      return new ImageData(Uint8ClampedArray.from(destination.data), data.img.width, data.img.height);
    } catch (err) {
      console.error(err);
      return { err: 'Something went wrong when using WebAssembly to blur image' }
    }
  });
  postMessage({
    img: result,
    info: err || `Blurred using WebAssembly in ${Math.round(time)}ms`,
    time
  });
}

function blurJs(data) {
  const { result, time, err } = timed(() => {
    const blurred = gaussianBlur(data.img.data, data.img.width, data.img.height, 9);
    return new ImageData(Uint8ClampedArray.from(blurred), data.img.width, data.img.height);
  });
  postMessage({
    img: result,
    info: err || `Blurred using JS in ${Math.round(time)}ms`,
    time
  });
}

function bwWasm(data) {
  const { result, time, err } = timed(() => {
    if (!cv) {
      return {
        err: 'OpenCv is not loaded'
      }
    }
    try {
      const image = cv.matFromImageData(data.img);
      console.log(4 * image.cols * image.rows);
      const temp = new cv.Mat(image.rows, image.cols, image.type());
      const dest = new cv.Mat();
      cv.cvtColor(image, temp, cv.COLOR_RGBA2GRAY, 4);
      temp.convertTo(dest, 4);
      return new ImageData(Uint8ClampedArray.from(dest.data), data.img.width, data.img.height);
    } catch (err) {
      console.error(err);
      return { err: 'Something went wrong when using WebAssembly to transform image to BW' }
    }
  });
  postMessage({
    img: result,
    info: err || `Transformed to BW using WebAssembly in ${Math.round(time)}ms`,
    time
  });
}

function bwJs(data) {
  const { result, time, err } = timed(() => {
    const bw = grayscale(data.img.data, data.img.width, data.img.height, true);
    return new ImageData(bw, data.img.width, data.img.height);
  });
  postMessage({
    img: result,
    info: err || `Transformed to BW using JS in ${Math.round(time)}ms`,
    time
  });
}