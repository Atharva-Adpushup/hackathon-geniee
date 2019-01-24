// Geniee-Ap REST API controller

var express = require('express'),
	siteModel = require('../models/siteModel'),
	_ = require('lodash'),
	urlModule = require('url'),
	{ promiseForeach } = require('node-utils'),
	AdPushupError = require('../helpers/AdPushupError'),
	regexGenerator = require('../misc/tools/regexGenerator/index'),
	utils = require('../helpers/utils'),
	channelModel = require('../models/channelModel'),
	config = require('../configs/config'),
	userModel = require('.././models/userModel'),
	adpushupEvent = require('../helpers/adpushupEvent'),
	commonConsts = require('../configs/commonConsts'),
	couchbase = require('../helpers/couchBaseService'),
	countryData = require('country-data'),
	Promise = require('bluebird'),
	N1qlQuery = require('couchbase').N1qlQuery,
	router = express.Router({ mergeParams: true }),
	checkAuth = (req, res, next) => {
		userModel
			.verifySiteOwner(req.session.user.email, req.params.siteId)
			.then(function() {
				// This throws a warning : promise created but nothing returned from it
				// @TODO : Fix this
				next();
			})
			.catch(function() {
				if (req.session.partner === 'geniee') {
					req.session.destroy(function() {
						return res.redirect('/403');
					});
				} else {
					next();
					// req.session.destroy(function () {
					//     return res.redirect('/login');
					// });
				}
			});
	},
	updateHbConfig = (siteId, site, payload, appBucket) => {
		const { hbConfig, editMode, additionalOptions, deviceConfig } = payload,
			json = {
				hbConfig: { bidderAdUnits: hbConfig, additionalOptions },
				deviceConfig,
				siteId,
				siteDomain: site.get('siteDomain'),
				email: site.get('ownerEmail')
			};

		const hbcfPromise =
			editMode === 'update'
				? appBucket.replaceAsync(`hbcf::${siteId}`, json)
				: appBucket.insertAsync(`hbcf::${siteId}`, json);

		return [hbcfPromise, site];
	};

router
	.get('/:siteId/*', checkAuth)
	.get('/:siteId/settings', (req, res) => {
		function channelsDataFetching(site) {
			return site.getAllChannels().then(channels => {
				let response = [];
				if (channels && channels.length) {
					response = _.map(channels, channel => {
						return {
							name: channel.channelName,
							autoOptimise:
								channel.hasOwnProperty('autoOptimise') && channel.autoOptimise != undefined
									? channel.autoOptimise
									: 'N/A'
						};
					});
				}
				return response;
			});
		}

		return siteModel
			.getSiteById(req.params.siteId)
			.then(site => [
				siteModel.getSitePageGroups(req.params.siteId),
				site,
				userModel.getUserByEmail(req.session.user.email)
			])
			.spread((sitePageGroups, site, user) => {
				const isSession = !!req.session,
					isPartner = req.session.user.userType == 'partner',
					isSessionGenieeUIAccess = !!(isSession && req.session.genieeUIAccess),
					genieeUIAccess = isSessionGenieeUIAccess ? req.session.genieeUIAccess : false,
					isGenieeUIAccessCodeConversion = !!(
						genieeUIAccess && genieeUIAccess.hasOwnProperty('codeConversion')
					),
					adNetworkSettings = user.get('adNetworkSettings');

				let dfpAccounts = null;
				if (adNetworkSettings.length) {
					adNetworkSettings.forEach(adNetworkSetting => {
						if (adNetworkSetting.networkName === 'DFP') {
							dfpAccounts = adNetworkSetting.dfpAccounts ? adNetworkSetting.dfpAccounts : null;
						}
					});
				}

				return [
					site,
					{
						pageGroups: sitePageGroups,
						patterns: site.get('apConfigs').pageGroupPattern || {},
						apConfigs: site.get('apConfigs'),
						blocklist: site.get('apConfigs').blocklist,
						siteId: req.params.siteId,
						siteDomain: site.get('siteDomain'),
						dfpAccounts: dfpAccounts,
						isSuperUser: req.session.isSuperUser,
						//UI access code conversion property value
						// Specific to Geniee network as of now but can be made generic
						uiaccecc: isGenieeUIAccessCodeConversion ? Number(genieeUIAccess.codeConversion) : 1,
						isPartner: isPartner ? true : false,
						gdpr: site.get('gdpr') ? site.get('gdpr') : commonConsts.GDPR
					}
				];
			})
			.spread((site, data) => {
				return Promise.join(channelsDataFetching(site), channels => {
					return res.render('settings', { ...data, channels: channels });
				});
			})
			.catch(err => {
				return res.send('Some error occurred!');
			});
	})
	.get('/:siteId/opsPanel', (req, res) => {
		const { session, params } = req;

		if (session.isSuperUser) {
			return res.render('opsPanel', { siteId: params.siteId });
		} else {
			return res.render('404');
		}
	})
	.get('/:siteId/opsPanel/hbConfig', (req, res) => {
		const { siteId } = req.params;

		return couchbase
			.connectToAppBucket()
			.then(appBucket => appBucket.getAsync(`hbcf::${siteId}`, {}))
			.then(hbConfig =>
				res.status(200).send({ success: 1, data: hbConfig.value, message: 'Header bidding config fetched' })
			)
			.catch(err => {
				const { code } = err;

				if (code === 13) {
					return res.status(404).send({
						success: 0,
						data: null,
						message: `Header bidding config for siteId : ${siteId} not found`
					});
				} else {
					return res
						.status(500)
						.send({ success: 0, data: null, message: 'Some error occurred! Please try again later' });
				}
			});
	})
	.post('/:siteId/updateServiceMode', (req, res) => {
		const { key, siteId } = req.body;

		if (!req.body || !key || !siteId) {
			res.status(500).send({
				success: 0,
				data: null,
				message: 'Incomplete Params'
			});
		}

		return siteModel
			.getSiteById(siteId)
			.then(site => {
				site.set(key, !site.get(key));
				return site.save();
			})
			.then(data => res.status(200).send({ success: 1, data: null, message: 'Settings updated!' }))
			.catch(err => {
				console.log(err);
				res.status(500).send({
					success: 0,
					data: null,
					message: 'Some error occurred! Please try again later'
				});
			});
	})
	.post('/:siteId/opsPanel/hbConfig', (req, res) => {
		const { siteId } = req.params,
			sitePromise = siteModel.getSiteById(req.params.siteId),
			appBucketPromise = couchbase.connectToAppBucket();

		return Promise.all([sitePromise, appBucketPromise])
			.spread((site, appBucket) => updateHbConfig(siteId, site, JSON.parse(req.body.data), appBucket))
			.spread((data, site) => {
				adpushupEvent.emit('siteSaved', site);
				return res.status(200).send({ success: 1, data: null, message: `Header bidding config updated` });
			})
			.catch(err => {
				console.log(err);
				return res
					.status(500)
					.send({ success: 0, data: null, message: 'Some error occurred! Please try again later' });
			});
	})
	.get('/:siteId/settings/regexVerifier', function(req, res) {
		return siteModel
			.getSiteById(req.params.siteId)
			.then(site => [siteModel.getSitePageGroups(req.params.siteId), site])
			.spread((sitePageGroups, site) => {
				return res.render('regExVerifier', {
					pageGroups: sitePageGroups,
					patterns: site.get('apConfigs').pageGroupPattern ? site.get('apConfigs').pageGroupPattern : [],
					siteId: req.params.siteId,
					siteDomain: site.get('siteDomain')
				});
			})
			.catch(function(err) {
				res.send('Some error occurred!');
			});
	})
	.get('/:siteId/settings/regexGenerator', function(req, res) {
		return res.render('regexGenerator', {
			siteId: req.params.siteId
			// ok: undefined,
			// userInputs: []
		});
	})
	.post('/:siteId/settings/regexGenerator', function(req, res) {
		if (!req.body && !req.body.toMatch && !req.body.toMatch.length) {
			return res.send({
				error: true,
				message: 'Incomplete Params'
			});
		}
		return regexGenerator({
			toMatch: req.body.toMatch,
			toNotMatch: req.body.toNotMatch
		}).then(response => {
			if (!response.error) {
				let urls = _.concat(req.body.toMatch, req.body.toNotMatch),
					matchedUrls = [],
					notMatchedUrls = [],
					re = new RegExp(response.regex, 'i');
				_.forEach(urls, url => {
					re.test(url) ? matchedUrls.push(url) : notMatchedUrls.push(url);
				});
				response = {
					...response,
					matchedUrls,
					notMatchedUrls
				};
			}
			return res.send(response);
		});
	})
	.post('/:siteId/saveSiteSettings', function(req, res) {
		function channelProcessing(autoOptimise, channel) {
			const platformAndPagegroup = channel.split(':');
			return channelModel
				.getChannel(req.params.siteId, platformAndPagegroup[0], platformAndPagegroup[1])
				.then(channel => {
					channel.set('autoOptimise', autoOptimise);
					return channel.save();
				});
		}

		function updateChannelsAutoptimize(channels, autoOptimise) {
			return promiseForeach(channels, channelProcessing.bind(null, autoOptimise), (data, err) => {
				console.log(`${err.message} | Data: ${data}`);
				return false;
			});
		}

		var json = { settings: req.body, siteId: req.params.siteId },
			{ gdprCompliance, cookieControlConfig } = req.body;
		gdprCompliance = gdprCompliance === 'false' ? false : true;
		// Added default parameter check for below JSON.parse issue at line 224
		if (!cookieControlConfig) {
			cookieControlConfig = JSON.stringify({});
		}

		json.settings.pageGroupPattern = JSON.stringify(
			_.groupBy(JSON.parse(json.settings.pageGroupPattern), pattern => {
				return pattern.platform;
			})
		);
		return siteModel
			.saveSiteData(req.params.siteId, null, {
				gdpr: { compliance: gdprCompliance, cookieControlConfig: JSON.parse(cookieControlConfig) }
			})
			.then(() => siteModel.saveSiteSettings(json))
			.then(() => siteModel.getSiteChannels(req.params.siteId))
			.then(channels =>
				json.settings.isAutoOptimiseChanged == 'true'
					? updateChannelsAutoptimize(channels, json.settings.autoOptimise === 'false' ? false : true)
					: true
			)
			.then(() => res.send({ success: 1 }))
			.catch(function(err) {
				if (err.name === 'AdPushupError') {
					res.send({ succes: 0, message: err.message });
				} else {
					res.send({ success: 0, message: 'Some error occurred!' });
				}
			});
	})
	.get('/:siteId/editor', function(req, res) {
		userModel
			.verifySiteOwner(req.session.user.email, req.params.siteId, { fullSiteData: true })
			.then(function(data) {
				const isSession = !!req.session,
					isSessionGenieeUIAccess = !!(isSession && req.session.genieeUIAccess),
					genieeUIAccess = isSessionGenieeUIAccess ? req.session.genieeUIAccess : false;

				return res.render('editor', {
					isChrome: true,
					domain: data.site.get('siteDomain'),
					siteId: data.site.get('siteId'),
					channels: data.site.get('channels'),
					environment: config.environment.HOST_ENV,
					currentSiteId: req.params.siteId,
					isSuperUser: req.session.isSuperUser || false,
					// Geniee UI access config values
					config: {
						usn:
							isSessionGenieeUIAccess && genieeUIAccess.hasOwnProperty('selectNetwork')
								? Number(genieeUIAccess.selectNetwork)
								: 1,
						ubajf:
							isSessionGenieeUIAccess && genieeUIAccess.hasOwnProperty('beforeAfterJs')
								? Number(genieeUIAccess.beforeAfterJs)
								: 1,
						upkv:
							isSessionGenieeUIAccess && genieeUIAccess.hasOwnProperty('pageKeyValue')
								? Number(genieeUIAccess.pageKeyValue)
								: 1,
						uadkv:
							isSessionGenieeUIAccess && genieeUIAccess.hasOwnProperty('adunitKeyValue')
								? Number(genieeUIAccess.adunitKeyValue)
								: 1,
						uud:
							isSessionGenieeUIAccess && genieeUIAccess.hasOwnProperty('useDfp')
								? Number(genieeUIAccess.useDfp)
								: 1
					}
				});
			})
			.catch(function() {
				return res.redirect('/403');
			});
	})
	.get('/:siteId/createPagegroup', function(req, res) {
		if (req.session.user.userType !== 'partner') {
			const getSiteModel = siteModel.getSiteById(req.params.siteId),
				getAllSiteChannels = getSiteModel.then(site => site.getAllChannels()),
				getChannelsData = getAllSiteChannels.then(channelsArr => {
					return channelsArr.map(channelObj => {
						return {
							sampleUrl: channelObj.sampleUrl,
							platform: channelObj.platform,
							pageGroup: channelObj.pageGroup,
							channelName: channelObj.channelName,
							id: channelObj.id,
							variationCount: _.keys(channelObj.variations).length,
							contentSelector: channelObj.contentSelector
						};
					});
				}),
				getUniqueChannels = getChannelsData.then(channelsData => {
					return _.uniq(channelsData.map(channelObj => channelObj.pageGroup));
				});

			return Promise.join(
				getSiteModel,
				getChannelsData,
				getUniqueChannels,
				(site, channelsData, uniqueChannels) => {
					const siteId = site.get('siteId'),
						siteDomain = site.get('siteDomain'),
						channels = uniqueChannels.concat([]),
						channelsCollection = channelsData.concat([]);

					return res.render('createPageGroup', {
						siteId,
						siteDomain,
						channels,
						channelsCollection
					});
				}
			).catch(function(err) {
				return res.send('Some error occurred!');
			});
		} else {
			return res.render('403');
		}
	})
	.post('/:siteId/createPagegroup', function(req, res) {
		var json = req.body;

		json = utils.getHtmlEncodedJSON(json);
		console.log('Inside CreatePagegroup');
		return channelModel
			.createPageGroup(json)
			.then(function(data) {
				console.log('PageGroup Creation Done');
				// Reset session on addition of new pagegroup for non-partner
				var userSites = req.session.user.sites,
					userEmail = req.session.user.email,
					site = _.find(userSites, { siteId: parseInt(json.siteId) });

				return userModel
					.setSitePageGroups(userEmail)
					.then(user => user.save())
					.then(() => {
						var index = _.findIndex(userSites, { siteId: parseInt(json.siteId) });
						req.session.user.sites[index] = site;

						return res.redirect('/user/dashboard');
					});
			})
			.catch(function(err) {
				var error = err.message[0].message ? err.message[0].message : 'Some error occurred!';

				return siteModel
					.getSiteById(req.params.siteId)
					.then(function(site) {
						return { siteDomain: site.get('siteDomain'), channels: site.get('channels') };
					})
					.then(function(data) {
						var channels = _.map(data.channels, function(channel) {
							return channel.split(':')[1];
						});
						return res.render('createPageGroup', {
							siteId: req.params.siteId,
							siteDomain: data.siteDomain,
							channels: _.uniq(channels),
							error: error
						});
					});
			});
	})
	.get('/:siteId/pagegroups', function(req, res) {
		if (req.session.user.userType !== 'partner') {
			siteModel
				.getSitePageGroups(req.params.siteId)
				.then(function(pageGroups) {
					return res.render('pageGroups', {
						pageGroups: pageGroups,
						siteId: req.params.siteId
					});
				})
				.catch(function(err) {
					return res.send('Some error occurred!');
				});
		} else {
			return res.render('403');
		}
	})
	.get('/:siteId/dashboard', function(req, res) {
		siteModel
			.getSitePageGroups(req.params.siteId)
			.then(function(pageGroups) {
				if (req.session.user.userType === 'partner') {
					return res.render('geniee/dashboard', {
						pageGroups: pageGroups,
						siteId: req.params.siteId
					});
				} else {
					var allUserSites = req.session.user.sites;

					function setEmailCookie() {
						var cookieName = 'email',
							// "Email" cookie has 1 year expiry and accessible through JavaScript
							cookieOptions = {
								expires: new Date(Date.now() + 60 * 60 * 1000 * 24 * 365),
								encode: String,
								httpOnly: false
							},
							isCookieSet =
								Object.keys(req.cookies).length > 0 && typeof req.cookies[cookieName] !== 'undefined';

						isCookieSet ? res.clearCookie(cookieName, cookieOptions) : '';
						res.cookie(cookieName, req.session.user.email, cookieOptions);
					}

					function sitePromises() {
						return _.map(allUserSites, function(obj) {
							return siteModel
								.getSiteById(obj.siteId)
								.then(function() {
									return obj;
								})
								.catch(function() {
									return 'inValidSite';
								});
						});
					}

					return Promise.all(sitePromises()).then(function(validSites) {
						var sites = _.difference(validSites, ['inValidSite']),
							unSavedSite;

						sites = Array.isArray(sites) && sites.length > 0 ? sites : [];
						/**
						 * unSavedSite, Current user site object entered during signup
						 *
						 * - Value is Truthy (all user site/sites) only if user has
						 * no saved any site through Visual Editor
						 * - Value is Falsy if user has atleast one saved site
						 */
						unSavedSite = sites.length === 0 ? allUserSites : null;
						req.session.unSavedSite = unSavedSite;
						setEmailCookie(req, res);

						return res.render('dashboard', {
							validSites: sites,
							unSavedSite: unSavedSite,
							imageHeaderLogo: true
						});
					});
				}
			})
			.catch(function(err) {
				res.send('Site not found!');
			});
	})
	.post('/:siteId/saveRevenueShare', (req, res) => {
		let response = {
			error: true,
			message: 'Operaiton Failed'
		};
		if (!req.body || !req.body.siteId || !req.body.share) {
			return res.send(response);
		}
		return siteModel
			.getSiteById(req.body.siteId)
			.then(site => {
				let adNetworkSettings = site.get('adNetworkSettings') || {};
				adNetworkSettings = {
					revenueShare: parseInt(req.body.share),
					negate: ['adsense']
				};
				site.set('adNetworkSettings', adNetworkSettings);
				return site.save();
			})
			.then(() =>
				res.send(
					Object.assign(response, {
						error: false,
						message: 'Share set'
					})
				)
			)
			.catch(err => {
				console.log(err);
				return res.send(response);
			});
	})
	.get('/:siteId/getRevenueShare', (req, res) => {
		let response = {
			error: true,
			message: 'Operaiton Failed'
		};
		return siteModel
			.getSiteById(req.params.siteId)
			.then(site => {
				if (!site) {
					return res.send(response);
				}
				return res.send(
					Object.assign(response, {
						error: false,
						message: 'Done',
						rs: site.get('adNetworkSettings').revenueShare ? site.get('adNetworkSettings').revenueShare : 10
					})
				);
			})
			.catch(err => {
				console.log(err);
				return res.send(response);
			});
	})
	.get('/:siteId/ampSettings', (req, res) => {
		const isSession = !!req.session,
			isSessionUser = !!(isSession && req.session.user),
			isGenieePartner = !!(isSession && req.session.partner && req.session.partner === 'geniee'),
			isDemoUserAccount = !!(isSessionUser && req.session.user.email === commonConsts.DEMO_ACCOUNT_EMAIL),
			isSuperUser = !!req.session.isSuperUser,
			isValidUser = isSuperUser || isGenieePartner || isDemoUserAccount;

		if (isValidUser) return res.render('ampSettings');
		else return res.render('404');
	})
	.get('/:siteId/ampSettingsData', (req, res) => {
		return siteModel
			.getSiteById(req.params.siteId)
			.then(site => {
				let ampSettings = site.get('ampSettings') || {};
				return channelModel.getAmpSettings(req.params.siteId).then(function(channels) {
					return res.send({
						siteId: req.params.siteId,
						channels,
						ampSettings,
						siteDomain: site.get('siteDomain')
					});
				});
			})
			.catch(function(err) {
				return res.send({
					error: true,
					message: 'Some Error Occured'
				});
			});
	})
	.post('/:siteId/saveAmpSettings', (req, res) => {
		let response = {
			error: true,
			message: 'Operaiton Failed'
		};
		return siteModel
			.getSiteById(req.params.siteId)
			.then(site => {
				if (!site) {
					return res.send(response);
				}
				site.set('ampSettings', req.body);
				return site.save();
			})
			.then(site => {
				res.send(site);
			})
			.catch(function(err) {
				return res.send({
					error: true,
					message: 'Some Error Occured'
				});
			});
	});

module.exports = router;
