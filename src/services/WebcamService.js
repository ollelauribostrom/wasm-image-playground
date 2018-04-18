import EventEmitter from '../utils/EventEmitter';
import WasmWorker from './WebcamService-wasm.worker';
import JsWorker from './WebcamService-js.worker';

class WebcamService extends EventEmitter {

  constructor() {
    super();
    this.wasmWorker = new WasmWorker();
    this.jsWorker = new JsWorker();
    this.wasmWorker.addEventListener('message', message => this.onWasmMessage(message));
    this.jsWorker.addEventListener('message', message => this.onJsMessage(message));
    this.wasmWorker.postMessage({ action: 'init' });
  }

  onWasmMessage(message) {
    if (message.data.error) {
      return this.emit('wasm:error', message);
    }
    if (message.data.loaded) {
      return this.emit('wasm:loaded', message);
    }
    this.emit('wasm:message', message);
  }

  onJsMessage(message) {
    if (message.data.error) {
      return this.emit('js:error', message);
    }
    this.emit('js:message', message);
  }

  postMessage(message) {
    if (message.type === 'wasm') {
      this.wasmWorker.postMessage(message);
    } else {
      this.jsWorker.postMessage(message);
    }
  }
}

export default WebcamService;
