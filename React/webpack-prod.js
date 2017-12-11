const path = require('path'),
	webpack = require('webpack'),
	buildPath = '../public/assets/js/builds/';

module.exports = [
	{
		entry: {
			outer: path.join(__dirname, './Apps/Editor/outer.js')
		},
		output: {
			path: path.join(__dirname, buildPath),
			filename: '[name].js',
			publicPath: '/'
		},
		// eslint: {
		// 	configFile: './Editor/.eslintrc.json',
		// 	failOnWarning: false,
		// 	failOnError: false
		// },
		resolve: {
			alias: {
				react: path.resolve('./node_modules/react'),
				React: path.resolve('./node_modules/react')
			},
			// root: path.resolve('./Editor'),
			modules: ['./Apps/Editor', './components/', './components/outer', './components/shared', 'node_modules'],
			extensions: ['.js', '.jsx', '.css']
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
				{
					test: /\.css$/,
					loaders: ['style-loader', 'css-loader']
				},
				{
					test: /\.scss$/,
					loaders: ['style-loader', 'css-loader', 'sass-loader']
				}
			]
		},
		plugins: [
			new webpack.optimize.UglifyJsPlugin({
				compress: {
					comparisons: false
				}
			})
		]
	},
	{
		entry: {
			inner: path.join(__dirname, './Apps/Editor/inner.js')
		},
		output: {
			path: path.join(__dirname, buildPath),
			filename: '[name].js',
			publicPath: '/'
		},
		// eslint: {
		// 	configFile: './Editor/.eslintrc.json',
		// 	failOnWarning: false,
		// 	failOnError: false
		// },
		resolve: {
			alias: {
				react: path.resolve('./node_modules/react'),
				React: path.resolve('./node_modules/react')
			},
			// root: path.resolve('./Editor'),
			modules: ['./Apps/Editor', './components/', './components/outer', './components/shared', 'node_modules'],
			extensions: ['.js', '.jsx', '.css']
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
				{
					test: /\.css$/,
					loaders: ['style-loader', 'css-loader']
				},
				{
					test: /\.scss$/,
					loaders: ['style-loader', 'css-loader', 'sass-loader']
				}
			]
		},
		plugins: [
			new webpack.optimize.UglifyJsPlugin({
				compress: {
					comparisons: false
				}
			})
		]
	},
	{
		entry: {
			inner: path.join(__dirname, './Apps/OpsPanel/index.js')
		},
		output: {
			path: path.join(__dirname, buildPath),
			filename: 'opsPanel.js',
			publicPath: '/'
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
				{
					test: /\.scss$/,
					loaders: ['style-loader', 'css-loader', 'sass-loader']
				},
				{
					test: /\.css$/,
					loaders: ['style-loader', 'css-loader']
				}
			]
		},
		plugins: [
			new webpack.optimize.UglifyJsPlugin({
				compress: {
					comparisons: false
				}
			})
		]
	},
	{
		entry: {
			inner: path.join(__dirname, './Apps/ReportingPanel/index.js')
		},
		output: {
			path: path.join(__dirname, buildPath),
			filename: 'reportingPanel.js',
			publicPath: '/'
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
				{
					test: /\.scss$/,
					loaders: ['style-loader', 'css-loader', 'sass-loader']
				},
				{
					test: /\.css$/,
					loaders: ['style-loader', 'css-loader']
				}
			]
		},
		plugins: [
			new webpack.optimize.UglifyJsPlugin({
				compress: {
					comparisons: false
				}
			})
		]
	}
];
