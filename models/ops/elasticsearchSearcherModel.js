var es = require('../../helpers/elasticSearchService'),
	// eslint-disable-next-line no-unused-vars
	Promise = require('bluebird'),
	API = {
		search: function(data) {
			return es.search(data.index, data.docType, data.searchQuery).then(function(result) {
				return { success: true, data: result };
			});
		}
	};

module.exports = API;
