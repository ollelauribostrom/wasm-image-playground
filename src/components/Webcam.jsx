import React, { Component } from 'react';
import Header from './Header';
import Icon from './Icon';
import Label from './Label';
import WasmMode from './WasmMode';
import InfoLabel from './InfoLabel';
import glasses from '../assets/glasses.svg';
import WebcamService from '../services/WebcamService';
import { calcEyesPosition } from '../utils/image';

class Webcam extends Component {
  state = {
    mode: 'blur',
    wasmMode: false,
    info: null,
    infoTimeout: null,
  }

  componentDidMount() {
    this.webcamService = new WebcamService();
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
    if (this.state.wasmMode) {
      this.drawFrame(data);
    }
    this.getNextFrame(frame, 'wasm');
  }

  onJsMessage = ({ data }) => {
    const frame = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    if (!this.state.wasmMode) {
      this.drawFrame(data);
    }
    this.getNextFrame(frame, 'js');
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
    this.ctx.clearRect(0, 0, 400, 400);
    this.ctx.filter = 'none';
    this.ctx.drawImage(this.video, 0, 0);
    if (data.type === 'face') {
      this.ctx.filter = 'blur(10px)';
      for (let i = 0; i < data.face.length; i += 1) {
        const { x, y, height, width } = data.face[i];
        this.ctx.drawImage(this.video, x, y, width, height, x, y, width, height);
      }
    } else if (data.type === 'eyes' && data.eyes.length) {
      const { x, y, height, width } = calcEyesPosition(data.eyes);
      const img = new Image();
      img.src = glasses;
      this.ctx.drawImage(img, x, y, width, height);
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
      </div>      
    );

    const mode = this.state.mode;

    return (
      <div className="component-wrapper">
        <Header title="Webcam">
          <WasmMode wasmMode={this.state.wasmMode} onClick={this.toggleWasmMode} />
          <div className="toolbar">
            <Label
              icon={<Icon name="face-rect" size="s"/>}
              size="square"
              className={`toolbar-button ${mode === 'rectangle' ? 'active' : ''}`}
              onClick={() => this.setState({ mode: 'rectangle' })}
              title="Face Detection"
            />
            <Label
              icon={<Icon name="face-blur" size="s"/>}
              size="square"
              className={`toolbar-button ${mode === 'blur' ? 'active' : ''}`}
              onClick={() => this.setState({ mode: 'blur' })}
              title="Face Blur"
            />
            <Label
              icon={<Icon name="banana" size="s"/>}
              size="square"
              className={`toolbar-button ${mode === 'banana' ? 'active' : ''}`}
              onClick={() => this.setState({ mode: 'banana' })}
              title="Track bananas"
            />
            <Label
              icon={<Icon name="smile" size="s"/>}
              size="square"
              className={`toolbar-button ${mode === 'smile' ? 'active' : ''}`}
              onClick={() => this.setState({ mode: 'smile' })}
              title="Smile for the camera"
            />
            <Label
              icon={<Icon name="glasses-white" size="s"/>}
              size="square"
              className={`toolbar-button ${mode === 'glasses' ? 'active' : ''}`}
              onClick={() => this.setState({ mode: 'glasses' })}
              title="Glasses"
            />
          </div>
        </Header>
        { this.state.error ? err : content }
      </div>
    );
  }
}

export default Webcam;
