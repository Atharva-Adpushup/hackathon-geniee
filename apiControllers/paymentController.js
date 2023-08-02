const express = require('express');
const { errorHandler } = require('../helpers/routeHelpers');

const router = express.Router();
const {
	sendSuccessResponse,
	sendErrorResponse,
	getMonthStartDate,
	getMonthEndDate
} = require('../helpers/commonFunctions');
const HTTP_STATUSES = require('../configs/httpStatusConsts');
const { sendDataToAuditLogService } = require('../helpers/routeHelpers');
const { sendEmail } = require('../helpers/queueMailer');

const { fetchReports } = require('../apiServices/reportsService');
const { generateDiscrepancyReport } = require('../apiServices/paymentReconciliationService');

const cbQuery = require('../apiServices/paymentServices');
const {
	AUDIT_LOGS_ACTIONS: { PAYMENT_SETTINGS }
} = require('../configs/commonConsts');
const config = require('../configs/config');
const { getEmailContent } = require('../helpers/mgDealsEmailUtils');

const getQuarter = date => {
	const month = Number(date.getMonth());
	return parseInt(month / 3, 0) + 1;
};

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

	return fetchReports(reportConfig);
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
	.get('/getAllMgDeals', (req, res) => {
		const { month, year } = req.query;
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
	})
	.get('/getMGDeals', (req, res) => {
		const { email, isSuperUser } = req.user;
		if (!isSuperUser) {
			const err = { message: 'unauthorized access' };
			return errorHandler(err, res, HTTP_STATUSES.UNAUTHORIZED);
		}

		cbQuery
			.getMGDeals(email)
			.then(data => {
				if (data.length) {
					sendSuccessResponse(data, res);
				} else {
					sendSuccessResponse([], res);
				}
			})
			.catch(err => errorHandler(err, res, HTTP_STATUSES.INTERNAL_SERVER_ERROR));
	})
	.post('/setMGDeals', (req, res) => {
		const { email, originalEmail, isSuperUser } = req.user;
		const { mgDeals, type, newDeal } = req.body;
		if (!isSuperUser) {
			const err = { message: 'unauthorized access' };
			return errorHandler(err, res, HTTP_STATUSES.UNAUTHORIZED);
		}

		cbQuery
			.setMGDeals(email, mgDeals)
			.then(data => {
				sendSuccessResponse(data, res);
				const { supportMails } = config.mgDealsAlerts;
				const { dealValues, siteId } = newDeal;
				const { body, subject } = getEmailContent({ type, email, dealValues, originalEmail, siteId });
				sendDataToAuditLogService({
					siteId : newDeal.siteId,
					siteDomain: newDeal.siteDomain,
					appName: PAYMENT_SETTINGS.MG_DEALS,
					type,
					impersonateId: email,
					userId: originalEmail,
					prevConfig: mgDeals,
					currentConfig: newDeal,
					action: {
						name: type,
						data: newDeal
					}
				});
				sendEmail({
					queue: 'MAILER',
					data: {
						to: supportMails,
						body,
						subject
					}
				});
			})
			.catch(err => {
				errorHandler(err, res, HTTP_STATUSES.INTERNAL_SERVER_ERROR);
			});
	})
	.get('/getPaymentDiscrepancy', async (req, res) => {
		const { month, year } = req.query || {};
		if (!month || !year) {
			return errorHandler('err', res, HTTP_STATUSES.BAD_REQUEST);
		}

		try {
			const date = new Date(`${year}-${month}`);
			const discrepancyConfig = { reportConfig: { date, month, year } };
			const data = await generateDiscrepancyReport(discrepancyConfig);
			return sendSuccessResponse(data, res);
		} catch (e) {
			return errorHandler('err', res, HTTP_STATUSES.INTERNAL_SERVER_ERROR);
		}
	});

module.exports = router;
