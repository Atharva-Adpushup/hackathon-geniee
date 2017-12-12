const webpack = require('webpack'),
	path = require('path'),
	buildPath = path.join(__dirname, './build');

module.exports = env => {
	return {
		entry: {
			adpushup: path.join(__dirname, 'script.js')
		},
		output: {
			path: buildPath,
			filename: '[name].js',
			chunkFilename: '[name].js',
			publicPath: path.join(__dirname, 'build/')
		},
		plugins: env && env.ENVIRONMENT === 'production' ? [new webpack.optimize.UglifyJsPlugin()] : []
	};
};
