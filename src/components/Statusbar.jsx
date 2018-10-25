import React from 'react';
import { Icon } from './Icon';
import { Spinner } from './Spinner';
import { connect } from '../store/AppStore';

type StatusbarProps = {
  status: string,
  isLoading: boolean
};

function Statusbar({ status, isLoading }: StatusbarProps) {
  return (
    <div className="statusbar">
      <Spinner isLoading={isLoading} />
      {isLoading ? null : <Icon name="info" />}
      <span>{status}</span>
    </div>
  );
}

export default connect(state => state)(Statusbar);
