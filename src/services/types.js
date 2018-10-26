export const WorkerCommands = {
  ApplyFilter: 'ApplyFilter',
  Benchmark: 'Benchmark'
};

export const Filters = {
  BoxBlur: 'BoxBlur',
  Cooling: 'Cooling',
  GaussianBlur: 'GaussianBlur',
  Grayscale: 'Grayscale',
  Invert: 'Invert',
  Sharpen: 'Sharpen'
};

export const Languages = {
  JavaScript: 'js',
  WebAssembly: 'wasm'
};

export type WorkerRequest = {
  id: number,
  command: WorkerCommand,
  payload: any
};

export type WorkerResponse = {
  id: number,
  payload: any,
  error?: any
};

export type WorkerCallback = {
  id: number,
  fn: (response: WorkerResponse) => void
};

export type Filter = $Keys<typeof Filters>;
export type Language = $Keys<typeof Languages>;
export type WorkerCommand = $Keys<typeof WorkerCommands>;
