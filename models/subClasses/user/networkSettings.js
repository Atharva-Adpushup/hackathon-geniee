var model = require('../../../helpers/model'),
	consts = require('../../../configs/commonConsts'),
	NetworkSettings = model.extend(function() {
		this.merging = true;
		this.mergingPriority = consts.enums.priorities.NEW_OBJECT;
		this.mergeExtraKeys = true;
		this.mergingKey = 'networkName';

		this.keys = ['networkName', 'refreshToken', 'expiresIn', 'accessToken', 'adsenseEmail', 'userInfo', 'adsenseAccounts', 'pubId'];
		this.defaults = {
			adsenseAccounts: [],
			isInMcm: false,
			adsenseConnected: false
		};
		this.constructor = function(data, force) {
			this.super(data, force);
		};
	});

module.exports = NetworkSettings;

