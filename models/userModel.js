const modelAPI = (module.exports = apiModule());

const model = require('../helpers/model');

const couchbase = require('../helpers/couchBaseService');

const query = require('couchbase').ViewQuery.from('app', 'sitesByUser');

const networkSettings = require('../models/subClasses/user/networkSettings');

const globalModel = require('../models/globalModel');

const siteModel = require('../models/siteModel');

const consts = require('../configs/commonConsts');

const utils = require('../helpers/utils');

const schema = require('../helpers/schema');

const _ = require('lodash');

const md5 = require('md5');

const extend = require('extend');

const normalizeurl = require('normalizeurl');

const FormValidator = require('../helpers/FormValidator');

const AdPushupError = require('../helpers/AdPushupError');

const Config = require('../configs/config');

const Mailer = require('../helpers/Mailer');

const jadeParser = require('simple-jade-parser');

const Promise = require('bluebird');

const request = require('request-promise');

const pipedriveAPI = require('../misc/vendors/pipedrive');

var mailService = require('../services/mailService/index');

var { mailService } = require('node-utils');

const User = model.extend(function() {
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
		'paymentInfoComplete'
	];
	this.validations = schema.user.validations;
	this.classMap = {
		adNetworkSettings: networkSettings
	};
	this.defaults = {
		sites: [],
		adNetworkSettings: [],
		// requestDemo: true
		// Commented for Tag Manager
		requestDemo: true
	};
	this.ignore = ['password', 'oldPassword', 'confirmPassword', 'site'];

	this.constructor = function(data, cas) {
		if (!data.email) {
			throw new AdPushupError("Can't create user without email.");
		}

		this.casValue = cas; // if user is loaded from database which will be almost every time except first, this value will be thr
		this.super(data, !!cas);
		this.key = `user::${data.email}`;
	};

	this.getSiteByDomain = function(domain) {
		return Promise.resolve(_.find(this.get('sites'), { domain }));
	};

	this.getSiteById = function(siteId) {
		return Promise.resolve(_.find(this.get('sites'), { siteId }));
	};

	this.addSite = function(domain, isManual) {
		const me = this;

		const normalizedDomain = normalizeurl(domain);

		return this.getSiteByDomain(normalizedDomain).then(site => {
			if (site) {
				return site;
			}
			return globalModel.incrSiteIdInApAppBucket().then(siteId => {
				me.get('sites').push({ siteId, domain: normalizedDomain, isManual });
				return { siteId, domain: normalizedDomain, isManual };
			});
		});
	};

	this.getNetworkData = function(networkName, keys) {
		return Promise.resolve(this.getNetworkDataSync(networkName, keys));
	};

	this.getNetworkDataObj = function(networkName) {
		const data = _.find(
			this.get('adNetworkSettings'),
			networkInfo => networkInfo.networkName === networkName
		);
		if (!data) {
			return false;
		}
		return data;
	};

	this.getNetworkDataSync = function(networkName, keys) {
		const data = this.getNetworkDataObj(networkName);

		let dataPubId;

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
		const me = this;
		return new Promise(resolve => {
			if (!me.get('adNetworkSettings')) {
				// some how we don't have this object then create an empty array;
				me.set('adNetworkSettings', []);
			}
			const adNetworkSettings = me.get('adNetworkSettings');
			adNetworkSettings.push(data);
			me.set('adNetworkSettings', adNetworkSettings);
			return me
				.save()
				.then(() => resolve(me))
				.catch(err => {
					throw new AdPushupError(err);
				});
		});
	};

	this.getAgencyuser = Promise.method(function() {
		const agency = this.get('managedBy');
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
		return couchbase.queryViewFromAppBucket(query).then(results => _.map(results, 'value'));
	};

	this.getPendingAdsCount = function() {
		return this.getAllSites()
			.then(sites => {
				let validSites;

				if (!Array.isArray(sites)) {
					return [];
				}

				validSites = _.map(sites, siteId => siteModel.getSiteById(siteId));
				return Promise.all(validSites);
			})
			.then(sites => {
				let total = 0;
				_.forEach(sites, site => {
					total += parseInt(site.getUnsyncedAds('ADSENSE').length, 10);
				});
				return total;
			});
	};

	this.getUnsyncedAd = function() {
		return this.getAllSites()
			.then(sites => {
				let validSites;
				if (!Array.isArray(sites)) {
					return [];
				}

				validSites = _.map(sites, siteId => siteModel.getSiteById(siteId));
				return Promise.all(validSites);
			})
			.then(sites => {
				let ad = null;

				let activeSite = null;
				_.forEach(sites, site => {
					ad = site.getUnsyncedAd();
					if (ad) {
						activeSite = site;
						return false;
					}
				});
				return ad ? { ad, site: activeSite } : false;
			});
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
	const blockList = consts.analytics.emailBlockList;

	const isEmailInBLockList = blockList.indexOf(email) > -1;

	return isEmailInBLockList;
}

function setSiteLevelPipeDriveData(user, inputData) {
	const allSites = user.get('sites');

	const isAllSites = !!(allSites && allSites.length);

	if (!isAllSites) {
		return Promise.resolve(user);
	}

	_.forEach(allSites, siteObject => {
		const siteDomain = utils.domanize(siteObject.domain);

		const inputDomain = utils.domanize(inputData.domain);

		const isDomainMatch = !!(siteDomain === inputDomain);

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
	const Mailer = new mailService({
		MAIL_FROM: 'services.daemon@adpushup.com',
		MAIL_FROM_NAME: 'AdPushup Mailer',
		SMTP_SERVER: Config.email.SMTP_SERVER,
		SMTP_USERNAME: Config.email.SMTP_USERNAME,
		SMTP_PASSWORD: Config.email.SMTP_PASSWORD
	});

	const template = json => `
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

	return Mailer.send({
		to: Config.email.MAIL_FROM,
		subject: 'New User Signup - Tag Manager',
		body: template(json),
		type: 'html'
	});
}

function apiModule() {
	var API = {
		getUserByEmail(email) {
			return couchbase
				.connectToAppBucket()
				.then(appBucket => appBucket.getAsync(`user::${email}`, {}))
				.then(userJson => new User(userJson.value, userJson.cas));
		},
		verifySiteOwner(email, siteId, options) {
			return API.getUserByEmail(email).then(user => {
				if (options && options.fullSiteData) {
					return siteModel.getSiteById(parseInt(siteId, 10)).then(site => {
						if (site) {
							return { user, site };
						}

						throw new Error('Invalid Site');
					});
				}
				return user.getSiteById(parseInt(siteId, 10)).then(site => {
					if (site) {
						return { user, site };
					}

					throw new Error('Invalid Site');
				});
			});
		},
		addSite(email, domain) {
			// normalize and remove slash from the end
			const normalizedDomain = utils.rightTrim(normalizeurl(domain), '/');

			const getUser = API.getUserByEmail(email);

			const addSite = getUser.then(user =>
				user.addSite(normalizedDomain).then(site => [user, site])
			);

			return addSite.spread((user, site) => {
				const validateSiteForDealCreation = user => {
					const allSites = user.get('sites');

					const isAllSites = !!(allSites && allSites.length);
					let isNewSite = true;

					if (!isAllSites) {
						return Promise.resolve(false);
					}

					_.forEach(allSites, siteObject => {
						const siteDomain = utils.domanize(siteObject.domain);

						const inputDomain = utils.domanize(domain);

						const isDomainMatch = !!(siteDomain === inputDomain);

						const isPipeDriveData = !!(
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
				};

				const setNewDealForExistingUser = validateSiteForDealCreation(user).then(
					isSiteValidated => {
						const api = {
							params: { site: normalizedDomain },
							options: { isExistingUser: true }
						};

						return getUser.then(user => {
							const isAPIActivated = isPipeDriveAPIActivated();

							const isEmailInBLockList = isEmailInAnalyticsBlockList(email);

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
					}
				);

				return setNewDealForExistingUser.then(user =>
					user.save().then(userObj => [userObj, site.siteId])
				);
			});
		},
		createUserFromJson(json) {
			return Promise.resolve(new User(json));
		},
		pipedriveDealCreation(user, pipedriveParams, options) {
			const isOptionsObject = !!options;

			const isExistingUserOption = !!(isOptionsObject && options.isExistingUser);

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
						}
						return pipedriveAPI('createPerson', pipedriveParams.userInfo);
					}
					return Promise.reject('Error while creating new user in Pipedrive');
				})
				.then(response => {
					if (response) {
						if (typeof response === 'object') {
							if (response.success) {
								return response.data.id;
							}
							return Promise.reject('Error while creating new user in Pipedrive');
						}
						if (typeof response === 'string' || typeof response === 'number') {
							return response;
						}
					}
					return Promise.reject('Error while creating new user in Pipedrive');
				})
				.then(userPipedriveId => {
					if (userPipedriveId) {
						pipedriveParams.dealInfo.person_id = userPipedriveId;
						return true;
					}
					return Promise.reject('Error while creating new deal in Pipedrive');
				})
				.then(() => pipedriveAPI('createDeal', pipedriveParams.dealInfo))
				.then(response => {
					const isResponseSuccess = !!(response && response.success && response.data);

					const userRevenue = user.get('websiteRevenue');

					const isRevenueValid = !!userRevenue;

					const isRevenueLow = !!(isRevenueValid && Number(userRevenue) <= 999);

					const isDealUnqualified = !!(isResponseSuccess && isRevenueLow);

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
		createNewPipeDriveDeal(params, user, options) {
			const userEmail = user.get('email');

			const userFirstName = user.get('firstName');

			const siteName = utils.domanize(params.site);

			const miscellaneousData = user.get('miscellaneous') || {};

			const pipedriveParams = {
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
		createNewUser(json) {
			return FormValidator.validate(json, schema.user.validations)
				.then(API.getUserByEmail.bind(null, json.email))
				.then(user => {
					if (user) {
						const error = [{ email: `User with email ${json.email} already exists` }];
						throw new AdPushupError(error);
					}
				})
				.catch(e => {
					if (e instanceof AdPushupError) {
						throw e;
					} else if (e.name && e.name === 'CouchbaseError') {
						return API.createUserFromJson(json)
							.then(user => {
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
							.then(user => {
								const isUserTypePartner = !!(json.userType && json.userType === 'partner');

								const isAPIActivated = isPipeDriveAPIActivated();

								const isManualTagActivated = isManualTagsActivated();

								const isEmailInBLockList = isEmailInAnalyticsBlockList(json.email);

								if (isManualTagActivated) {
									sendUserSignupMail(json).then(console.log);
								}

								if (isUserTypePartner || !isAPIActivated || isEmailInBLockList) {
									return [user, {}];
								}

								return API.createNewPipeDriveDeal(json, user, {});
							})
							.spread((user, pipedriveData) => {
								const pipedriveParams = {
									dealTitle: pipedriveData.dealTitle || false,
									dealId: pipedriveData.dealId || false,
									domain: json.site
								};

								const isManualTagActivated = isManualTagsActivated() || false;

								const addUserSite = user.addSite(json.site, isManualTagActivated);

								const setPipeDriveData = addUserSite.then(addedSiteData =>
									setSiteLevelPipeDriveData(user, pipedriveParams)
								);

								return setPipeDriveData.then(user => user.save());
							})
							.then(user => {
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
		sendCodeToDev(json) {
			const mailer = new Mailer(Config.email, 'html');

			const mailHeader =
				'Hi, <br/> Please find below the code snippet for your AdPushup setup. Paste this into the <strong>&lt;head&gt;</strong> section of your page - \n\n';

			const mailFooter = '<br/><br/>Thanks,<br/>Team AdPushup';

			let headerCode = json.code;

			headerCode = headerCode.replace(/</g, '&lt;');
			headerCode = headerCode.replace(/>/g, '&gt;');

			const content = `${mailHeader}<div style="background-color: #eaeaea; padding: 20px; margin-top: 10px;">${headerCode}</div>${mailFooter}`;

			const obj = { to: json.email, subject: 'AdPushup Header Snippet', html: content };

			return mailer.send(obj);
		},
		forgotPassword(json) {
			return FormValidator.validate(json, schema.user.validations)
				.then(API.getUserByEmail.bind(null, json.email))
				.then(user => {
					let passwordResetKey;
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
				.then(html => {
					const stringifiedHtml = html.toString();

					const mailer = new Mailer(Config.email, 'html');

					const obj = { to: json.email, subject: 'Password Recovery', html: stringifiedHtml };

					return mailer.send(obj);
				});
		},
		getResetPassword(options) {
			let config;
			return FormValidator.validate({ email: options.email }, schema.user.validations)
				.then(API.getUserByEmail.bind(null, options.email))
				.then(user => {
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

					return new Promise(resolve => {
						if (config && typeof config === 'object' && Object.keys(config).length > 0) {
							resolve(config);
						} else if (!config) {
							throw new AdPushupError({ keyNotFound: ['Email or key not found'] });
						}
					});
				});
		},
		postResetPassword(json) {
			return FormValidator.validate(json, schema.user.validations)
				.then(API.getUserByEmail.bind(null, json.email))
				.then(user => {
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
		saveProfile(json, email) {
			return FormValidator.validate(json, schema.user.validations)
				.then(API.getUserByEmail.bind(null, email))
				.then(user => {
					const oldPasswordMd5 = md5(user.get('salt') + json.oldPassword + user.get('salt'));

					const passwordMd5 = user.get('passwordMd5');

					if (oldPasswordMd5 && oldPasswordMd5 === passwordMd5) {
						json.passwordMd5 = md5(user.get('salt') + json.password + user.get('salt'));

						return user;
					}
					throw new AdPushupError({
						oldPassword: ["Old Password doesn't match your current password"]
					});
				})
				.then(user => {
					_.forOwn(json, (value, key) => {
						if (user.get(key) && user.get(key) !== value) {
							user.set(key, value);
						}
					});

					return user;
				})
				.then(user => user.save());
		},
		getAllUserSites(email) {
			return API.getUserByEmail(email)
				.then(user => user)
				.then(user => {
					const sitePromises = _.map(user.get('sites'), site =>
						siteModel
							.getSiteById(site.siteId)
							.then(site => ({
								domain: site.get('siteDomain'),
								siteId: site.get('siteId'),
								step: site.get('step'),
								channels: site.get('channels')
							}))
							.catch(() => ({
								domain: site.domain,
								siteId: site.siteId,
								step: site.step,
								channels: []
							}))
					);

					return Promise.all(sitePromises).then(sites => sites);
				});
		},
		saveCredentials(json, email) {
			return API.getUserByEmail(email).then(user => {
				Object.keys(json).forEach(key => {
					if (json[key].username) {
						if (!json[key].password || json[key].password === '') {
							throw new AdPushupError({
								errorField: key,
								incompleteCredentials: ['Please enter Username and Password both']
							});
						}
					} else if (json[key].password) {
						throw new AdPushupError({
							errorField: key,
							incompleteCredentials: ['Please enter Username and Password both']
						});
					}
				});
				user.set('adnetworkCredentials', json);
				return user.save();
			});
		},
		setSitePageGroups(email) {
			function setPageGroupsPromises(user) {
				return _(user.get('sites')).map(site => {
					const uniquePageGroups = siteModel.getUniquePageGroups(site.siteId);

					const setupStep = siteModel.getSetupStep(site.siteId);

					const cmsData = siteModel.getCmsData(site.siteId);
					return Promise.join(uniquePageGroups, setupStep, cmsData, (pageGroups, step, cms) => {
						site.step = step;
						site.cmsInfo = cms;
						site.pageGroups = pageGroups;
						return site;
					}).catch(err => {
						site.pageGroups = [];
						site.step = site.step || false;
						return site;
					});
				});
			}

			function setPageGroups(user) {
				return Promise.all(setPageGroupsPromises(user))
					.then(sites => {
						user.set('sites', sites);
						return user;
					})
					.catch(() => user);
			}

			return API.getUserByEmail(email).then(setPageGroups);
		},
		setUserStatus(data, email) {
			return API.getUserByEmail(email).then(user => {
				user.set('requestDemo', data.status);
				user.set('websiteRevenue', data.websiteRevenue);
				user.set('revenueUpperLimit', data.revenueUpperLimit);
				user.save();
				return user;
			});
		}
	};

	return API;
}
