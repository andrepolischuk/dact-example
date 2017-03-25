/* eslint-disable max-len */
const webpack = require('webpack')
const cssnext = require('postcss-cssnext')

const production = process.env.NODE_ENV === 'production'

module.exports = {
  entry: './index',
  output: {
    filename: 'bundle.js',
    path: `${__dirname}/dist`,
    publicPath: '/dist/'
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader?modules&importLoaders=1&localIdentName=[path][name]--[local]--[hash:base64:5]',
          {
            loader: 'postcss-loader',
            options: {
              ident: 'by-ident',
              plugins: () => [
                cssnext
              ]
            }
          }
        ]
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          'babel-loader'
        ]
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV)
      }
    }),
    new webpack.optimize.OccurrenceOrderPlugin(),
    ...production && [
      new webpack.LoaderOptionsPlugin({
        minimize: true
      }),
      new webpack.optimize.UglifyJsPlugin({
        compress: {
          /* eslint-disable camelcase */
          pure_getters: true,
          unsafe: true,
          unsafe_comps: true,
          screw_ie8: true,
          warnings: false
          /* eslint-enable camelcase */
        }
      }),
      new webpack.NoEmitOnErrorsPlugin()
    ]
  ],
  ...!production && {
    devServer: {
      inline: true,
      historyApiFallback: true,
      port: 3000,
      stats: {
        colors: true
      }
    }
  }
}

