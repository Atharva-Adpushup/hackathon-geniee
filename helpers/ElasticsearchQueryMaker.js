var ESQueryMaker = {

	getDefaultQuery: function(bool, aggs, size, config) {
		var q = {
			'query': {
				'filtered': {
					'filter': {
						'bool': bool
					}
				}
			},
			'aggs': aggs,
			'size': size
		};

		if (config && config.query) {
			q.query.filtered.query = config.query;
		}

		return q;
	},

	createBoolFilter: function() {
		return {
			'must': [],
			'should': [],
			'must_not': []
		};
	},

	addFilterToBoolPath: function(boolFilter, boolPath, f) {
		boolFilter[boolPath].push(f);
	},

	createTermFilter: function(fieldName, fieldVal) {
		var bundle = {}, f = {};
		f[fieldName] = fieldVal;
		bundle.term = f;
		return bundle;
	},

	createExistsFilter: function(fieldVal) {
		var bundle = {}, f = {};
		f.field = fieldVal;
		bundle.exists = f;
		return bundle;
	},

	createRangeFilter: function(fieldName, gte, lte) {
		var bundle = {}, f = {};
		f[fieldName] = { 'gte': gte, 'lte': lte };
		bundle.range = f;
		return bundle;
	},

	addAggr: function(query, aggName, agg) {
		if (!query.aggs) {
			query.aggs = {};
		}
		query.aggs[aggName] = agg;
	},

	createDateHistogramAggr: function(field, interval) {
		var agg = {};
		agg.date_histogram = { 'field': field, 'interval': interval };
		return agg;
	},

	createTermsAggr: function(field, size) {
		var agg = {};
		agg.terms = { 'field': field, 'size': size };
		return agg;
	}

};

module.exports = ESQueryMaker;
