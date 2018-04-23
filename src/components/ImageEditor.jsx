import React, { Component } from 'react';
import { isImage, scaleToFit } from 'imutils';
import Header from './Header';
import Icon from './Icon';
import Label from './Label';
import WasmMode from './WasmMode';
import Spinner from './Spinner';
import InfoLabel from './InfoLabel';
import Benchmark from './Benchmark';
import ImageService from '../services/ImageService';

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
    ImageService.on('message', this.onMessage);
    window.addEventListener('dragover', this.onDragOver);
    window.addEventListener('drop', this.onDrop);
    window.addEventListener('resize', this.onResize);
    this.ctx = this.canvas.getContext('2d');
    this.onResize();

    if (!this.props.serviceLoaded) {
      this.setState({ info: 'Loading OpenCv...' });
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.serviceLoaded && !prevProps.serviceLoaded) {
      const message = this.props.serviceError || 'Finished loading OpenCv';
      this.displayInfoLabel(message);
    }
  }

  componentWillUnmount() {
    window.clearTimeout(this.state.draggingTimeout);
    window.clearTimeout(this.state.infoTimeout);
    ImageService.removeListener('message', this.onMessage);
    window.removeEventListener('dragover', this.onDragOver);
    window.removeEventListener('drop', this.onDrop);
    window.removeEventListener('resize', this.onResize);
  }

  onMessage = ({ data }) => {
    if (data.result) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.putImageData(data.result, 0, 0);
    }
    this.displayInfoLabel(data.info);
    this.setState({ loading: false });
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
    let file;
    if (ev.target.files) {
      file = ev.target.files[0];
    } else {
      file = ev.dataTransfer.files[0];
    }
    if (isImage(file)) {
      this.setState({ originalImage: file, loading: true });
      this.drawImage(file);
    } else {
      this.displayInfoLabel('The uploaded file is not an image');
    }
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

  displayInfoLabel = (info, duration = 5000) => {
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
    this.setState({ wasmMode: !this.state.wasmMode });
  }

  runRestore = () => {
    if (this.state.originalImage) {
      this.setState({ loading: true });
      this.displayInfoLabel('Image restored');
      this.drawImage(this.state.originalImage);
    }
  }

  onBenchmarkOpen = () => {
    if (!this.props.serviceLoaded) {
      return;
    }
    this.setState({ showBenchmark: true });
  }

  onBenchmarkStart = () => {
    this.setState({ info: 'Running benchmarks..', loading: true  });
  }

  onBenchmarkStop = () => {
    this.dismissInfoLabel();
    this.setState({ showBenchmark: true, loading: false });
  }

  onBenchmarkClose = () => {
    this.setState({ showBenchmark: false });
  };

  getAction = action => {
    return this.state.wasmMode ? `${action}Wasm` : `${action}Js`;
  }

  runAction = action => {
    if (this.state.loading || !this.props.serviceLoaded) {
      return;
    }
    if (!this.state.originalImage) {
      this.displayInfoLabel('Upload an image first');
      return;
    }
    this.setState({ loading: true });
    ImageService.postMessage({
      action: this.getAction(action),
      img: this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height)
    });
  };

  drawImage = (imgData, onResize = false) => {
    const reader = new FileReader();
    const img = new Image();
    reader.onload = () => img.src = reader.result;
    img.onload = () => {
      if (!onResize) {
        scaleToFit(img, this.canvas.width, this.canvas.height);
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
    return (
      <div className="component-wrapper">
        <Header title="Image Editor">
          <Label
            text="Benchmark"
            className="benchmark-label"
            icon={<Icon name="benchmark" size="xs"/>}
            onClick={this.onBenchmarkOpen}
            title="Run benchmark"
          />
          <WasmMode wasmMode={this.state.wasmMode} onClick={this.toggleWasmMode} />
          <div className="toolbar image-editor-toolbar">
            <Spinner visible={this.state.loading || this.props.serviceLoaded === false } color="#A599FF" />
            <Label
              icon={<Icon name="restore" size="s"/>}
              size="square"
              className="toolbar-button"
              onClick={this.runRestore}
              title="Restore image"
            />
            <Label
              text="Gray"
              size="square"
              className="toolbar-button"
              onClick={() => this.runAction('grayscale')}
              title="Convert image to grayscale"
            />
            <Label
              text="B.Blur"
              size="square"
              className="toolbar-button"
              onClick={() => this.runAction('boxBlur')}
              title="Apply Box Blur"
            />
            <Label
              text="G.Blur"
              size="square"
              className="toolbar-button"
              onClick={() => this.runAction('gaussianBlur')}
              title="Apply Gaussian Blur"
            />
          </div>
        </Header>
        <div className="component-content" ref={contentWrapper => this.contentWrapper = contentWrapper}>
          <Benchmark
            title="Image Editor"
            benchmarkType="imageEditorBenchmark"
            isOpen={this.state.showBenchmark}
            onClose={this.onBenchmarkClose}
            onStart={this.onBenchmarkStart}
            onStop={this.onBenchmarkStop}
          />
          <div className={`drop-info ${this.state.originalImage ? 'drop-info-hidden' : ''}`} onClick={() => this.input.click()}>
            <Icon name={this.state.dragging ? 'drop' : 'drag'} size={this.state.dragging ? 'xl' : 'l'} />
            <span>Drop images here (or click to choose a file)</span>
            <input type="file" className="hidden" ref={(input) => this.input = input} onChange={this.onDrop} />
          </div>
          <canvas ref={canvas => this.canvas = canvas} className="image-editor-canvas" />
          <InfoLabel text={this.state.info} onClick={this.dismissInfoLabel} />
        </div>
      </div>
    );
  }
}

export default ImageEditor;
