import React from 'react';
import Icon from './Icon';
import Spinner from './Spinner';

function getStatusIcon(status) {
  if (status === 'running') {
    return (
      <div className="benchmark-task-status-icon">
        <Spinner visible={true} color="#A599FF" />
      </div>
    );
  }
  if (status === 'done') {
    return <Icon name="check" size="s" className="benchmark-task-status-icon" />;
  }
  if (status === 'error') {
    return <Icon name="cross" size="s" className="benchmark-task-status-icon" />;
  }
}

function BenchmarkTask({ id, status, info, time, average, type, iconSize = 's' }) {
  return (
    <div className="benchmark-task" key={id}>
      {<Icon name={type} size={iconSize} />}
      <span className="benchmark-info">{info}</span>
      {time ? <span className="benchmark-time">Total: {time}ms</span> : null}
      {average ? <span className="benchmark-average">Average: {average}ms</span> : null }
      {getStatusIcon(status)}
    </div>
  )
}

export default BenchmarkTask;
