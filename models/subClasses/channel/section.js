var model = require('../../../helpers/model'),
	consts = require('../../../configs/commonConsts'),
	Section = model.extend(function() {
		this.merging = true;
		this.mergingPriority = consts.enums.priorities.NEW_OBJECT;
		this.mergeExtraKeys = true;
		this.mergingKey = 'sectionMd5';
		this.keys = ['id', 'channelId', 'xpath', 'operation', 'name', 'actions', 'sectionMd5', 'ads', 'actions', 'adCode', 'isIncontent', 'inContentSettings'];
		this.clientKeys = ['id', 'xpath', 'operation', 'channelId', 'name', 'sectionMd5', 'actions', 'adCode', 'isIncontent', 'inContentSettings'];
		this.defaults = {
			'impressions': 0,
			'clicks': 0,
			'ads': [],
			'actions': []
		};

		this.constructor = function(data, force) {
			this.super(data, force);
		};
	});

module.exports = Section;
