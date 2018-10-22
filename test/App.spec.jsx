import React from 'react';
import { mount, shallow } from 'enzyme';
import App from '../src/components/App';

function wait(duration) {
  return new Promise(resolve => {
    setTimeout(resolve, duration);
  });
}

jest.mock('../src/services/ColorService', () => ({
  getRandomColor: jest.fn(() => Promise.resolve(`hsla(${Math.random() * 360}, 100%, 70%, 1)`))
}));

describe('Tests for App', () => {
  test('it renders correctly', () => {
    const wrapper = shallow(<App />);
    expect(wrapper).toMatchSnapshot();
  });
  test('it handles clicks', async () => {
    const wrapper = mount(<App />);
    expect(wrapper.find('.reactor-count')).toHaveText('CLICK THE REACTOR');
    wrapper.find('.reactor-icon').simulate('click');
    await wait(10);
    expect(wrapper.find('.reactor-count')).toHaveText('CLICKED 1 TIME');
    wrapper.find('.reactor-icon').simulate('click');
    await wait(10);
    expect(wrapper.find('.reactor-count')).toHaveText('CLICKED 2 TIMES');
    wrapper.unmount();
  });
});
