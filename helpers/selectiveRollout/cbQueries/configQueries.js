const commonConsts = require('../../../configs/commonConsts');

function getSiteConfigQuery(siteId) {
	return `
		SELECT apConfigs.selectiveRolloutConfig 
		FROM AppBucket 
		WHERE meta().id LIKE "${commonConsts.docKeys.site}%" 
		AND siteId = ${siteId}
	`;
}

function getSelectiveRolloutFeatureQuery(service, feature) {
	const FEATURE_LIST_GROUP_BY_FEATURE = `
		SELECT
			selectiveRolloutDoc.feature,
			ARRAY_AGG(siteDoc.siteId) AS sites,
			ARRAY_DISTINCT(ARRAY_AGG(siteDoc.ownerEmail)) AS users
		FROM AppBucket AS siteDoc
		JOIN AppBucket AS selectiveRolloutDoc
		ON KEYS "srfc::" || siteDoc.apConfigs.selectiveRolloutConfig.feature
		WHERE META(siteDoc).id LIKE "site::%"
			AND META(selectiveRolloutDoc).id LIKE "srfc::%"
			AND siteDoc.apConfigs.selectiveRolloutConfig IS NOT MISSING
			AND siteDoc.apConfigs.selectiveRolloutConfig.feature IS NOT MISSING
			AND siteDoc.apConfigs.selectiveRolloutConfig.enabled = TRUE
			${feature ? `AND siteDoc.apConfigs.selectiveRolloutConfig.feature = "${feature}"` : ''}
			${
				service
					? `
				AND selectiveRolloutDoc.dependencies.${service} IS NOT MISSING
				AND selectiveRolloutDoc.dependencies.${service}.selectivelyRolledOut = TRUE
			`
					: ''
			}
		GROUP BY selectiveRolloutDoc.feature;
	`;

	return FEATURE_LIST_GROUP_BY_FEATURE;
}
module.exports = {
	getSiteConfigQuery,
	getSelectiveRolloutFeatureQuery
};
