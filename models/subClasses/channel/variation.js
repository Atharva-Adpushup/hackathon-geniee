var model = require('../../../helpers/model'),
	sectionModel = require('./section'),
	consts = require('../../../configs/commonConsts'),
	Variation = {
		merging: true,
		mergingPriority: consts.enums.priorities.NEW_OBJECT,
		mergeExtraKeys: true,
		mergingKey: 'id',
		keys: ['id', 'name', 'trafficDistribution', 'createTs', 'customJs', 'sections'],
		clientKeys: ['id', 'name', 'trafficDistribution', 'createTs', 'customJs', 'sections'],
		defaults: {},
		classMap: { 'sections': sectionModel }
	};

module.exports = Variation;
