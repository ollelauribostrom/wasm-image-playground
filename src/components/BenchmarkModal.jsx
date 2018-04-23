import React from 'react';
import Modal from 'react-modal';
import Icon from './Icon';
import BenchmarkTask from './BenchmarkTask';
import BenchmarkResult from './BenchmarkResult';
import Label from './Label';

const modalStyle = {
  content: {
    background: "transparent",
    border: 0
  },
  overlay: {
    background: "rgba(0, 0, 0, 0.9)",
    border: 0,
    zIndex: 2,            
  }
};

function BenchmarkModal({ isOpen, title, running, results, tasks, onStart, onRestart, onClose }) {
  return (
    <Modal isOpen={isOpen} style={modalStyle} >
      <div className="benchmark-content">
        <h1 className="benchmark-heading">Benchmark: {title}</h1>
        <Icon 
          name="restore"
          size="l"
          onClick={onRestart}
          className={`benchmark-reset-icon ${!running && results.length ? '' : 'hidden'}`}
        />
        <Icon 
          name="close"
          size="l"
          onClick={onClose}
          className="benchmark-close-icon"
        />
        <Label 
          text="Run Benchmark"
          size="large"
          onClick={onStart}
          className={`benchmark-button ${!running && !results.length ? '' : 'hidden'}`} 
        />
        {tasks.map(task => <BenchmarkTask {...task} />)}
        <div className={`benchmark-results ${results.length ? '' : 'hidden'}`}>
          {results.map(result => <BenchmarkResult {...result} />)}
        </div>
      </div>
    </Modal>
  )
}

export default BenchmarkModal;