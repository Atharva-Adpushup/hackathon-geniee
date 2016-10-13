var elasticsearch = require('elasticsearch'),
	config = require('../configs/config'),
	state = {
		client: null
	};

module.exports = {
	getClient: function() {
		if (!state.client) {
			state.client = new elasticsearch.Client(config.elasticServer);
		}
		return state.client;
	},
	deleteIndex: function(indexName) {
		return this.getClient().indices.delete({
			index: indexName
		});
	},
	initIndex: function(indexName) {
		return this.getClient().indices.create({
			index: indexName
		});
	},
	indexExists: function(indexName) {
		return this.getClient().indices.exists({
			index: indexName
		});
	},
	initMapping: function(indexName, type, properties) {
		return this.getClient().indices.putMapping({
			index: indexName,
			type: type,
			body: { properties: properties }
		});
	},
	search: function(index, type, queryBody) {
		return this.getClient().search({
			index: index,
			type: type,
			body: queryBody
		});
	}
};
