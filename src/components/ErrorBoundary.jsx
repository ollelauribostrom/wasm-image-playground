import React, { Component } from 'react';

type ErrorBoundaryState = {
  error?: Error
};

class ErrorBoundary extends Component<{}, ErrorBoundaryState> {
  state = {
    error: null
  };

  componentDidCatch(error: any) {
    this.setState({ error });
  }

  render() {
    if (this.state.error) {
      return <span>{`Error Boundary Caught: ${this.state.error.message}`}</span>;
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
