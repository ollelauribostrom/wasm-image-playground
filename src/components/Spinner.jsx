import React from 'react';

function Spinner({ visible, color }) {
  return visible ? 
    (<div className="spinner" style={{borderTop: `6px solid ${color}`}}></div>) : 
    null;
}

export default Spinner;