const axios = require('axios');
const { geniee } = require('./config');
const config = require('../../configs/config');
const helperUtils = require('../../helpers/utils');

const isNotProduction = config.environment.HOST_ENV !== 'production';

function updatedTypeUsedOnSite(siteobject) {
	let updatedTypes = this;
	if (!siteobject.lineItemTypes) {
		return false;
	}
	return siteobject.lineItemTypes.some(lineItemType => updatedTypes.indexOf(lineItemType) !== -1);
}

async function syncSites(siteList, networkCode) {
	const sites = siteList.join(',');
	const requestSettings = {
		method: 'GET',
		url: geniee.endpoint + geniee.siteSync,
		headers: {
			'Content-Type': 'application/json; charset=utf-8'
		},
		params: {
			sites
		}
	};

	await axios(requestSettings)
		.then(console.log(`${sites} pushed for syncing for GAM: ${networkCode}`))
		.catch(error => {
			return { error: `failed to sync sites for GAM ${networkCode}: ${error}` };
		});
}

module.exports = {
	getHash: value => {
		var hash = 0,
			i,
			chr;
		if (value.length === 0) return hash;
		for (i = 0; i < value.length; i++) {
			chr = value.charCodeAt(i);
			hash = (hash << 5) - hash + chr;
			hash |= 0; // Convert to 32bit integer
		}
		return hash;
	},
	handleUpdatedTypes: async function handleUpdatedLineItemTypes(updatedTypes, networkCode, db) {
		const getSiteTypesQuery = `
		SELECT siteId,
       		   lineItemTypes
		FROM AppBucket
		WHERE META().id LIKE "site::%"
    		AND siteId IN (
    		SELECT RAW site.siteId
    		FROM (
        		SELECT sites
        		FROM AppBucket a
        		WHERE META().id LIKE "user::%%"
            		AND adServerSettings.dfp.activeDFPNetwork = $networkCode ) AS ds
    		UNNEST sites AS site)`;

		let sitesWithTypes = await db.query(getSiteTypesQuery, { networkCode });
		let sitesToSync = sitesWithTypes.results.filter(updatedTypeUsedOnSite, updatedTypes);
		sitesToSync = sitesToSync.map(site => site.siteId);
		if (!sitesToSync.length) {
			return;
		}
		await syncSites(sitesToSync, networkCode);
		this.logToEvLogger({
			message: `Syncing site as type line Items updated: ${updatedTypes} for GAM ${networkCode}`,
			details: `sites = ${sitesToSync}`
		});
	},
	syncAllGAMSites: async function(networkCode, reason) {
		const requestSettings = {
			method: 'GET',
			url: geniee.endpoint + geniee.GAMSiteSync,
			headers: {
				'Content-Type': 'application/json; charset=utf-8'
			},
			params: {
				networkCode: networkCode
			}
		};

		await axios(requestSettings)
			.then(console.log(`sent request for syncing all connected sites for GAM: ${networkCode}`))
			.catch(error => {
				return { error: `failed to sync sites for GAM ${networkCode}: ${error}` };
			});
		this.logToEvLogger({
			message: `Syncing all GAM sites for ${networkCode} as ${reason} line Items updated`,
			details: `${reason} line Items updated`
		});
	},
	logToEvLogger: function(job) {
		if (isNotProduction) {
			console.log(`Environment is development/staging. Skipping event viewer logging.`);
			return Promise.resolve(job);
		}
		console.log(`${job.message} pushed to evLogger queue.`);
		return helperUtils.publishToRabbitMqQueue(
			config.RABBITMQ.EV_LOGGER.NAME_IN_QUEUE_PUBLISHER_SERVICE,
			{ source: 'LINE ITEM SERVICE', ...job }
		);
	}
};
