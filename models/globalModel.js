var couchbase = require('../helpers/couchBaseService'),
	consts = require('../configs/commonConsts'),
	_ = require('lodash'),
	AdPushupError = require('../helpers/AdPushupError'),
	API = {
		incrSiteId: function() {
			return couchbase.connectToAppBucket()
				.then(function(appBucket) {
					return appBucket.counterAsync('data::siteid', 1, { initial: 1 });
				})
				.then(function(doc) {
					return doc.value;
				});
		},
		//NOTE: Increment siteId in 'apAppBucket' bucket rather than
		// current 'appBucket' bucket
		// This is done to achieve a central database for site id incrementation
		incrSiteIdInApAppBucket: function() {
			var bucketName = 'apAppBucket',
				docName = 'data::siteid';

			return couchbase.connectToBucket(bucketName)
				.then(function(apAppBucket) {
					return apAppBucket.counterAsync(docName, 1, { initial: 1 });
				})
				.then(function(doc) {
					return doc.value;
				});
		},
		addEmail: function(email) {
			function saveEmailList(appBucket, emailList) {
				var mailList = (emailList && emailList.message) ? [] : emailList.value;

				if (mailList.indexOf(email) === -1) {
					mailList.push(email);
				}
				return appBucket.upsertAsync('data::emails', mailList, {});
			}

			return couchbase.connectToAppBucket()
				.then(function(appBucket) {
					return appBucket.getAsync('data::emails', {})
						.then(saveEmailList.bind(null, appBucket), saveEmailList.bind(null, appBucket));
				});
		},
		// generic function to add element in array type queues in db
		addToQueue: function(queueName, val) {
			function save(appBucket, list) {
				var emailList = (list && list.message) ? [] : list.value;

				if (emailList.indexOf(val) === -1) {
					emailList.push(val);
				}
				return appBucket.upsertAsync(queueName, emailList, {});
			}

			return couchbase.connectToAppBucket()
				.then(function(appBucket) {
					return appBucket.getAsync(queueName, {})
						.then(save.bind(null, appBucket))
						.catch(function(err) {
							if (err.code && err.code === 13) {
								return appBucket.insertAsync(queueName, [val], {});
							}
							throw err;
						});
				});
		},
		// generic function to remove element in array type queues in db
		removeFromQueue: function(queueName, val) {
			function save(appBucket, list) {
				var emailList = (list && list.message) ? [] : list.value;

				if (emailList.indexOf(val) !== -1) {
					emailList.splice(emailList.indexOf(val), 1);
				}
				return appBucket.upsertAsync(queueName, emailList, {});
			}

			return couchbase.connectToAppBucket()
				.then(function(appBucket) {
					return appBucket.getAsync(queueName, {})
						.then(save.bind(null, appBucket))
						.catch(function(err) {
							if (err.code && err.code === 13) {
								appBucket.insertAsync(queueName, [], {})
									.then(save.bind(null, appBucket));
							}
							throw err;
						});
				});
		},
		// generic function to get queue
		getQueue: function(queueName) {
			return couchbase.connectToAppBucket()
				.then(function(appBucket) {
					return appBucket.getAsync(queueName, {})
						.then(function(list) {
							return (list && list.message) ? [] : list.value;
						})
						.catch(function(err) {
							if (err && err.code && err.code === 13) {
								return appBucket.insertAsync(queueName, [], {})
									.then(API.getQueue.bind(null, queueName));
							}
							throw err;
						});
				});
		},
		// generic function to add element in array type queues in db
		getFirstFromQueue: function(queueName) {
			return API.getQueue(queueName)
				.then(function(list) {
					return list.length ? list[0] : false;
				})
				.catch(function(err) {
					if (err) {
						throw err;
					}

					throw new AdPushupError('Unexpected error while getting first element from queue');
				});
		},
		findInviteIncache: function(email) {
			return API.getQueue(consts.Queue.MCM_LINKS).then(function(queue) {
				return _.find(queue, { email: email });
			});
		},
		getExpiringInvites: function() {
			var data = [];
			return API.getQueue(consts.Queue.MCM_LINKS).then(function(queue) {
				_.forEach(queue, function(invite) {
					// invite more than 30 mins old
					if (((new Date().getTime() - invite.creationTs) / 60000 > 30)) {
						data.push({ inviteId: invite.inviteId });
					}
				});
				return data;
			});
		},
		removeInvitesFromQueue: function(invites) {
			return API.getQueue(consts.Queue.MCM_LINKS).then(function(queue) {
				_.remove(queue, function(elm) {
					return _.find(invites, { inviteId: elm.inviteId });
				});
				return queue;
			}).then(function(finalQueue) {
				return couchbase.connectToAppBucket()
					.then(function(appBucket) {
						return appBucket.upsertAsync(consts.Queue.MCM_LINKS, finalQueue, {});
					});
			});
		}

	};
module.exports = API;
