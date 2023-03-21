const express = require('express');
const moment = require('moment');
const { errorHandler } = require('../helpers/routeHelpers');

const router = express.Router();
const { sendSuccessResponse, sendErrorResponse } = require('../helpers/commonFunctions');
const HTTP_STATUSES = require('../configs/httpStatusConsts');
const { sendDataToAuditLogService } = require('../helpers/routeHelpers');
const { sendEmail } = require('../helpers/queueMailer');

const cbQuery = require('../apiServices/paymentServices');
const {
	AUDIT_LOGS_ACTIONS: { PAYMENT_SETTINGS }
} = require('../configs/commonConsts');

const { getReports } = require('../apiServices/reportsService');

const getQuarter = date => {
	const month = Number(date.getMonth());
	return parseInt(month / 3, 0) + 1;
};

const getMonthStartDate = date =>
	moment(date)
		.startOf('month')
		.format('YYYY-MM-DD');

const getMonthEndDate = date =>
	moment(date)
		.endOf('month')
		.format('YYYY-MM-DD');

const getSelectedDurationMgData = (mgDealsData, duration) => {
	const { quarter, year } = duration;
	const requiredData = [];

	mgDealsData.forEach(mgDealData => {
		const { mgDeal: { quarterWiseData, mgType } = {}, email } = mgDealData;

		const requiredQuarterData = quarterWiseData.find(
			quaterData => Number(quaterData.year) === Number(year) && quaterData.quarter === quarter
		);

		if (!requiredQuarterData) {
			return;
		}

		const revenueData = { ...requiredQuarterData, email, mgType };
		requiredData.push(revenueData);
	});

	return requiredData;
};

const getGlobalReportingData = date => {
	const monthStartDate = getMonthStartDate(date);
	const monthEndDate = getMonthEndDate(date);

	// Set Global Site Level Revenue Data Config
	const reportConfig = {
		fromDate: monthStartDate,
		toDate: monthEndDate,
		interval: 'cumulative',
		dimension: 'siteid',
		isSuperUser: 'true',
		siteId: ''
	};

	return getReports(reportConfig);
};

const processMgDealsData = async (mgDealsData, duration) => {
	const { month, year } = duration;
	if (!month || !year) {
		return Promise.reject(new Error('Invalid Request'));
	}
	const date = new Date(`${year}-${month}`);

	const quarterValue = getQuarter(date);
	// eslint-disable-next-line no-param-reassign
	duration.quarter = quarterValue;

	const allAccountsMgDetails = getSelectedDurationMgData(mgDealsData, duration);

	try {
		const reportingData = await getGlobalReportingData(date);
		return { allAccountsMgDetails, reportingData };
	} catch (e) {
		return Promise.reject(new Error('Error while getting Global Data'));
	}
};

router
	.get('/getPaymetHistory', (req, res) => {
		const { email } = req.user;
		cbQuery
			.getPaymetHistory(email)
			.then(data => {
				if (data.length) {
					sendSuccessResponse(data[0].release_amount, res);
				} else {
					sendSuccessResponse([], res);
				}
			})
			.catch(err => errorHandler(err, res, HTTP_STATUSES.INTERNAL_SERVER_ERROR));
	})
	.get('/getMiscellaneous', (req, res) => {
		const { email } = req.user;
		cbQuery
			.getMiscellaneous(email)
			.then(data => {
				if (data.length && data[0].availableBalance) {
					sendSuccessResponse(data[0].availableBalance, res);
				} else {
					sendSuccessResponse([], res);
				}
			})
			.catch(err => errorHandler(err, res, HTTP_STATUSES.INTERNAL_SERVER_ERROR));
	})
	.post('/requestPayment', (req, res) => {
		const { email } = req.user;
		const response = {
			error: false
		};
		const reqAmt = JSON.stringify(req.body.data);

		const { getPaymetHistory, setRequestAmountDetails } = cbQuery;
		getPaymetHistory(email).then(data =>
			setRequestAmountDetails(email, reqAmt)
				.then(reqAmtArr => {
					const { originalEmail } = req.user;
					const {
						data: { amtToRelease, created_date: createdDate },
						dataForAuditLogs
					} = req.body;
					const { appName, type = 'account' } = dataForAuditLogs;
					const siteId = '';
					const siteDomain = '';
					if (amtToRelease && createdDate) {
						sendEmail({
							queue: 'MAILER',
							data: {
								to: 'accounts@adpushup.com',
								body: `G4G requests ${amtToRelease}$ on ${createdDate}`,
								subject: 'G4G payment Request'
							}
						});
					}

					sendDataToAuditLogService({
						siteId,
						siteDomain,
						appName,
						type,
						impersonateId: email,
						userId: originalEmail,
						prevConfig: (data.length && data[0].release_amount) || {},
						currentConfig: (reqAmtArr.length && reqAmtArr[0].release_amount) || {},
						action: {
							name: PAYMENT_SETTINGS.PAYMENT_BALANCE,
							data: `REQUEST BALANCE`
						}
					});
					return res.send(Object.assign(response, { status: 200 }));
				})
				.catch(() => {
					res.send(response, { error: true, message: 'Message Failed' });
				})
		);
	})
	.post('/setAvailableBalance', (req, res) => {
		const response = {
			error: false
		};
		const { email } = req.user;
		const body = JSON.stringify(req.body.data);
		const { total_revenue: totalRevenue } = req.body.data;
		const { setAvailableBalance, storeBalanceRecord, getMiscellaneous } = cbQuery;
		getMiscellaneous(email).then(data =>
			setAvailableBalance(email, totalRevenue)
				.then(() => {
					storeBalanceRecord(email, body);
				})
				.then(() => {
					const { originalEmail } = req.user;
					const { dataForAuditLogs } = req.body;
					const { appName, type = 'account' } = dataForAuditLogs;
					const siteId = '';
					const siteDomain = '';
					sendDataToAuditLogService({
						siteId,
						siteDomain,
						appName,
						type,
						impersonateId: email,
						userId: originalEmail,
						prevConfig: { availableBalance: (data.length && data[0].availableBalance) || 0 },
						currentConfig: { availableBalance: totalRevenue },
						action: {
							name: PAYMENT_SETTINGS.PAYMENT_BALANCE,
							data: `BALANCE UPDATE`
						}
					});
					return res.send(Object.assign(response, { status: 200 }));
				})
				.catch(() => {
					res.send(response, { error: true, message: 'Message Failed' });
				})
		);
	})
	.post('/updateStatus', (req, res) => {
		const response = {
			error: false
		};
		const { email, originalEmail } = req.user;
		const { details, dataForAuditLogs } = req.body;
		const { appName, type = 'account' } = dataForAuditLogs;
		const { id, status } = details;
		const { updateStatus, getStatus } = cbQuery;
		const siteId = '';
		const siteDomain = '';
		getStatus(email).then(data =>
			updateStatus(email, id, status)
				.then(e => {
					sendDataToAuditLogService({
						siteId,
						siteDomain,
						appName,
						type,
						impersonateId: email,
						userId: originalEmail,
						prevConfig: (data.length && data[0].release_amount) || {},
						currentConfig: (e.length && e[0].release_amount) || 0,
						action: {
							name: PAYMENT_SETTINGS.PAYMENT_BALANCE,
							data: `STATUS UPDATE`
						}
					});
					return res.send(
						Object.assign(response, { release_amount: e[0].release_amount, status: 200 })
					);
				})
				.catch(() => res.send(Object.assign(response, { error: true })))
		);
	})
	.get('/getStatus', (req, res) => {
		const { email } = req.user;
		cbQuery
			.getStatus(email)
			.then(data => {
				if (data.length && data[0].availableBalance) {
					sendSuccessResponse(data[0].availableBalance, res);
				} else {
					sendSuccessResponse(0, res);
				}
			})
			.catch(err => errorHandler(err, res, HTTP_STATUSES.INTERNAL_SERVER_ERROR));
	})
	.get('/getAllMgDeals/:month/:year', (req, res) => {
		const { month, year } = req.params;
		cbQuery
			.getAllMgDeals()
			.then(async data => {
				const duration = { month, year };
				try {
					const mgDealsRawData = await processMgDealsData(data, duration);
					sendSuccessResponse(mgDealsRawData, res);
				} catch (error) {
					sendErrorResponse(
						{
							message: 'Error occured while processing MG Deals Data'
						},
						res
					);
				}
			})
			.catch(err => errorHandler(err, res, HTTP_STATUSES.INTERNAL_SERVER_ERROR));
	});

module.exports = router;
