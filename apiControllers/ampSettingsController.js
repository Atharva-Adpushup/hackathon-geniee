const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const path = require('path');
const express = require('express');

const router = express.Router();
const { verifyOwner, errorHandler } = require('../helpers/routeHelpers');

router.get('/:siteId', (req, res) => {
	const htmlFilePath = path.resolve(__dirname, '../portedApps/Apps/ampSettings/', 'index.html');
	const {
		user: { email: userEmail },
		params: { siteId }
	} = req;

	return verifyOwner(siteId, userEmail)
		.then(() =>
			fs.readFileAsync(htmlFilePath, 'utf8').then(result => {
				res.set('content-type', 'text/html');
				res.send(result);
				res.end();
			})
		)
		.catch(error => errorHandler(error, res));
});

module.exports = router;
