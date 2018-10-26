import React from 'react';
import { Icon } from './Icon';
import { Spinner } from './Spinner';
import { connect } from '../stores/AppStore';

type StatusbarProps = {
  status: string,
  isLoading: boolean
};

function Statusbar({ status, isLoading }: StatusbarProps) {
  const showIcon = !isLoading && status;
  return (
    <div className="statusbar">
      <Spinner isLoading={isLoading} />
      {showIcon ? <Icon name="info" /> : null}
      <span>{status}</span>
    </div>
  );
}

export default connect(state => state)(Statusbar);
