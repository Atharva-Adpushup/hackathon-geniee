import axiosInstance from '../helpers/axiosInstance';

export function saveHbRule(hbRule, dataForAuditLogs) {
	return axiosInstance.post('/ops/rules', {
		hbRule,
		dataForAuditLogs
	});
}
export function updateHbRule(hbRuleData, dataForAuditLogs) {
	return axiosInstance.put('/ops/rules', {
		hbRuleData,
		dataForAuditLogs
	});
}
