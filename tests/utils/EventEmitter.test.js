import EventEmitter from '../../src/utils/EventEmitter';

describe('{unit} EventEmitter', () => {
  it('is possible to listen to an event', async () => {
    const emitter = new EventEmitter();
    const fn = jest.fn();
    emitter.on('test', fn);
    expect(emitter.listeners.test.length).toEqual(1);
  });
  it('is possible to remove a listener', async () => {
    const emitter = new EventEmitter();
    const fn = jest.fn();
    emitter.on('test', fn);
    emitter.removeListener('test', fn);
    expect(emitter.listeners.test.length).toEqual(0);
  });
  it('is possible to emit an event', async () => {
    const emitter = new EventEmitter();
    const fn = jest.fn();
    emitter.on('test', fn);
    emitter.emit('test', 1);
    expect(fn.mock.calls.length).toEqual(1);
    expect(fn.mock.calls[0][0]).toEqual(1);
  });
});
