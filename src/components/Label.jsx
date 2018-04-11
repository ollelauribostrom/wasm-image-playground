import React from 'react';

function Label({
  text = '',
  size = 'small',
  className = '',
  icon = null,
  onClick = () => {},
  ...props
}) {
  return (
    <div
      className={`label label-${size} ${className}`}
      onClick={onClick}
      {...props}
    >
      <span>{text}</span>
      {icon}
    </div>
  )
}

export default Label;