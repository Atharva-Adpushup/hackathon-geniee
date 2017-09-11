const path = require('path'),
	buildPath = '../../public/assets/js/builds/',
	webpack = require('webpack');

module.exports = [
	{
		entry: {
			adptags: path.join(__dirname, 'hbScript', 'index.js')
		},
		output: {
			path: path.join(__dirname, buildPath),
			filename: '[name].js'
		}
	},
	{
		entry: {
			adptags: path.join(__dirname, 'hbScript', 'index.js')
		},
		output: {
			path: path.join(__dirname, buildPath),
			filename: '[name].min.js'
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
	// {
	// 	entry: {
	// 		adptags: path.join(__dirname, 'hbScriptNormal', 'src', 'index.js'),
	// 	},
	// 	output: {
	// 		path: path.join(__dirname, 'hbScriptNormal', 'build'),
	// 		filename: '[name].min.js'
	// 	},
	// 	plugins: [
	// 		new webpack.optimize.UglifyJsPlugin({
	// 			compress: {
	// 				warnings: false
	// 			},
	// 			mangle: false,
	// 			sourceMap: true
	// 		})
	// 	]
	// }
];
