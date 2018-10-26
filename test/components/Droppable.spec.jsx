import React from 'react';
import { mount } from 'enzyme';
import Droppable from '../../src/components/Droppable';

const wait = duration => new Promise(resolve => setTimeout(resolve, duration));

describe('Tests for Droppable', () => {
  it('invokes onDrop when a drop event fires on the child component', () => {
    const onDrop = jest.fn();
    const wrapper = mount(<Droppable onDrop={onDrop}>{<div />}</Droppable>);
    wrapper.instance().droppableContainer.dispatchEvent(new Event('drop'));
    expect(onDrop).toHaveBeenCalledTimes(1);
    wrapper.unmount();
  });
  it('invokes onDragStart when a drag is started', () => {
    const onDragStart = jest.fn();
    const wrapper = mount(<Droppable onDragStart={onDragStart}>{<div />}</Droppable>);
    wrapper.instance().droppableContainer.dispatchEvent(new Event('dragover'));
    expect(onDragStart).toHaveBeenCalledTimes(1);
    wrapper.unmount();
  });
  it('invokes onDragEnd when the drag is ended', async () => {
    const onDragEnd = jest.fn();
    const wrapper = mount(<Droppable onDragStart={onDragEnd}>{<div />}</Droppable>);
    wrapper.instance().droppableContainer.dispatchEvent(new Event('dragover'));
    await wait(100);
    expect(onDragEnd).toHaveBeenCalledTimes(1);
    wrapper.unmount();
  });
  it('removes event listeners on unmount', () => {
    const onDrop = jest.fn();
    const wrapper = mount(<Droppable onDrop={onDrop}>{<div />}</Droppable>);
    const droppableContainer = wrapper.instance().droppableContainer;
    const removeEventListener = jest.spyOn(droppableContainer, 'removeEventListener');
    wrapper.unmount();
    expect(removeEventListener.mock.calls[0][0]).toEqual('dragover');
    expect(removeEventListener.mock.calls[1][0]).toEqual('drop');
  });
});
