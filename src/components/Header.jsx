import React from 'react';
import Icon from './Icon';
import Button from './Button';
import { connect, actions } from '../stores/AppStore';
import { Filters, Languages } from '../services/types';
import type { Language } from '../services/types';

type HeaderProps = {
  image: Image,
  language: Language,
  history: Array<Image>,
  isLoading: boolean
};

function Header({ image, language, history, isLoading }: HeaderProps) {
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
            await actions.applyFilter(Filters.BoxBlur);
          }}
          isDisabled={isLoading}
        />
        <Button
          customClassName="toolbar__button toolbar__button--filter"
          title="Convert image to grayscale"
          icon={<Icon name="bw" />}
          onClick={async () => {
            actions.setLoading(true);
            await actions.applyFilter(Filters.Grayscale);
          }}
          isDisabled={isLoading}
        />
        <Button
          customClassName="toolbar__button toolbar__button--filter"
          title="Sharpen image"
          icon={<Icon name="sharpen" />}
          onClick={async () => {
            actions.setLoading(true);
            await actions.applyFilter(Filters.Sharpen);
          }}
          isDisabled={isLoading}
        />
        <Button
          customClassName="toolbar__button toolbar__button--filter"
          title="Invert image"
          icon={<Icon name="invert" />}
          onClick={async () => {
            actions.setLoading(true);
            await actions.applyFilter(Filters.Invert);
          }}
          isDisabled={isLoading}
        />
        <Button
          customClassName="toolbar__button toolbar__button--filter"
          title="Apply cooling filter"
          icon={<Icon name="cool" />}
          onClick={async () => {
            actions.setLoading(true);
            await actions.applyFilter(Filters.Cooling);
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
          onClick={() => {
            actions.setLoading(true);
            actions.undo();
          }}
          isDisabled={isLoading || !history.length}
        />
        <Button
          customClassName="toolbar__button toolbar__button--action"
          title="Download"
          icon={<Icon name="download" />}
          onClick={() => {
            actions.setLoading(true);
            actions.download();
          }}
          isDisabled={isLoading || !image}
        />
        <Button
          customClassName="toolbar__button toolbar__button--action"
          title="Delete"
          icon={<Icon name="delete" />}
          onClick={() => {
            actions.setLoading(true);
            actions.delete();
          }}
          isDisabled={isLoading}
        />
        <Button
          customClassName="toolbar__button toolbar__button--action"
          title="Current language mode"
          icon={<Icon name={language} />}
          onToggle={() =>
            actions.setLanguage(
              language === Languages.JavaScript ? Languages.WebAssembly : Languages.JavaScript
            )
          }
          isDisabled={isLoading}
        />
      </div>
    </div>
  );
}

export default connect(state => state)(Header);
