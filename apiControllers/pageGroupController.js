// Geniee-Ap REST API controller

const express = require('express');
const Promise = require('bluebird');

const siteModel = require('../models/siteModel');
const channelModel = require('../models/channelModel');
const adpushupEvent = require('../helpers/adpushupEvent');

const router = express.Router({ mergeParams: true });

router.post('/saveAmpSettings', (req, res) => {
	const { siteId } = req.params;
	const { platform, pageGroup, ampData } = req.body;

	return (
		channelModel
			.getChannel(siteId, platform, pageGroup)
			// eslint-disable-next-line no-shadow
			.then(pageGroup =>
				// eslint-disable-next-line no-shadow
				Promise.all([siteModel.getSiteById(siteId), pageGroup]).spread((site, pageGroup) => {
					adpushupEvent.emit('siteSaved', site);
					pageGroup.set('ampSettings', ampData);
					return pageGroup.save();
				})
			)
			// eslint-disable-next-line no-shadow
			.then(pageGroup => res.json(pageGroup))
	);
});

module.exports = router;
