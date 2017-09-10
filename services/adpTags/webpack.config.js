const path = require('path'),
	webpack = require('webpack');

module.exports = [
	{
		entry: {
			adpushupHB: path.join(__dirname, 'hbScript', 'index.js')
		},
		output: {
			path: path.join(__dirname, 'hbScript', 'build'),
			filename: '[name].js'
		}
	},
	{
		entry: {
			adpushupHB: path.join(__dirname, 'hbScript', 'index.js')
		},
		output: {
			path: path.join(__dirname, 'hbScript', 'build'),
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
	// 		adpushupHB: path.join(__dirname, 'hbScriptNormal', 'src', 'index.js'),
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
