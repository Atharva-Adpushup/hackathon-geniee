import $ from 'jquery';
import { arrayOf, normalize } from 'normalizr';
import { channelSchema } from 'schemas/site';
import { siteModes } from 'consts/commonConsts';
import _ from 'lodash';
import { openPageGroupIfPresent } from '../misc/beforeEditorInit';

const save = (url, data) => $.ajax({ type: 'POST', url, data, dataType: 'json' }),
	getData = (url, data) => $.get(url, data),
	isApInstalled = (url, siteId) =>
		$.getJSON(`/api/proxy/detectAp?url=${encodeURI(url)}&siteId=${siteId}`),
	changeSiteMode = (siteId, mode) =>
		save('/data/changeMode', { siteId, mode }).then(response => !!response.success),
	/** *TODO: Optimise and reduce below function** */
	loadInitialData = siteId => {
		const deferred = $.Deferred(),
			processData = rawData => {
				const parsedData = typeof rawData === 'string' ? JSON.parse(rawData) : rawData,
					result = normalize(parsedData.channels, arrayOf(channelSchema));
				let computedResult = $.extend(true, {}, result.entities);
				computedResult.siteData = {
					mode: parsedData.site.hasOwnProperty('apConfigs')
						? parseInt(parsedData.site.apConfigs.mode, 10)
						: siteModes.DRAFT,
					partner: rawData.site.partner || null,
					customSizes: parsedData.site.customSizes || []
				};

				computedResult.channelData = {
					activeChannel: null,
					byIds: $.extend(true, {}, result.entities.channelData)
				};

				// Compute active channel and set default UI properties
				Object.keys(computedResult.channelData.byIds).forEach(channelKey => {
					// Set default UI properties
					computedResult.channelData.byIds[channelKey].isOpen = false;
					computedResult.channelData.byIds[channelKey].isLoading = false;
				});

				// Change 'variations' keys object to keys array
				_.forOwn(computedResult.channelData.byIds, (chnlData, channelName) => {
					computedResult.channelData.byIds[channelName].variations = _.keys(
						computedResult.channelData.byIds[channelName].variations
					);
				});

				// Change 'sections' keys object to keys array
				_.forOwn(computedResult.variationByIds, (variationData, variationName) => {
					computedResult.variationByIds[variationName].sections = _.keys(
						computedResult.variationByIds[variationName].sections
					);
				});

				// Change 'ads' keys object to keys array
				_.forOwn(computedResult.sectionByIds, (sectionData, sectionName) => {
					computedResult.sectionByIds[sectionName].ads = _.keys(
						computedResult.sectionByIds[sectionName].ads
					);
				});

				computedResult.reporting = rawData.reporting;
				computedResult.networkConfig = parsedData.networkConfig;
				computedResult = openPageGroupIfPresent(computedResult);

				deferred.resolve(computedResult);
				return deferred.promise();
			};

		return getData('/api/data/getData', { siteId })
			.then(rawData => processData(rawData))
			.fail((jqXHR, textStatus) => {
				const initialData = { channels: [] };

				console.log('Error while loading data: ', textStatus);
				console.log('Initial data will be loaded');
				return processData(initialData);
			});
	},
	masterSave = data =>
		save('/api/data/saveData', {
			data: JSON.stringify(data)
		});

export { masterSave, changeSiteMode, isApInstalled, loadInitialData };
