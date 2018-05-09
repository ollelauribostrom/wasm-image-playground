import React, { Component } from 'react';
import { imageConverters } from 'imutils';
import BenchmarkModal from './BenchmarkModal';
import ImageService from '../services/ImageService';
import benchmarkImages from '../../benchmark/images.json'

class Benchmark extends Component {
  state = {
    taskIndex: 0,
    tasks: [],
    taskResults: {},
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
      await this.setState({ tasks: [], results: [], error: null, taskIndex: 0, taskResults: {} });
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
        const data = await imageConverters.toUint8ClampedArray(URL.createObjectURL(blob));
        return { data, containsFace: image.containsFace }
      }));
      await this.setState({ images });
      this.addOrUpdateTask({
        id: 'SETUP',
        info: `Loaded ${images.length} benchmark images`,
        status: 'done',
      });
      this.startTask(this.props.tasks[0]);
    } catch (error) {
      this.addOrUpdateTask({
        id: 'SETUP',
        info: 'Error when loading benchmark images',
        status: 'error',
      });
    }
  }

  startTask = task => {
    ImageService.postMessage({
      task,
      action: this.props.benchmarkType,
      images: this.state.images,
      results: task === 'getResults' ? this.state.taskResults : null
    });
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

    if (task.status === 'done' && task.id !== 'SETUP') {
      const taskResults = Object.assign({}, this.state.taskResults);
      const currentTask = this.props.tasks[this.state.taskIndex];
      const nextTask = this.props.tasks[this.state.taskIndex + 1];
      taskResults[currentTask] = task.result;
      this.setState({ taskResults, taskIndex: this.state.taskIndex + 1 });
      if (nextTask) {
        this.startTask(nextTask);
      }
    }
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
      <BenchmarkModal
        isOpen={this.props.isOpen}
        running={this.state.running}
        tasks={this.state.tasks}
        results={this.state.results}
        title={this.props.title}
        onStart={this.start}
        onRestart={this.restart}
        onClose={this.props.onClose}
      />
    )
  }
}

export default Benchmark;
