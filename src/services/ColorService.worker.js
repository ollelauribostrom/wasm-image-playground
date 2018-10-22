import { WorkerCommands } from './types';
import type { WorkerRequest, WorkerResponse } from './types';

declare var self: {
  onmessage: (e: any) => void,
  postMessage: (message: any) => void
};

self.onmessage = (e: { data: WorkerRequest }) => {
  const fn = {
    [WorkerCommands.GetRandomColor]: getRandomColor
  }[e.data.command];
  if (fn) {
    fn(e.data);
  }
};

function getRandomColor(request: WorkerRequest): void {
  const response: WorkerResponse = {
    id: request.id,
    payload: `hsla(${Math.random() * 360}, 100%, 70%, 1)`
  };
  self.postMessage(response);
}
