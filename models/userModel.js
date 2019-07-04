var modelAPI = (module.exports = apiModule()),
	model = require('../helpers/model'),
	couchbase = require('../helpers/couchBaseService'),
	query = require('couchbase').ViewQuery.from('app', 'sitesByUser'),
	networkSettings = require('../models/subClasses/user/networkSettings'),
	globalModel = require('../models/globalModel'),
	siteModel = require('../models/siteModel'),
	consts = require('../configs/commonConsts'),
	utils = require('../helpers/utils'),
	schema = require('../helpers/schema'),
	_ = require('lodash'),
	md5 = require('md5'),
	extend = require('extend'),
	normalizeurl = require('normalizeurl'),
	FormValidator = require('../helpers/FormValidator'),
	AdPushupError = require('../helpers/AdPushupError'),
	Config = require('../configs/config'),
	Mailer = require('../helpers/Mailer'),
	jadeParser = require('simple-jade-parser'),
	Promise = require('bluebird'),
	request = require('request-promise'),
	pipedriveAPI = require('../misc/vendors/pipedrive'),
	mailService = require('../services/mailService/index'),
	{ mailService: nodeUtilsMailService } = require('node-utils'),
	proxy = require('../helpers/proxy'),
	User = model.extend(function() {
		this.keys = [
			'firstName',
			'lastName',
			'email',
			'salt',
			'passwordMd5',
			'sites',
			'adNetworkSettings',
			'createdAt',
			'passwordResetKey',
			'passwordResetKeyCreatedAt',
			'requestDemo',
			'requestDemoData',
			'adNetworks',
			'pageviewRange',
			'managedBy',
			'userType',
			'websiteRevenue',
			// 'crmDealId',
			// 'crmDealTitle',
			// 'crmDealSecondaryTitle',
			'revenueUpperLimit',
			'preferredModeOfReach',
			'revenueLowerLimit',
			'revenueAverage',
			'adnetworkCredentials',
			'miscellaneous',
			'billingInfoComplete',
			'paymentInfoComplete',
			'isPaymentDetailsComplete',
			"adServerSettings"
		];
		this.clientKeys = [
			'firstName',
			'lastName',
			'email',
			'sites',
			'adNetworkSettings',
			'createdAt',
			'requestDemo',
			'requestDemoData',
			'adNetworks',
			'pageviewRange',
			'userType',
			'websiteRevenue',
			'revenueUpperLimit',
			'preferredModeOfReach',
			'revenueLowerLimit',
			'revenueAverage',
			'adnetworkCredentials',
			'billingInfoComplete',
			'paymentInfoComplete',
			'isPaymentDetailsComplete',
			"adServerSettings"
		];
		this.validations = schema.user.validations;
		this.classMap = {
			adNetworkSettings: networkSettings
		};
		this.defaults = {
			sites: [],
			adNetworkSettings: [],
			adServerSettings: {},
			requestDemo: true
		};
		this.ignore = ['password', 'oldPassword', 'confirmPassword', 'site'];

		this.constructor = function(data, cas) {
			if (!data.email) {
				throw new AdPushupError("Can't create user without email.");
			}

			this.casValue = cas; // if user is loaded from database which will be almost every time except first, this value will be thr
			this.super(data, cas ? true : false);
			this.key = 'user::' + data.email;
		};

		this.getSiteByDomain = function(domain) {
			return Promise.resolve(_.find(this.get('sites'), { domain: domain }));
		};

		this.getSiteById = function(siteId) {
			return Promise.resolve(_.find(this.get('sites'), { siteId: siteId }));
		};

		this.addSite = function(domain, isManual) {
			var me = this,
				normalizedDomain = normalizeurl(domain);

			return this.getSiteByDomain(normalizedDomain).then(function(site) {
				if (site) {
					return siteModel
						.getSiteById(site.siteId)
						.then(() => {
							throw new AdPushupError({ status: 409, message: 'Site already exists!' });
						})
						.catch(err => {
							if (
								err instanceof AdPushupError &&
								err.message.length &&
								err.message[0].status === 404
							) {
								return site;
							}

							throw err;
						});
				}
				return globalModel.incrSiteIdInApAppBucket().then(function(siteId) {
					me.get('sites').push({ siteId: siteId, domain: normalizedDomain, isManual: isManual });
					return { siteId: siteId, domain: normalizedDomain, isManual: isManual };
				});
			});
		};

		this.getNetworkData = function(networkName, keys) {
			return Promise.resolve(this.getNetworkDataSync(networkName, keys));
		};

		this.getNetworkDataObj = function(networkName) {
			var data = _.find(this.get('adNetworkSettings'), function(networkInfo) {
				return networkInfo.networkName === networkName;
			});
			if (!data) {
				return false;
			}
			return data;
		};

		this.getNetworkDataSync = function(networkName, keys) {
			var data = this.getNetworkDataObj(networkName),
				dataPubId;

			if (!data) {
				return false;
			}

			if (keys) {
				return data;
			}

			if (data.pubId) {
				dataPubId = data.pubId;
			} else if (data.adsenseAccounts[0].id) {
				dataPubId = data.adsenseAccounts[0].id;
			} else {
				dataPubId = null;
			}

			return {
				pubId: dataPubId,
				adsenseEmail: data.adsenseEmail
			};
		};

		this.addNetworkData = function(data) {
			var me = this;
			return new Promise(function(resolve) {
				if (!me.get('adNetworkSettings')) {
					// some how we don't have this object then create an empty array;
					me.set('adNetworkSettings', []);
				}
				var adNetworkSettings = me.get('adNetworkSettings');
				var isExist = false;
				if(adNetworkSettings.length && data.networkName === "ADSENSE" || data.networkName === "DFP"){
					for (var i = 0; i < adNetworkSettings.length; i++){
						switch(data.networkName){
							case "ADSENSE": {
								isExist = data.networkName === adNetworkSettings[i].networkName && data.adsenseEmail === adNetworkSettings[i].adsenseEmail && data.pubId === adNetworkSettings[i].pubId 
								break;
							}
							case "DFP": {
								isExist = data.networkName === adNetworkSettings[i].networkName && data.userInfo.email === adNetworkSettings[i].userInfo.email
								break;
							}
						}

						if(isExist) break;
					}
				}

				if(!isExist){
					adNetworkSettings.push(data);
					me.set('adNetworkSettings', adNetworkSettings);
				}

				return me
					.save()
					.then(function() {
						return resolve(me);
					})
					.catch(function(err) {
						throw new AdPushupError(err);
					});
			});
		};

		this.getAgencyuser = Promise.method(function() {
			var agency = this.get('managedBy');
			if (!agency) {
				Promise.reject(new AdPushupError(consts.errors.USER_NOT_MANAGED));
				return;
			}
			return modelAPI.getUserByEmail(agency);
		});

		this.isMe = function(email, pass) {
			return (
				this.get('email') === email &&
				this.get('passwordMd5') === md5(this.get('salt') + pass + this.get('salt'))
			);
		};

		this.getAllSites = function() {
			query.range(this.get('email'), this.get('email'), true);
			return couchbase.queryViewFromAppBucket(query).then(function(results) {
				return _.map(results, 'value');
			});
		};

		this.getPendingAdsCount = function() {
			return this.getAllSites()
				.then(function(sites) {
					var validSites;

					if (!Array.isArray(sites)) {
						return [];
					}

					validSites = _.map(sites, function(siteId) {
						return siteModel.getSiteById(siteId);
					});
					return Promise.all(validSites);
				})
				.then(function(sites) {
					var total = 0;
					_.forEach(sites, function(site) {
						total += parseInt(site.getUnsyncedAds('ADSENSE').length, 10);
					});
					return total;
				});
		};

		this.getUnsyncedAd = function() {
			return this.getAllSites()
				.then(function(sites) {
					var validSites;
					if (!Array.isArray(sites)) {
						return [];
					}

					validSites = _.map(sites, function(siteId) {
						return siteModel.getSiteById(siteId);
					});
					return Promise.all(validSites);
				})
				.then(function(sites) {
					var ad = null,
						activeSite = null;
					_.forEach(sites, function(site) {
						ad = site.getUnsyncedAd();
						if (ad) {
							activeSite = site;
							return false;
						}
					});
					return ad ? { ad: ad, site: activeSite } : false;
				});
		};

		this.cleanData = () => {
			const { data } = this;
			const filteredData = {};
			_.forEach(data, (value, key) => {
				if (this.clientKeys.includes(key)) {
					filteredData[key] = value;
				}
			});
			return filteredData;
		};
	});

function isPipeDriveAPIActivated() {
	return !!(
		Config.hasOwnProperty('analytics') &&
		Config.analytics.hasOwnProperty('pipedriveActivated') &&
		Config.analytics.pipedriveActivated
	);
}

function isManualTagsActivated() {
	return !!(
		Config.hasOwnProperty('analytics') &&
		Config.analytics.hasOwnProperty('manualTagsActivated') &&
		Config.analytics.manualTagsActivated
	);
}

function isEmailInAnalyticsBlockList(email) {
	const blockList = consts.analytics.emailBlockList,
		isEmailInBLockList = blockList.indexOf(email) > -1;

	return isEmailInBLockList;
}

function setSiteLevelPipeDriveData(user, inputData) {
	let allSites = user.get('sites'),
		isAllSites = !!(allSites && allSites.length);

	if (!isAllSites) {
		return Promise.resolve(user);
	}

	_.forEach(allSites, siteObject => {
		const siteDomain = utils.domanize(siteObject.domain),
			inputDomain = utils.domanize(inputData.domain),
			isDomainMatch = !!(siteDomain === inputDomain);

		if (!isDomainMatch) {
			return true;
		}

		siteObject.pipeDrive = {
			dealId: inputData.dealId,
			dealTitle: inputData.dealTitle
		};
		return false;
	});

	user.set('sites', allSites);
	return Promise.resolve(user);
}

function sendUserSignupMail(json) {
	const Mailer = new nodeUtilsMailService({
			MAIL_FROM: 'services.daemon@adpushup.com',
			MAIL_FROM_NAME: 'AdPushup Mailer',
			SMTP_SERVER: Config.email.SMTP_SERVER,
			SMTP_USERNAME: Config.email.SMTP_USERNAME,
			SMTP_PASSWORD: Config.email.SMTP_PASSWORD
		}),
		template = json => {
			return `
				<h3>Email:</h3>
				<h4>${json.email}</h4>
				<hr/>
				<h3>Revenue:</h3>
				<h4>${json.websiteRevenue || 'N/A'}</h4>
				<hr/>
				<h3>Name:</h3>
				<h4>${json.firstName} ${json.lastName}</h4>
				<hr/>
				<h3>Site:</h3>
				<h4>${json.site}</h4>
				<hr/>
			`;
		};

	return Mailer.send({
		to: Config.email.MAIL_FROM,
		subject: 'New User Signup - Tag Manager',
		body: template(json),
		type: 'html'
	});
}

function apiModule() {
	var API = {
		getUserByEmail: function(email) {
			return couchbase
				.connectToAppBucket()
				.then(function(appBucket) {
					return appBucket.getAsync('user::' + email, {});
				})
				.then(function(userJson) {
					return new User(userJson.value, userJson.cas);
				});
		},
		verifySiteOwner: function(email, siteId, options) {
			return API.getUserByEmail(email).then(function(user) {
				if (options && options.fullSiteData) {
					return siteModel.getSiteById(parseInt(siteId, 10)).then(function(site) {
						if (site) {
							return { user: user, site: site };
						}

						throw new Error('Invalid Site');
					});
				} else {
					return user.getSiteById(parseInt(siteId, 10)).then(function(site) {
						if (site) {
							return { user: user, site: site };
						}

						throw new Error('Invalid Site');
					});
				}
			});
		},
		addSite: function(email, domain) {
			// normalize and remove slash from the end
			const normalizedDomain = utils.rightTrim(normalizeurl(domain), '/'),
				getUser = API.getUserByEmail(email),
				addSite = getUser.then(user => {
					return user.addSite(normalizedDomain).then(site => {
						return [user, site];
					});
				});

			return addSite.spread((user, site) => {
				const validateSiteForDealCreation = user => {
						const allSites = user.get('sites'),
							isAllSites = !!(allSites && allSites.length);
						let isNewSite = true;

						if (!isAllSites) {
							return Promise.resolve(false);
						}

						_.forEach(allSites, siteObject => {
							const siteDomain = utils.domanize(siteObject.domain),
								inputDomain = utils.domanize(domain),
								isDomainMatch = !!(siteDomain === inputDomain),
								isPipeDriveData = !!(
									isDomainMatch &&
									siteObject.pipeDrive &&
									siteObject.pipeDrive.dealId &&
									siteObject.pipeDrive.dealTitle
								);

							if (isPipeDriveData) {
								isNewSite = false;
								return false;
							}
						});

						return Promise.resolve(isNewSite);
					},
					setNewDealForExistingUser = validateSiteForDealCreation(user).then(isSiteValidated => {
						const api = {
							params: { site: normalizedDomain },
							options: { isExistingUser: true }
						};

						return getUser.then(user => {
							const isAPIActivated = isPipeDriveAPIActivated(),
								isEmailInBLockList = isEmailInAnalyticsBlockList(email);

							if (!isSiteValidated || !isAPIActivated || isEmailInBLockList) {
								return user;
							}

							return API.createNewPipeDriveDeal(api.params, user, api.options).spread(
								(user, pipeDriveData) => {
									const pipedriveParams = {
										dealTitle: pipeDriveData.dealTitle || false,
										dealId: pipeDriveData.dealId || false,
										domain
									};
									return setSiteLevelPipeDriveData(user, pipedriveParams);
								}
							);
						});
					});

				return setNewDealForExistingUser.then(user => {
					return user.save().then(function(userObj) {
						return [userObj, site.siteId];
					});
				});
			});
		},
		createUserFromJson: function(json) {
			return Promise.resolve(new User(json));
		},
		pipedriveDealCreation: function(user, pipedriveParams, options) {
			const isOptionsObject = !!options,
				isExistingUserOption = !!(isOptionsObject && options.isExistingUser);

			process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
			return pipedriveAPI('getUserByTerm', {
				term: pipedriveParams.userInfo.email,
				search_by_email: 1,
				start: 0
			})
				.then(response => {
					if (response && response.success) {
						const isResponseData = !!(
							response.data &&
							response.data != null &&
							response.data != 'null' &&
							response.data.length
						);

						if (isResponseData) {
							return response.data[0].id;
						} else {
							return pipedriveAPI('createPerson', pipedriveParams.userInfo);
						}
					}
					return Promise.reject('Error while creating new user in Pipedrive');
				})
				.then(response => {
					if (response) {
						if (typeof response == 'object') {
							if (response.success) {
								return response.data.id;
							}
							return Promise.reject('Error while creating new user in Pipedrive');
						} else if (typeof response == 'string' || typeof response == 'number') {
							return response;
						}
					}
					return Promise.reject('Error while creating new user in Pipedrive');
				})
				.then(userPipedriveId => {
					if (userPipedriveId) {
						pipedriveParams.dealInfo['person_id'] = userPipedriveId;
						return true;
					}
					return Promise.reject('Error while creating new deal in Pipedrive');
				})
				.then(() => {
					return pipedriveAPI('createDeal', pipedriveParams.dealInfo);
				})
				.then(response => {
					const isResponseSuccess = !!(response && response.success && response.data),
						userRevenue = user.get('websiteRevenue'),
						isRevenueValid = !!userRevenue,
						isRevenueLow = !!(isRevenueValid && Number(userRevenue) <= 999),
						isDealUnqualified = !!(isResponseSuccess && isRevenueLow);

					if (!isResponseSuccess) {
						return Promise.reject('Error while checking unqualified deal in Pipedrive');
					}
					if (!isDealUnqualified) {
						return response;
					}

					const paramConfig = extend(true, {}, pipedriveParams.dealInfo);

					paramConfig.id = response.data.id;
					paramConfig.deal_id = paramConfig.id;
					paramConfig.status = 'lost';
					paramConfig.lost_reason = '[CO] Revenue < $1000 Monthly';
					return pipedriveAPI('updateDeal', paramConfig);
				})
				.then(response => {
					const isResponseSuccess = !!(response && response.success);

					if (isResponseSuccess) {
						const pipeDriveData = {
							dealId: response.data.id,
							dealTitle: response.data.title
						};
						// user.set('crmDealId', response.data.id);
						// user.set('crmDealTitle', response.data.title);
						return Promise.resolve([user, pipeDriveData]);
					}

					return Promise.reject('Error while creating new deal in Pipedrive');
				})
				.catch(err => {
					// Send mail to sales@adPushup.com here regarding error
					pipedriveParams.errorMessage =
						'Error while creating deal in Pipedrive. \
					Please make deal manually. After that update corresponding userdoc and add field `crmDealId`. \
					Below is all the information you need.';
					return mailService({
						header: 'Error while creating new deal in Pipedrive',
						content: JSON.stringify(pipedriveParams),
						emailId: 'sales@adpushup.com'
					})
						.then(() => [user, {}])
						.catch(err => [user, {}]);
				});
		},
		createNewPipeDriveDeal: function(params, user, options) {
			var userEmail = user.get('email'),
				userFirstName = user.get('firstName'),
				siteName = utils.domanize(params.site),
				miscellaneousData = user.get('miscellaneous') || {},
				pipedriveParams = {
					userInfo: {
						name: userFirstName,
						email: userEmail
					},
					dealInfo: {
						title: `[CO] ${siteName}`,
						value: user.get('websiteRevenue'),
						stage_id: 81, // [2017] AP User Onboarding Pipeline | First Stage | Deal Created
						[consts.analytics.pipedriveCustomFields.websiteName]: siteName,
						[consts.analytics.pipedriveCustomFields.dailyPageviews]: user.get('pageviewRange'),
						[consts.analytics.pipedriveCustomFields.adNetworks]: user.get('adNetworks').join(' | '),
						[consts.analytics.pipedriveCustomFields.websiteRevenue]: user.get('websiteRevenue'),
						[consts.analytics.pipedriveCustomFields.utmSource]: miscellaneousData.utmSource,
						[consts.analytics.pipedriveCustomFields.utmMedium]: miscellaneousData.utmMedium,
						[consts.analytics.pipedriveCustomFields.utmCampaign]: miscellaneousData.utmCampaign,
						[consts.analytics.pipedriveCustomFields.utmTerm]: miscellaneousData.utmTerm,
						[consts.analytics.pipedriveCustomFields.utmName]: miscellaneousData.utmName,
						[consts.analytics.pipedriveCustomFields.utmContent]: miscellaneousData.utmContent,
						[consts.analytics.pipedriveCustomFields.utmFirstHit]: miscellaneousData.utmFirstHit,
						[consts.analytics.pipedriveCustomFields.utmFirstReferrer]:
							miscellaneousData.utmFirstReferrer,
						currency: 'USD'
					}
				};

			return API.pipedriveDealCreation(user, pipedriveParams, options);
		},
		createNewUser: function(json) {
			return FormValidator.validate(json, schema.user.validations)
				.then(API.getUserByEmail.bind(null, json.email))
				.then(function(user) {
					if (user) {
						const error = [{ email: `User with email ${json.email} already exists` }];
						throw new AdPushupError(error);
					}
				})
				.catch(function(e) {
					if (e instanceof AdPushupError) {
						throw e;
					} else if (e.name && e.name === 'CouchbaseError') {
						return API.createUserFromJson(json)
							.then(function(user) {
								const miscellaneousObj = {
									utmSource: json.utmSource,
									utmMedium: json.utmMedium,
									utmCampaign: json.utmCampaign,
									utmTerm: json.utmTerm,
									utmName: json.utmName,
									utmContent: json.utmContent,
									utmFirstHit: json.utmFirstHit,
									utmFirstReferrer: json.utmFirstReferrer
								};

								// Miscellanous field will comprise of non-major user data attributes
								user.set('miscellaneous', miscellaneousObj);
								user.set('createdAt', +new Date());
								user.set('salt', consts.SALT + utils.random(0, 100000000));
								user.set('pageviewRange', json.pageviewRange);
								user.set('passwordMd5', md5(user.get('salt') + json.password + user.get('salt')));
								!json.userType ? user.set('managedBy', 'adsense.apac@adpushup.com') : '';
								return user;
							})
							.then(function(user) {
								const isUserTypePartner = !!(json.userType && json.userType === 'partner'),
									isAPIActivated = isPipeDriveAPIActivated(),
									isManualTagActivated = isManualTagsActivated(),
									isEmailInBLockList = isEmailInAnalyticsBlockList(json.email);

								if (isManualTagActivated) {
									sendUserSignupMail(json).then(console.log);
								}

								if (isUserTypePartner || !isAPIActivated || isEmailInBLockList) {
									return [user, {}];
								}

								return API.createNewPipeDriveDeal(json, user, {});
							})
							.spread(function(user, pipedriveData) {
								const pipedriveParams = {
										dealTitle: pipedriveData.dealTitle || false,
										dealId: pipedriveData.dealId || false,
										domain: json.site
									},
									isManualTagActivated = isManualTagsActivated() || false,
									addUserSite = user.addSite(json.site, isManualTagActivated),
									setPipeDriveData = addUserSite.then(addedSiteData => {
										return setSiteLevelPipeDriveData(user, pipedriveParams);
									});

								return setPipeDriveData.then(function(user) {
									return user.save();
								});
							})
							.then(function(user) {
								if (json.userType === 'partner') {
									globalModel.addEmail(json.email);
									return user.get('sites')[0];
								}

								return globalModel.addEmail(json.email);
							});
					} else {
						throw e;
					}
				});
		},
		sendCodeToDev: function(json) {
			return FormValidator.validate({ email: json.email }, schema.user.validations).then(() => {
				var mailer = new Mailer(Config.email, 'html'),
					email = json.email,
					subject = utils.htmlEntities(utils.trimString(json.subject)),
					content = json.body;

				var obj = { to: email, subject: subject, html: content };

				return mailer.send(obj);
			});
		},
		forgotPassword: function(json) {
			return FormValidator.validate(json, schema.user.validations)
				.then(API.getUserByEmail.bind(null, json.email))
				.then(function(user) {
					var passwordResetKey;
					if (user) {
						user.set('passwordResetKey', md5(Math.random(0, Math.pow(10, 32))));
						passwordResetKey = user.get('passwordResetKey');

						user.set('passwordResetKeyCreatedAt', +new Date());
						user.save();

						return jadeParser({
							file: '../views/mail/forgotPassword.jade',
							data: {
								baseUrl: consts.BASE_URL,
								email: json.email,
								resetKey: passwordResetKey
							}
						});
					}
				})
				.then(function(html) {
					var stringifiedHtml = html.toString(),
						mailer = new Mailer(Config.email, 'html'),
						obj = { to: json.email, subject: 'Password Recovery', html: stringifiedHtml };

					return mailer.send(obj);
				});
		},
		getResetPassword: function(options) {
			var config;
			return FormValidator.validate({ email: options.email }, schema.user.validations)
				.then(API.getUserByEmail.bind(null, options.email))
				.then(function(user) {
					if (
						user.get('passwordResetKey') &&
						user.get('passwordResetKeyCreatedAt') &&
						user.get('passwordResetKey') === options.key
					) {
						if (
							parseInt(user.get('passwordResetKeyCreatedAt'), 10) + 60 * 60 * 24 * 1000 <
							+new Date()
						) {
							config = { keyExpired: true };
						} else {
							config = { email: options.email, key: options.key };
						}
					} else {
						config = { keyNotFound: true };
					}

					return new Promise(function(resolve) {
						if (config && typeof config === 'object' && Object.keys(config).length > 0) {
							resolve(config);
						} else if (!config) {
							throw new AdPushupError({ keyNotFound: ['Email or key not found'] });
						}
					});
				});
		},
		postResetPassword: function(json) {
			return FormValidator.validate(json, schema.user.validations)
				.then(API.getUserByEmail.bind(null, json.email))
				.then(function(user) {
					if (
						user.get('passwordResetKey') &&
						user.get('passwordResetKeyCreatedAt') &&
						user.get('passwordResetKey') === json.key
					) {
						user.delete('passwordResetKey');
						user.delete('passwordResetKeyCreatedAt');
						user.set('passwordMd5', md5(user.get('salt') + json.password + user.get('salt')));
						return user.save();
					}
					throw new AdPushupError({ keyNotFound: true });
				});
		},
		saveProfile: function(json, email) {
			return FormValidator.validate(json, schema.user.validations)
				.then(API.getUserByEmail.bind(null, email))
				.then(function(user) {
					var oldPasswordMd5 = md5(user.get('salt') + json.oldPassword + user.get('salt')),
						passwordMd5 = user.get('passwordMd5');

					if (oldPasswordMd5 && oldPasswordMd5 === passwordMd5) {
						json.passwordMd5 = md5(user.get('salt') + json.password + user.get('salt'));

						return user;
					}
					throw new AdPushupError({
						oldPassword: ["Old Password doesn't match your current password"]
					});
				})
				.then(function(user) {
					_.forOwn(json, function(value, key) {
						if (user.get(key) && user.get(key) !== value) {
							user.set(key, value);
						}
					});

					return user;
				})
				.then(function(user) {
					return user.save();
				});
		},
		getAllUserSites: function(email) {
			return API.getUserByEmail(email)
				.then(function(user) {
					return user;
				})
				.then(function(user) {
					var sitePromises = _.map(user.get('sites'), function(site) {
						return siteModel
							.getSiteById(site.siteId)
							.then(function(site) {
								return {
									domain: site.get('siteDomain'),
									siteId: site.get('siteId'),
									step: site.get('step'),
									channels: site.get('channels')
								};
							})
							.catch(function() {
								return {
									domain: site.domain,
									siteId: site.siteId,
									step: site.step,
									channels: []
								};
							});
					});

					return Promise.all(sitePromises).then(function(sites) {
						return sites;
					});
				});
		},
		saveCredentials: function(json, email) {
			return API.getUserByEmail(email).then(function(user) {
				Object.keys(json).forEach(function(key) {
					if (json[key].username) {
						if (!json[key].password || json[key].password === '') {
							throw new AdPushupError({
								errorField: key,
								incompleteCredentials: ['Please enter Username and Password both']
							});
						}
					} else {
						if (json[key].password) {
							throw new AdPushupError({
								errorField: key,
								incompleteCredentials: ['Please enter Username and Password both']
							});
						}
					}
				});
				user.set('adnetworkCredentials', json);
				return user.save();
			});
		},
		setSitePageGroups: function(email) {
			function setPageGroupsPromises(user) {
				return _(user.get('sites')).map(function(site) {
					var uniquePageGroups = siteModel.getUniquePageGroups(site.siteId),
						setupStage = siteModel.getSetupStage(site.siteId),
						setupStep = siteModel.getSetupStep(site.siteId),
						cmsData = siteModel.getCmsData(site.siteId);
					return Promise.join(uniquePageGroups, setupStage, setupStep, cmsData, function(
						pageGroups,
						onboardingStage,
						step,
						cms
					) {
						site.onboardingStage = onboardingStage;
						site.step = step;
						site.cmsInfo = cms;
						site.pageGroups = pageGroups;
						return site;
					}).catch(function(err) {
						site.pageGroups = [];
						site.onboardingStage = site.onboardingStage || 'preOnboarding';
						site.step = site.step || false;
						return site;
					});
				});
			}

			function setPageGroups(user) {
				return Promise.all(setPageGroupsPromises(user))
					.then(function(sites) {
						user.set('sites', sites);
						return user;
					})
					.catch(function() {
						return user;
					});
			}

			return API.getUserByEmail(email).then(setPageGroups);
		},
		setUserStatus: function(data, email) {
			return API.getUserByEmail(email).then(function(user) {
				user.set('requestDemo', data.status);
				user.set('websiteRevenue', data.websiteRevenue);
				user.set('revenueUpperLimit', data.revenueUpperLimit);
				user.save();
				return user;
			});
		},
		updateUserPaymentStatus: email => {
			return proxy.checkIfBillingProfileComplete(email).then(status => {
				return API.getUserByEmail(email).then(user => {
					user.set('isPaymentDetailsComplete', status);
					return user.save();
				});
			});
		}
	};

	return API;
}
