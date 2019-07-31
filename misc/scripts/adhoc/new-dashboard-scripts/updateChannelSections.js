/**
 * PHASE 1: Rename all existing sections in channels
 *
 * Find all channels
 * Iterate over each channel
 * Iterate over each variation
 * Iterate over each section
 * 		If sectionName === 'Section-__SECTION_ID__'
 * 			replace it with 'AP_SERVICE(L|I|T)_DEVICE(D|M|T)_PAGEGROUP_WIDTHXHEIGHT_(4_DIGIT_UNIQUE_IDENTIFIER)'
 * 		else
 * 			continue
 *
 * PHASE 2: Testing of the above script
 *
 * PHASE 3: Built functionality into the editor that on section creation it should follow the same naming convention
 *
 * PHASE 4: Testing of the editor's section creation
 */

const { promiseForeach } = require('node-utils');
const _ = require('lodash');
const uuid = require('uuid');

const { fetchAllChannels, errorHandler, updateDoc } = require('./helpers');

function generateSectionName({ service, platform = null, pagegroup = null, width, height }) {
	const name = ['AP', service];

	if (platform) name.push(platform.toUpperCase().slice(0, 1));
	if (pagegroup) name.push(pagegroup.toUpperCase().replace(/\s/g, '-'));

	name.push(`${width}X${height}`);
	name.push(uuid.v4().slice(0, 5));

	return name.join('_');
}

function channelProcessing(channel) {
	const { siteId, platform, pageGroup, variations } = channel;
	const channelKey = `chnl::${siteId}:${platform}:${pageGroup}`;

	_.forEach(variations, (variation, variationId) => {
		const { sections } = variation;
		_.forEach(sections, (section, sectionId) => {
			const { name, id, ads = {}, type = -1 } = section;
			const adIds = Object.keys(ads);
			const service = type === 3 || type === 4 ? 'I' : 'L';

			if (adIds.length) {
				const { width, height } = ads[adIds[0]];
				if (name === `Section-${id}`) {
					variations[variationId].sections[sectionId].name = generateSectionName({
						width,
						height,
						platform,
						service,
						pagegroup: pageGroup
					});
				}
			}
		});
	});
	channel.variations = variations;

	return updateDoc(channelKey, channel).then(() => console.log(`Processed channel: ${channelKey}`));
}

function processing(channels) {
	if (!channels || !channels.length) {
		throw new Error('No Channels available');
	}
	return promiseForeach(channels, channelProcessing, errorHandler);
}

function init() {
	return fetchAllChannels()
		.then(processing)
		.catch(err => console.log('Error occured : ', err));
}

init().then(() => {
	console.log('Processing Over');
	return process.exit(0);
});
