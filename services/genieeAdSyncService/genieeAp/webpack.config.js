const path = require('path'),
	webpack = require('webpack'),
	buildPath = '../../../public/assets/js/builds/';
//const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = [{
	//devtool: 'cheap-module-source-map',
	entry: {
		adpushup: path.join(__dirname, 'main.js')
	},
	output: {
		path: path.join(__dirname, buildPath),
		filename: '[name].js',
		publicPath: '/'
	},
	eslint: {
		configFile: '.eslintrc.js',
		failOnWarning: false,
		failOnError: false
	},
	plugins: []
}, {
	//devtool: 'cheap-module-source-map',
	entry: {
		adpushup: path.join(__dirname, 'main.js')
	},
	output: {
		path: path.join(__dirname, buildPath),
		filename: '[name].min.js',
		publicPath: '/'
	},
	eslint: {
		configFile: '.eslintrc.js',
		failOnWarning: false,
		failOnError: false
	},
	plugins: [
		new webpack.optimize.UglifyJsPlugin({
			compress: {
				warnings: false
			},
			mangle: false,
			sourceMap: true
		})
	]
}];
