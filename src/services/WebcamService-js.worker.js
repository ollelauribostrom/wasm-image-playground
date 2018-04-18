import { find, detect} from 'imutils';

onmessage = async ({ data }) => {
  const action = {
    rectangle,
    blur,
    banana,
    smile,
    glasses
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

function banana({ frame }) {

}

function smile({ frame }) {

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
  postMessage({
    face,
    type: 'face',
    time: performance.now()
  });
}

function findEyes(frame) {
  const eyes = find('eye', frame.data, frame.width, frame.height, {
    edgesDensity: 0.1,
    initialScale: 4,
    scaleFactor: 1.6,
    stepSize: 2
  });
  postMessage({
    eyes,
    type: 'eyes',
    time: performance.now()
  });
}
