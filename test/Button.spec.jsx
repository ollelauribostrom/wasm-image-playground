import React from 'react';
import { shallow, mount } from 'enzyme';
import { Button } from '../src/components/Button';
import { Icon } from '../src/components/Icon';

describe('Tests for Button', () => {
  it('renders correctly', () => {
    const wrapper = shallow(
      <Button customClassName="testClass" title="testTitle" icon={<Icon name="image" />} />
    );
    expect(wrapper).toMatchSnapshot();
  });
  it('renders correctly when passing the isDisabled prop', () => {
    const wrapper = shallow(
      <Button customClassName="testClass" icon={<Icon name="image" />} isDisabled />
    );
    expect(wrapper).toMatchSnapshot();
  });
  it('renders correctly when passing the href prop', () => {
    const wrapper = shallow(
      <Button
        label="label"
        href="testHref"
        target="testTarget"
        rel="testRel"
        icon={<Icon name="image" />}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });
  it('renders correctly when passing the onToggle prop', () => {
    const onToggle = jest.fn();
    const wrapper = shallow(
      <Button
        className="testClass"
        title="testTitle"
        icon={<Icon name="image" />}
        onToggle={onToggle}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });
  it('invokes onClick when clicked', () => {
    const onClick = jest.fn();
    const wrapper = shallow(<Button onClick={onClick} />);
    wrapper.simulate('click');
    expect(onClick).toHaveBeenCalledTimes(1);
  });
  it('invokes onClick on enter keypress', () => {
    const onClick = jest.fn();
    const wrapper = shallow(<Button onClick={onClick} />);
    wrapper.simulate('keypress', { keyCode: 13 });
    wrapper.simulate('keypress', { keyCode: 12 });
    wrapper.simulate('keypress', { key: 'Enter' });
    expect(onClick).toHaveBeenCalledTimes(2);
  });
  it('invokes onToggle when clicking the toggle handle', () => {
    const onClick = jest.fn();
    const onToggle = jest.fn();
    const wrapper = mount(<Button onClick={onClick} onToggle={onToggle} />);
    wrapper.find('ToggleHandle').simulate('click');
    expect(onClick).not.toHaveBeenCalled();
    expect(onToggle).toHaveBeenCalledTimes(1);
    wrapper.unmount();
  });
  it('does not invoke onClick if the button is disabled', () => {
    const onClick = jest.fn();
    const wrapper = shallow(<Button onClick={onClick} isDisabled />);
    wrapper.simulate('click');
    wrapper.simulate('keypress', { key: 'Enter' });
    expect(onClick).not.toHaveBeenCalled();
  });
});
