const moment = require('moment');
const { fetchReports } = require('../../../../apiServices/reportsService');

const fetchCumulativeReportingData = async siteid => {
	const toDate = moment()
		.subtract(1, 'day')
		.format('YYYY-MM-DD');
	const fromDate = moment()
		.subtract(6, 'day')
		.format('YYYY-MM-DD');

	const reportConfig = {
		isSuperUser: true,
		siteid,
		toDate,
		fromDate,
		interval: 'cumulative',
		dimension: 'page_group,section,ad_unit_type',
		ad_unit_type: '1,2,3,7',
		bypassCache: false
	};

	try {
		const response = await fetchReports(reportConfig);
		return response.result;
	} catch (err) {
		console.log('Powered By Adpushup banner service error :', err);
		return [];
	}
};

module.exports = { fetchCumulativeReportingData };
