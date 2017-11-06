const N1qlQuery = require('couchbase-promises').N1qlQuery,
	couchbase = require('../../helpers/couchBaseService'),
	siteModel = require('../../models/siteModel'),
	_ = require('lodash'),
	Promise = require('bluebird'),
	query = N1qlQuery.fromString('select siteId from apAppBucket where META().id like "%site::%"'),
	woodlotCustomLogger = require('woodlot').customLogger,
	woodlot = new woodlotCustomLogger({
		streams: ['./logs/patternUpdation.log'],
		stdout: false,
		format: {
			type: 'json',
			options: {
				spacing: '\t',
				separator: '\n'
			}
		}
	}),
	setPageGroupPatternByPlatform = (site, pageGroupPatterns, existingPatterns) => {
		Object.keys(pageGroupPatterns).forEach(platform => {
			const platformPageGroups = pageGroupPatterns[platform];

			platformPageGroups.forEach(pg => {
				existingPatterns.forEach(p => {
					if (p[pg.pageGroup]) {
						pg.pattern = p[pg.pageGroup];
					} else {
						pg.pattern = pg.pattern || '';
					}
				});
			});
		});

		const apConfigs = site.get('apConfigs');
		apConfigs.pageGroupPattern = pageGroupPatterns;
		site.set('apConfigs', apConfigs);
		return site.save();
	},
	mapPageGroupPatternByPlatform = (site, existingPatterns) => {
		const channels = site.get('channels'),
			pageGroupPatterns = {};

		channels.forEach(channel => {
			const platform = channel.split(':')[0],
				pageGroup = channel.split(':')[1];

			if (!pageGroupPatterns[platform]) {
				pageGroupPatterns[platform] = [];
			}
			pageGroupPatterns[platform].push({ pageGroup });
		});

		setPageGroupPatternByPlatform(site, pageGroupPatterns, existingPatterns);
	},
	findSitePageGroupPattern = siteId => {
		siteModel.getSiteById(siteId).then(site => {
			const { pageGroupPattern } = site.get('apConfigs');
			if (!pageGroupPattern) {
				woodlot.err(`Pagegroup pattern not found for site - ${siteId}`);
				return;
			}
			woodlot.info(`Updating pageGroup pattern for site - ${siteId}`);
			mapPageGroupPatternByPlatform(site, pageGroupPattern);
		});
	};

couchbase
	.connectToAppBucket()
	.then(appBucket => appBucket.queryPromise(query))
	.then(siteIds => {
		siteIds.forEach(id => {
			var a = findSitePageGroupPattern(id.siteId);
			console.log('Pagegroup pattern updated!');
		});
	})
	.catch(function(err) {
		console.log(err);
	});
