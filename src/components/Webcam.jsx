import React, { Component } from 'react';
import Header from './Header';
import Icon from './Icon';
import Label from './Label';
import WasmMode from './WasmMode';
import InfoLabel from './InfoLabel';
import glasses from '../assets/glasses.svg';
import ImageService from '../services/ImageService';
import { calcEyesPosition } from '../utils/image';

class Webcam extends Component {
  state = {
    fps: 0,
    fpsArr: [],
    blurMode: true,
    wasmMode: false,
    info: null,
    infoTimeout: null,
  }

  async componentDidMount() {
    ImageService.on('message', this.onMessage);
    if (!this.props.serviceLoaded) {
      return this.setState({ info: 'Loading OpenCv...' });
    }
    this.startCamera();
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.serviceLoaded && !prevProps.serviceLoaded) {
      const message = this.props.serviceError || 'Finished loading OpenCv';
      this.displayInfoLabel(message);
      this.startCamera();
    }
  }

  componentWillUnmount() {
    if (this.video.srcObject) {
      this.video.srcObject.getTracks()[0].stop();
    }
    ImageService.removeListener('message', this.onMessage);
    window.clearTimeout(this.state.infoTimeout);
    window.cancelAnimationFrame(this.animationFrame);
  }

  startCamera = async () => {
    try {
      if (this.props.serviceLoaded) {
        const constraints = { audio: false, video: true };
        this.video.srcObject = await window.navigator.mediaDevices.getUserMedia(constraints);
        this.ctx = this.canvas.getContext('2d');
        const frame = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        setTimeout(() => this.getNextFrame(frame), 1000);
      }
    } catch (err) {
      this.setState({ error: 'No Webcam access' });
    }
  }

  displayInfoLabel = info => {
    const infoTimeout = window.setTimeout(this.dismissInfoLabel, 5000);
    window.clearTimeout(this.state.infoTimeout);
    this.setState({ info, infoTimeout });
  }

  dismissInfoLabel = () => {
    this.setState({ info: null })
  }

  onMessage = ({ data }) => {
    console.log(data);
    this.ctx.clearRect(0, 0, 400, 400);
    this.ctx.filter = 'none';
    this.ctx.drawImage(this.video, 0, 0);
    const frame = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    if (this.state.lastTimeUpdated) {
      this.setState({ fps: Math.round(1000 / (data.time - this.state.lastTimeUpdated)) })
    }
    this.setState({ lastTimeUpdated: data.time })
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
    this.getNextFrame(frame);
  }

  getAction = action => {
    if (this.state.wasmMode) {
      return this.state.blurMode ? 'findFaceWasm' : 'findEyesWasm';
    }
    return this.state.blurMode ? 'findFaceJs' : 'findEyesJs';
  }

  getNextFrame = frame => {
    ImageService.postMessage({
      action: this.getAction(),
      frame,
    });
  }

  toggleWasmMode = () => {
    this.displayInfoLabel(`Now running ${!this.state.wasmMode ? 'WebAssembly' : 'JavaScript' }`)
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
        <Icon
          name="face-active"
          size="xxl"
          onClick={() => this.setState({ blurMode: true })}
          className={this.state.blurMode ? 'webcam-icon' : 'webcam-icon-inactive'}
        />
        <video ref={video => this.video = video } autoPlay={true} className="Webcam-video"/>
        <canvas ref={canvas => this.canvas = canvas} className="Webcam-canvas" width="600" height="400"/>
        <Icon
          name="glasses-active"
          size="xxl"
          onClick={() => this.setState({ blurMode: false })}
          className={this.state.blurMode ? 'webcam-icon-inactive' : 'webcam-icon'}
        />
        <InfoLabel text={this.state.info} onClick={this.dismissInfoLabel} />
      </div>      
    );

    return (
      <div className="component-wrapper">
        <Header title="Webcam">
          <Label text={`fps: ${this.state.fps}`} className="fps-label" />
          <WasmMode wasmMode={this.state.wasmMode} onClick={this.toggleWasmMode} />
        </Header>
        { this.state.error ? err : content }
      </div>
    );
  }
}

export default Webcam;
