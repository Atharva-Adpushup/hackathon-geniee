var webpack = require('webpack');
var path = require('path');

var clientDir = path.join(__dirname, './client');

module.exports = {
	mode: 'development',
	entry: path.join(clientDir, 'index.js'),
	output: {
		path: path.join(__dirname, './public', '/dist'),
		publicPath: './public',
		filename: 'bundle.js'
	},
	module: {
		rules: [
			{
				test: /\.(js|jsx)$/,
				exclude: /node_modules/,
				loader: 'babel-loader'
			},
			{
				test: /\.css$/,
				loaders: ['style-loader', 'css-loader']
			}
		]
	},
	devServer: {
		contentBase: clientDir,
		historyApiFallback: true,
		port: 3004
	}
};
