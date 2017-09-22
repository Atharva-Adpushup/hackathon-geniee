var adModel = require('./ad'),
	Section = {
		keys: ['id', 'xpath', 'operation', 'name', 'allXpaths', 'ads', 'partnerData'],
		classMap: { ads: adModel }
	};

module.exports = Section;
