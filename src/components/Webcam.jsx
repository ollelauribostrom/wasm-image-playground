import React, { Component } from 'react';
import FpsCounter from 'fps';
import Header from './Header';
import Icon from './Icon';
import Label from './Label';
import WasmMode from './WasmMode';
import InfoLabel from './InfoLabel';
import BenchmarkModal from './BenchmarkModal';
import glasses from '../assets/glasses.svg';
import shades from '../assets/shades.svg';
import WebcamService from '../services/WebcamService';
import BenchmarkTracker from '../utils/BenchmarkTracker';
import { calcEyesPosition } from '../utils/eyes';
import { calcFacePosition } from '../utils/face';

const wasmBenchmark = new BenchmarkTracker();
const jsBenchmark = new BenchmarkTracker();
const glassesImg = new Image();
const shadesImg = new Image();
glassesImg.src = glasses;
shadesImg.src = shades;

class Webcam extends Component {
  state = {
    mode: 'rectangle',
    wasmMode: false,
    info: null,
    infoTimeout: null,
    wasmFps: 0,
    jsFps: 0,
    benchmarkRunning: false,
    benchmarkOpen: false,
    benchmarkTasks: [],
    benchmarkResults: []
  }

  componentDidMount() {
    this.webcamService = new WebcamService();
    this.wasmFps = new FpsCounter({ every: 10 });
    this.jsFps = new FpsCounter({ every: 10 });
    this.wasmFps.on('data', wasmFps => this.setState({ wasmFps }));
    this.jsFps.on('data', jsFps => this.setState({ jsFps }));
    this.webcamService.on('wasm:message', this.onWasmMessage);
    this.webcamService.on('js:message', this.onJsMessage);
    this.webcamService.on('wasm:error', this.onError);
    this.webcamService.on('js:error', this.onError);
    this.webcamService.on('wasm:loaded', this.onLoad);
    this.setState({ info: 'Loading OpenCv...' });
  }

  componentWillUnmount() {
    this.stopCamera();
    this.webcamService.removeListener('wasm:message', this.onWasmMessage);
    this.webcamService.removeListener('js:message', this.onJsMessage);
    this.webcamService.removeListener('wasm:error', this.onError);
    this.webcamService.removeListener('js:error', this.onError);
    this.webcamService.removeListener('wasm:loaded', this.onLoad);
    window.clearTimeout(this.state.infoTimeout);
    window.cancelAnimationFrame(this.animationFrame);
  }

  onWasmMessage = ({ data }) => {
    this.wasmFps.tick();
    if (this.state.benchmarkRunning) {
      const detection = data.eyes || data.face;
      wasmBenchmark.tick(detection.length);
    }
    this.getNextFrame('wasm');
    this.drawFrame(data, 'wasm');

  }

  onJsMessage = ({ data }) => {
    this.jsFps.tick();
    if (this.state.benchmarkRunning) {
      const detection = data.eyes || data.face;
      jsBenchmark.tick(detection.length);
    }
    this.getNextFrame('js');
    this.drawFrame(data, 'js');
  }

  onLoad = () => {
    this.setState({ openCvLoaded: true });
    this.displayInfoLabel('Finished loading OpenCv');
    this.startCamera();
  }

  onError = ({ data }) => {
    this.displayInfoLabel(data.error);
    this.setState({ error: data.error});
    this.stopCamera();
  }

  startCamera = async () => {
    try {
      const constraints = { audio: false, video: true };
      this.video.srcObject = await window.navigator.mediaDevices.getUserMedia(constraints);
      this.wasmCtx = this.wasmcanvas.getContext('2d');
      this.jsCtx = this.jscanvas.getContext('2d');
      this.bufferCtx = this.buffer.getContext('2d');
      setTimeout(() => {
        this.getNextFrame('wasm');
        this.getNextFrame('js');
      }, 1000);
    } catch (err) {
      this.setState({ error: 'No Webcam access' });
    }
  }

  stopCamera = () => {
    if (this.video.srcObject) {
      this.video.srcObject.getTracks()[0].stop();
    }
  }

  openBenchmark = () => {
    if (!this.state.openCvLoaded) {
      return;
    }
    this.setState({ benchmarkOpen: true });
  }

  runBenchmark = () => {
    if (this.state.benchmarkRunning) {
      return;
    }
    window.setTimeout(() => {
      window.clearTimeout(this.state.infoTimeout);
      wasmBenchmark.reset();
      jsBenchmark.reset();
      this.benchmarkTask({ id: 'rect', status: 'running', info: 'Detecting face', type: 'faceRect' });
      this.setState({
        benchmarkRunning: true,
        benchmarkResults: [],
        mode: 'rectangle',
        info: 'Running benchmark'
      })
    }, 0);
    window.setTimeout(() => {
      this.benchmarkTask({ id: 'rect', status: 'done' });
      this.benchmarkTask({ id: 'blur', status: 'running', info: 'Blurring face', type: 'faceBlur' });
      this.setState({ mode: 'blur' });
    }, 15000);
    window.setTimeout(() => {
      this.benchmarkTask({ id: 'blur', status: 'done' });
      this.benchmarkTask({ id: 'glasses', status: 'running', info: 'Drawing glasses', type: 'glassesWhite', iconSize: 'xs' });
      this.setState({ mode: 'glasses' });
    }, 30000);
    window.setTimeout(() => {
      this.benchmarkTask({ id: 'glasses', status: 'done' });
      this.benchmarkTask({ id: 'shades', status: 'running', info: 'Drawing shades', type: 'shadesWhite', iconSize: 'xs' });
      this.setState({ mode: 'shades' });
    }, 45000);
    window.setTimeout(() => {
      this.benchmarkTask({ id: 'shades', status: 'done' });
      this.stopBenchmark();
    }, 60000);
  }

  benchmarkTask = task => {
    const benchmarkTasks = [...this.state.benchmarkTasks];
    const taskIndex = benchmarkTasks.findIndex(t => t.id === task.id);
    if (taskIndex > -1) {
      benchmarkTasks[taskIndex] = Object.assign(benchmarkTasks[taskIndex], task);
    } else {
      benchmarkTasks.push(task)
    }
    this.setState({ benchmarkTasks });
  }

  stopBenchmark = () => {
    const wasmResult = wasmBenchmark.getResult(60);
    const jsResult = jsBenchmark.getResult(60);
    this.setState({
      benchmarkOpen: true,
      benchmarkRunning: false,
      benchmarkResults: [
        { task: 'wasm', taskInfo: `WebAssembly: ${wasmResult.info}` },
        { task: 'js', taskInfo: `JavaScript: ${jsResult.info}` }
      ],
      info: null,
    });
  }

  drawFrame = (data, type) => {
    const canvas = type === 'wasm' ? this.wasmcanvas : this.jscanvas;
    const ctx = type === 'wasm' ? this.wasmCtx : this.jsCtx;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.filter = 'none';
    ctx.drawImage(this.video, 0, 0);
    const mode = this.state.mode;
    if (mode === 'rectangle') {
      const { x, y, width, height } = calcFacePosition(data.face);
      ctx.beginPath();
      ctx.strokeStyle = type === 'wasm' ? '#633df8' : '#fecb00';
      ctx.lineWidth = 2;
      ctx.rect(x, y, width, height);
      ctx.stroke();
      return ctx.closePath();
    }
    if (mode === 'blur') {
      const { x, y, width, height } = calcFacePosition(data.face);
      ctx.filter = 'blur(10px)';
      return ctx.drawImage(this.video, x, y, width, height, x, y, width, height);
    }
    if (mode === 'glasses') {
      const { x, y, width, height } = calcEyesPosition(data.eyes);
      return ctx.drawImage(glassesImg, x, y, width, height);
    }
    if (mode === 'shades') {
      const { x, y, width, height } = calcEyesPosition(data.eyes);
      return ctx.drawImage(shadesImg, x, y, width, height);
    }
  }

  getNextFrame = type => {
    this.bufferCtx.clearRect(0, 0, this.buffer.width, this.buffer.height);
    this.bufferCtx.drawImage(this.video, 0, 0);
    this.webcamService.postMessage({
      action: this.state.mode,
      type,
      frame: this.bufferCtx.getImageData(0, 0, this.buffer.width, this.buffer.height)
    });
  }

  displayInfoLabel = info => {
    const infoTimeout = window.setTimeout(this.dismissInfoLabel, 5000);
    window.clearTimeout(this.state.infoTimeout);
    this.setState({ info, infoTimeout });
  }

  dismissInfoLabel = () => {
    this.setState({ info: null })
  }

  toggleWasmMode = () => {
    this.displayInfoLabel(`Now displaying ${!this.state.wasmMode ? 'WebAssembly' : 'JavaScript' } canvas`);
    this.setState({wasmMode: !this.state.wasmMode});
  }

  setMode = mode => {
    if (this.state.benchmarkRunning) {
      return;
    }
    this.setState({ mode });
  }

  render() {
    const err = (
      <div className="component-content">
        <div className="webcam-error">
          <Icon name="sad" size="xl" />
          <span>{this.state.error}</span>
        </div>
      </div>
    );

    const content = (
      <div className="component-content">
        <video ref={video => this.video = video } autoPlay={true} className="Webcam-video"/>
        <canvas 
          ref={wasmcanvas => this.wasmcanvas = wasmcanvas} 
          className="Webcam-canvas wasm-canvas"
          style={{
            display: this.state.wasmMode ? 'flex' : 'none'
          }}
          width="600" 
          height="400"
        />
        <canvas 
          ref={jscanvas => this.jscanvas = jscanvas} 
          className="Webcam-canvas js-canvas"
          style={{
            display: !this.state.wasmMode ? 'flex' : 'none'
          }}
          width="600" 
          height="400"
        />
        <canvas ref={buffer => this.buffer = buffer} className="hidden" width="600" height="400"/>
        <InfoLabel text={this.state.info} onClick={this.dismissInfoLabel} />
        <Label
          icon={<Icon name="wasm" size="s"/>}
          text={`fps: ${Math.round(this.state.wasmFps)}`}
          size="medium"
          className="fps wasm-fps"
          title="WebAssembly FPS"
        />
        <Label
          icon={<Icon name="js" size="s"/>}
          text={`fps: ${Math.round(this.state.jsFps)}`}
          size="medium"
          className="fps js-fps"
          title="JavaScript FPS"
        />
      </div>      
    );

    const mode = this.state.mode;

    return (
      <div className="component-wrapper webcam">
        <Header title="Webcam">
          <Label
            text="Benchmark"
            className="benchmark-label"
            icon={<Icon name="benchmark" size="xs"/>}
            onClick={this.openBenchmark}
            title="Run benchmark"
          />
          <WasmMode wasmMode={this.state.wasmMode} onClick={this.toggleWasmMode} />
          <div className="toolbar">
            <Label
              icon={<Icon name="faceRect" size="s"/>}
              size="square"
              className={`toolbar-button ${mode === 'rectangle' ? 'active' : ''}`}
              onClick={() => this.setMode('rectangle')}
              title="Face Detection"
            />
            <Label
              icon={<Icon name="faceBlur" size="s"/>}
              size="square"
              className={`toolbar-button ${mode === 'blur' ? 'active' : ''}`}
              onClick={() => this.setMode('blur')}
              title="Face Blur"
            />
            <Label
              icon={<Icon name="glassesWhite" size="xs"/>}
              size="square"
              className={`toolbar-button ${mode === 'glasses' ? 'active' : ''}`}
              onClick={() => this.setMode('glasses')}
              title="Glasses"
            />
            <Label
              icon={<Icon name="shadesWhite" size="xs"/>}
              size="square"
              className={`toolbar-button ${mode === 'shades' ? 'active' : ''}`}
              onClick={() => this.setMode('shades')}
              title="Shades"
            />
          </div>
        </Header>
        { this.state.error ? err : content }
        <BenchmarkModal
          isOpen={this.state.benchmarkOpen}
          running={this.state.benchmarkRunning}
          tasks={this.state.benchmarkTasks}
          results={this.state.benchmarkResults}
          title="Webcam"
          onStart={this.runBenchmark}
          onRestart={this.runBenchmark}
          onClose={() => this.setState({ benchmarkOpen: false })}
        />
      </div>
    );
  }
}

export default Webcam;
