import React from 'react';
import { shallow, mount } from 'enzyme';
import Header from '../../src/components/Header';
import { actions } from '../../src/store/AppStore';
import { Button } from '../../src/components/Button';
import { ToggleHandle } from '../../src/components/ToggleHandle';

jest.mock('../../src/store/AppStore', () => ({
  connect: () => arg => arg,
  actions: {
    setStatus: jest.fn(),
    setLoading: jest.fn(),
    setLanguage: jest.fn(),
    toggleBenchmarkModal: jest.fn(),
    applyFilter: jest.fn(),
    runBenchmark: jest.fn(),
    undo: jest.fn(),
    download: jest.fn(),
    delete: jest.fn()
  }
}));

const ButtonIndex = {
  Blur: 0,
  Grayscale: 1,
  Sharpen: 2,
  Invert: 3,
  Cool: 4,
  Benchmark: 5,
  Undo: 6,
  Download: 7,
  Delete: 8
};

describe('Tests for Header', () => {
  it('renders correctly', () => {
    const wrapper = shallow(<Header language="js" />);
    expect(wrapper).toMatchSnapshot();
  });
  it('renders correctly when language is wasm', () => {
    const wrapper = shallow(<Header language="wasm" />);
    expect(wrapper).toMatchSnapshot();
  });
  it('renders correctly when app is loading', () => {
    const wrapper = shallow(<Header language="js" isLoading />);
    expect(wrapper).toMatchSnapshot();
  });
  it('handles click on the blur button', () => {
    const wrapper = shallow(<Header language="js" />);
    wrapper
      .find(Button)
      .at(ButtonIndex.Blur)
      .simulate('click');
    expect(actions.setLoading).toHaveBeenCalledWith(true);
    expect(actions.applyFilter).toHaveBeenCalledWith('blur');
  });
  it('handles click on the grayscale button', () => {
    const wrapper = shallow(<Header language="js" />);
    wrapper
      .find(Button)
      .at(ButtonIndex.Grayscale)
      .simulate('click');
    expect(actions.setLoading).toHaveBeenCalledWith(true);
    expect(actions.applyFilter).toHaveBeenCalledWith('grayscale');
  });
  it('handles click on the sharpen button', () => {
    const wrapper = shallow(<Header language="js" />);
    wrapper
      .find(Button)
      .at(ButtonIndex.Sharpen)
      .simulate('click');
    expect(actions.setLoading).toHaveBeenCalledWith(true);
    expect(actions.applyFilter).toHaveBeenCalledWith('sharpen');
  });
  it('handles click on the invert button', () => {
    const wrapper = shallow(<Header language="js" />);
    wrapper
      .find(Button)
      .at(ButtonIndex.Invert)
      .simulate('click');
    expect(actions.setLoading).toHaveBeenCalledWith(true);
    expect(actions.applyFilter).toHaveBeenCalledWith('invert');
  });
  it('handles click on the cool button', () => {
    const wrapper = shallow(<Header language="js" />);
    wrapper
      .find(Button)
      .at(ButtonIndex.Cool)
      .simulate('click');
    expect(actions.setLoading).toHaveBeenCalledWith(true);
    expect(actions.applyFilter).toHaveBeenCalledWith('cool');
  });
  it('handles click on the benchmark button', () => {
    const wrapper = shallow(<Header language="js" />);
    wrapper
      .find(Button)
      .at(ButtonIndex.Benchmark)
      .simulate('click');
    expect(actions.toggleBenchmarkModal).toHaveBeenCalled();
  });
  it('handles click on the undo button', () => {
    const wrapper = shallow(<Header language="js" />);
    wrapper
      .find(Button)
      .at(ButtonIndex.Undo)
      .simulate('click');
    expect(actions.setLoading).toHaveBeenCalledWith(true);
    expect(actions.undo).toHaveBeenCalled();
  });
  it('handles click on the download button', () => {
    const wrapper = shallow(<Header language="js" />);
    wrapper
      .find(Button)
      .at(ButtonIndex.Download)
      .simulate('click');
    expect(actions.setLoading).toHaveBeenCalledWith(true);
    expect(actions.download).toHaveBeenCalled();
  });
  it('handles click on the delete button', () => {
    const wrapper = shallow(<Header language="js" />);
    wrapper
      .find(Button)
      .at(ButtonIndex.Delete)
      .simulate('click');
    expect(actions.setLoading).toHaveBeenCalledWith(true);
    expect(actions.delete).toHaveBeenCalled();
  });
  it('handles click on the language toggle handle (js => wasm)', () => {
    const wrapper = mount(<Header language="js" />);
    wrapper.find(ToggleHandle).simulate('click');
    expect(actions.setLanguage).toHaveBeenCalledWith('wasm');
    wrapper.unmount();
  });
  it('handles click on the language toggle handle (wasm => js)', () => {
    const wrapper = mount(<Header language="wasm" />);
    wrapper.find(ToggleHandle).simulate('click');
    expect(actions.setLanguage).toHaveBeenCalledWith('js');
    wrapper.unmount();
  });
});
