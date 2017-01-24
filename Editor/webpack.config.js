

const path = require('path'),
	webpack = require('webpack'),
	buildPath = '../public/assets/js/builds/';
//const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = [
	{
		//devtool: 'cheap-module-source-map',
		entry: {
			outer: path.join(__dirname, 'app/outer.js'),
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
		resolve: {
			alias: {
				react: path.resolve('./node_modules/react'),
				React: path.resolve('./node_modules/react'),
			},
			root: path.resolve('./app/'),
			modulesDirectories: ['./components/', './components/outer', './components/shared', 'node_modules'],
			extensions: ['', '.js', '.jsx', '.css']
		},
		externals: {
			react: 'React',
			'react-dom': 'ReactDOM',
			jquery: 'jQuery'
		},
		module: {
			loaders: [
				{
					test: /.jsx?$/,
					loader: 'babel-loader',
					exclude: /node_modules/,
					query: {
						plugins: ['lodash'],
						presets: ['es2015', 'react', 'stage-2']
					}
				},
				{ test: /\.css$/, loader: 'style-loader!css-loader' },
				{
					test: /\.scss$/,
					loaders: ['style', 'css', 'sass']
				}
			]
		},
	},
	{
		//devtool: 'cheap-module-source-map',
		entry: {
			inner: path.join(__dirname, 'app/inner.js'),
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
		resolve: {
			alias: {
				react: path.resolve('./node_modules/react'),
				React: path.resolve('./node_modules/react'),
			},
			root: path.resolve('./app/'),
			modulesDirectories: ['./components/', './components/outer', './components/shared', 'node_modules'],
			extensions: ['', '.js', '.jsx', '.css']
		},
		module: {
			loaders: [
				{
					test: /.jsx?$/,
					loader: 'babel-loader',
					exclude: /node_modules/,
					query: {
						plugins: ['lodash'],
						presets: ['es2015', 'react', 'stage-2']
					}
				},
				{ test: /\.css$/, loader: 'style-loader!css-loader' },
				{
					test: /\.scss$/,
					loaders: ['style', 'css', 'sass']
				}
			]
		},
	}
];
