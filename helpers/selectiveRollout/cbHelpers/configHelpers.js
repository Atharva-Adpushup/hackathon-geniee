const {
	configQueries: { getSiteConfigQuery, getSelectiveRolloutFeatureQuery }
} = require('../cbQueries');
const couchbase = require('../../couchBaseService');

async function getFeaturesGroupByFeature(service, feature) {
	const query = getSelectiveRolloutFeatureQuery(service, feature);
	return couchbase.queryFromAppBucket(query);
}

async function getSiteConfig(siteId) {
	const query = getSiteConfigQuery(siteId);
	const [queryResponse = {}] = await couchbase.queryFromAppBucket(query);
	const { selectiveRolloutConfig = {} } = queryResponse;
	return selectiveRolloutConfig;
}

module.exports = {
	getFeaturesGroupByFeature,
	getSiteConfig
};
