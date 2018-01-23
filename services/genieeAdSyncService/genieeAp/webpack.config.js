const path = require('path'),
	webpack = require('webpack'),
	buildPath = '../../../public/assets/js/builds/',
	BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = [
	{
		//devtool: 'cheap-module-source-map',
		entry: {
			adpushup: path.join(__dirname, 'main.js')
		},
		output: {
			path: path.join(__dirname, buildPath),
			filename: '[name].js',
			chunkFilename: '[name].js',
			publicPath: '//cdn.adpushup.com/'
		},
		resolve: {
			alias: {
				interactiveAds: path.resolve(__dirname, '../../interactiveAds/')
			}
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
		plugins: [
			//new BundleAnalyzerPlugin()
		]
	},
	{
		//devtool: 'cheap-module-source-map',
		entry: {
			adpushup: path.join(__dirname, 'main.js')
		},
		output: {
			path: path.join(__dirname, buildPath),
			filename: '[name].min.js',
			chunkFilename: '[name].min.js',
			publicPath: 'http://cdn.adpushup.com/'
		},
		resolve: {
			alias: {
				interactiveAds: path.resolve(__dirname, '../../interactiveAds/')
			}
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
];
