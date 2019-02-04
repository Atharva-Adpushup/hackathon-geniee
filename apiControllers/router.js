/* eslint-disable block-scoped-var */
/* eslint-disable global-require */
/* eslint-disable vars-on-top */
/* eslint-disable no-var */
const path = require('path');

if (process.env.NODE_ENV !== 'production') {
	var swaggerUi = require('swagger-ui-express');
	var swaggerDocument = require('../configs/swagger.json');

	const webpack = require('webpack');
	var webpackConfig = require('../webpack.dev');
	var compiler = webpack(webpackConfig);
	var webpackDevMiddleware = require('webpack-dev-middleware');
	var webpackHotMiddleware = require('webpack-hot-middleware');
}

const userController = require('./userController');

module.exports = function router(app) {
	if (process.env.NODE_ENV !== 'production') {
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

	// API Conrollers
	app.use('/api/user', userController);

	// React Catch All Route
	app.use((req, res) => {
		if (process.env.NODE_ENV === 'production') {
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
