import { detect } from 'imutils';
import { calcFacePosition } from '../utils/face';

onmessage = async ({ data }) => {
  const action = {
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

function rectangle({ frame, superpowers }) {
  return findFace(frame, superpowers);
}

function blur({ frame, superpowers }) {
  return findFace(frame, superpowers);
}

function glasses({ frame, superpowers }) {
  return findEyes(frame, superpowers);
}

function shades({ frame, superpowers }) {
  return findEyes(frame, superpowers);
}

function findFace(frame, superpowers) {
  const face = detect('face', frame, {
    ratio: 1,
    increment: 0.08,
    baseScale: 2.0,
    scaleInc: 1.6,
    minNeighbors: 2,
    doCannny: true,
    cannyLow: 60,
    cannyHigh: 200,
  });
  postMessage({ face });
}

function findEyes(frame, superpowers) {
  const faces = detect('face', frame, {
    ratio: 1,
    increment: 0.10,
    baseScale: 1.0,
    scaleInc: 1.8,
    minNeighbors: 3,
    doCannny: true,
    cannyLow: 60,
    cannyHigh: 200,
  });
  const face = calcFacePosition(faces);
  const eyes = detect('eye', frame, {
    ratio: 1,
    increment: 0.10,
    baseScale: 2.0,
    scaleInc: 1.6,
    minNeighbors: 2,
    doCannny: true,
    inArea: face || null,
  });
  postMessage({ eyes, face: face || [] });
}
