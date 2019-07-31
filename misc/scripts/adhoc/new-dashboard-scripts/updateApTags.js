/**
 * PHASE 1: Rename all existing existings ads in tgmr doc
 *
 * Find all tgmr docs
 * Iterate over each ad
 * 		If ad === 'Section-__SECTION_ID__'
 * 			replace it with 'AP_SERVICE(L|I|T)_DEVICE(D|M|T)_PAGEGROUP_WIDTHXHEIGHT_(4_DIGIT_UNIQUE_IDENTIFIER)'
 * 		else
 * 			continue
 *
 * PHASE 2: Testing of the above script
 *
 * PHASE 3: Built functionality into the ApTag app that on ad creation it should follow the same naming convention
 *
 * PHASE 4: Testing of the ApTag's ad creation
 */

const { promiseForeach } = require('node-utils');
const _ = require('lodash');

const { fetchAllTgmrDocs, errorHandler, updateDoc, generateSectionName } = require('./helpers');

function apTagProcessing(doc) {
	const { siteId, ads } = doc;
	const docKey = `tgmr::${siteId}`;

	_.forEach(ads, (ad, index) => {
		const { width, height, id } = ad;

		if (name === `Ad-${id}`) {
			ads[index] = generateSectionName({
				width,
				height,
				platform: null,
				pagegroup: null,
				service: 'T'
			});
		}
	});

	doc.ads = ads;

	return updateDoc(docKey, doc).then(() => console.log(`Processed channel: ${docKey}`));
}

function processing(docs) {
	if (!docs || !docs.length) {
		throw new Error('No docs available');
	}
	return promiseForeach(docs, apTagProcessing, errorHandler);
}

function init() {
	return fetchAllTgmrDocs()
		.then(processing)
		.catch(err => console.log('Error occured : ', err));
}

init().then(() => {
	console.log('Processing Over');
	return process.exit(0);
});
