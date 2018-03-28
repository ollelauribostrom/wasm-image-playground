import React from 'react';

function Header({ title, subtitle = '', icon = null, children }) {
  return (
    <div className="app-header">
      <div className="app-header-top">
        <h1 className="app-header-title">
          {icon}
          {title}
          <span className="app-header-title-light">{subtitle}</span>
        </h1>
        {children}
      </div>
    </div>
  )
}

export default Header;