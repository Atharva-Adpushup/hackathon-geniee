var express = require('express'),
	// eslint-disable-next-line new-cap
	router = express.Router(),
	siteMapModel = require('../../models/ops/siteMapModel'),
	userModel = require('../../models/userModel'),
	incontentSectionsModel = require('../../models/ops/incontentSectionsModel'),
	cbDocEditorModel = require('../../models/ops/cbDocEditorModel'),
	elasticsearchSearcherModel = require('../../models/ops/elasticsearchSearcherModel'),
	getAutoAnalysisPageGroupsModel = require('../../models/ops/autoAnalysisPageGroupsModel'),
	siteVitalsModel = require('../../models/ops/siteVitalsModel');

function getDataFromRequest(req) {
	var data = req.body;
	return JSON.parse(data.data);
}

router
	.post('/cbDocEditor', function(req, res) {
		cbDocEditorModel
			.getResult(getDataFromRequest(req))
			.then(function(data) {
				res.json(data);
			})
			.catch(function(err) {
				res.json({ error: err.toString() });
			});
	})
	.post('/siteMap', function(req, res) {
		siteMapModel
			.getResult(getDataFromRequest(req))
			.then(function(data) {
				res.json(data);
			})
			.catch(function(err) {
				res.json({ error: err.toString() });
			});
	})
	.post('/getAutoAnalysisPageGroups', function(req, res) {
		getAutoAnalysisPageGroupsModel
			.getAutoAnalysisPageGroupsForSite(getDataFromRequest(req).siteId)
			.then(function(data) {
				res.json(data);
			})
			.catch(function(err) {
				res.json({ error: err.toString() });
			});
	})
	.post('/elasticsearchSearcher', function(req, res) {
		elasticsearchSearcherModel
			.search(getDataFromRequest(req))
			.then(function(data) {
				res.json(data);
			})
			.catch(function(err) {
				res.json({ error: err.toString() });
			});
	})
	.post('/incontentSections', function(req, res) {
		var d = JSON.parse(req.body.data);
		incontentSectionsModel
			.getIncontentSectionsPerChannel(JSON.parse(d.data).options)
			.then(function(data) {
				res.json(data);
			})
			.catch(function(err) {
				res.json({ error: err.toString() });
			});
	})
	.post('/siteVitals', function(req, res) {
		siteVitalsModel
			.getResult(getDataFromRequest(req))
			.then(function(data) {
				res.json(data);
			})
			.catch(function(err) {
				res.json({ error: err.toString() });
			});
	})
	.post('/enableLogin', function(req, res) {
		userModel
			.getUserByEmail(getDataFromRequest(req).email)
			.then(function(user) {
				user.set('requestDemo', false, true);
				return user.save();
			})
			.then(function() {
				res.json({ success: true });
			})
			.catch(function(err) {
				res.json({ success: false, error: err.toString() });
			});
	});

module.exports = router;
