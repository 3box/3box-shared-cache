const path = require('path');

module.exports = {
  entry: {
    client: './example/client.js',
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
           presets: ['@babel/preset-env']
          }
        }
      }
    ]
  }
};
