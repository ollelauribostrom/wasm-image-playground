# WebAssembly Image Playground
Play around with Image Processing and Object Detection using WebAssembly. 

> https://wasm-image-playground.now.sh/

Benchmarks
----------
The application contains a number of easy-to-run benchmarks, comparing JavaScript vs. WebAssembly
performance for some Image Processing / Object Detection related [use cases](http://webassembly.org/docs/use-cases/)
identified by the WebAssembly Community Group. Currently, benchmarks are available for the use cases
Image editing, Image recognition and Live video augmentation.  

- WebAssembly implementations are using [OpenCv]() compiled to WebAssembly.
- JavaScript implementations are using an ES6 rewrite of [HAAR.js](https://github.com/foo123/HAAR.js/) (which is a JavaScript port of OpenCV C++ Haar Detection) and some parts of [Tracking.js](https://github.com/eduardolundgren/tracking.js).
- Both versions are using the same Haar Cascades.
- Image processing are done using Web Workers to avoid blocking the main thread

Running a local copy
------------------
```bash
  # Clone/Download project

  # Install dependencies
  npm install

  # Start dev server
  npm start
```

Running the tests
-----------------
```bash
  # Run tests
  npm test

  # Run coverage
  npm run coverage

  # Run ESLint
  npm run lint
```

Contributing
------------
- Fork
- Create a feature branch
- Make your changes
- Run the tests: `npm test`
- Push your changes to your fork
- Create a pull request

Credits
-------
- [imutils](https://github.com/ollelauribostrom/imutils) is used to process images using JavaScript (filters/haar detection)
- [OpenCv](https://github.com/opencv/opencv) is used to to process images using WebAssembly (filters/haar detection)
- [Emscripten](https://github.com/kripken/emscripten) is used to to compile OpenCv to WebAssembly
- [Uint8ClampedArray-utils](https://github.com/ollelauribostrom/Uint8ClampedArray-utils) is used to to measure difference between output images
- [React Modal](https://github.com/reactjs/react-modal) is used to create modals
- [React Router](https://github.com/ReactTraining/react-router) is used for routing
- [Shortid](https://github.com/dylang/shortid) is used to generate short ids
- [fps](https://github.com/hughsk/fps) is used to measure fps
- and of course: React, Webpack, Babel, ESLint

Support
-------
Please [open an issue](https://github.com/ollelauribostrom/wasm-image-playground/issues/new) for support.

License
-------
MIT
