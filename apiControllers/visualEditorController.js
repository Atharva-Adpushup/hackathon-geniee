const fs = require('fs');
const path = require('path');
const express = require('express');

const router = express.Router();
// const { sendErrorResponse, sendSuccessResponse } = require('../helpers/commonFunctions');
const { verifyOwner, errorHandler } = require('../helpers/routeHelpers');

router.get('/get', (req, res) => {
	const userEmail = 'devtest257@mailinator.com';
	const siteId = '45';
	const htmlFilePath = path.resolve(__dirname, '../portedApps/Apps/Editor/', 'index.html');

	return verifyOwner(userEmail, siteId)
		.then(() =>
			fs.readFile(htmlFilePath, (err, result) => {
				res.set('content-type', 'text/html');
				res.send(result);
				res.end();
			})
		)
		.catch(error => errorHandler(error, res));
});

// return res.render('editor', {
// 	isChrome: true,
// 	domain: data.site.get('siteDomain'),
// 	siteId: data.site.get('siteId'),
// 	channels: data.site.get('channels'),
// 	environment: config.environment.HOST_ENV,
// 	currentSiteId: req.params.siteId,
// 	isSuperUser: req.session.isSuperUser || false,
// 	// Geniee UI access config values
// 	config: {
// 		usn:
// 			isSessionGenieeUIAccess && genieeUIAccess.hasOwnProperty('selectNetwork')
// 				? Number(genieeUIAccess.selectNetwork)
// 				: 1,
// 		ubajf:
// 			isSessionGenieeUIAccess && genieeUIAccess.hasOwnProperty('beforeAfterJs')
// 				? Number(genieeUIAccess.beforeAfterJs)
// 				: 1,
// 		upkv:
// 			isSessionGenieeUIAccess && genieeUIAccess.hasOwnProperty('pageKeyValue')
// 				? Number(genieeUIAccess.pageKeyValue)
// 				: 1,
// 		uadkv:
// 			isSessionGenieeUIAccess && genieeUIAccess.hasOwnProperty('adunitKeyValue')
// 				? Number(genieeUIAccess.adunitKeyValue)
// 				: 1,
// 		uud:
// 			isSessionGenieeUIAccess && genieeUIAccess.hasOwnProperty('useDfp')
// 				? Number(genieeUIAccess.useDfp)
// 				: 1
// 	}
// });

module.exports = router;
