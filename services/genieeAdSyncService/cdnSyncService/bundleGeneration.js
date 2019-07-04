const Promise = require('bluebird');
const path = require('path');
const fs = Promise.promisifyAll(require('fs'));
const webpack = require('webpack');

const AdPushupError = require('../../../helpers/AdPushupError');
let buildPath = '../../../public/assets/js/builds/geniee/__SITE_ID__/';

function init(site, config) {
	const { statusesAndAds: { statuses } = {} } = config;
	const siteId = site.get('siteId');

	buildPath = buildPath.replace('__SITE_ID__', siteId);

	return new Promise((resolve, reject) => {
		if (!statuses || !Object.keys(statuses).length) {
			return reject(new AdPushupError(`Invalid Service Statuses for site: ${site.get('siteId')}`));
		}
		const compiler = webpack({
			entry: path.join(__dirname, '..', 'adpushup.js', 'main.js'),
			output: {
				path: path.join(__dirname, buildPath),
				filename: 'bundle.js'
			},
			module: {
				rules: [
					{
						test: /.jsx?$/,
						loader: 'babel-loader',
						exclude: /node_modules/,
						options: {
							presets: ['@babel/preset-env', '@babel/preset-react'],
							plugins: [
								'@babel/plugin-syntax-dynamic-import',
								'@babel/plugin-proposal-class-properties',
								'@babel/plugin-proposal-export-namespace-from',
								'@babel/plugin-proposal-throw-expressions',
								'@babel/plugin-transform-react-jsx-source'
							]
						}
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
			plugins: [new webpack.DefinePlugin({ ...statuses, SITE_ID: JSON.stringify(siteId) })]
		});
		new webpack.ProgressPlugin().apply(compiler);
		compiler.run((err, stats) => {
			return err ? reject(err) : resolve();
		});
	})
		.then(() => {
			return Promise.join(
				fs.readFileAsync(path.join(__dirname, buildPath, 'bundle.js'), 'utf-8'),
				uncompressed => {
					return [config, uncompressed];
				}
			);
		})
		.catch(err => {
			console.log(`Error while creating webpack bundle for siteId ${siteId} and err is ${err}`);
			throw err;
		});
}

module.exports = init;
