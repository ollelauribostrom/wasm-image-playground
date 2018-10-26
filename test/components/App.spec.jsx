import React from 'react';
import { shallow, mount } from 'enzyme';
import App from '../../src/components/App';
import { actions } from '../../src/stores/AppStore';
import { Droppable } from '../../src/components/Droppable';

jest.mock('../../src/stores/AppStore', () => ({
  connect: () => arg => arg,
  Provider: () => <div />,
  actions: {
    setLoading: jest.fn(),
    setDragging: jest.fn(),
    upload: jest.fn()
  }
}));

describe('Tests for App', () => {
  it('renders correctly', () => {
    const wrapper = shallow(<App />);
    expect(wrapper).toMatchSnapshot();
  });
  it('handles drop events on the Droppable component (e.target.files)', async () => {
    const wrapper = shallow(<App />);
    const onDrop = wrapper.find(Droppable).prop('onDrop');
    const mockFiles = ['fileA', 'fileB'];
    const mockEvent = { preventDefault: jest.fn(), target: { files: mockFiles } };
    await onDrop(mockEvent);
    expect(mockEvent.preventDefault).toHaveBeenCalledTimes(1);
    expect(actions.setLoading).toHaveBeenCalledTimes(1);
    expect(actions.upload).toHaveBeenCalledWith(mockFiles);
    wrapper.unmount();
  });
  it('handles drop events on the Droppable component (e.dataTransfer.files)', async () => {
    const wrapper = shallow(<App />);
    const onDrop = wrapper.find(Droppable).prop('onDrop');
    const mockFiles = ['fileA', 'fileB'];
    const mockEvent = { preventDefault: jest.fn(), target: {}, dataTransfer: { files: mockFiles } };
    actions.setLoading.mockClear();
    actions.upload.mockClear();
    await onDrop(mockEvent);
    expect(mockEvent.preventDefault).toHaveBeenCalledTimes(1);
    expect(actions.setLoading).toHaveBeenCalledTimes(1);
    expect(actions.upload).toHaveBeenCalledWith(mockFiles);
    wrapper.unmount();
  });
  it('handles dragStart events on the Droppable component', () => {
    const wrapper = shallow(<App />);
    const onDragStart = wrapper.find(Droppable).prop('onDragStart');
    onDragStart();
    expect(actions.setDragging).toHaveBeenCalledWith(true);
  });
  it('handles dragEnd events on the Droppable component', () => {
    const wrapper = shallow(<App />);
    const onDragEnd = wrapper.find(Droppable).prop('onDragEnd');
    onDragEnd();
    expect(actions.setDragging).toHaveBeenCalledWith(false);
  });
});
