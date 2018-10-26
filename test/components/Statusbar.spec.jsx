import React from 'react';
import { shallow } from 'enzyme';
import Statusbar from '../../src/components/Statusbar';

jest.mock('../../src/stores/AppStore', () => ({
  connect: () => arg => arg
}));

describe('Tests for Statusbar', () => {
  it('renders correctly', () => {
    const wrapper = shallow(<Statusbar status="test-status" isLoading={false} />);
    expect(wrapper).toMatchSnapshot();
  });
  it('renders correctly when loading', () => {
    const wrapper = shallow(<Statusbar status="test-status" isLoading />);
    expect(wrapper).toMatchSnapshot();
  });
});
