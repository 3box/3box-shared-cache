const path = require('path');

module.exports = {
  mode: 'development',
  devtool: 'source-map',
  entry: {
    server: './example/server.js'
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'example', 'dist'),
  },
	module: {
	  rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: [
              ['@babel/plugin-transform-runtime'],
            ]
          }
        }
      }
    ]
  }
};
