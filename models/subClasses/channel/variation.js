var model = require('../../../helpers/model'),
	sectionModel = require('./section'),
	consts = require('../../../configs/commonConsts'),
	Variation = model.extend(function() {
		this.merging = true;
		this.mergingPriority = consts.enums.priorities.NEW_OBJECT;
		this.mergeExtraKeys = true;
		this.mergingKey = 'id';
		this.keys = ['id', 'name', 'trafficDistribution', 'createTs', 'customJs', 'sections'];
		this.clientKeys = ['id', 'name', 'trafficDistribution', 'createTs', 'customJs', 'sections'];
		this.defaults = {};

		this.classMap = { 'sections': sectionModel };
		this.constructor = function(data, force) {
			this.super(data, force);
		};
	});

module.exports = Variation;
