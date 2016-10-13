var adpushup = require('../../helpers/adpushupEvent'),
	consts = require('../../configs/commonConsts'),
	request = require('request-promise');


adpushup.on('siteSaved', function(site) {
	function doIt() {
		return request({
			uri: consts.ADRECOVER_ORIGIN + '/generator/updateRecoverjs?siteId=' + site.get('siteId'),
			jar: true,
			strictSSL: false,
			json: true
		});
	}

	site.hasAdrecoverChannels().then(function() {
		// Retry if some error happen.
		doIt().then(function() {
		})
		.catch(function() {
			doIt().then(function() {}).catch(function(err) {
				console.log('Error connecting adrecover: ' + err);
			});
		});
	}).catch(function() {
		return;
	})
});

