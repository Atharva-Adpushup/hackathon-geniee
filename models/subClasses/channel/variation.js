var sectionModel = require('./section'),
	Variation = {
		keys: ['id', 'name', 'trafficDistribution', 'createTs', 'customJs', 'sections'],
		classMap: { 'sections': sectionModel }
	};

module.exports = Variation;
