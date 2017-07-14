const path = require('path'),
	webpack = require('webpack'),
	buildPath = 'js/builds/',
	reportsJSPath = 'js/reports/geniee/reports.js';

module.exports = [{
	entry: {
		genieeReports: path.join(__dirname, reportsJSPath)
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
		new webpack.optimize.UglifyJsPlugin({
			compress: {
				warnings: false
			},
			mangle: false,
			sourceMap: true
		})
	]
}];
