import React, { Component } from 'react';
import { connect } from '../stores/AppStore';

class ImageView extends Component {
  canvas: any;
  ctx: any;
  wrapper: any;

  componentDidMount() {
    window.addEventListener('resize', this.onResize);
    this.ctx = this.canvas.getContext('2d');
    this.onResize();
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.image !== prevProps.image) {
      this.drawImage(this.props.image);
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onResize);
  }

  onResize = () => {
    this.canvas.toBlob(blob => {
      this.canvas.height = this.wrapper.offsetHeight;
      this.canvas.width = this.wrapper.offsetWidth;
      if (this.props.image) {
        this.drawImage(blob);
      }
    });
  };

  drawImage = image => {
    const offsetWidth = this.canvas.width / 2 - image.width / 2;
    const offsetHeight = this.canvas.height / 2 - image.height / 2;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.drawImage(image, offsetWidth, offsetHeight, image.width, image.height);
  };

  render() {
    return (
      <div
        ref={ref => {
          this.wrapper = ref;
        }}
      >
        <canvas
          ref={ref => {
            this.canvas = ref;
          }}
          className="imageview"
        />
      </div>
    );
  }
}

export default connect(state => state)(ImageView);
