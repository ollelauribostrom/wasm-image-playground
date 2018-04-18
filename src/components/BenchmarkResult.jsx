import React from 'react';
import Icon from './Icon';

function BenchmarkResult({ task, fastest, percent, avgDiff }) {
  const diff = avgDiff !== undefined ? `(${avgDiff}% difference in output pixels)` : '';
  const info = `${task}: ${fastest} was ${percent.total}% faster ${diff}`;
  return (
    <div className="benchmark-result" key={task}>
      {<Icon name="results" size="s" />}
      <span className="benchmark-result-info">{info}</span>
    </div>
  )
}

export default BenchmarkResult;
