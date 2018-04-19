import { find, detect} from 'imutils';

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
    minNeighbors: 1,
    doCannny: true,
    cannyLow: 60,
    cannyHigh: 200
  });
  postMessage({ face });
}

function findEyes(frame) {
  const eyes = detect('eye', frame, {
    ratio: 1,
    increment: 0.11,
    baseScale: 2.0,
    scaleInc: 1.6,
    minNeighbors: 1,
    doCannny: true,
    cannyLow: 60,
    cannyHigh: 200
  });
  postMessage({ eyes });
}
