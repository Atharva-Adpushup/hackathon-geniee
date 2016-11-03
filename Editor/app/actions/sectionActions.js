import { sectionActions, defaultSectionCss, leftSectionCss, rightSectionCss } from 'consts/commonConsts';
import Utils from 'libs/utils';
import _ from 'lodash';

const createSection = (sectionPayload, adPayload, variationId) => {
		const adId = Utils.getRandomNumber(),
			sectionId = Utils.getRandomNumber();
		return {
			type: sectionActions.CREATE_SECTION,
			adPayload: Object.assign(adPayload, { id: adId, css: adPayload.css ? adPayload.css : defaultSectionCss, createTs: Math.floor(Date.now() / 1000) }),
			sectionPayload: Object.assign(sectionPayload, { name: `Section-${sectionId}`, id: sectionId, ads: [adId], createTs: Math.floor(Date.now() / 1000), allXpaths: [] }),
			sectionId,
			adId,
			variationId
		};
	},
	createIncontentSection = (sectionPayload, adPayload, variationId) => (dispatch, getState) => {
		const state = getState(),
			arr = _.map(state.sectionByIds, function (data) { return data; });
		if (_.find(arr, { sectionNo: sectionPayload.sectionNo })) {
			alert('Cannot create in content section with same section no.');
			return;
		}

		const adId = Utils.getRandomNumber(),
			sectionId = Utils.getRandomNumber(),
			float = sectionPayload.float,
			css = (float !== 'none' ? (float === 'left' ? leftSectionCss : rightSectionCss) : defaultSectionCss);
		dispatch({
			type: sectionActions.CREATE_INCONTENT_SECTION,
			adPayload: Object.assign(adPayload, { id: adId, css, createTs: Math.floor(Date.now() / 1000), secondaryCss: float !== 'none' ? defaultSectionCss : undefined }),
			sectionPayload: Object.assign(sectionPayload, { id: sectionId, name: `Section-${sectionId}`, ads: [adId], createTs: Math.floor(Date.now() / 1000), allXpaths: [] }),
			sectionId,
			adId,
			variationId
		});
	},
	deleteSection = (sectionId, variationId) => ({
		type: sectionActions.DELETE_SECTION,
		sectionId,
		variationId
	}),
	renameSection = (sectionId, name) => ({
		type: sectionActions.DELETE_SECTION,
		sectionId,
		name
	});

export { createSection, deleteSection, renameSection, createIncontentSection };
