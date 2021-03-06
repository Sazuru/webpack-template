const path = require('path');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserJSPlugin = require('terser-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');

const isDevMode = process.env.NODE_ENV === 'development';
const isProductionMode = process.env.NODE_ENV === 'production';

const optimization = () => {
  const config = {
    splitChunks: {
      chunks: 'all',
    },
    minimize: isProductionMode,
    minimizer: [
      new TerserJSPlugin({
        terserOptions: {
          output: {
            comments: false,
          },
        },
        extractComments: false,
      }),
      new OptimizeCSSAssetsPlugin(),
    ],
  };

  return config;
};

const filename = (extension) =>
  isDevMode ? `[name].${extension}` : `[name].[contenthash].${extension}`;

const cssLoaders = (extra) => {
  const loaders = [
    {
      loader: MiniCssExtractPlugin.loader,
      options: {
        hmr: isDevMode,
        reloadAll: true,
      },
    },
    'css-loader',
  ];

  if (isProductionMode) {
    loaders.push({
      loader: 'postcss-loader',
      options: {
        ident: 'postcss',
        plugins: (loader) => [
          require('postcss-import')({ root: loader.resourcePath }),
          require('postcss-preset-env')(),
          require('autoprefixer')(),
          require('cssnano')(),
        ],
      },
    });
  }

  if (extra) {
    loaders.push(extra);
  }
  return loaders;
};

const jsLoaders = () => {
  const loaders = [
    {
      loader: 'babel-loader',
      options: {
        presets: ['@babel/preset-env'],
      },
    },
  ];

  if (isDevMode) {
    loaders.push('eslint-loader');
  }

  return loaders;
};

module.exports = {
  context: path.resolve(__dirname, 'src'),
  mode: 'development',
  entry: ['@babel/polyfill', './index.js'],
  output: {
    filename: filename('js'),
    path: path.resolve(__dirname, 'dist'),
  },
  devServer: {
    port: 8080,
    hot: isDevMode,
  },
  resolve: {
    alias: {},
  },
  optimization: optimization(),
  devtool: isDevMode ? 'source-map' : '',
  plugins: [
    new HTMLWebpackPlugin({
      template: './index.html',
      minify: {
        collapseWhitespace: isProductionMode,
      },
    }),
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin([
      { from: 'assets/images', to: 'images' },
      { from: 'assets/fonts', to: 'fonts' },
    ]),
    new MiniCssExtractPlugin({
      filename: filename('css'),
      chunkFilename: '[id].css',
      ignoreOrder: false,
    }),
  ],
  module: {
    rules: [
      {
        test: /\.css$/,
        use: cssLoaders(),
      },
      {
        test: /\.s[ac]ss$/,
        use: cssLoaders('sass-loader'),
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'images',
            },
          },
        ],
      },
      {
        test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'fonts',
            },
          },
        ],
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: jsLoaders(),
      },
    ],
  },
};
