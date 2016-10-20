import { sectionActions, defaultSectionCss } from 'consts/commonConsts';
import Utils from 'libs/utils';

const createSection = (sectionPayload, adPayload, variationId) => {
		const adId = Utils.getRandomNumber(),
			sectionId = Utils.getRandomNumber();
		return {
			type: sectionActions.CREATE_SECTION,
			adPayload: Object.assign(adPayload, { id: adId, name: `Section-${sectionId}`, css: adPayload.css ? adPayload.css : defaultSectionCss, createTs: Math.floor(Date.now() / 1000) }),
			sectionPayload: Object.assign(sectionPayload, { id: sectionId, ads: [adId], createTs: Math.floor(Date.now() / 1000), allXpaths: [] }),
			sectionId,
			adId,
			variationId
		};
	},
	createIcontentSection = (sectionPayload, adPayload, variationId) => {
		const adId = Utils.getRandomNumber(),
			sectionId = Utils.getRandomNumber();
		return {
			type: sectionActions.CREATE_INCONTENT_SECTION,
			adPayload: Object.assign(adPayload, { id: adId, name: `Section-${sectionId}`, css: adPayload.css ? adPayload.css : defaultSectionCss, createTs: Math.floor(Date.now() / 1000) }),
			sectionPayload: Object.assign(sectionPayload, { id: sectionId, ads: [adId], createTs: Math.floor(Date.now() / 1000), allXpaths: [] }),
			sectionId,
			adId,
			variationId
		};
	},
	deleteSection = (sectionId) => ({
		type: sectionActions.DELETE_SECTION,
		sectionId
	}),
	renameSection = (sectionId, name) => ({
		type: sectionActions.DELETE_SECTION,
		sectionId,
		name
	});

export { createSection, deleteSection, renameSection, createIcontentSection };
