

const path = require('path'),
	webpack = require('webpack'),
	buildPath = '../public/assets/js/builds/';
//const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
	entry: {
		outer: path.join(__dirname, 'app/outer.js'),
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
		root: path.resolve('./app/'),
		modulesDirectories: ['./components/', './components/outer', './components/shared', 'node_modules'],
		extensions: ['', '.js', '.jsx']
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
			}
		]
	}

};
