import React, { Component } from 'react';
import Modal from 'react-modal';
import Icon from './Icon';
import BenchmarkTask from './BenchmarkTask';
import BenchmarkResult from './BenchmarkResult';
import ImageService from '../services/ImageService';
import Label from './Label';
import benchmarkImages from '../../benchmark/images.json'
import { imageToUint8ClampedArray } from '../utils/image';

class Benchmark extends Component {
  state = {
    tasks: [],
    results: [],
    error: null,
    running: false,
    showResult: false
  }

  componentWillMount() {
    ImageService.on('benchmarkUpdate', this.onUpdate);
    ImageService.on('benchmarkError', this.onError);
    ImageService.on('benchmarkComplete', this.onComplete);
  }

  componentWillUnmount() {
    ImageService.removeListener('benchmarkUpdate', this.onUpdate);
    ImageService.removeListener('benchmarkError', this.onError);
    ImageService.removeListener('benchmarkComplete', this.onComplete);
  }

  restart = async () => {
    if (!this.state.running && this.state.results) {
      await this.setState({ tasks: [], results: [], error: null });
      this.start();
    }
  }

  start = () => {
    this.props.onStart();
    this.setState({ running: true });
    this.setup();
  }

  stop = () => {
    this.props.onStop();
  }

  setup = async () => {
    try {
      this.addOrUpdateTask({
        id: 'SETUP',
        info: 'Loading benchmark images',
        status: 'running',
        type: 'setup'
      });
      const images = await Promise.all(benchmarkImages.files.map(async image => {
        const res = await fetch(require(`../../benchmark/${image.path}`));
        const blob = await res.blob();
        const data = await imageToUint8ClampedArray(URL.createObjectURL(blob));
        return { data, faces: image.faces }
      }));
      this.addOrUpdateTask({
        id: 'SETUP',
        info: `Loaded ${images.length} benchmark images`,
        status: 'done',
      });
      ImageService.postMessage({
        action: this.props.benchmarkType,
        images
      });
    } catch (error) {
      this.addOrUpdateTask({
        id: 'SETUP',
        info: 'Error when loading benchmark images',
        status: 'error',
      });
    }
  }

  addOrUpdateTask = task => {
    const tasks = [...this.state.tasks];
    const taskIndex = tasks.findIndex(t => t.id === task.id);
    if (taskIndex > -1) {
      tasks[taskIndex] = Object.assign(tasks[taskIndex], task);
    } else {
      tasks.push(task)
    }
    this.setState({ tasks });
  }

  onUpdate = ({ data }) => {
    this.addOrUpdateTask(data.task);
  }
  
  onError = ({ data }) => {
    this.setState({
      error: data.error,
      running: false
    });
    this.props.onStop();
  }

  onComplete = ({ data }) => {
    this.setState({ running: false, results: data.results });
    this.props.onStop();
  }

  onClose = () => {
    this.setState({
      isOpen: false
    });
  }

  render() {
    return (
      <Modal
        isOpen={this.props.isOpen}
        style={{
          content: {
            background: "transparent",
            border: 0
          },
          overlay: {
            background: "rgba(0, 0, 0, 0.9)",
            border: 0,
            zIndex: 2,            
          }
        }}
      >
        <div className="benchmark-content">
          <h1 className="benchmark-heading">Benchmark: {this.props.title}</h1>
          {
            !this.state.running && this.state.results.length ?
              <Icon 
                name="restore"
                size="l"
                onClick={this.restart}
                className="benchmark-reset-icon"
              /> : null
          }
          <Icon 
            name="close-white"
            size="l"
            onClick={this.props.onClose}
            className="benchmark-close-icon"
          />
          { !this.state.running && !this.state.results.length ? 
              <Label 
                text="Run Benchmark"
                size="large"
                onClick={this.start}
                className="benchmark-button" 
              /> : null
          }
          {this.state.tasks.map(task => <BenchmarkTask {...task} />)}
          {
            this.state.results.length ?
              <div className="benchmark-results">
                {this.state.results.map(result => <BenchmarkResult {...result} />)}
              </div> : null
          }
        </div>
      </Modal>
    )
  }
}

export default Benchmark;
