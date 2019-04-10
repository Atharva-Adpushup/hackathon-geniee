const path = require('path');
const webpack = require('webpack');
const buildPath = '../../public/assets/js/builds/';

module.exports = [
	{
		//devtool: 'cheap-module-source-map',
		entry: path.join(__dirname, 'index.js'),
		output: {
			path: path.join(__dirname, buildPath),
			filename: 'adpInteractiveAds.js',
			chunkFilename: 'adpInteractiveAds.js',
		},
		module: {
			loaders: [
				{
					test: /.jsx?$/,
					loader: 'babel-loader',
					exclude: /node_modules/
				},
				{
					test: /.css?$/,
					loader: ['style-loader', 'css-loader']
				},
				{
					test: /\.(eot|svg|ttf|woff|woff2)$/,
					loader: 'url-loader'
				}
			]
		}
	},
	{
		//devtool: 'cheap-module-source-map',
		entry: path.join(__dirname, 'index.js'),
		output: {
			path: path.join(__dirname, buildPath),
			filename: 'adpInteractiveAds.min.js',
			chunkFilename: 'adpInteractiveAds.min.js'
		},
		module: {
			loaders: [
				{
					test: /.jsx?$/,
					loader: 'babel-loader',
					exclude: /node_modules/
				},
				{
					test: /.css?$/,
					loader: ['style-loader', 'css-loader']
				},
				{
					test: /\.(eot|svg|ttf|woff|woff2)$/,
					loader: 'url-loader'
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
