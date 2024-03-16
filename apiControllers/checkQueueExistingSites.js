const express = require('express');

const router = express.Router();
const checkExistingSitesStatus = require('../existingMessageConsumer');

router.get('/checkExistingSitesStatus', async (req, res) => {
	try {
		console.log('Code reached here');
		const sitesStatus = await checkExistingSitesStatus();
		return res.status(httpStatus.OK).json(sitesStatus);
	} catch (error) {
		console.log(error);
		return res.status(HTTP_STATUSES.INTERNAL_SERVER_ERROR).json({ error: error });
	}
});

module.exports = router;
