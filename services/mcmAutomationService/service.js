var AdPushupError = require('../../helpers/AdPushupError'),
	adpushupEvent = require('../../helpers/adpushupEvent'),
	consts = require('../../configs/commonConsts'),
	globalModel = require('../../models/globalModel'),
	adsenseModel = require('../../models/adsenseModel'),
	userModel = require('../../models/userModel'),
	uuid = require('node-uuid'),
	Promise = require('bluebird'),
	io = null,
	baMachine = null,
	sendToBa = function(command, dataToSend, client, callback) {
		if (!baMachine) {
			client.emit('err', new AdPushupError('No BA machine connected.'));
			return false;
		}
		function doIt(data) {
			if (typeof callback === 'function') {
				callback(data);
			}
		}
		baMachine.emit(command, dataToSend);
		baMachine.once(command, doIt);
	},
	sendToBaPromise = function(command, dataToSend, timeout) {
		adpushupEvent.once('baDisconnected', callback);
		var requestId = uuid.v4(),
			promise = new Promise(function(resolve, reject) {
				dataToSend.requestId = requestId;
				if (!baMachine) {
					removerListener();
					reject(new AdPushupError('No BA machine connected.'));
				}
				baMachine.emit(command, dataToSend);
				baMachine.on(command, function(recievedData) {
					if (recievedData.requestId === requestId) {
						delete recievedData.requestId;
						if (promise.isPending()) {
							removerListener();
							if (recievedData.success) {
								resolve(recievedData);
							} else {
								reject(recievedData);
							}
						}
						return;
					}
				});
			});
		function rejectIfPending(msg) {
			if (promise.isPending()) {
				removerListener();
				promise._reject(msg);
			}
		}
		function callback() {
			rejectIfPending(new AdPushupError('BA machine disconnected.'));
		}
		function removerListener() {
			adpushupEvent.removeListener('baDisconnected', callback);
		}

		if (timeout) {
			setTimeout(rejectIfPending.bind(this, new AdPushupError('Promise expired.')), parseInt(timeout, 10));
		}
		return promise;
	},
	start = function(server) {// socket server instance
		io = require('socket.io')(server);
		io.on('connection', function(client) {
			client.on('getMcmLink', function(data) {// sent by the client from browser
				globalModel.findInviteIncache(data.email)// check chached invited
					.then(function(invite) {
						if (invite) {// if chached invite fount then send it to the user
							client.emit('inviteLink', { success: true, link: invite.link });
							return;
						}
						sendToBa('generateMcmLink', data, client, function(dataRecieved) {// else send request to browser automation machine to create invite
							if (dataRecieved.success === true) {
								client.emit('inviteLink', { success: true, link: dataRecieved.link });
								globalModel.addToQueue(consts.Queue.MCM_LINKS, dataRecieved);
							} else {
								client.emit('err', { success: false, lastcommand: 'getMcmLink', message: dataRecieved.message });
							}
						});
					});
			});

			client.on('verifyMcmInvitation', function(data) {
				var pubId = null,
					getUser = userModel.getUserByEmail(data.userEmail),
					getAgencyuser = getUser.then(function(user) {
						var networkData = user.getNetworkDataSync('ADSENSE');
						if (!networkData) {
							throw new AdPushupError(consts.errors.NO_ADSENSE_ACCOUNT_CONNECTED);
						}
						pubId = networkData.pubId;
						return user.getAgencyuser();
					});
				Promise.join(getUser, getAgencyuser, function(user, agencyUser) {
					return adsenseModel.getAdsense(agencyUser)
						.then(function(adsense) {
							return adsense.doesAccountExists(pubId);
						})
						.then(function(status) {
							if (status) {
								user.getNetworkDataObj('ADSENSE').set('isInMcm', true, true);
								user.getNetworkDataObj('ADSENSE').set('adsenseConnected', true, true);
								user.save();
							}
							return status;
						});
				}).then(function(status) {
					if (status) {
						client.emit('isMcmInvitationComplete', { success: true, msg: 'User is verified' });
					} else {
						client.emit('isMcmInvitationComplete', { success: false, msg: 'User is not verified' });
					}
				}).catch(function(err) {
					client.emit('err', { success: false, lastcommand: 'verifyMcmInvitation', msg: err });
				});
			});

			client.on('iamBa', function() {
				baMachine = client;
			});

			client.on('disconnect', function() {
				if (baMachine === client) {
					baMachine = null;
					adpushupEvent.emit('baDisconnected');
				}
			});
		});
	};

module.exports = {
	start: start,
	sendToBaPromise: sendToBaPromise
};
