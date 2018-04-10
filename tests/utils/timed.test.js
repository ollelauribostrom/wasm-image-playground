import timed from '../../src/utils/timed';

describe('{unit} time', () => {
  it('runs the function', async () => {
    const fn = jest.fn().mockReturnValue(1);
    const returnVal = timed(fn);
    expect(fn.mock.calls.length).toEqual(1);
    expect(returnVal.time).toBeTruthy();
    expect(returnVal.result).toEqual(1);
  });
  it('catches error', async () => {
    const fn = () => { throw new Error(); };
    const returnVal = timed(fn, { language: 'JS', action: 'run tests'});
    expect(returnVal.err).toBeInstanceOf(Error);
    expect(returnVal.error).toEqual('Error when using JS to run tests');
  });
});
