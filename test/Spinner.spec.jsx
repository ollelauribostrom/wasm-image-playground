import React from 'react';
import { shallow } from 'enzyme';
import { Spinner } from '../src/components/Spinner';

describe('Tests for Spinner', () => {
  it('renders correctly', () => {
    expect(shallow(<Spinner />)).toMatchSnapshot();
  });
});
