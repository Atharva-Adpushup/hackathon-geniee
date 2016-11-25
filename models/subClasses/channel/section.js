var model = require('../../../helpers/model'),
	adModel = require('./ad'),
	consts = require('../../../configs/commonConsts'),
	Section = {
		merging: true,
		mergingPriority: consts.enums.priorities.NEW_OBJECT,
		mergeExtraKeys: true,
		mergingKey: 'id',
		keys: ['id', 'xpath', 'operation', 'name', 'allXpaths', 'ads', 'partnerData'],
		clientKeys: ['id', 'xpath', 'operation', 'name', 'allXpaths', 'ads', 'partnerData'],
		defaults: {},
		classMap: { 'ads': adModel }
	};

module.exports = Section;
