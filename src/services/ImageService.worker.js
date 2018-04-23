import shortid from 'shortid';
import round from 'lodash.round';
import { gaussianBlur, grayscale, boxBlur, detect, matConverters } from 'imutils';
import { diffSync } from 'uint8clampedarray-utils';
import timed from '../utils/timed';
import makeCv from '../../lib/opencv';

let cv;
let loadingCv;
let faceCascade;

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
    imageEditorBenchmark,
    faceDetectorBenchmark
  }[data.action];

  if (!action) {
    throw new Error(`Action ${data.action} does not exist`);
  }
  action(data);
};

function init(data) {
  if (!cv && !loadingCv) {
    try {
      const start = performance.now();
      loadingCv = true;
      console.log('Loading OpenCv..');
      makeCv()
        .then((instance) => {
          cv = instance;
          cv.FS_createPreloadedFile('/', 'haarcascade_frontalface_alt.xml', '../lib/data/haarcascade_frontalface_alt.xml', true, false);
          loadingCv = false;
          const time = performance.now() - start;
          console.log(`Finished loading OpenCv (${round(time, 2)}ms)`);
          postMessage({ loaded: true, time });
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

function getPixelDiff(js, wasm) {
  const results = [];
  if (js.results.length !== wasm.results.length) {
    throw Error('Not comparable');
  }
  for (let i = 0; i < js.results.length; i++) {
    const diff = diffSync(js.results[i].result.data, wasm.results[i].result.data);
    results.push(diff);
  }
  return results;
}

function getPercentage(js, wasm) {
  return {
    total: round(wasm.time < js.time ? ((js.time / wasm.time) - 1) * 100 : ((wasm.time / js.time) - 1) * 100, 2),
    avg: round(wasm.time < js.time ? ((js.average / wasm.average) - 1) * 100 : ((wasm.average / js.average) - 1) * 100, 2)
  }
}

function getTaskResult(task, js, wasm) {
  const diff = getPixelDiff(js, wasm);
  const stats = {
    task,
    fastest: js.time < wasm.time ? 'JavaScript' : 'WebAssembly',
    fastestAvg: js.average < wasm.average ? 'JavaScript' : 'WebAssembly',
    avgDiff: round(diff.reduce((total, d) => total + d.diffPercentage, 0) / diff.length, 2),
    percent: getPercentage(js, wasm),
    diff
  }
  console.log(stats);
  return stats;
}

function imageEditorBenchmark(data) {
  const jsGrayscaleResult = performTask({
    info: 'Converting to grayscale',
    type: 'js',
    images: data.images,
    fn: grayscaleJs
  });
  const wasmGrayscaleResult = performTask({
    info: 'Converting to grayscale',
    type: 'wasm',
    images: data.images,
    fn: grayscaleWasm
  });
  const jsBoxBlurResult = performTask({
    info: 'Applying Box Blur',
    type: 'js',
    images: data.images,
    fn: boxBlurJs
  });
  const wasmBoxBlurResult = performTask({
    info: 'Applying Box Blur',
    type: 'wasm',
    images: data.images,
    fn: boxBlurWasm
  });
  const jsGaussianResult = performTask({
    info: 'Applying Gaussian Blur',
    type: 'js',
    images: data.images,
    fn: gaussianBlurJs
  });
  const wasmGaussianResult = performTask({
    info: 'Applying Gaussian Blur',
    type: 'wasm',
    images: data.images,
    fn: gaussianBlurWasm
  });
  postMessage({
    type: 'benchmarkComplete',
    results: [
      getTaskResult('Grayscale', jsGrayscaleResult, wasmGrayscaleResult),
      getTaskResult('Box Blur', jsBoxBlurResult, wasmBoxBlurResult),
      getTaskResult('Gaussian Blur', jsGaussianResult, wasmGaussianResult)
    ]
  });
}

function faceDetectorBenchmark(data) {
  console.log(data);
  const jsResult = performDetectionTask({
    info: 'Deteting faces',
    type: 'js',
    images: data.images,
    fn: containsFaceJs
  });
  const wasmResult = performDetectionTask({
    info: 'Detecting faces',
    type: 'wasm',
    images: data.images,
    fn: containsFaceWasm
  });
  postMessage({
    type: 'benchmarkComplete',
    results: [
      {
        task: 'Face Detection',
        fastest: jsResult.time < wasmResult.time ? 'JavaScript' : 'WebAssembly',
        percent: {
          total: round(wasmResult.time < jsResult.time ? ((jsResult.time / wasmResult.time) - 1) * 100 : ((wasmResult.time / jsResult.time) - 1) * 100, 2)
        }
      }
    ]
  });
}

function findFalsePositives(result, images) {
  let count = 0;
  for (let i = 0; i < result.length; i++) {
    if (result[i].faceCount > images[i].faces) {
      count += result[i].faceCount - images[i].faces;
    }
  }
  return count;
}

function performDetectionTask({ info, type, images, fn }) {
  const id = shortid.generate();
  postMessage({
    type: 'benchmarkUpdate',
    task: { id, info, type, status: 'running'}
  });
  try {
    const result = fn({ images }, true);
    const time = round(result.time, 2);
    const expectedFaces = images.reduce((total, img) => total + img.faces, 0);
    const foundFaces = result.result.reduce((total, r) => total + r.faceCount, 0);
    const falsePositives = findFalsePositives(result.result, images);
    postMessage({
      type: 'benchmarkUpdate',
      task: {
        id,
        info: `Detected ${foundFaces}/${expectedFaces} faces (${falsePositives} false positives)`,
        type,
        time,
        status: 'done',
      }
    });
    return { result, time, foundFaces, falsePositives };
  } catch (error) {
    console.log(error);
    postMessage({
      type: 'benchmarkError',
      error
    });
  } 
}

function performTask({ info, type, images, fn }) {
  const id = shortid.generate();
  const results = [];
  postMessage({
    type: 'benchmarkUpdate',
    task: { id, info, type, status: 'running'}
  });
  try {
    for (let i = 0; i < images.length; i++) {
      const result = fn({ img: images[i].data }, true);
      results.push(result);
      if (result.err) {
        throw result.err;
      }
    }
    const time = round(results.reduce((total, r) => total + r.time, 0), 2);
    const average = round(time / images.length, 2);
    postMessage({
      type: 'benchmarkUpdate',
      task: {
        id,
        info,
        type,
        time,
        average,
        status: 'done',
      }
    });
    return { results, time, average };
  } catch (error) {
    console.log(error);
    postMessage({
      type: 'benchmarkError',
      error
    });
  }
}

function performAction(config, fn) {
  const { result, time, error } = timed(fn, config);
  if (config.returnResult) {
    return { result, time, error };
  }
  postMessage({
    result,
    info: error || `${config.info} in ${round(time)}ms`,
    time
  });
}

function gaussianBlurWasm({ img }, returnResult) {
  return performAction({
    info: 'Applied (Gaussian) blur using WebAssembly',
    returnResult,
    debug: true
  }, () => {
    const image = cv.matFromImageData(img);
    const output = new cv.Mat();
    const size = new cv.Size(9, 9);
    cv.GaussianBlur(image, output, size, 0, 0, cv.BORDER_DEFAULT);
    image.delete();
    return matConverters.toImageData(output, cv);
  });
}

function gaussianBlurJs({ img }, returnResult) {
  return performAction({
    info: 'Applied (Gaussian) blur using JS',
    returnResult,
    debug: true
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
    return matConverters.toImageData(output, cv);
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
    return matConverters.toImageData(output, cv);
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
    faceCascade.load('haarcascade_frontalface_alt.xml');
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
    info: error || `${language}: ${info} - ${round(time)}ms`,
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
      const faces = detect('face', img.data, {
        ratio: 1,
        increment: 0.05,
        baseScale: 1.0,
        scaleInc: 1.5,
        minNeighbors: 2,
        doCannny: true,
      });
      img.faceCount = faces.length;
      return img;
    });
  });
}
