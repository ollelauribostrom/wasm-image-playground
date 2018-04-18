import EventEmitter from '../utils/EventEmitter';
import ImageServiceWorker from './ImageService.worker';

class ImageService extends EventEmitter {

  constructor() {
    super();
    this.worker = new ImageServiceWorker();
  }

  init() {
    this.worker.addEventListener('message', message => this.onMessage(message));
    this.worker.postMessage({ action: 'init' });
  }

  onMessage(message) {
    if (message.data.error) {
      return this.emit('error', message);
    }
    if (message.data.loaded) {
      return this.emit('loaded', message);
    }
    if (message.data.type === 'benchmarkUpdate' ||
        message.data.type === 'benchmarkError' ||
        message.data.type === 'benchmarkComplete') {
      return this.emit(message.data.type, message);
    }
    this.emit('message', message);
  }

  postMessage(message) {
    this.worker.postMessage(message);
  }
}

const imageService = new ImageService();
export default imageService;
