var model = require('../../../helpers/model'),
	consts = require('../../../configs/commonConsts'),
	Ad = model.extend(function() {
		this.merging = true;
		this.mergingPriority = consts.enums.priorities.NEW_OBJECT;
		this.mergingKey = 'id';
		this.keys = ['id', 'adCode', 'css', 'height', 'width', 'network'];
		this.clientKeys = ['id', 'adCode', 'css', 'height', 'width', 'network'];
		this.defaults = {};

		this.constructor = function(data, force) {
			this.super(data, force);
		};
	});

module.exports = Ad;
