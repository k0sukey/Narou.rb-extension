const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: {
    popup: path.join(__dirname, 'src', 'popup'),
    options: path.join(__dirname, 'src', 'options'),
    background: path.join(__dirname, 'src', 'background'),
    // content_script: path.join(__dirname, 'src', 'content_script.ts'),
  },
  output: {
    path: path.join(__dirname, 'extension'),
    filename: '[name].js',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
    modules: ['src', 'node_modules'],
    alias: {
      react: 'preact/compat',
      'react-dom': 'preact/compat',
    },
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production'),
    }),
  ],
  mode: 'production',
  node: {
    global: true,
  },
};
