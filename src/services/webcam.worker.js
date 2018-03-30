onmessage = ({ data }) => {
  const action = {
    faceDetectionWasm,
    faceDetectionJs,
    eyeDetectionWasm,
    eyeDetectionJs
  }[data.action];

  if (!action) {
    throw new Error(`Action ${data.action} does not exist in ShapeDetector worker`);
  }

  action(data);
}

function faceDetectionWasm(data) {
  console.log('detect face using wasm..');
  console.log(data);
}

function faceDetectionJs(data) {
  console.log('detect face using js..');
  console.log(data);
}

function eyeDetectionWasm(data) {
  console.log('detect eyes using wasm..');
  console.log(data);
}

function eyeDetectionJs(data) {
  console.log('detect eyes using js..');
  console.log(data);
}