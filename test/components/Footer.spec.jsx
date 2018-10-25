import React from 'react';
import { shallow } from 'enzyme';
import { Footer } from '../../src/components/Footer';

describe('Tests for Footer', () => {
  it('renders correctly', () => {
    expect(shallow(<Footer />)).toMatchSnapshot();
  });
});
