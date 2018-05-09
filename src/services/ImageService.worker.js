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

function getTaskConfig(task, images) {
  const tasks = {
    jsGrayscale: { info: 'Converting to grayscale', type: 'js', fn: grayscaleJs, images },
    wasmGrayscale: { info: 'Converting to grayscale', type: 'wasm', fn: grayscaleWasm, images },
    jsBoxBlur: { info: 'Applying Box Blur', type: 'js', fn: boxBlurJs, images },
    wasmBoxBlur: { info: 'Applying Box Blur', type: 'wasm', fn: boxBlurWasm, images },
    jsGaussian: { info: 'Applying Gaussian Blur', type: 'js', fn: gaussianBlurJs, images },
    wasmGaussian: { info: 'Applying Gaussian Blur', type: 'wasm', fn: gaussianBlurWasm, images }
  }
  return tasks[task];
}

function imageEditorBenchmark(data) {
  if (data.task === 'getResults') {
    postMessage({
      type: 'benchmarkComplete',
      results: [
        getTaskResult('Grayscale', data.results.jsGrayscale, data.results.wasmGrayscale),
        getTaskResult('Box Blur', data.results.jsBoxBlur, data.results.wasmBoxBlur),
        getTaskResult('Gaussian Blur', data.results.jsGaussian, data.results.wasmGaussian)
      ]
    });
  } else {
    performTask(getTaskConfig(data.task, data.images))
  }
}

function faceDetectorBenchmark(data) {
  if (data.task === 'jsFaceDetection') {
    performDetectionTask({
      info: 'Deteting faces',
      type: 'js',
      images: data.images,
      fn: containsFaceJs
    });
  } else if (data.task === 'wasmFaceDetection') {
    performDetectionTask({
      info: 'Detecting faces',
      type: 'wasm',
      images: data.images,
      fn: containsFaceWasm
    });
  } else if (data.task === 'getResults') {
    const jsResult = data.results.jsFaceDetection;
    const wasmResult = data.results.wasmFaceDetection;
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
}

function findFalsePositives(result, images) {
  let count = 0;
  for (let i = 0; i < result.length; i++) {
    if (result[i].containsFace !== images[i].faceDetected) {
      count += 1;
    }
  }
  return count;
}

function performDetectionTask({ info, type, images, fn }) {
  console.log(images);
  const id = shortid.generate();
  postMessage({
    type: 'benchmarkUpdate',
    task: { id, info, type, status: 'running'}
  });
  try {
    const result = fn({ images }, true);
    const time = round(result.time, 2);
    const expectedFaces = result.result.filter(img => img.containsFace).length;
    const foundFaces = result.result.filter(img => img.faceDetected && img.containsFace).length;
    const falsePositives = result.result.filter(img => img.containsFace !== img.faceDetected).length;
    postMessage({
      type: 'benchmarkUpdate',
      task: {
        id,
        info: `Detected faces in ${foundFaces}/${expectedFaces} images (${falsePositives} false positives)`,
        type,
        time,
        status: 'done',
        result: { result, time, foundFaces, falsePositives }
      }
    });
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
        result: { results, time, average }
      }
    });
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
    cv.GaussianBlur(image, output, size, 1.65, 0, cv.BORDER_DEFAULT);
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
    cv.cvtColor(image, output, cv.COLOR_RGBA2GRAY);
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

function performFaceDetection(config, fn) {
  const { result, time, error } = timed(fn, config);
  const { returnResult, language } = config;
  const imagesWithFaces = result.filter(img => img.faceDetected).length;
  const imageNoun = imagesWithFaces === 1 ? 'image' : 'images';
  const info = `Found faces in ${imagesWithFaces} ${imageNoun}`;
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
  return performFaceDetection({
    action: 'detect faces',
    language: 'WebAssembly',
    returnResult
  }, () => {
    return images.map(img => {
      const image = cv.matFromImageData(img.data, 24);
      const faces = new cv.RectVector();
      cv.cvtColor(image, image, cv.COLOR_RGBA2GRAY);
      faceCascade.detectMultiScale(image, faces, 1.6, 2, 1);
      img.faceDetected = faces.size() > 0;
      image.delete();
      faces.delete();
      return img;
    });
  });
}

function containsFaceJs({ images }, returnResult) {
  return performFaceDetection({
    action: 'detect faces',
    language: 'JS',
    returnResult
  }, () => {
    return images.map(img => {
      const faces = detect('face', img.data, {
        ratio: 1,
        increment: 0.08,
        baseScale: 2.0,
        scaleInc: 1.6,
        minNeighbors: 2,
        doCannny: true,
        cannyLow: 60,
        cannyHigh: 200,
      });
      img.faceDetected = faces.length > 0;
      return img;
    });
  });
}
