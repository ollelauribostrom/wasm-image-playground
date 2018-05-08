import makeCv from '../../lib/opencv';

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
          cv.FS_createPreloadedFile('/', 'haarcascade_frontalface_alt.xml', '../lib/data/haarcascade_frontalface_alt.xml', true, false);
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
    faceCascade.load('haarcascade_frontalface_alt.xml');
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
  cv.cvtColor(image, image, cv.COLOR_RGBA2GRAY, 0);
  faceCascade.detectMultiScale(image, faces, 1.6, 2, 0, new cv.Size(50, 50));
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
  const eyes = new cv.RectVector();
  const eyesRects = [];
  cv.cvtColor(image, image, cv.COLOR_RGBA2GRAY, 0);
  eyesCascade.detectMultiScale(image, eyes, 1.6, 2, 0, new cv.Size(10, 10));
  for(let i = 0; i < eyes.size(); i+= 1) {
    eyesRects.push(eyes.get(i));
  }
  image.delete();
  eyes.delete();
  postMessage({ eyes: eyesRects });
}
