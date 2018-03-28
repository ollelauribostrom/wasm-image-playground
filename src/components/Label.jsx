import React from 'react';

function Label({
  text = '',
  size = 'small',
  className = '',
  icon = null,
  onClick = () => {}
}) {
  return (
    <div
      className={`label label-${size} ${className}`}
      onClick={onClick}
    >
      <span>{text}</span>
      {icon}
    </div>
  )
}

export default Label;