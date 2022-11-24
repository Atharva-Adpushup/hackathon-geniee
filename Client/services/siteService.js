import axiosInstance from '../helpers/axiosInstance';

export default {
	getOnboardingData: siteId =>
		siteId
			? axiosInstance.get('/site/onboarding', { params: { siteId } })
			: axiosInstance.get('/site/onboarding'),
	saveSite: (siteId, site, onboardingStage, step, dataForAuditLogs) =>
		axiosInstance.post('/data/saveSite', { siteId, site, onboardingStage, step, dataForAuditLogs }),
	saveApConfigs: (siteId, apConfigs, dataForAuditLogs) =>
		axiosInstance.post('/site/saveApConfigs', { siteId, apConfigs, dataForAuditLogs }),
	forceApBuild: (siteId, dataForAuditLogs) =>
		axiosInstance.post(`/site/${siteId}/forceApBuild`, {
			dataForAuditLogs
		}),
	forceAmpDvcBuild: siteId =>
		axiosInstance.post('/site/forceAmpDvcBuild', {
			siteId
		}),
	updateBlockListedLineItems: (siteId, blockListedLineItems, dataForAuditLogs) =>
		axiosInstance.post(`/site/updateBlockListedLineItem`, {
			dataForAuditLogs,
			siteId,
			blockListedLineItems
		}),
	setRuleEngineData: (siteId, hbRuleData, dataForAuditLogs) =>
		axiosInstance.post(`/site/${siteId}/rulesData`, {
			hbRuleData,
			dataForAuditLogs
		}),
	updateRulesEngineData: (siteId, hbRuleData, dataForAuditLogs) =>
		axiosInstance.put(`/site/${siteId}/rulesData`, {
			hbRuleData,
			dataForAuditLogs
		})
};
