export const WorkerCommands = {
  GetRandomColor: 'GetRandomColor'
};

export type WorkerCommand = $Keys<typeof WorkerCommands>;

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
