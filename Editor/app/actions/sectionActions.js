import { sectionActions, defaultSectionCss, leftSectionCss, rightSectionCss } from 'consts/commonConsts';
import { getVariationSectionsWithAds } from 'selectors/variationSelectors';
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
		const variationSections = getVariationSectionsWithAds(getState(), { variationId }).sections,
			arr = _.map(variationSections, (data) => { return data; });
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

		alert('In-content section has been created!');
	},
	deleteSection = (sectionId, variationId) => (dispatch, getState) => {
		if(confirm('Are you sure you want to delete this section ?')) {
			dispatch({
				type: sectionActions.DELETE_SECTION,
				sectionId,
				variationId
			});
		}
	},
	renameSection = (section, variationId, name) => (dispatch, getState) => {
		const variationSections = getVariationSectionsWithAds(getState(), { variationId }).sections,
			arr = _.map(variationSections, (data) => { return data });
		if (_.find(arr, { name: name })) {
			alert('Cannot create section with same section name');
			return;
		}

		dispatch({
			type: sectionActions.RENAME_SECTION,
			sectionId: section.id,
			name
		});
	};

export { createSection, deleteSection, renameSection, createIncontentSection };
