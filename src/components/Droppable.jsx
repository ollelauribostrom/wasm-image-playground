import React, { Component } from 'react';

type DroppableProps = {
  onDrop: () => void,
  onDragStart?: () => void,
  onDragEnd?: () => void
};

type DroppableState = {
  dragging: boolean,
  draggingTimeout: number
};

class Droppable extends Component<DroppableProps, DroppableState> {
  droppableContainer: any;
  state = {
    dragging: false,
    draggingTimeout: null
  };
  static defaultProps = {
    onDragStart: () => {},
    onDragEnd: () => {}
  };
  componentDidMount() {
    this.droppableContainer.addEventListener('dragover', this.onDragOver);
    this.droppableContainer.addEventListener('drop', this.props.onDrop);
  }
  componentWillUnmount() {
    window.clearTimeout(this.state.draggingTimeout);
    this.droppableContainer.removeEventListener('dragover', this.onDragOver);
    this.droppableContainer.removeEventListener('drop', this.props.onDrop);
  }
  onDragOver = ev => {
    ev.preventDefault();
    window.clearTimeout(this.state.draggingTimeout);
    this.props.onDragStart();
    const draggingTimeout = window.setTimeout(() => {
      this.setState({ dragging: false });
      this.props.onDragEnd();
    }, 100);
    this.setState({ dragging: true, draggingTimeout });
  };
  render() {
    return (
      <div
        ref={ref => {
          this.droppableContainer = ref;
        }}
      >
        {this.props.children}
      </div>
    );
  }
}

export default Droppable;
