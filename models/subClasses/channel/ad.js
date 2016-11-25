var model = require('../../../helpers/model'),
	consts = require('../../../configs/commonConsts'),
	Ad = {
		merging: true,
		mergingPriority: consts.enums.priorities.NEW_OBJECT,
		mergingKey: 'id',
		keys: ['id', 'adCode', 'css', 'height', 'width', 'network'],
		clientKeys: ['id', 'adCode', 'css', 'height', 'width', 'network'],
		defaults: {}
	};

module.exports = Ad;
