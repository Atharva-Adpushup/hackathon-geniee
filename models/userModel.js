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
			'passwordResetKey', 'passwordResetKeyCreatedAt', 'requestDemo',
			'requestDemoData', 'analytics', 'adNetworks', 'pageviewRange', 'managedBy', 'userType'];
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
				return (networkInfo.get('networkName') === networkName);
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

			data = data.toJSON();
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
				me.set('adNetworkSettings', data);
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
		verifySiteOwner: function(email, siteId) {
			return API.getUserByEmail(email).then(function(user) {
				return user.getSiteById(parseInt(siteId, 10)).then(function(site) {
					if (site) {
						return { user: user, site: site };
					}

					throw new Error('Invalid Site');
				});
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
								if(json.userType === 'partner') {
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
										'txt_ad_network': user.get('adNetworks').join(' | ')
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

								return request(pipeDriveOptions).then(function() {
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
		setSitePageGroups: function(email) {
			function setPageGroupsPromises(user) {
				return (_(user.get('sites')).map(function(site) {
					return siteModel.getUniquePageGroups(site.siteId)
						.then(function(pageGroups) {
							site.pageGroups = pageGroups;
							return site;
						}).catch(function() {
							site.pageGroups = [];
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
		}
	};

	return API;
}
