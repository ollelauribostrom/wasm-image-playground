import React, { Component } from 'react';
import Header from './Header';
import Icon from './Icon';
import Label from './Label';
import WasmMode from './WasmMode';
import InfoLabel from './InfoLabel';
import glasses from '../assets/glasses.svg';
import Worker from '../services/webcam.worker';

const worker = new Worker();

class Webcam extends Component {
  state = {
    fps: 0,
    blurMode: true,
    wasmMode: false,
    info: null,
    infoTimeout: null,
  }

  async componentDidMount() {
    try {
      const constraints = { audio: false, video: true };
      this.video.srcObject = await window.navigator.mediaDevices.getUserMedia(constraints);
      this.ctx = this.canvas.getContext('2d');
      window.requestAnimationFrame(this.updateCanvas)
    } catch (err) {
      this.setState({ error: 'No Webcam access' })
    }
  }

  componentWillUnmount() {
    if (this.video.srcObject) {
      this.video.srcObject.getTracks()[0].stop();
    }
    window.clearTimeout(this.state.infoTimeout);
    window.cancelAnimationFrame(this.updateCanvas);
  }

  displayInfoLabel = info => {
    const infoTimeout = window.setTimeout(this.dismissInfoLabel, 5000);
    window.clearTimeout(this.state.infoTimeout);
    this.setState({ info, infoTimeout });
  }

  dismissInfoLabel = () => {
    this.setState({ info: null })
  }

  updateFps = (now) => {
    // Pretty much fake
    let fps = 0;
    const { lastTimeCalled } = this.state;
    if (lastTimeCalled) {
      fps = Math.ceil(1 / ((now - lastTimeCalled) / 1000));
    }
    this.setState({ fps, lastTimeCalled: now });
  }

  updateCanvas = async (timeStamp) => {
    if (!this.canvas) {
      return;
    }
    
    this.ctx.clearRect(0, 0, 400, 400);
    this.ctx.filter = 'none';
    this.ctx.drawImage(this.video, 0, 0);

    if (this.state.blurMode) {
      this.runBlur();
    } else {
      this.runGlasses();
    }

    this.updateFps(timeStamp);
    window.requestAnimationFrame(this.updateCanvas);
  }

  activateBlurMode = () => {
    this.setState({ blurMode: true });
  }

  activateGlassesMode = () => {
    this.setState({ blurMode: false });
  }

  runBlur = (area) => {
    this.ctx.filter = 'blur(10px)';
    // Perform face detection here to know where to place blur
    worker.postMessage({
      action: this.state.wasmMode ? 'faceDetectionWasm' : 'faceDetectionJs'
    })
    this.ctx.drawImage(this.video, 100, 100, 100, 100, 100, 100, 100, 100);
  }

  runGlasses = () => {
    const img = new Image();
    img.src = glasses
    // Perform eye tracking here to know where to place glasses
    worker.postMessage({
      action: this.state.wasmMode ? 'eyeDetectionWasm' : 'eyeDetectionJs'
    })
    this.ctx.drawImage(img, 100, 100)
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
          onClick={this.activateBlurMode}
          className={this.state.blurMode ? 'webcam-icon' : 'webcam-icon-inactive'}
        />
        <video ref={video => this.video = video } autoPlay={true} className="Webcam-video"/>
        <canvas ref={canvas => this.canvas = canvas} className="Webcam-canvas" width="600" height="400"/>
        <Icon
          name="glasses-active"
          size="xxl"
          onClick={this.activateGlassesMode}
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
