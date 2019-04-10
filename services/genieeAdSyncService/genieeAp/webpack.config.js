const path = require('path');
const webpack = require('webpack');
const buildPath = '../../../public/assets/js/builds/';
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

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
			// publicPath: 'http://localhost:8080/assets/js/builds/'
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
				},
				{
					test: /.css?$/,
					loader: ['style-loader', 'css-loader']
				},
				{
					test: /\.(eot|svg|ttf|woff|woff2)$/,
					loader: 'url-loader'
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
			publicPath: '//cdn.adpushup.com/'
			// publicPath: 'http://localhost:8080/assets/js/builds/'
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
				},
				{
					test: /.css?$/,
					loader: ['style-loader', 'css-loader']
				},
				{
					test: /\.(eot|svg|ttf|woff|woff2)$/,
					loader: 'url-loader'
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
