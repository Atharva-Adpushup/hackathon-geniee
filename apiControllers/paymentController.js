const express = require('express');
const { errorHandler } = require('../helpers/routeHelpers');

const router = express.Router();
const { sendSuccessResponse } = require('../helpers/commonFunctions');
const HTTP_STATUSES = require('../configs/httpStatusConsts');
const { sendDataToAuditLogService } = require('../helpers/routeHelpers');
const cbQuery = require('../apiServices/paymentServices');
const {
	AUDIT_LOGS_ACTIONS: { PAYMENT_SETTINGS }
} = require('../configs/commonConsts');

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
		const { total_revenue } = req.body.data;
		const { setAvailableBalance, storeBalanceRecord, getMiscellaneous } = cbQuery;
		getMiscellaneous(email).then(data =>
			setAvailableBalance(email, total_revenue)
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
						currentConfig: { availableBalance: total_revenue },
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
	});

module.exports = router;
