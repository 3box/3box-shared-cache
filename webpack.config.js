const path = require('path');

module.exports = {
  entry: './iframe/index.js',
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'public'),
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
      },
      {
        loader: "webpack-modernizr-loader",
        test: /\.modernizrrc\.js$/,
        exclude: /(node_modules)/,
        type: 'javascript/auto'
      }
    ]
  },
  resolve: {
    alias: {
      modernizr$: path.resolve(__dirname, "./.modernizrrc")
    }
  }
};
