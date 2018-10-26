import React from 'react';
import { mount } from 'enzyme';
import { config } from '../../src/stores/AppStore';
import ImageService from '../../src/services/ImageService';

jest.mock('../../src/services/ImageService', () => ({
  applyFilter: jest.fn((image, filter) => {
    image.appliedFilter = filter;
    return image;
  }),
  benchmark: jest.fn(() => 'results'),
  upload: jest.fn(images => images[0]),
  download: jest.fn()
}));

const actions = config.actionsCreators;

describe('Tests for AppStore', () => {
  it('has the correct initial state', () => {
    expect(config.initialState).toMatchSnapshot();
  });
  it('handles action: setStatus', () => {
    const state = { ...config.initialState };
    const newState = Object.assign({}, state, actions.setStatus(state, {}, 'test-status'));
    expect(newState.status).toEqual('test-status');
  });
  it('handles action: setLoading', () => {
    const state = { ...config.initialState };
    const newState = Object.assign({}, state, actions.setLoading(state, {}, true));
    expect(newState.isLoading).toEqual(true);
  });
  it('handles action: setLanguage', () => {
    const state = { ...config.initialState };
    const newState = Object.assign({}, state, actions.setLanguage(state, {}, 'wasm'));
    expect(newState.language).toEqual('wasm');
  });
  it('handles action: setDragging', () => {
    const state = { ...config.initialState };
    const newState = Object.assign({}, state, actions.setDragging(state, {}, true));
    expect(newState.isDragging).toEqual(true);
  });
  it('handles action: toggleBenchmarkModal', () => {
    const state = { ...config.initialState };
    const newState = Object.assign({}, state, actions.toggleBenchmarkModal(state, {}));
    const finalState = Object.assign({}, newState, actions.toggleBenchmarkModal(newState, {}));
    expect(newState.showBenchmarkModal).toEqual(true);
    expect(finalState.showBenchmarkModal).toEqual(false);
  });
  it('handles action: upload', async () => {
    const files = ['fileA', 'fileB'];
    const state = { ...config.initialState };
    const newState = await actions.upload(state, {}, files);
    expect(newState.image).toEqual('fileA');
    expect(newState.isLoading).toEqual(false);
  });
  it('handles action: applyFilter', async () => {
    const image = {};
    const state = Object.assign({}, config.initialState, { image, loading: true });
    const newState = await actions.applyFilter(state, {}, 'BoxBlur');
    expect(newState.image).toEqual({ appliedFilter: 'BoxBlur' });
    expect(newState.history).toEqual([image]);
    expect(newState.isLoading).toEqual(false);
  });
  it('handles action: runBenchmark', async () => {
    const state = { ...config.initialState };
    const newState = await actions.runBenchmark(state, {});
    expect(newState.benchmarkResults).toEqual('results');
    expect(newState.showBenchmarkModal).toEqual(true);
    expect(newState.isLoading).toEqual(false);
  });
  it('handles action: undo', () => {
    const state = { image: 3, history: [1, 2] };
    const newState = actions.undo(state, {});
    expect(newState.image).toEqual(2);
    expect(newState.history).toEqual([1]);
    expect(newState.isLoading).toEqual(false);
  });
  it('handles action: download', () => {
    const state = { isLoading: true };
    const newState = actions.download(state, {});
    expect(ImageService.download).toHaveBeenCalled();
    expect(newState.isLoading).toEqual(false);
  });
  it('handles action: delete', () => {
    const state = { image: 3, history: [1, 2] };
    const newState = actions.delete(state, {});
    expect(newState).toEqual({ image: null, history: [] });
  });
});
