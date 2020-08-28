module.exports = apiModule();

const model = require('../helpers/model');
const couchbase = require('../helpers/couchBaseService');
const { docKeys } = require('../configs/commonConsts');

const ActiveBidderAdaptersList = model.extend(function() {
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
				'activeBidders list and prebidBundleName are required for ActiveBidderAdaptersList doc'
			);
		}
		this.key = docKeys.activeBidderAdaptersList;
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
		getActiveBidderAdaptersDoc: function() {
			return couchbase
				.connectToAppBucket()
				.then(appBucket => appBucket.getAsync(docKeys.activeBidderAdaptersList))
				.then(json => new ActiveBidderAdaptersList(json.value, json.cas));
		},
		createActiveBidderAdaptersDoc(activeBidders) {
			const json = {
				prebidBundleName: getPrebidBundleName(),
				activeBiddersInAscOrder: activeBidders
			};
			return Promise.resolve(new ActiveBidderAdaptersList(json)).then(ActiveBidderAdaptersList =>
				ActiveBidderAdaptersList.save()
			);
		},
		/**
		 * - Fetch existing doc, if found and activeBidders list is different then udpate it
		 * - If doc not found then create a new doc
		 * - If activeBidders list not changed or got any error while fetching doc then do nothing
		 */
		updateActiveBidderAdaptersIfChanged(activeBidderAdapters) {
			const output = {
				activeBidderAdapters,
				isUpdated: false,
				prebidBundleName: ''
			};
			const newActiveBiddersInAscOrderString = activeBidderAdapters.join(',');

			return API.getActiveBidderAdaptersDoc()
				.then(ActiveBidderAdaptersList => {
					const existingActiveBiddersInAscOrderString = ActiveBidderAdaptersList.get(
						'activeBiddersInAscOrder'
					).join(',');

					if (existingActiveBiddersInAscOrderString !== newActiveBiddersInAscOrderString) {
						ActiveBidderAdaptersList.updateActiveBidderAdapters(activeBidderAdapters);
						return ActiveBidderAdaptersList.save().then(activeBidderAdapters => {
							output.isUpdated = true;
							return activeBidderAdapters;
						});
					}

					return ActiveBidderAdaptersList;
				})
				.catch(err => {
					if (err.code === 13) {
						return API.createActiveBidderAdaptersDoc(activeBidderAdapters).then(
							activeBidderAdapters => {
								output.isUpdated = true;
								return activeBidderAdapters;
							}
						);
					}

					throw err;
				})
				.then(ActiveBidderAdaptersList => {
					output.prebidBundleName = ActiveBidderAdaptersList.get('prebidBundleName');
					return output;
				});
		}
	};

	return API;
}
