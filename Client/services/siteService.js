import axiosInstance from '../helpers/axiosInstance';

export default {
	getOnboardingData: siteId =>
		siteId
			? axiosInstance.get('/site/onboarding', { params: { siteId } })
			: axiosInstance.get('/site/onboarding'),
	saveSite: (siteId, site, onboardingStage, step) =>
		axiosInstance.post('/data/saveSite', { siteId, site, onboardingStage, step }),
	saveApConfigs: (siteId, apConfigs) =>
		axiosInstance.post('/site/saveApConfigs', { siteId, apConfigs }),
	forceApBuild: siteId => axiosInstance.post(`/site/${siteId}/forceApBuild`)
};
