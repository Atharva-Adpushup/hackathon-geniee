const webpack = require('webpack'),
	path = require('path'),
	buildPath = path.join(__dirname, './build');

module.exports = env => {
	return {
		entry: {
			adpushup: path.join(__dirname, 'index.js')
		},
		output: {
			path: path.join(buildPath),
			filename: '[name].js'
		},
		module: {
			loaders: [
				{
					test: /.jsx?$/,
					loader: 'babel-loader',
					exclude: /node_modules/,
					query: {
						presets: ['es2015']
					}
				}
			]
		},
		plugins: [new webpack.optimize.UglifyJsPlugin()]
	};
};
