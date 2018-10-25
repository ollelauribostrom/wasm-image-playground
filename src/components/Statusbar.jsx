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
      {isLoading ? <Spinner /> : <Icon name="info" />}
      <span>{status}</span>
    </div>
  );
}

export default connect(state => state)(Statusbar);
