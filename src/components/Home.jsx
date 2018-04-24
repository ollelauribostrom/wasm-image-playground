import React from 'react';
import { Link } from 'react-router-dom';
import Header from './Header';
import Icon from './Icon';
import Label from './Label';

function Home() {
  return (
    <div className="Home">
      <div className="Home-wrapper">
        <Header
          title="WebAssembly"
          subtitle="Image Playground"
          icon={
            <Icon
              name="wasm"
              size="m"
              style={{ marginRight: '10px' }}
            />
          }
        />
        <p className="Home-description">
          Play around with Image Processing and Object Detection using WebAssembly. Toggle between 
          JavaScript and WebAssembly mode to reveal the differences in performance.
        </p>
        <p className="Home-description">
          The application contains a number of easy-to-run benchmarks, comparing JavaScript vs. WebAssembly
          performance for some Image Processing and Object Detection related use cases. Click the green
          benchmark button to get started.
        </p>
        <Link to="/image-editor">
          <Label
            text="Image Editor"
            color="#654FF0"
            size="large"
            className="Home-link"
          />
        </Link>
        <Link to="/face-detector">
          <Label
            text="Face Detector"
            color="#654FF0"
            size="large"
            className="Home-link"
          />
        </Link>
        <Link to="/webcam">
          <Label text="Webcam"
            color="#654FF0"
            size="large"
            className="Home-link"
          />
        </Link>
      </div>
    </div>
  );
}

export default Home;