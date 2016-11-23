var model = require('../../../helpers/model'),
	adModel = require('./ad'),
	consts = require('../../../configs/commonConsts'),
	Section = model.extend(function() {
		this.merging = true;
		this.mergingPriority = consts.enums.priorities.NEW_OBJECT;
		this.mergeExtraKeys = true;
		this.mergingKey = 'id';
		this.keys = ['id', 'xpath', 'operation', 'name', 'allXpaths', 'ads', 'partnerData'];
		this.clientKeys = ['id', 'xpath', 'operation', 'name', 'allXpaths', 'ads', 'partnerData'];
		this.defaults = {};
		this.classMap = { 'ads': adModel };

		this.constructor = function(data, force) {
			this.super(data, force);
		};
	});

module.exports = Section;
