var AdPushupError = require('../../helpers/AdPushupError'),
	globalModel = require('../../models/globalModel'),
	mcmService = require('../mcmAutomationService/service'),
	consts = require('../../configs/commonConsts'),
	later = require('later'),
	inProgress = false,
	schedule = later.parse.text('every 1 min');

function cancelInvites() {
	if (inProgress) {
		return false;
	}
	inProgress = true;

	globalModel.getExpiringInvites()
		.then(function(invites) {
			if (!invites || !invites.length) {
				throw new AdPushupError(consts.errors.NO_INVITES_TO_CANCEL);
			}
			return mcmService.sendToBaPromise('cancelMcmLinks', { inviteIds: invites }, invites.length * (20 * 1000)); // set expiry as it roughly takes 20 seconds for each invite to get cancelled
		})
		.then(function(data) {
			return globalModel.removeInvitesFromQueue(data.inviteIds);
		}).then(function() {
			console.log('Invite cancelation complete');
			inProgress = false;
		})
		.catch(function(err) {
			inProgress = false;
			console.log(err);
		});
}

later.setInterval(cancelInvites, schedule);
