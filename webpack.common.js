const path = require('path');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

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
					test: /node_modules/
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
			// favicon: './public/favicon.ico',
			filename: 'index.html'
		}),
		new OptimizeCSSAssetsPlugin({})
	]
};
