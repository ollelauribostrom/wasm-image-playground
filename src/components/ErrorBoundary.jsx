import React, { Component } from 'react';

type ErrorBoundaryProps = {
  children: any
};

type ErrorBoundaryState = {
  error: ?Error
};

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state = {
    error: null
  };

  componentDidCatch(error: any) {
    this.setState({ error });
  }

  render() {
    const { error } = this.state;
    const { children } = this.props;
    if (error) {
      return <span>{`Error Boundary Caught: ${error.message}`}</span>;
    }
    return children;
  }
}

export default ErrorBoundary;
