import React from 'react';
import Icon from './Icon';

function GithubLink() {
  return (
    <a href="https://github.com/ollelauribostrom/wasm-image-playground" className="gh-link">
      <span>View on</span>
      <Icon name="gh" size="xs" />
    </a>
  )
}

export default GithubLink;