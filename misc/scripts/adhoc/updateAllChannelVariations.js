const Promise = require('bluebird'),
	lodash = require('lodash'),
	extend = require('extend'),
	couchBaseService = require('../../../helpers/couchBaseService'),
	couchbasePromise = require('couchbase'),
	sitesByNonEmptyChannelsQuery = couchbasePromise.ViewQuery.from('app', 'sitesByNonEmptyChannels'),
	{ promiseForeach } = require('node-utils'),
	channelModel = require('../../../models/channelModel');

function formatQueryResult(resultData) {
	return lodash.map(resultData, resultObj => {
		return { id: resultObj.value.siteId, channels: resultObj.value.channels.concat([]) };
	});
}

function getSiteChannelsData() {
	const performQuery = couchBaseService.queryViewFromAppBucket(sitesByNonEmptyChannelsQuery);

	return Promise.resolve(performQuery)
		.then(formatQueryResult)
		.then(computedData => computedData);
}

function updateVariationsData(channelData) {
	const inputData = extend(true, {}, channelData),
		siteId = inputData.id,
		channelsListArray = inputData.channels,
		isChannels = !!(channelsListArray && channelsListArray.length);
	let rootStatusObject = {
		id: siteId,
		channelList: channelsListArray,
		status: 0,
		data: ''
	};

	if (!isChannels) {
		return rootStatusObject;
	}

	return Promise.all(
		lodash.map(channelsListArray, channelItem => {
			const channelItemArray = channelItem.split(':'),
				platform = channelItemArray[0],
				pageGroup = channelItemArray[1],
				statusObject = {
					id: siteId,
					channel: channelItem,
					status: 0,
					message: ''
				};

			return channelModel
				.getChannel(siteId, platform, pageGroup)
				.then(modelInstance => {
					const isModel = !!modelInstance,
						isChannelContentSelectorProperty = !!(
							isModel &&
							modelInstance.data &&
							modelInstance.data.hasOwnProperty('contentSelector')
						),
						isChannelContentSelector = !!(
							isChannelContentSelectorProperty && modelInstance.data.contentSelector
						),
						channelContentSelector = isChannelContentSelectorProperty
							? modelInstance.data.contentSelector
							: '',
						variations = isModel && modelInstance.get('variations'),
						isVariations = !!variations && lodash.isObject(variations) && lodash.keys(variations).length;
					let variationsObject, variationKeys;

					if (!isVariations) {
						statusObject.status = 0;
						statusObject.message = 'Variations does not exist';
						return statusObject;
					}

					variationsObject = extend(true, {}, variations);
					variationKeys = lodash.keys(variationsObject);

					return Promise.all(
						lodash.map(variationKeys, variationKey => {
							const variationObject = variationsObject[variationKey],
								isVariationContentSelectorProperty = !!(
									variationObject && variationObject.hasOwnProperty('contentSelector')
								),
								isVariationContentSelector = !!(
									isVariationContentSelectorProperty && variationObject.contentSelector
								),
								isNoContentSelectorProperty = !!(
									!isChannelContentSelectorProperty && !isVariationContentSelectorProperty
								);

							statusObject.variationKey = variationKey;

							if (isNoContentSelectorProperty) {
								statusObject.status = 0;
								statusObject.message = 'Empty content selectors at variation and channel level';
								return statusObject;
							}

							if (isVariationContentSelector) {
								statusObject.status = 0;
								statusObject.message = 'Valid variation content selector exist';
								return statusObject;
							}

							if (isChannelContentSelectorProperty && !isVariationContentSelectorProperty) {
								variationObject.contentSelector = channelContentSelector;
								statusObject.status = 1;
								statusObject.message = `Content selector added from channel to variation ${variationKey} level`;
							}

							variationsObject[variationKey] = extend(true, {}, variationObject);
							return statusObject;
						})
					).then(statusObjectArray => {
						const isStatusArray = !!statusObjectArray && statusObjectArray.length,
							isDataChanged = !!(isStatusArray && lodash(statusObjectArray).find({ status: 1 }));

						if (!isDataChanged) {
							statusObject.status = 0;
							statusObject.message =
								'No change in variations object, so channel document do not need to be saved';
							return statusObject;
						}

						modelInstance.set('variations', variationsObject);
						return modelInstance.save().then(() => {
							return statusObjectArray;
						});
					});
				})
				.catch(err => {
					const errorMessage = `UpdateVariationsData:: Promise catch: Unable to get channel document for ${channelItem}`;

					console.log(errorMessage);
					statusObject.status = 0;
					statusObject.message = errorMessage;
					return statusObject;
				});
		})
	)
		.then(rootStatusArray => {
			rootStatusObject.status = 1;
			rootStatusObject.data = rootStatusArray.concat([]);
			console.log(
				`Successfully changes done for Site ${rootStatusObject.id}. Status Data: ${JSON.stringify(
					rootStatusArray
				)}`
			);
			return rootStatusObject;
		})
		.catch(err => {
			console.log(`Failed to make changes for Site ${rootStatusObject.id}. Error message: ${err.message}`);
			return rootStatusObject;
		});
}

function processData(channelsData) {
	return promiseForeach(channelsData, updateVariationsData, (channelItem, err) => {
		console.log(
			`Init:: Root catch: Error occurred with channel item: ${JSON.stringify(channelItem)}, ${err.message}`
		);
		return true;
	});
}

function init() {
	return getSiteChannelsData()
		.then(processData)
		.then(() => console.log(`Init:: Successfully updated all variations data`))
		.catch(err =>
			console.log(`Init:: Catch: Failed to update variations data. Error message: ${JSON.stringify(err)}`)
		);
}

init();
