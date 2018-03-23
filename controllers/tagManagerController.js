const express = require('express'),
	Promise = require('bluebird'),
	_ = require('lodash'),
	{ couchbaseService } = require('node-utils'),
	config = require('../configs/config'),
	utils = require('../helpers/utils'),
	router = express.Router();

const fn = {};

router.get(['/'], (req, res) => {
	const { session, params } = req;

	return res.render('tagManager', {
		siteId: 1
	});
});

module.exports = router;
