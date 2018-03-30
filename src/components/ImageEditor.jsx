import React, { Component } from 'react';
import Header from './Header';
import Icon from './Icon';
import Label from './Label';
import WasmMode from './WasmMode';
import Spinner from './Spinner';
import InfoLabel from './InfoLabel';
import { resizeImage } from '../utils/image';
import Worker from '../services/imageEditor.worker';

const worker = new Worker();

class ImageEditor extends Component {
  state = {
    wasmMode: false,
    loading: false,
    dragging: false,
    draggingTimeout: null,
    info: null,
    infoTimeout: null,
    image: null
  }

  componentDidMount() {
    window.addEventListener('dragover', this.onDragOver);
    window.addEventListener('drop', this.onDrop);
    window.addEventListener('resize', this.onResize);
    this.ctx = this.canvas.getContext('2d');
    this.onResize();
  }

  componentWillUnmount() {
    window.clearTimeout(this.state.draggingTimeout);
    window.clearTimeout(this.state.infoTimeout);
    window.removeEventListener('dragover', this.onDragOver);
    window.removeEventListener('drop', this.onDrop);
    window.removeEventListener('resize', this.onResize);
  }

  onDragOver = ev => {
    ev.preventDefault();
    window.clearTimeout(this.state.draggingTimeout);
    const draggingTimeout = window.setTimeout(() => {
      this.setState({ dragging: false })
    }, 100)
    this.setState({ dragging: true, draggingTimeout });
  }

  onDrop = ev => {
    ev.preventDefault();
    const originalImage = ev.dataTransfer.files[0];
    this.setState({ originalImage, loading: true });
    this.drawImage(originalImage);
  }

  onResize = ev => {
    this.canvas.toBlob(blob => {
      this.canvas.height = this.contentWrapper.offsetHeight;
      this.canvas.width = this.contentWrapper.offsetWidth;
      if (this.state.originalImage) {
        this.drawImage(blob, true);
      }
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
    if (this.state.loading) {
      return;
    }
    this.displayInfoLabel(`Now running ${!this.state.wasmMode ? 'WebAssembly' : 'JavaScript' }`)
    this.setState({wasmMode: !this.state.wasmMode});
  }

  runReset = () => {
    if (this.state.originalImage) {
      this.displayInfoLabel('Image restored');
      this.drawImage(this.state.originalImage);
    }
  }

  runBenchmarks = () => {
    if (this.state.loading) {
      return;
    }
    // Run benchmarks here
    this.displayInfoLabel('Benchmarks not supported yet');
  }

  runBlur = () => {
    if (this.state.loading) {
      return;
    }
    // Blur image here
    worker.postMessage({
      action: this.state.wasmMode ? 'blurWasm' : 'blurJs'
    })
    this.displayInfoLabel('Image blur not implemented yet');
  }

  runBW = () => {
    if (this.state.loading) {
      return;
    }
    // Convert to BW here
    worker.postMessage({
      action: this.state.wasmMode ? 'bwWasm' : 'bwJs'
    })
    this.displayInfoLabel('Image to BW not implemented yet');
  }

  drawImage = (imgData, onResize = false) => {
    const reader = new FileReader();
    const img = new Image();
    reader.onload = () => img.src = reader.result;
    img.onload = () => {
      if (!onResize) {
        resizeImage(img, this.canvas.width, this.canvas.height);
      }
      const offsetWidth = (this.canvas.width / 2) - (img.width / 2);
      const offsetHeight = (this.canvas.height / 2) - (img.height / 2);
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.drawImage(img, offsetWidth, offsetHeight, img.width, img.height);
      this.setState({ loading: false })
    }
    reader.readAsDataURL(imgData);
  }

  render() {
    const dropInfoClassName = this.state.originalImage ? 'hidden' : 'drop-info';
    const dropIconClassName = this.state.dragging ? 'drop' : 'drag';
    const dropIconSize = this.state.dragging ? 'xl' : 'l';

    return (
      <div className="component-wrapper">
        <Header title="Image Editor">
          <Label
            text="Run benchmark"
            className="benchmark-label"
            icon={<Icon name="benchmark" size="xs"/>}
            onClick={this.runBenchmarks}
          />
          <WasmMode wasmMode={this.state.wasmMode} onClick={this.toggleWasmMode} />
          <div className="toolbar">
            <Spinner visible={this.state.loading} color="#A599FF" />
            <Label
              icon={<Icon name="restore" size="s"/>}
              size="square"
              className="toolbar-button"
              onClick={this.runReset}
            />
            <Label
              text="BW"
              size="square"
              className="toolbar-button"
              onClick={this.runBW}
            />
            <Label
              text="Blur"
              size="square"
              className="toolbar-button"
              onClick={this.runBlur}
            />
          </div>
        </Header>
        <div className="component-content" ref={contentWrapper => this.contentWrapper = contentWrapper}>
          <div className={dropInfoClassName}>
            <Icon name={dropIconClassName} size={dropIconSize} />
            <span>Drop image here</span>
          </div>
          <canvas ref={canvas => this.canvas = canvas} className="image-editor-canvas" />
          <InfoLabel text={this.state.info} onClick={this.dismissInfoLabel} />
        </div>
      </div>
    );
  }
}

export default ImageEditor;
