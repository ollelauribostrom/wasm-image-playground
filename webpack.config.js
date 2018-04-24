const path = require("path");
const autoprefixer = require('autoprefixer');

module.exports = env => {
  const config = {
    mode: 'development',
    entry: {
      main: path.resolve(__dirname, 'src/index.js'),
    },
    output: {
      filename: '[name].bundle.js',
      chunkFilename: '[name].bundle.js',
      path: path.resolve(__dirname, 'dist/'),
      publicPath: '/dist/',
    },
    devtool: 'source-map',
    resolve: {
      extensions: ['.js', '.json', '.jsx']
    },
    node: {
      fs: 'empty'
    },
    module: {
      rules: [
      // Workers loader
      {
        test: /\.worker\.js$/,
        use: { loader: 'worker-loader' }
      },
      // EsLint
      {
        test: /\.(js|jsx)$/,
        enforce: 'pre',
        use: [
          {
            options: {
              eslintPath: require.resolve('eslint'),
              
            },
            loader: require.resolve('eslint-loader'),
          },
        ],
        include: path.resolve(__dirname, 'src/'),
      },
      {
        oneOf: [
          // Image loader
          {
            test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
            loader: require.resolve('url-loader'),
            options: {
              limit: 10000,
              name: 'static/media/[name].[hash:8].[ext]',
            },
          },
          // Process JS with Babel.
          {
            test: /\.(js|jsx)$/,
            include: path.resolve(__dirname, 'src/'),
            loader: require.resolve('babel-loader'),
            options: { cacheDirectory: true },
          },
          // CSS
          {
            test: /\.css$/,
            use: [
              require.resolve('style-loader'),
              {
                loader: require.resolve('css-loader'),
                options: {
                  importLoaders: 1,
                },
              },
              {
                loader: require.resolve('postcss-loader'),
                options: {
                  // Necessary for external CSS imports to work
                  // https://github.com/facebookincubator/create-react-app/issues/2677
                  ident: 'postcss',
                  plugins: () => [
                    require('postcss-flexbugs-fixes'),
                    autoprefixer({
                      browsers: [
                        '>1%',
                        'last 4 versions',
                        'Firefox ESR',
                        'not ie < 9', // React doesn't support IE8 anyway
                      ],
                      flexbox: 'no-2009',
                    }),
                  ],
                },
              },
            ],
          },
          {
            // Files
            exclude: [/\.(js|jsx|mjs)$/, /\.html$/, /\.json$/],
            loader: require.resolve('file-loader'),
            options: {
              name: 'static/media/[name].[hash:8].[ext]',
            },
          },
        ],
      },
      // ** STOP ** Are you adding a new loader?
      // Make sure to add the new loader(s) before the "file" loader.
        ]
    },
    externals: {
        "react": "React",
        "react-dom": "ReactDOM"
    },
    plugins: [],
    devServer: {
      historyApiFallback: { disableDotRule: true },
      stats: "minimal",
      port: 3000,
      open: true
    }
  };

  return config;
};