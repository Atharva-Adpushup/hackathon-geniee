const Promise = require('bluebird');
const PromiseFtp = require('promise-ftp');

const { cacheFlyFtp } = require('../configs/config');

const ftp = new PromiseFtp();

function closeConnection() {
	if (ftp.getConnectionStatus() === 'connected') return ftp.end();
	return true;
}

function connectToServer(credentials) {
	if (ftp.getConnectionStatus() === 'connected') {
		return Promise.resolve(true);
	}
	return ftp.connect(credentials);
}

function upload(
	cwd,
	data,
	credentials = {
		host: cacheFlyFtp.HOST,
		user: cacheFlyFtp.USERNAME,
		password: cacheFlyFtp.PASSWORD
	}
) {
	return connectToServer(credentials)
		.then(() => {
			if (typeof cwd === 'string') return ftp.cwd(cwd);
			if (typeof cwd === 'function') return cwd(ftp);

			return Promise.reject('Invalid value found for cwd');
		})
		.then(() => ftp.put(data.content, data.filename))
		.then(closeConnection)
		.catch(err => {
			closeConnection();
			throw err;
		});
}

module.exports = upload;
