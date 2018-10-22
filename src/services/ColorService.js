import ColorServiceWorker from './ColorService.worker';
import { WorkerCommands } from './types';
import type { WorkerRequest, WorkerCommand, WorkerResponse, WorkerCallback } from './types';

class ColorService {
  nextId: number;
  worker: any;
  workerCallbacks: Array<WorkerCallback>;

  constructor() {
    this.nextId = 0;
    // $FlowFixMe
    this.worker = new ColorServiceWorker();
    this.workerCallbacks = [];
    this.worker.addEventListener('message', (e: any) => this.onMessage(e));
  }

  getNextId(): number {
    const id = this.nextId;
    this.nextId += 1;
    return id;
  }

  onMessage(e: { data: WorkerResponse }) {
    const i = this.workerCallbacks.findIndex(cb => cb.id === e.data.id);
    if (i < 0) {
      return;
    }
    this.workerCallbacks[i].fn(e.data);
    this.workerCallbacks.splice(i, 1);
  }

  postMessage(command: WorkerCommand, payload: ?any): Promise<WorkerResponse> {
    return new Promise((resolve, reject) => {
      const request: WorkerRequest = {
        id: this.getNextId(),
        command,
        payload
      };
      this.workerCallbacks.push({
        id: request.id,
        fn: (response: WorkerResponse) => {
          if (response.error) {
            reject(response);
          }
          resolve(response);
        }
      });
      this.worker.postMessage(request);
    });
  }

  async getRandomColor(): Promise<string> {
    const response = await this.postMessage(WorkerCommands.GetRandomColor);
    return response.payload;
  }
}

const service = new ColorService();
export default service;
