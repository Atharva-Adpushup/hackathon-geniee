const express = require('express'),
	Promise = require('bluebird'),
	_ = require('lodash'),
	router = express.Router();

router.get(['/', '/liveSitesMapping', 'couchbaseEditor'], (req, res) => {
	const { session, params } = req;

	if (session.isSuperUser) {
		return res.render('opsPanel');
	} else {
		return res.render('404');
	}
});

module.exports = router;
