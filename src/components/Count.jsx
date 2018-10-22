import React from 'react';
import { connect } from '../store/AppStore';

type CountProps = {|
  count: number
|};

function Count({ count }: CountProps) {
  const times = count === 1 ? 'TIME' : 'TIMES';
  const message = count === 0 ? 'CLICK THE REACTOR' : `CLICKED ${count} ${times}`;
  return <div className="reactor-count">{message}</div>;
}

export default connect(state => state)(Count);
