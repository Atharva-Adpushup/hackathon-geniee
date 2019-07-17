const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const path = require('path');
const express = require('express');

const router = express.Router();
const { verifyOwner, errorHandler } = require('../helpers/routeHelpers');
const { BASE_URL, PROXY_ORIGIN } = require('../configs/commonConsts');
const {
	environment: { HOST_ENV }
} = require('../configs/config');
const { domanize } = require('../helpers/utils');

router.get('/:siteId', (req, res) => {
	const htmlFilePath = path.resolve(__dirname, '../portedApps/Apps/Editor/', 'index.html');
	const {
		user: { isSuperUser, email: userEmail },
		params: { siteId }
	} = req;

	return verifyOwner(siteId, userEmail)
		.then(site =>
			fs.readFileAsync(htmlFilePath, 'utf8').then(result => {
				const siteDomain = site.get('siteDomain');
				const domanizedDomain = domanize(siteDomain);
				const resultString = result
					.replace('__BASE_URL__', BASE_URL)
					.replace('__PROXY_ORIGIN__', PROXY_ORIGIN)
					.replace('__DOMANIZE_DOMAIN__', domanizedDomain)
					.replace('__SITE_DOMAIN__', siteDomain)
					.replace('__SITE_ID__', site.get('siteId'))
					.replace('__ENVIRONMENT__', HOST_ENV)
					.replace('__IS_SUPER_USER__', isSuperUser)
					.replace('__IS_GENIEE__', 0);

				res.set('content-type', 'text/html');
				res.send(resultString);
				res.end();
			})
		)
		.catch(error => errorHandler(error, res));
});

module.exports = router;
