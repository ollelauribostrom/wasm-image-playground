const path = require('path');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = publicPath => ({
  entry: {
    main: './src/index.jsx'
  },
  output: {
    filename: '[name].bundle.js',
    chunkFilename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist/'),
    publicPath: publicPath || '/'
  },
  devtool: 'source-map',
  resolve: {
    extensions: ['.js', '.json', '.jsx']
  },
  module: {
    rules: [
      // Workers loader
      {
        test: /\.worker\.js$/,
        use: {
          loader: 'worker-loader',
          options: { name: '[name].js', publicPath: publicPath || '/' }
        }
      },
      // Process JS with Babel.
      {
        test: /\.(js|jsx)$/,
        include: path.resolve(__dirname, 'src/'),
        loader: require.resolve('babel-loader')
      },
      // HTML
      {
        test: /\.html$/,
        use: [
          {
            loader: 'html-loader',
            options: { minimize: true }
          }
        ]
      },
      // CSS
      { test: /\.css$/, use: ['style-loader', 'css-loader'] }
    ]
  },
  plugins: [
    new CleanWebpackPlugin('./dist'),
    new HtmlWebPackPlugin({
      template: './public/index.html',
      favicon: './public/favicon.ico',
      filename: 'index.html'
    }),
    new CopyWebpackPlugin([{ from: './public/manifest.json' }])
  ],
  externals: {
    react: 'React',
    'react-dom': 'ReactDOM'
  },
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    port: 3000
  }
});
