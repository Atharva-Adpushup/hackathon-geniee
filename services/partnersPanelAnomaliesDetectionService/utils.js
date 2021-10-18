const CustomError = require('./CustomError');
const Emailer = require('./emailer');

const axiosErrorHandler = err => {
	console.log(err);
	if (err.response) {
		throw new CustomError(
			`${err.response.data.Message} - ${err.response.status} ${err.response.statusText}`
		);
	} else if (err.request) {
		throw new CustomError(`${err.toString()}`);
	} else {
		throw err;
	}
};

const requestErrorHandler = err => {
	console.log(err);
	throw err;
};

/* diff field name for SiteId and Revenue for each partner */
const aggregateWeeklyData = (reportData, DOMAIN_FIELD_NAME, REVENUE_FIELD) => {
	// 1. group by domain
	var obj = reportData.reduce((acc, item) => {
		if(!acc[item[DOMAIN_FIELD_NAME]]) {
			acc[item[DOMAIN_FIELD_NAME]] = [];
		}
		acc[item[DOMAIN_FIELD_NAME]].push(item)
		return acc;
	}, {})

	// 2. aggregate revenue of grouped site's data
	var res = [];
	for(let site in obj) {
		let aggregatedDataForEachSite = obj[site].reduce((acc, item) => {
			if(!acc[DOMAIN_FIELD_NAME]) {
				acc = {
					[DOMAIN_FIELD_NAME]: item[DOMAIN_FIELD_NAME],
					[REVENUE_FIELD]: 0
				}
			}
			acc[REVENUE_FIELD] += +item[REVENUE_FIELD]
			return acc;
		}, {})
		res.push(aggregatedDataForEachSite)
	}
	return res;
}

const partnerModuleErrorHandler = async (module, err) => {
	console.log(err);
	if (err instanceof CustomError) {
		await sendErrorNotification(err, module);
	}
	return {
		total: 0,
		anomalies: 0,
		partner: module,
		message: err.toString(),
		status: 'Error'
	};
};
const couchbaseErrorHandler = err => {
	console.log(err);
	if (err.message) {
		throw new CustomError(`${err.toString()} - ${err.code} ${err.message}`);
	} else {
		throw err;
	}
};

const sendErrorNotification = async (err, module) => {
	console.log(err);
	await Emailer.serviceErrorNotificationMailService(err, module);
};

module.exports = {
	axiosErrorHandler,
	requestErrorHandler,
	partnerModuleErrorHandler,
	couchbaseErrorHandler,
	sendErrorNotification,
	aggregateWeeklyData
};
