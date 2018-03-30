onmessage = ({ data }) => {
  const action = { detectSquaresWasm, detectSquaresJs }[data.action]
  if (!action) {
    throw new Error(`Action ${data.action} does not exist in ShapeDetector worker`);
  }
  action(data);
}

function detectSquaresWasm(data) {
  console.log('detect squares using wasm..');
  console.log(data);
}

function detectSquaresJs(data) {
  console.log('detect squares using js..');
  console.log(data);
}