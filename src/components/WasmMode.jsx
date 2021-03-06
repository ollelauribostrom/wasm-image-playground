import React from 'react';
import Icon from './Icon';
import Label from './Label';

function WasmMode({ wasmMode, onClick, ...props }) {
  const text = wasmMode ? 'WebAssembly' : 'JavaScript';
  const className = wasmMode ? 'wasm-mode' : 'js-mode';
  return (
    <Label
      text={text}
      className={className}
      onClick={onClick}
      icon={<Icon name="change" size="xs"/>}
      title="Toggle WebAssembly/JavaScript mode"
    />
  )
}

export default WasmMode;