import makeCv from '../../lib/opencv_js';

let cv;
let loadingCv;
let faceCascade;
let eyesCascade;

onmessage = async ({ data }) => {
  const action = {
    init,
    rectangle,
    blur,
    glasses,
    shades
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
          cv.FS_createPreloadedFile('/', 'haarcascade_frontalface_default.xml', '../lib/data/haarcascade_frontalface_default.xml', true, false);
          cv.FS_createPreloadedFile('/', 'haarcascade_eye.xml', '../lib/data/haarcascade_eye.xml', true, false);
          loadingCv = false;
          const time = performance.now() - start;
          console.log(`Finished loading OpenCv (${Math.round(time)}ms)`);
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

function rectangle({ frame }) {
  return findFace(frame);
}

function blur({ frame }) {
  return findFace(frame);
}

function glasses({ frame }) {
  return findEyes(frame);
}

function shades({ frame }) {
  return findEyes(frame);
}

function findFace(frame) {
  loadFaceCascade();
  const image = cv.matFromImageData(frame, 24);
  const faces = new cv.RectVector();
  const faceRects = [];
  faceCascade.detectMultiScale(image, faces, 1.6, 3, 0|cv.CASCADE_SCALE_IMAGE, new cv.Size(50, 50));
  for(let i = 0; i < faces.size(); i+= 1) {
    faceRects.push(faces.get(i));
  }
  image.delete();
  faces.delete();
  postMessage({ face: faceRects });
}

function findEyes(frame) {
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
  postMessage({ eyes: eyesRect });
}
