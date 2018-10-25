import React, { Component } from 'react';
import { mount } from 'enzyme';
import ErrorBoundary from '../src/components/ErrorBoundary';

class Child extends Component {
  render() {
    if (this.props.throw) {
      throw new Error('Thrown from child');
    }
    return <span>Rendered from child</span>;
  }
}

describe('Tests for ErrorBoundary', () => {
  it('should render children', () => {
    const wrapper = mount(
      <ErrorBoundary>
        <Child />
      </ErrorBoundary>
    );
    expect(wrapper).toHaveText('Rendered from child');
    wrapper.unmount();
  });
  it('should catch errors thrown from child components', () => {
    const error = jest.spyOn(console, 'error');
    error.mockImplementation(() => {}); // Silence React error logging
    const wrapper = mount(
      <ErrorBoundary>
        <Child throw />
      </ErrorBoundary>
    );
    expect(wrapper.state().error.message).toEqual('Thrown from child');
    expect(wrapper).toMatchSnapshot();
    wrapper.unmount();
    error.mockRestore();
  });
});
