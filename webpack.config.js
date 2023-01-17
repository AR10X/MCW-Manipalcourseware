const path = require('path');
const nodeExternals = require('webpack-node-externals');
const Dotenv = require('dotenv-webpack');

module.exports = {
  entry: './app.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  target: 'node',
  externals: [nodeExternals()],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: [ 
          /node_modules/,
          /models/
        ],
        use: {
          loader: 'babel-loader'
        }
      }
    ]
  },
  plugins: [
        new Dotenv({
            path: path.resolve(__dirname, 'process.env'),
        })
    ],
  devtool: 'source-map',
  mode: 'production'
};
