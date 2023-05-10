module.exports = apiModule();

const model = require('../helpers/model');
const couchbase = require('../helpers/couchBaseService');
const { docKeys } = require('../configs/commonConsts');
const commonConsts = require('../configs/commonConsts');
const N1qlQuery = require('couchbase').N1qlQuery;

const AmpSelectiveRolloutActiveBidderAdaptersList = model.extend(function() {
	this.keys = ['prebidBundleName', 'activeBiddersInAscOrder'];
	this.clientKeys = ['prebidBundleName', 'activeBiddersInAscOrder'];
	this.validations = {
		required: []
	};
	this.classMap = {};
	this.defaults = {};
	this.constructor = function(data, cas) {
		if (!data.activeBiddersInAscOrder || !data.prebidBundleName) {
			throw new Error(
				'activeBidders list and prebidBundleName are required for AmpSelectiveRolloutActiveBidderAdaptersList doc'
			);
		}
		this.key = docKeys.ampSelectiveRolloutActiveBidderAdaptersList;
		this.super(data, !!cas);
		this.casValue = cas; // if user is loaded from database which will be almost every time except first, this value will be thr
		this.updateActiveBidderAdapters = function(activeBidders) {
			this.set('prebidBundleName', getPrebidBundleName());
			this.set('activeBiddersInAscOrder', activeBidders);
			return Promise.resolve(this);
		};
	};
});

function getPrebidBundleName() {
	var timestamp = Date.now();
	return `pb.${timestamp}.js`;
}

function apiModule() {
	const API = {
		getActiveBidderAdaptersList: function() {
			return couchbase
				.connectToAppBucket()
				.then(appBucket => appBucket.getAsync(docKeys.ampSelectiveRolloutActiveBidderAdaptersList))
				.then(json => new AmpSelectiveRolloutActiveBidderAdaptersList(json.value, json.cas));
		},
		createActiveBidderAdaptersList(activeBidders) {
			const json = {
				prebidBundleName: getPrebidBundleName(),
				activeBiddersInAscOrder: activeBidders
			};
			return Promise.resolve(new AmpSelectiveRolloutActiveBidderAdaptersList(json)).then(activeBidderAdaptersList =>
				activeBidderAdaptersList.save()
			);
		},
		/**
		 * - Fetch existing doc, if found and activeBidders list is different then udpate it
		 * - If doc not found then create a new doc
		 * - If activeBidders list not changed or got any error while fetching doc then do nothing
		 */
		updateActiveBidderAdaptersIfChanged(activeBidderAdapters) {
			const newActiveBiddersInAscOrder = activeBidderAdapters.sort();
			const output = {
				activeBidderAdapters: newActiveBiddersInAscOrder,
				isUpdated: false,
				prebidBundleName: ''
			};

			// const newActiveBiddersInAscOrderString = newActiveBiddersInAscOrder.join(',');

			return API.getActiveBidderAdaptersList()
				.then(activeBidderAdaptersList => {
                    
					// We will have to upgrade the new version of prebid in type=adpushup component.
					// It is currently 4.43 and is breaking for new adapter changes.
					// Our next step should be to upgrade the prebid module and then start updating the active bidders.

					return activeBidderAdaptersList;

					/*
					const existingActiveBiddersInAscOrderString = activeBidderAdaptersList
						.get('activeBiddersInAscOrder')
						.join(',');

					if (existingActiveBiddersInAscOrderString !== newActiveBiddersInAscOrderString) {
						activeBidderAdaptersList.updateActiveBidderAdapters(newActiveBiddersInAscOrder);
						return activeBidderAdaptersList.save().then(activeBidderAdaptersList => {
							output.isUpdated = true;
							return activeBidderAdaptersList;
						});
					}

					return activeBidderAdaptersList; 
					*/
				})
				.catch(err => {
					if (err.code === 13) {
						return API.createActiveBidderAdaptersList(newActiveBiddersInAscOrder).then(
							activeBidderAdaptersList => {
								output.isUpdated = true;
								return activeBidderAdaptersList;
							}
						);
					}

					throw err;
				})
				.then(activeBidderAdaptersList => {
					output.prebidBundleName = activeBidderAdaptersList.get('prebidBundleName');
					output.activeBidderAdapters = activeBidderAdaptersList.get('activeBiddersInAscOrder');
					return output;
				});
		},
		getActiveAndUsedBidderAdapters: function() {
			const queryString = commonConsts.PREBID_BUNDLING.AMP_SELECTIVE_ROLLOUT_ACTIVE_BIDDER_ADAPTERS_N1QL;
			const query = N1qlQuery.fromString(queryString);

			return couchbase.connectToAppBucket().then(appBucket => {
				return appBucket.queryAsync(query);
			});
		}
	};

	return API;
}
