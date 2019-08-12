/* eslint-disable block-scoped-var */
/* eslint-disable global-require */
/* eslint-disable vars-on-top */
/* eslint-disable no-var */
const path = require('path');
const apiRouter = require('./apiRouter');

const consts = require('../configs/commonConsts');

const isDevelopment = process.env.NODE_ENV === consts.environment.development;

if (isDevelopment) {
	var swaggerUi = require('swagger-ui-express');
	var swaggerDocument = require('../configs/swagger.json');

	const webpack = require('webpack');
	var webpackConfig = require('../webpack.dev');
	var compiler = webpack(webpackConfig);
	var webpackDevMiddleware = require('webpack-dev-middleware');
	var webpackHotMiddleware = require('webpack-hot-middleware');
}

module.exports = function router(app) {
	if (isDevelopment) {
		// webpack hmr
		app.use(
			webpackDevMiddleware(compiler, {
				noInfo: true,
				publicPath: webpackConfig.output.publicPath,
				index: path.resolve(__dirname, 'dist', 'index.html')
			})
		);
		app.use(webpackHotMiddleware(compiler));

		// Swagger API Docs
		app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
	}

	// API Router
	app.use('/api', apiRouter);

	// React Catch All Route
	app.use((req, res) => {
		if (!isDevelopment) {
			// eslint-disable-next-line no-undef
			const filePath = path.resolve(__basedir, 'clientDist', 'index.html');
			res.sendFile(filePath);
		} else {
			const filename = path.resolve(compiler.outputPath, 'index.html');
			compiler.outputFileSystem.readFile(filename, (err, result) => {
				res.set('content-type', 'text/html');
				res.send(result);
				res.end();
			});
		}
	});
};
