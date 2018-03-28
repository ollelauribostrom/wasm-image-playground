import React, { Component } from 'react';
import { BrowserRouter as Router, Route } from  'react-router-dom';
import Home from './Home';
import ImageEditor from './ImageEditor';
import ShapeDetector from './ShapeDetector';
import Webcam from './Webcam';
import GithubLink from './GithubLink';
import '../styles/styles.css';

class App extends Component {
  render() {
    return (
      <Router>
        <div className="App">
          <Route exact path="/" component={Home} />
          <Route path="/image-editor" component={ImageEditor} />
          <Route path="/shape-detector" component={ShapeDetector} />
          <Route path="/webcam" component={Webcam} />
          <GithubLink />
        </div>
      </Router>
    );
  }
}

export default App;
