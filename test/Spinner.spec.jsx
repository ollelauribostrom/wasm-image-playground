import React from 'react';
import { shallow } from 'enzyme';
import { Spinner } from '../src/components/Spinner';

describe('Tests for Spinner', () => {
  it('renders correctly', () => {
    expect(shallow(<Spinner isLoading />)).toMatchSnapshot();
  });
  it('renders empty when IsLoading = false', () => {
    expect(shallow(<Spinner isLoading={false} />)).toBeEmptyRender();
  });
});
