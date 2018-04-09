import React, { Component } from 'react';
import { BrowserRouter as Router, Route } from  'react-router-dom';
import Home from './Home';
import ImageEditor from './ImageEditor';
import ShapeDetector from './ShapeDetector';
import Webcam from './Webcam';
import GithubLink from './GithubLink';
import ImageService from '../services/ImageService';
import '../styles/styles.css';

class App extends Component {
  state = {
    serviceLoaded: false,
    serviceError: null,
  }

  async componentWillMount() {
    ImageService.on('loaded', () => this.setState({ serviceLoaded: true }));
    ImageService.on('error', () => this.setState({
      serviceLoaded: true,
      serviceError: 'Error loading OpenCv',
    }))
    ImageService.init();
  }

  render() {
    return (
      <Router>
        <div className="App">
          <Route exact path="/" component={Home} />
          <Route path="/image-editor" render={() => <ImageEditor {...this.state} />} />
          <Route path="/shape-detector" render={() => <ShapeDetector {...this.state} />} />
          <Route path="/webcam" render={() => <Webcam {...this.state} />} />
          <GithubLink />
        </div>
      </Router>
    );
  }
}

export default App;
