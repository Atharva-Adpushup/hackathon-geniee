var sectionModel = require('./section'),
	Variation = {
		keys: [
			'id',
			'name',
			'trafficDistribution',
			'createTs',
			'customJs',
			'sections',
			'contentSelector',
			'personalization'
		],
		classMap: { sections: sectionModel }
	};

module.exports = Variation;
