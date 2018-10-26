import React from 'react';
import { shallow } from 'enzyme';
import ToggleHandle from '../../src/components/ToggleHandle';

describe('Tests for ToggleHandle', () => {
  it('renders correctly', () => {
    const onToggle = jest.fn();
    const wrapper = shallow(<ToggleHandle onToggle={onToggle} />);
    expect(wrapper).toMatchSnapshot();
  });
  it('invokes onToggle when clicked', () => {
    const onToggle = jest.fn();
    const wrapper = shallow(<ToggleHandle onToggle={onToggle} />);
    wrapper.simulate('click');
    expect(onToggle).toHaveBeenCalledTimes(1);
  });
  it('invokes onToggle on enter keypress', () => {
    const onToggle = jest.fn();
    const wrapper = shallow(<ToggleHandle onToggle={onToggle} />);
    wrapper.simulate('keypress', { keyCode: 13 });
    wrapper.simulate('keypress', { keyCode: 12 });
    wrapper.simulate('keypress', { key: 'Enter' });
    expect(onToggle).toHaveBeenCalledTimes(2);
  });
});
