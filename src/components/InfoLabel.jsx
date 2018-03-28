import React from 'react';
import Icon from './Icon';

function InfoLabel({ text, onClick }) {
  const hidden = !text ? 'info-label-hidden' : '' ;

  return (
    <div className={`info-label ${hidden}`} onClick={onClick}>
      <Icon name="alert" size="s" />
      <span>{text}</span>
    </div>
  )
}

export default InfoLabel;