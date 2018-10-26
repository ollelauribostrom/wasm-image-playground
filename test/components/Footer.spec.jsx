import React from 'react';
import { shallow } from 'enzyme';
import Footer from '../../src/components/Footer';

jest.mock('../../src/services/ImageService', () => ({
  applyFilter: jest.fn(),
  benchmark: jest.fn(),
  upload: jest.fn(),
  download: jest.fn()
}));

describe('Tests for Footer', () => {
  it('renders correctly', () => {
    expect(shallow(<Footer />)).toMatchSnapshot();
  });
});
