const webpack = require('webpack'),
	path = require('path'),
	buildPath = path.join(__dirname, './build/');

module.exports = env => {
	return {
		entry: {
			adpInteractiveAds: path.join(__dirname, 'script.js')
		},
		output: {
			path: buildPath,
			filename: '[name].js',
			chunkFilename: '[name].js',
			publicPath: './build/'
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
		plugins: env && env.ENVIRONMENT === 'production' ? [new webpack.optimize.UglifyJsPlugin()] : []
	};
};
