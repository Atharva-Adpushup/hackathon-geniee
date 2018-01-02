const path = require('path'),
	webpack = require('webpack'),
	buildPath = '../../../public/assets/js/builds/';
//const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = [
	{
		//devtool: 'cheap-module-source-map',
		entry: {
			adpushup: path.join(__dirname, 'main.js')
		},
		output: {
			path: path.join(__dirname, buildPath),
			filename: '[name].js',
			chunkFilename: '[name].js',
			publicPath: 'http://localhost:8080/assets/js/builds/'
		},
		resolve: {
			alias: {
				interactiveAds: path.resolve(__dirname, '../../interactiveAds/')
			}
		},
		module: {
			loaders: [
				{
					test: /.jsx?$/,
					loader: 'babel-loader',
					exclude: /node_modules/
				}
			]
		},
		plugins: []
	},
	{
		//devtool: 'cheap-module-source-map',
		entry: {
			adpushup: path.join(__dirname, 'main.js')
		},
		output: {
			path: path.join(__dirname, buildPath),
			filename: '[name].min.js',
			chunkFilename: '[name].min.js',
			publicPath: path.join(__dirname, '../../../public/assets/js/builds/')
		},
		resolve: {
			alias: {
				interactiveAds: path.resolve(__dirname, '../../interactiveAds/')
			}
		},
		module: {
			loaders: [
				{
					test: /.jsx?$/,
					loader: 'babel-loader',
					exclude: /node_modules/
				}
			]
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
	}
];
