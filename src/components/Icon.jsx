import React from 'react';
import icons from '../assets';

function Icon({ name, alt = "icon", size, style, className, ...props }) {
  return (
    <img 
      src={icons[name]} 
      alt={alt}
      style={style}
      className={`icon icon-${size} ${className}`}
      {...props}
    />)
}

export default Icon;