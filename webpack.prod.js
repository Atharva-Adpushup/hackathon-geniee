const webpack = require('webpack');
const merge = require('webpack-merge');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const common = require('./webpack.common.js');
const config = require('./configs/config');

module.exports = merge(common, {
	mode: 'production',
	output: {
		filename: 'shell.[contenthash].js',
		chunkFilename: '[name].[contenthash].js'
	},
	plugins: [
		new MiniCssExtractPlugin({
			filename: '[name].[contenthash].css',
			chunkFilename: '[id].[contenthash].css'
		}),
		new CleanWebpackPlugin(),
		new webpack.SourceMapDevToolPlugin({
			// this is the url of our local sourcemap server
			publicPath: config.clientErrorTrackingService.sourceMapsURL,
			filename: '[file].map',
		})
	]
});
