import React from 'react';
import { mount } from 'enzyme';
import ImageView from '../src/components/ImageView';

jest.mock('../src/store/AppStore', () => ({
  connect: () => arg => arg
}));

function mockCanvas() {
  const mockCtx = { clearRect: jest.fn(), drawImage: jest.fn() };
  const getContext = jest.spyOn(HTMLCanvasElement.prototype, 'getContext');
  const toBlob = jest.spyOn(HTMLCanvasElement.prototype, 'toBlob');
  getContext.mockImplementation(() => mockCtx);
  toBlob.mockImplementation(() => {});
  return { mockCtx, toBlob, restore: () => getContext.mockRestore() };
}

describe('Tests for ImageView', () => {
  it('renders correctly (empty view)', () => {
    const { restore } = mockCanvas();
    const wrapper = mount(<ImageView image={null} />);
    expect(wrapper).toMatchSnapshot();
    wrapper.unmount();
    restore();
  });
  it('renders correctly (image)', () => {
    const { mockCtx, restore } = mockCanvas();
    const wrapper = mount(<ImageView image={null} />);
    const mockImage = { width: 100, height: 100 };
    wrapper.instance().ctx = mockCtx;
    wrapper.instance().canvas.height = 200;
    wrapper.instance().canvas.width = 200;
    wrapper.setProps({ image: mockImage });
    expect(mockCtx.clearRect).toHaveBeenCalledWith(0, 0, 200, 200);
    expect(mockCtx.drawImage).toHaveBeenCalledWith(mockImage, 50, 50, 100, 100);
    wrapper.unmount();
    restore();
  });
  it('only updates if the image prop has changed', () => {
    const { mockCtx, restore } = mockCanvas();
    const wrapper = mount(<ImageView image={null} />);
    const mockImage = { width: 100, height: 100 };
    wrapper.instance().ctx = mockCtx;
    wrapper.instance().canvas.height = 200;
    wrapper.instance().canvas.width = 200;
    wrapper.setProps({ image: mockImage });
    mockCtx.clearRect.mockClear();
    mockCtx.drawImage.mockClear();
    wrapper.setProps({ image: mockImage });
    expect(mockCtx.clearRect).not.toHaveBeenCalled();
    expect(mockCtx.drawImage).not.toHaveBeenCalled();
    wrapper.unmount();
    restore();
  });
  it('reacts to resize events', () => {
    const { toBlob, restore } = mockCanvas();
    const wrapper = mount(<ImageView image={null} />);
    window.dispatchEvent(new Event('resize'));
    expect(toBlob).toHaveBeenCalled();
    wrapper.unmount();
    restore();
  });
  it('removes the resize eventlistener on unmount', () => {
    const { restore } = mockCanvas();
    const wrapper = mount(<ImageView image={null} />);
    const removeEventListener = jest.spyOn(window, 'removeEventListener');
    wrapper.unmount();
    expect(removeEventListener.mock.calls[1][0]).toEqual('resize');
    restore();
  });
});
