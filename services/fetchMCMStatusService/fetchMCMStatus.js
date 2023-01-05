const NetworkService = require('./NetworkService');
const config = require('./config');
const { couchbaseService } = require('node-utils');
const globalConfig = require('../../configs/config');
const utility = require('./utility');

const appBucket = couchbaseService(
	`couchbase://${globalConfig.couchBase.HOST}`,
	'AppBucket',
	globalConfig.couchBase.DEFAULT_USER_NAME,
	globalConfig.couchBase.DEFAULT_USER_PASSWORD
);

const fetchAllNetworks = async function getAllNetworksFromService() {
	try {
		const networkService = new NetworkService(config);
		await networkService.initService();
		return await networkService.getAllNetworks();
	} catch (error) {
		console.error(error);
	}
};

const getChildPublishers = function getChildPublishersForNetwork(network) {
	if (Array.isArray(network.childPublishers) && network.childPublishers.length) {
		return { [network.networkCode]: network.childPublishers };
	}
	return null;
};

const getMCMStatus = async function getMCMStatusForNetworks(requiredNetworks = []) {
	let networks = await fetchAllNetworks();
	if (!(Array.isArray(networks) && networks.length)) {
		throw new Error('No Networks found in GAM with provided credentials');
	}
	if (requiredNetworks.length) {
		networks = networks.filter(network => requiredNetworks.includes(network.networkCode));
	}
	let results = {};
	for (const network of networks) {
		results = { ...results, ...getChildPublishers(network) };
	}
	return results;
};

const saveMCMStatus = async function saveMCMStatusInDatabase(MCMstatus) {
	for (const parentNetwork of Object.keys(MCMstatus)) {
		for (const childNetwork of MCMstatus[parentNetwork]) {
			try {
				if (!childNetwork.childNetworkCode) {
					continue;
				}
				const docId = `ntwk::${childNetwork.childNetworkCode}`;
				let doc = await appBucket.getDoc(docId);
				doc = doc.value;
				const oldMCMStatus = doc.MCMStatus;
				const statusApproved =
					oldMCMStatus &&
					oldMCMStatus.proposedDelegationType &&
					childNetwork.approvedDelegationType;
				const statusUpdated =
					oldMCMStatus && (oldMCMStatus.status != childNetwork.status || statusApproved);

				if (!oldMCMStatus || statusUpdated) {
					doc.MCMStatus = childNetwork;
					await appBucket.updateDoc(docId, doc);
					let emailBody;
					if (oldMCMStatus) {
						emailBody = `<p>MCM Status Changed from ${oldMCMStatus.status} to ${childNetwork.status} for GAM ${childNetwork.childNetworkCode} </p>`;
					} else {
						emailBody = `<p>MCM Status Approved For for GAM ${childNetwork.childNetworkCode} </p>`;
					}
					const emailSubject = 'MCM Status changed';
					utility.sendEmail({
						queue: 'MAILER',
						data: {
							to: config.statusUpdateEmail, //
							body: emailBody,
							subject: emailSubject
						}
					});
				}
			} catch (err) {
				if (err.code && err.code === 13 && err.message.includes('key does not exist')) {
					continue;
				} else throw err;
			}
		}
	}
};

async function main() {
	const startService = async retries => {
		try {
			await getMCMStatus().then(saveMCMStatus);
			process.exit(0);
		} catch (error) {
			if (retries === config.maximum_Retries) {
				await utility.handleError(error);
				process.exit(1);
			}
			setTimeout(startService, retries * 1000, ++retries);
		}
	};
	startService(1);
}

module.exports = main;
