import React from 'react';
import { shallow } from 'enzyme';
import Icon from '../../src/components/Icon';

describe('Tests for Icon', () => {
  it('renders correctly: image icon', () => {
    expect(shallow(<Icon name="image" />)).toMatchSnapshot();
  });
  it('renders correctly: info icon', () => {
    expect(shallow(<Icon name="info" />)).toMatchSnapshot();
  });
  it('renders correctly: blur icon', () => {
    expect(shallow(<Icon name="blur" />)).toMatchSnapshot();
  });
  it('renders correctly: bw icon', () => {
    expect(shallow(<Icon name="bw" />)).toMatchSnapshot();
  });
  it('renders correctly: sharpen icon', () => {
    expect(shallow(<Icon name="sharpen" />)).toMatchSnapshot();
  });
  it('renders correctly: invert icon', () => {
    expect(shallow(<Icon name="invert" />)).toMatchSnapshot();
  });
  it('renders correctly: cool icon', () => {
    expect(shallow(<Icon name="cool" />)).toMatchSnapshot();
  });
  it('renders correctly: benchmark icon', () => {
    expect(shallow(<Icon name="benchmark" />)).toMatchSnapshot();
  });
  it('renders correctly: undo icon', () => {
    expect(shallow(<Icon name="undo" />)).toMatchSnapshot();
  });
  it('renders correctly: download icon', () => {
    expect(shallow(<Icon name="download" />)).toMatchSnapshot();
  });
  it('renders correctly: delete icon', () => {
    expect(shallow(<Icon name="delete" />)).toMatchSnapshot();
  });
  it('renders correctly: js icon', () => {
    expect(shallow(<Icon name="js" />)).toMatchSnapshot();
  });
  it('renders correctly: toggle icon', () => {
    expect(shallow(<Icon name="toggle" />)).toMatchSnapshot();
  });
  it('renders correctly: drag icon', () => {
    expect(shallow(<Icon name="drag" />)).toMatchSnapshot();
  });
  it('renders correctly: wasm icon', () => {
    expect(shallow(<Icon name="wasm" />)).toMatchSnapshot();
  });
  it('renders correctly: github icon', () => {
    expect(shallow(<Icon name="github" />)).toMatchSnapshot();
  });
  it('returns null for unknown icon name', () => {
    expect(shallow(<Icon name="nonexisting" />)).toBeEmptyRender();
  });
});
