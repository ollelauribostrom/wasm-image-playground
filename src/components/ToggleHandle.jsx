import React from 'react';
import { Icon } from './Icon';

type ToggleHandleProps = {
  onToggle: () => void
};

export function ToggleHandle({ onToggle }: ToggleHandleProps) {
  return (
    <div
      className="toggle__handle"
      onKeyPress={e => {
        const key = e.key || e.keyCode;
        if (key === 'Enter' || key === 13) {
          onToggle();
        }
      }}
      onClick={onToggle}
      role="button"
      tabIndex={0}
    >
      {<Icon name="toggle" />}
    </div>
  );
}
