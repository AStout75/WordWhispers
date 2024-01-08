const path = require('path');
const webpack = require('webpack')
 
module.exports = {
  entry: [path.resolve(__dirname, './src/frontend/index.tsx'), path.resolve(__dirname, 'src/libraries/gsap.js')],
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react', '@babel/preset-typescript']
          }
        }
      },
      {
        test: /\.js$/,
        use: ["source-map-loader"],
        enforce: "pre"
      },

      {
        test: /\.(jpg|png)$/,
        use: {
          loader: 'url-loader',
        },
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.jsx'],
  },
  output: {
    path: path.resolve(__dirname, './dist/bundle'),
    filename: 'bundle.js',
  },
  devServer: {
    contentBase: path.resolve(__dirname, './dist/bundle'),
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': JSON.stringify(process.env)
    }),
  ],
  mode: "development"
};