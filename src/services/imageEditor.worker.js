onmessage = ({ data }) => {
  const action = { blurWasm, blurJs, bwWasm, bwJs }[data.action]
  if (!action) {
    throw new Error(`Action ${data.action} does not exist in ImageEditor worker`);
  }
  action(data);
}

function blurWasm(data) {
  console.log('blur using wasm..');
  console.log(data);
}

function blurJs(data) {
  console.log('blur using js..');
  console.log(data);
}

function bwWasm(data) {
  console.log('to bw using wasm..');
  console.log(data);
}

function bwJs(data) {
  console.log('to bw using js..');
  console.log(data);
}