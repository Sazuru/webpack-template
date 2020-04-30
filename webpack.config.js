const path = require('path');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserJSPlugin = require('terser-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');

const isDevMode = process.env.NODE_ENV === 'development';
const optimization = () => {
  const config = {
    splitChunks: {
      chunks: 'all',
    },
  };

  if (!isDevMode) {
    config.minimizer = {
      minimizer: [new TerserJSPlugin(), new OptimizeCSSAssetsPlugin()],
    };
  }
};

module.exports = {
  context: path.resolve(__dirname, 'src'),
  mode: 'development',
  entry: './index.js',
  output: {
    filename: 'bundle.js',
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
  plugins: [
    new HTMLWebpackPlugin({
      template: './index.html',
      minify: {
        collapseWhitespace: !isDevMode,
      },
    }),
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin([
      { from: 'assets/images', to: 'images' },
      { from: 'assets/fonts', to: 'fonts' },
    ]),
    new MiniCssExtractPlugin({
      filename: 'css/[name].css',
      chunkFilename: '[id].css',
      ignoreOrder: false,
    }),
  ],
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              hmr: isDevMode,
              reloadAll: true,
            },
          },
          'css-loader',
        ],
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'assets/images/',
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
              outputPath: 'assets/fonts/',
            },
          },
        ],
      },
    ],
  },
};
