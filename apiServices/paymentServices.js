const { appBucket } = require('../helpers/routeHelpers');
const { couchBase } = require('../configs/config');
const { upsertDoc } = require('../helpers/couchBaseService');

const cbQuery = {
	getPaymetHistory: email => {
		const query = `SELECT release_amount FROM ${couchBase.DEFAULT_BUCKET} WHERE meta().id = "balancePayment::${email}"`;
		return appBucket.queryDB(query);
	},
	setRequestAmountDetails: (email, data) => {
		const query = `UPDATE ${couchBase.DEFAULT_BUCKET} SET release_amount = ARRAY_APPEND(release_amount,${data}) WHERE meta().id = "balancePayment::${email}"
		RETURNING release_amount`;
		return appBucket.queryDB(query);
	},
	storeBalanceRecord: (email, data) => {
		const query = `UPDATE ${couchBase.DEFAULT_BUCKET} SET revenue_earned_details = ARRAY_APPEND(revenue_earned_details,${data}) WHERE meta().id = "balancePayment::${email}"`;
		return appBucket.queryDB(query);
	},
	getMiscellaneous: email => {
		const query = `SELECT availableBalance, accessBalanceUpdate FROM ${couchBase.DEFAULT_BUCKET} WHERE meta().id = 'balancePayment::${email}'`;
		return appBucket.queryDB(query);
	},
	setAvailableBalance: (email, value) => {
		const query = `UPDATE ${couchBase.DEFAULT_BUCKET} SET availableBalance = ${value} 
			WHERE meta().id = 'balancePayment::${email}'`;
		return appBucket.queryDB(query);
	},
	updateStatus: (email, id, status) => {
		const query = `UPDATE ${couchBase.DEFAULT_BUCKET} SET release_amount[i].status = "${status}" 
		FOR i: amt IN release_amount WHEN amt.id = ${id} END
		WHERE meta().id = 'balancePayment::${email}'
		RETURNING release_amount`;
		return appBucket.queryDB(query);
	},
	getStatus: email => {
		const query = `SELECT release_amount
		FROM  ${couchBase.DEFAULT_BUCKET}
		WHERE META().id = "balancePayment::${email}"`;
		return appBucket.queryDB(query);
	},
	getAllMgDeals: () => {
		const query = `select mgDeal, doc.email from AppBucket doc UNNEST doc.mgDeals as mgDeal where meta(doc).id like 'mgdl::%' and mgDeal.isActive = true`;
		return appBucket.queryDB(query);
	},
	getMGDeals: email => {
		const query = `SELECT mgDeals FROM ${couchBase.DEFAULT_BUCKET} WHERE meta().id = 'mgdl::${email}'`;
		return appBucket.queryDB(query);
	},
	setMGDeals: (email, mgDeals) => upsertDoc('AppBucket', `mgdl::${email}`, { email, mgDeals })
};
module.exports = cbQuery;
