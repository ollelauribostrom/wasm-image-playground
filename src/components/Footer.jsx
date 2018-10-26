import React from 'react';
import Statusbar from './Statusbar';
import Button from './Button';
import Icon from './Icon';

function Footer() {
  return (
    <div className="footer">
      <Statusbar />
      <Button
        href="https://github.com/ollelauribostrom/wasm-image-playground#credits"
        target="_blank"
        rel="noopener noreferrer"
        label="Credits"
        customClassName="footer__button footer__button--credits"
      />
      <Button
        href="https://github.com/ollelauribostrom/wasm-image-playground"
        target="_blank"
        rel="noopener noreferrer"
        label="View on"
        icon={<Icon name="github" />}
        customClassName="footer__button"
      />
    </div>
  );
}

export default Footer;
