const Promise = require('bluebird');
const path = require('path');
const webpack = require('webpack');

function init(statuses = { LAYOUT: true, AMP: false }) {
	return new Promise((resolve, reject) => {
		webpack(
			{
				entry: {
					adpushup: path.join(__dirname, '..', 'genieeAp', 'main.js')
				},
				output: {
					filename: '[name].js',
					chunkFilename: '[name].js',
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
					new webpack.DefinePlugin(statuses)
				]
			},
			{
				entry: {
					adpushup: path.join(__dirname, '..', 'genieeAp', 'main.js')
				},
				output: {
					filename: '[name].min.js',
					chunkFilename: '[name].min.js'
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
					}),
					new webpack.DefinePlugin(statuses)
				]
			},
			(err, stats, output) => {
				if (err) {
					console.log(err);
				}
			}
		)
	})
}

init();

module.exports = init;