const config = require('../../../configs/config'),
	path = require('path'),
	utils = require('../../../libs/utils'),
	fs = require('fs'),
	Promise = require('bluebird'),
	readFile = Promise.promisify(fs.readFile),
	PromiseFtp = require('promise-ftp'),
	adpInteractiveScriptName = 'adpInteractiveAds',
	adpInteractiveTplPath = path.join(
		__dirname,
		'..',
		'..',
		'..',
		'public',
		'assets',
		'js',
		'builds',
		'adpInteractiveAds.min.js'
	),
	ftp = new PromiseFtp(),
	getjSFile = readFile(adpInteractiveTplPath, 'utf8'),
	connectToServer = () => {
		if (ftp.getConnectionStatus() === 'connected') {
			return Promise.resolve(true);
		}
		return ftp.connect({
			host: config.cacheFlyFtp.HOST,
			user: config.cacheFlyFtp.USERNAME,
			password: config.cacheFlyFtp.PASSWORD
		});
	},
	uploadToCDN = function() {
		return connectToServer()
			.then(() => getjSFile)
			.then(jsFileContents => {
				return Promise.all([
					ftp.put(jsFileContents, `${adpInteractiveScriptName}.js`),
					ftp.put(jsFileContents, `${adpInteractiveScriptName}.min.js`)
				]);
			});
	};

return uploadToCDN()
	.then(() => {
		utils.log('Adp interactive script uploaded to CDN');
		process.exit();
	})
	.catch(err => {
		throw new Error(err);
	});
