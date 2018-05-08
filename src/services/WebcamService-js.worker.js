import { detect } from 'imutils';

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
  const face = detect('face', frame, {
    ratio: 1,
    increment: 0.11,
    baseScale: 2.0,
    scaleInc: 1.6,
    minNeighbors: 2,
    doCannny: false
  });
  postMessage({ face });
}

function findEyes(frame) {
  const eyes = detect('eye', frame, {
    ratio: 1,
    increment: 0.11,
    baseScale: 2.0,
    scaleInc: 1.6,
    minNeighbors: 2,
    doCannny: false
  });
  postMessage({ eyes });
}
