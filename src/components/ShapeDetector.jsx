import React, { Component } from 'react';
import Header from './Header';
import Icon from './Icon';
import Label from './Label';
import WasmMode from './WasmMode';
import Spinner from './Spinner';
import InfoLabel from './InfoLabel';
import { isImage, asyncImageListLoader } from '../utils/image';

class ShapeDetector extends Component {
  state = {
    wasmMode: false,
    loading: false,
    dragging: false,
    draggingTimeout: null,
    info: null,
    infoTimeout: null,
    images: []
  }

  componentDidMount() {
    window.addEventListener('dragover', this.onDragOver);
    window.addEventListener('drop', this.onDrop);
  }

  componentWillUnmount() {
    window.clearTimeout(this.state.draggingTimeout);
    window.clearTimeout(this.state.infoTimeout);
    window.removeEventListener('dragover', this.onDragOver);
    window.removeEventListener('drop', this.onDrop);
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
    this.setState({ loading: true });
    this.loadImages(ev.dataTransfer.files);
  }

  loadImages = async fileList => {
    const newImages = await asyncImageListLoader(fileList, () => {
      this.displayInfoLabel('File is not an image, skipping')
    })
    const images = [...this.state.images, ...newImages];
    this.setState({ images, loading: false })
  }

  toggleWasmMode = () => {
    if (this.state.loading) {
      return;
    }
    this.displayInfoLabel(`Now running ${!this.state.wasmMode ? 'WebAssembly' : 'JavaScript' }`)
    this.setState({wasmMode: !this.state.wasmMode});
  }

  displayInfoLabel = info => {
    const infoTimeout = window.setTimeout(this.dismissInfoLabel, 5000);
    window.clearTimeout(this.state.infoTimeout);
    this.setState({ info, infoTimeout });
  }

  dismissInfoLabel = () => {
    this.setState({ info: null })
  }

  runBenchmarks = () => {
    if (this.state.loading) {
      return;
    }
    // Run benchmarks here
    this.displayInfoLabel('Benchmarks not supported yet');
  }

  runSquareDetection = () => {
    if (this.state.loading) {
      return;
    }
    if (this.state.images.length) {
      // Run square detection here
      this.displayInfoLabel('Square detection not implemented yet (running fake)');
      this.fakeSquareDetection();
    } else {
      this.displayInfoLabel('Upload some images first');
    }
  }

  fakeSquareDetection = () => {
    this.setState({ loading: true })
    window.setTimeout(() => {
      const images = [...this.state.images];
      let squareCount = 0;
      images.map((image, i) => {
        if (i % 2 === 0) {
          image.hasSquare = true;
          squareCount++;
        }
      });
      this.setState({ images, loading: false })
      this.displayInfoLabel(`Detected ${squareCount} images containing squares in 1365ms`);
    }, 2000)
  }

  render() {
    const images = this.state.images.map((image) => {
      return (
        <img 
          src={image.data}
          alt="uploaded"
          className={`uploaded-image ${image.hasSquare ? 'has-square' : ''}`}
          key={image.id}
        />
      )
    })

    return (
      <div className="component-wrapper">
        <Header title="Shape detector">
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
              text="Detect Squares"
              size="large"
              className="toolbar-button"
              onClick={this.runSquareDetection}
            />
          </div>
        </Header>
        <div className="component-content image-container">
          { images }
          <div className={`drop-info ${this.state.images.length ? 'drop-info-hidden' : ''}`}>
            <Icon name={this.state.dragging ? 'drop' : 'drag'} size={this.state.dragging ? 'xl' : 'l'} />
            <span>Drop images here</span>
          </div>
          <InfoLabel text={this.state.info} onClick={this.dismissInfoLabel} />
        </div>
      </div>
    );
  }
}

export default ShapeDetector;
