const path = require('path'),
	webpack = require('webpack'),
	buildPath = '../../../public/assets/js/builds/';
//const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
	//devtool: 'cheap-module-source-map',
	entry: {
		adpushup: path.join(__dirname, 'main.js'),
		adpushupHB: path.join(__dirname, 'mainHB.js'),
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
	plugins: [
		/*new webpack.DefinePlugin({
			'process.env': {
				NODE_ENV: JSON.stringify('production')
			}
		})*/
	]

};
