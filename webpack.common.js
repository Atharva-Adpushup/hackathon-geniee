const path = require('path');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const webpack = require('webpack');

module.exports = {
	context: path.resolve(__dirname, 'Client'),
	entry: './index.js',
	output: {
		path: path.resolve(__dirname, 'clientDist'),
		filename: 'shell.js',
		chunkFilename: '[name].js',
		publicPath: '/'
	},
	optimization: {
		splitChunks: {
			cacheGroups: {
				default: false,
				vendors: {
					name: 'vendors',
					chunks: 'all',
					test: /[\\/]node_modules[\\/]((?!(codemirror|highchart|react-dates)).*)[\\/]/
				},
				"codemirror": {
					name: 'codemirror',
					chunks: 'all',
					test: /node_modules\/codemirror/
				},
				"highcharts": {
					name: 'highcharts',
					chunks: 'all',
					test: /node_modules\/highcharts/
				},
				"react-dates": {
					name: 'react-dates',
					chunks: 'all',
					test: /node_modules\/react-dates/
				}
			}
		}
	},
	module: {
		rules: [
			{
				test: /\.(js|jsx)$/,
				exclude: /node_modules/,
				resolve: { extensions: ['.js', '.jsx'] },
				use: {
					loader: 'babel-loader'
				}
			},
			{
				test: /\.css$/,
				use: [MiniCssExtractPlugin.loader, 'css-loader']
			},
			{
				test: /\.scss$/,
				use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader']
			},
			{
				test: /\.png$/,
				loader: 'url-loader?limit=100000'
			},
			{
				test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
				loader: 'url-loader?limit=10000&mimetype=application/font-woff'
			},
			{
				test: /\.(ttf|otf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?|(jpg|gif)$/,
				loader: 'file-loader'
			}
		]
	},
	plugins: [
		new HtmlWebPackPlugin({
			template: './index.html',
			favicon: './public/assets/images/favicon.ico',
			filename: 'index.html'
		}),
		new OptimizeCSSAssetsPlugin({}),
		new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /en/)
	]
};
