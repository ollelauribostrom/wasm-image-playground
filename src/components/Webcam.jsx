import React, { Component } from 'react';
import FpsCounter from 'fps';
import Header from './Header';
import Icon from './Icon';
import Label from './Label';
import WasmMode from './WasmMode';
import InfoLabel from './InfoLabel';
import glasses from '../assets/glasses.svg';
import shades from '../assets/shades.svg';
import WebcamService from '../services/WebcamService';
import { calcEyesPosition, calcFacePosition } from '../utils/image';

const shadesImg = new Image();
const glassesImg = new Image();
shadesImg.src = shades;
glassesImg.src = glasses;

class Webcam extends Component {
  state = {
    mode: 'blur',
    wasmMode: false,
    info: null,
    infoTimeout: null,
    wasmFps: 0,
    jsFps: 0
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
    return this.setState({ info: 'Loading OpenCv...' });
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
    const frame = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    this.wasmFps.tick();
    this.getNextFrame(frame, 'wasm');
    if (this.state.wasmMode) {
      this.drawFrame(data);
    }
  }

  onJsMessage = ({ data }) => {
    const frame = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    this.jsFps.tick();
    this.getNextFrame(frame, 'js');
    if (!this.state.wasmMode) {
      this.drawFrame(data);
    }
  }

  onLoad = () => {
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
      this.ctx = this.canvas.getContext('2d');
      const frame = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
      setTimeout(() => {
        this.getNextFrame(frame, 'wasm');
        this.getNextFrame(frame, 'js');
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

  drawFrame = (data) => {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.filter = 'none';
    this.ctx.drawImage(this.video, 0, 0);
    const mode = this.state.mode;
    if (mode === 'rectangle') {
      const { x, y, width, height } = calcFacePosition(data.face);
      this.ctx.beginPath();
      this.ctx.strokeStyle = this.state.wasmMode ? '#633df8' : '#fecb00';
      this.ctx.lineWidth = 2;
      this.ctx.rect(x, y, width, height);
      this.ctx.stroke();
      this.ctx.closePath();
    }
    if (mode === 'blur') {
      const { x, y, width, height } = calcFacePosition(data.face);
      this.ctx.filter = 'blur(10px)';
      return this.ctx.drawImage(this.video, x, y, width, height, x, y, width, height);
    } 
    if (mode === 'glasses') {
      const { x, y, width, height } = calcEyesPosition(data.eyes);
      return this.ctx.drawImage(glassesImg, x, y, width, height);
    }
    if (mode === 'shades') {
      const { x, y, width, height } = calcEyesPosition(data.eyes);
      return this.ctx.drawImage(shadesImg, x, y, width, height);
    }
  }

  getNextFrame = (frame, type) => {
    this.webcamService.postMessage({
      action: this.state.mode,
      type,
      frame,
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
    this.displayInfoLabel(`Now running ${!this.state.wasmMode ? 'WebAssembly' : 'JavaScript' }`);
    this.setState({wasmMode: !this.state.wasmMode});
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
        <canvas ref={canvas => this.canvas = canvas} className="Webcam-canvas" width="600" height="400"/>
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
          <WasmMode wasmMode={this.state.wasmMode} onClick={this.toggleWasmMode} />
          <div className="toolbar">
            <Label
              icon={<Icon name="faceRect" size="s"/>}
              size="square"
              className={`toolbar-button ${mode === 'rectangle' ? 'active' : ''}`}
              onClick={() => this.setState({ mode: 'rectangle' })}
              title="Face Detection"
            />
            <Label
              icon={<Icon name="faceBlur" size="s"/>}
              size="square"
              className={`toolbar-button ${mode === 'blur' ? 'active' : ''}`}
              onClick={() => this.setState({ mode: 'blur' })}
              title="Face Blur"
            />
            <Label
              icon={<Icon name="glassesWhite" size="xs"/>}
              size="square"
              className={`toolbar-button ${mode === 'glasses' ? 'active' : ''}`}
              onClick={() => this.setState({ mode: 'glasses' })}
              title="Glasses"
            />
            <Label
              icon={<Icon name="shadesWhite" size="xs"/>}
              size="square"
              className={`toolbar-button ${mode === 'shades' ? 'active' : ''}`}
              onClick={() => this.setState({ mode: 'shades' })}
              title="Shades"
            />
          </div>
        </Header>
        { this.state.error ? err : content }
      </div>
    );
  }
}

export default Webcam;
