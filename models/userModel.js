var modelAPI = module.exports = apiModule(),
	model = require('../helpers/model'),
	couchbase = require('../helpers/couchBaseService'),
	query = require('couchbase-promises').ViewQuery.from('app', 'sitesByUser'),
	networkSettings = require('../models/subClasses/user/networkSettings'),
	globalModel = require('../models/globalModel'),
	siteModel = require('../models/siteModel'),
	consts = require('../configs/commonConsts'),
	utils = require('../helpers/utils'),
	schema = require('../helpers/schema'),
	_ = require('lodash'),
	md5 = require('md5'),
	normalizeurl = require('normalizeurl'),
	FormValidator = require('../helpers/FormValidator'),
	AdPushupError = require('../helpers/AdPushupError'),
	Config = require('../configs/config'),
	Mailer = require('../helpers/Mailer'),
	jadeParser = require('simple-jade-parser'),
	Promise = require('bluebird'),
	request = require('request-promise'),
	User = model.extend(function() {
		this.keys = ['firstName', 'lastName', 'email', 'salt', 'passwordMd5', 'sites', 'adNetworkSettings', 'createdAt',
			'passwordResetKey', 'passwordResetKeyCreatedAt', 'requestDemo', 'requestDemoData', 'analytics', 'adNetworks', 
			'pageviewRange', 'managedBy', 'userType', 'websiteRevenue', 'crmDealId', 'revenueUpperLimit', 'preferredModeOfReach', 
			'revenueLowerLimit', 'revenueAverage', 'adnetworkCredentials'];
		this.validations = schema.user.validations;
		this.classMap = {
			adNetworkSettings: networkSettings
		};
		this.defaults = {
			sites: [],
			adNetworkSettings: [],
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
			return Promise.resolve(_.find(this.get('sites'), { 'domain': domain }));
		};

		this.getSiteById = function(siteId) {
			return Promise.resolve(_.find(this.get('sites'), { 'siteId': siteId }));
		};

		this.addSite = function(domain) {
			var me = this,
				normalizedDomain = normalizeurl(domain);

			return this.getSiteByDomain(normalizedDomain).then(function(site) {
				if (site) {
					return site;
				}
				return globalModel.incrSiteId().then(function(siteId) {
					me.get('sites').push({ siteId: siteId, domain: normalizedDomain });
					return ({ siteId: siteId, domain: normalizedDomain });
				});
			});
		};

		this.getNetworkData = function(networkName, keys) {
			return Promise.resolve(this.getNetworkDataSync(networkName, keys));
		};

		this.getNetworkDataObj = function(networkName) {
			var data = _.find(this.get('adNetworkSettings'), function(networkInfo) {
				return (networkInfo.networkName === networkName);
			});
			if (!data) {
				return false;
			}
			return data;
		};

		this.getNetworkDataSync = function(networkName, keys) {
			var data = this.getNetworkDataObj(networkName), dataPubId;

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
				if (!me.get('adNetworkSettings')) {// some how we don't have this object then create an empty array;
					me.set('adNetworkSettings', []);
				}
				var adNetworkSettings = me.get('adNetworkSettings');
				adNetworkSettings.push(data);
				me.set('adNetworkSettings', adNetworkSettings);
				return me.save().then(function() {
					return resolve(me);
				}).catch(function(err) {
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
			return this.get('email') === email && this.get('passwordMd5') === md5(this.get('salt') + pass + this.get('salt'));
		};

		this.getAllSites = function() {
			query.range(this.get('email'), this.get('email'), true);
			return couchbase.queryViewFromAppBucket(query)
				.then(function(results) {
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
					var ad = null, activeSite = null;
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
	});

function apiModule() {
	var API = {
		getUserByEmail: function(email) {
			return couchbase.connectToAppBucket().then(function(appBucket) {
				return appBucket.getAsync('user::' + email, {});
			}).then(function(userJson) {
				return new User(userJson.value, userJson.cas);
			});
		},
		verifySiteOwner: function(email, siteId, options) {
			return API.getUserByEmail(email).then(function(user) {
				if(options && options.fullSiteData) {
					return siteModel.getSiteById(parseInt(siteId, 10)).then(function(site) {
						if (site) {
							return { user: user, site: site };
						}

						throw new Error('Invalid Site');
					});
				}
				else {
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
			var normalizedDomain = utils.rightTrim(normalizeurl(domain), '/');// normalize and remove slash from the end
			return API.getUserByEmail(email).then(function(user) {
				return user.addSite(normalizedDomain).then(function(site) {
					return user.save().then(function(userObj) {
						return [userObj, site.siteId];
					});
				});
			});
		},
		createUserFromJson: function(json) {
			return Promise.resolve(new User(json));
		},
		createNewUser: function(json) {
			return FormValidator.validate(json, schema.user.validations)
				.then(API.getUserByEmail.bind(null, json.email))
				.then(function(user) {
					if (user) {
						var error = { 'email': ['User with email ' + json.email + ' already exists'] };
						throw new AdPushupError(error);
					}
				})
				.catch(function(e) {
					if (e instanceof AdPushupError) {
						throw e;
					} else if (e.name && e.name === 'CouchbaseError') {
						return API.createUserFromJson(json)
							.then(function(user) {
								user.set('createdAt', +new Date());
								user.set('salt', consts.SALT + utils.random(0, 100000000));
								user.set('pageviewRange', json.pageviewRange);
								user.set('passwordMd5', md5(user.get('salt') + json.password + user.get('salt')));
								!json.userType ? user.set('managedBy', 'adsense.apac@adpushup.com') : '';
								return user;
							})
							.then(function(user) {
								if(json.userType && json.userType === 'partner') {
									return user;
								}
								var analyticsObj, userId = user.get('email'),
									anonId = json.anonId,
									pipeDriveParams = {
										'txt_name': user.get('firstName'),
										'txt_email_id': user.get('email'),
										'txt_website': json.site,
										'txt_pvs': user.get('pageviewRange'),
										'txt_platform': 'undefined',
										'txt_ad_network': user.get('adNetworks').join(' | '),
										'txt_website_revenue' : user.get('websiteRevenue'),
										'txt_stage_id': 64
									},
									pipeDriveOptions = {
										'method': 'POST',
										'uri': consts.analytics.PIPEDRIVE_URL,
										'form': pipeDriveParams
									};

								if (anonId && !user.get('analytics')) {
									analyticsObj = {
										'anonymousId': anonId,
										'userId': userId,
										'isUserIdentified': true
									};
									user.set('analytics', analyticsObj);
								}
								process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
								return request(pipeDriveOptions).then(function(res) {
								if(res) {
										var responseString = res.toString(),
											dealId = responseString.substring(responseString.lastIndexOf(":")+1,responseString.lastIndexOf(";"));
										user.set('crmDealId', dealId);
									}
									return user;
								}).catch(function(err) {
									throw err;
								});
							})
							.then(function(user) {
								return user.addSite(json.site).then(function() {
									return user.save();
								});
							})
							.then(function(user) {
								if(json.userType === 'partner') {
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
			var mailer = new Mailer(Config.email, 'html'),
			mailHeader = 'Hi, <br/> Please find below the code snippet for your AdPushup setup. Paste this into the <strong>&lt;head&gt;</strong> section of your page - \n\n',
				mailFooter = '<br/><br/>Thanks,<br/>Team AdPushup',
				headerCode = json.code;

				headerCode = headerCode.replace(/</g, '&lt;');
				headerCode = headerCode.replace(/>/g, '&gt;');

				var content = mailHeader + '<div style="background-color: #eaeaea; padding: 20px; margin-top: 10px;">'+headerCode+'</div>' + mailFooter,
				obj = { to: json.email, subject: 'AdPushup Header Snippet', html: content };
			
			return mailer.send(obj);
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
					if (user.get('passwordResetKey') && user.get('passwordResetKeyCreatedAt') && (user.get('passwordResetKey') === options.key)) {
						if ((parseInt(user.get('passwordResetKeyCreatedAt'), 10) + (60 * 60 * 24 * 1000)) < +new Date()) {
							config = { 'keyExpired': true };
						} else {
							config = { 'email': options.email, 'key': options.key };
						}
					} else {
						config = { keyNotFound: true };
					}

					return new Promise(function(resolve) {
						if (config && (typeof config === 'object') && Object.keys(config).length > 0) {
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
					if (user.get('passwordResetKey') && user.get('passwordResetKeyCreatedAt') && (user.get('passwordResetKey') === json.key)) {
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

					if (oldPasswordMd5 && (oldPasswordMd5 === passwordMd5)) {
						json.passwordMd5 = md5(user.get('salt') + json.password + user.get('salt'));

						return user;
					}
					throw new AdPushupError({ oldPassword: ["Old Password doesn't match your current password"] });
				})
				.then(function(user) {
					_.forOwn(json, function(value, key) {
						if (user.get(key) && (user.get(key) !== value)) {
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
				.then(function(user) { return user })
				.then(function(user) {
					var sitePromises = _.map(user.get('sites'), function (site) {
						return siteModel.getSiteById(site.siteId)
							.then(function (site) {
								return {
									domain: site.get('siteDomain'),
									siteId: site.get('siteId'),
									step: site.get('step'),
									channels: site.get('channels')
								};
							}).catch(function() {
								return {
									domain: site.domain,
									siteId: site.siteId,
									step: site.step,
									channels: []
								};
							})
					});

					return Promise.all(sitePromises).then(function (sites) {
						return sites;
					});					
				});
		},
		saveCredentials: function(json, email) {
			return API.getUserByEmail(email)
				.then(function(user) {
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
				return (_(user.get('sites')).map(function(site) {
					var uniquePageGroups = siteModel.getUniquePageGroups(site.siteId),
						setupStep = siteModel.getSetupStep(site.siteId),
						cmsData = siteModel.getCmsData(site.siteId);
					return Promise.join(uniquePageGroups, setupStep, cmsData, function(pageGroups, step, cms) {
						site.step = step;
						site.cmsInfo = cms;
						site.pageGroups = pageGroups;
						return site;
					})
					.catch(function(err) {
						site.pageGroups = [];
						site.step = site.step || false;
						return site;
					});
				}));
			}

			function setPageGroups(user) {
				return Promise.all(setPageGroupsPromises(user)).then(function(sites) {
					user.set('sites', sites);
					return user;
				}).catch(function() {
					return user;
				});
			}

			return API.getUserByEmail(email).then(setPageGroups);
		},
		setUserStatus: function(data, email) {
			return API.getUserByEmail(email)
				.then(function(user) {
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
