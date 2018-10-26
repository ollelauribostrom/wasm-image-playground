import React from 'react';
import { Icon } from './Icon';
import { Button } from './Button';
import { connect, actions } from '../stores/AppStore';

type HeaderProps = {
  language: string,
  isLoading: boolean
};

function Header({ language, isLoading }: HeaderProps) {
  return (
    <div className="header">
      <div className="header__logo">
        <Icon name="image" />
      </div>
      <div className="header__toolbar">
        <Button
          customClassName="toolbar__button toolbar__button--filter"
          title="Blur image"
          icon={<Icon name="blur" />}
          onClick={async () => {
            actions.setLoading(true);
            await actions.applyFilter('blur');
          }}
          isDisabled={isLoading}
        />
        <Button
          customClassName="toolbar__button toolbar__button--filter"
          title="Convert image to grayscale"
          icon={<Icon name="bw" />}
          onClick={async () => {
            actions.setLoading(true);
            await actions.applyFilter('grayscale');
          }}
          isDisabled={isLoading}
        />
        <Button
          customClassName="toolbar__button toolbar__button--filter"
          title="Sharpen image"
          icon={<Icon name="sharpen" />}
          onClick={async () => {
            actions.setLoading(true);
            await actions.applyFilter('sharpen');
          }}
          isDisabled={isLoading}
        />
        <Button
          customClassName="toolbar__button toolbar__button--filter"
          title="Invert image"
          icon={<Icon name="invert" />}
          onClick={async () => {
            actions.setLoading(true);
            await actions.applyFilter('invert');
          }}
          isDisabled={isLoading}
        />
        <Button
          customClassName="toolbar__button toolbar__button--filter"
          title="Apply cooling filter"
          icon={<Icon name="cool" />}
          onClick={async () => {
            actions.setLoading(true);
            await actions.applyFilter('cool');
          }}
          isDisabled={isLoading}
        />
        <Button
          customClassName="toolbar__button toolbar__button--benchmark"
          title="Open benchmark "
          icon={<Icon name="benchmark" />}
          onClick={() => {
            actions.toggleBenchmarkModal();
          }}
        />
        <Button
          customClassName="toolbar__button toolbar__button--action"
          title="Undo last action"
          icon={<Icon name="undo" />}
          onClick={async () => {
            actions.setLoading(true);
            await actions.undo();
          }}
          isDisabled={isLoading}
        />
        <Button
          customClassName="toolbar__button toolbar__button--action"
          title="Download"
          icon={<Icon name="download" />}
          onClick={async () => {
            actions.setLoading(true);
            await actions.download();
          }}
          isDisabled={isLoading}
        />
        <Button
          customClassName="toolbar__button toolbar__button--action"
          title="Delete"
          icon={<Icon name="delete" />}
          onClick={async () => {
            actions.setLoading(true);
            await actions.delete();
          }}
          isDisabled={isLoading}
        />
        <Button
          customClassName="toolbar__button toolbar__button--action"
          title="Current language mode"
          icon={<Icon name={language} />}
          onToggle={() => actions.setLanguage(language === 'js' ? 'wasm' : 'js')}
          isDisabled={isLoading}
        />
      </div>
    </div>
  );
}

export default connect(state => state)(Header);
