import React from 'react';
import { Icon } from './Icon';
import { ToggleHandle } from './ToggleHandle';

type ButtonProps = {
  icon?: Icon,
  label?: string,
  title?: string,
  isDisabled?: boolean,
  onClick?: () => void,
  onToggle?: () => void,
  customClassName?: string,
  href?: string,
  target?: string,
  rel?: string
};

export function Button({
  icon,
  label,
  title,
  isDisabled,
  onClick,
  onToggle,
  customClassName,
  href,
  target,
  rel
}: ButtonProps) {
  let className = `button ${customClassName}`;
  if (isDisabled) {
    className += 'button--disabled';
  }
  if (href && !isDisabled) {
    return (
      <a className={className} href={href} target={target} rel={rel} title={title}>
        {label}
        {icon}
      </a>
    );
  }
  return (
    <div
      onKeyPress={e => {
        const key = e.key || e.keyCode;
        if (key === 'Enter' || key === 13) {
          if (!isDisabled) {
            onClick();
          }
        }
      }}
      onClick={e => !isDisabled && onClick(e)}
      className={`button ${customClassName}`}
      type="button"
      title={title}
      role="button"
      tabIndex={0}
    >
      {label ? <span>{label}</span> : null}
      {icon}
      {onToggle ? (
        <ToggleHandle
          onToggle={e => {
            e.stopPropagation();
            onToggle();
          }}
        />
      ) : null}
    </div>
  );
}

Button.defaultProps = {
  icon: null,
  label: null,
  title: '',
  isDisabled: false,
  onClick: () => {},
  onToggle: null,
  customClassName: '',
  href: null,
  target: null,
  rel: null
};
