const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');

const DIST = 'dist';

var libConfig = {
  name: 'lib',
  entry: ['@babel/polyfill', './src/lib/index.js'],
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, DIST)
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader'
      }
    ]
  },
  resolve: {
    modules: [
      path.resolve(__dirname, 'src'),
      path.resolve('./node_modules')
    ]
  }
};

var appConfig = {
  name: 'app',
  entry: ['@babel/polyfill', './src/index.js'],
  resolve: {
    modules: [
      path.resolve(__dirname, 'src'),
      path.resolve('./node_modules')
    ]
  },
  devServer: {
    contentBase: path.resolve(__dirname, DIST),
    port: 9000,
    hot: true
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: "Output Management",
      template: "./index.html"
    }),
    new CleanWebpackPlugin(),
    new ManifestPlugin()
  ],
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, DIST)
  },
  module: {
    rules: [
      {
        test: /(\.jsx|\.js)$/,
        exclude: /node_modules/,
        use: [
          {
            loader:'babel-loader',
            options: {
              presets: ['@babel/preset-env', '@babel/preset-react'],
              /**
               Experimental javascript features should be supported through individual plugin fo
               each of these features.  Babel has deprecated support for stage-x presents, becuase
               it encourages the use of experimental features that may not become standard.

               https://babeljs.io/blog/2018/07/27/removing-babels-stage-presets
               */
              plugins: [
                // support async await
                "@babel/plugin-transform-async-to-generator",
                // support class properties
                "@babel/plugin-proposal-class-properties"
              ]
            },
          }
        ],
      },
      {
        test: /\.scss$/,
        exclude: /node_modules/,
        use: ['style-loader', 'css-loader', 'postcss-loader', 'sass-loader']
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg)$/,
        use: ['file-loader']
      },
      {
        test: /\.css$/,
        use: [
          "style-loader", "css-loader"
        ]
      }
    ]
  }
};

module.exports = { appConfig, libConfig, DIST };