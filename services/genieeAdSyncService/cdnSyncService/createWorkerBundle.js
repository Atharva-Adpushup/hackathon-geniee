const path = require('path');
const webpack = require('webpack');
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));

// const AdPushupError = require('../../../helpers/AdPushupError');

let buildPath = '../../../public/assets/js/builds/geniee/workers/';

function init(siteId) {
	return new Promise((resolve, reject) => {
		const compiler = webpack({
			mode: 'production',
			entry: path.join(__dirname, '..', 'adpushup.js-optimized', 'libs', 'webworkers', 'script.worker.js'),
			output: {
				path: path.join(__dirname, buildPath),
				filename: 'index.[hash].js'
			},
			module: {
				rules: [
					{
						test: /.js$/,
						loader: 'babel-loader',
						options: {
							// TODO: set target to esModules if building with es6 support
							presets: ['@babel/preset-env']
						}
					},
					{
						test: /\.worker\.js$/,
						loader: 'worker-loader',
						options: {
							filename: 'worker.[hash].js',
							esModule: false
						}
					}
				]
			}
		});
		new webpack.ProgressPlugin().apply(compiler);
		compiler.run((err, stats) => {
			if (err || stats.hasErrors()) {
				return reject(err || stats.compilation.errors);
			}
			const indexFileHash = stats.hash;
			const workerFileHash = stats.compilation.children[0].hash;
			return resolve({ indexFileHash, workerFileHash });
		});
	})
		.then(({ indexFileHash, workerFileHash }) => {
			// remove index.[hash].js file since it is not required
			const workerFileName = `worker.${workerFileHash}.js`;

			return Promise.join(
				fs.readFileAsync(path.join(__dirname, buildPath, workerFileName), 'utf-8'),
				fs.unlinkAsync(path.join(__dirname, buildPath, `index.${indexFileHash}.js`))
			).then(([workerFileContent]) => {
				return {
					name: workerFileName,
					default: workerFileContent,
				};
			});
		})
		.catch(err => {
			console.log(`Error while creating web worker bundle for siteId ${siteId} and err is ${err}`);
			throw err;
		});
}

module.exports = init;
