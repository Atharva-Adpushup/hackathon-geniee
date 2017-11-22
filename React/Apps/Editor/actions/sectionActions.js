import { sectionActions, defaultSectionCss, leftSectionCss, rightSectionCss, adActions } from 'consts/commonConsts';
import { getVariationSectionsWithAds } from 'selectors/variationSelectors';
import { showNotification } from 'actions/uiActions';
import Utils from 'libs/utils';
import _ from 'lodash';

const createSection = (sectionPayload, adPayload, variationId) => {
		const adId = Utils.getRandomNumber(),
			sectionId = Utils.getRandomNumber();

		return {
			type: sectionActions.CREATE_SECTION,
			adPayload: Object.assign(adPayload, {
				id: adId,
				css: adPayload.css ? adPayload.css : defaultSectionCss,
				createTs: Math.floor(Date.now() / 1000)
			}),
			sectionPayload: Object.assign(sectionPayload, {
				name: `Section-${sectionId}`,
				id: sectionId,
				ads: [adId],
				createTs: Math.floor(Date.now() / 1000),
				allXpaths: []
			}),
			sectionId,
			adId,
			variationId
		};
	},
	createIncontentSection = (sectionPayload, adPayload, variationId) => (dispatch, getState) => {
		const variationSections = getVariationSectionsWithAds(getState(), { variationId }).sections,
			arr = _.map(variationSections, data => {
				return data;
			});

		if (_.find(arr, { sectionNo: sectionPayload.sectionNo })) {
			alert('Cannot create in content section with same section no.');
			return;
		}
		if (_.find(arr, { sectionNo: sectionPayload.name })) {
			alert('Cannot create in content section with same section name.');
			return;
		}

		const adId = Utils.getRandomNumber(),
			sectionId = Utils.getRandomNumber(),
			float = sectionPayload.float,
			css = float !== 'none' ? (float === 'left' ? leftSectionCss : rightSectionCss) : defaultSectionCss,
			adData = {},
			adWidth = parseInt(adPayload.adSize.substr(0, adPayload.adSize.indexOf('x')).trim(), 10),
			adHeight = parseInt(adPayload.adSize.substr(adPayload.adSize.indexOf('x') + 1).trim(), 10),
			network = currentUser.userType === 'partner' ? 'geniee' : adPayload.network ? adPayload.network : 'custom';

		dispatch({
			type: sectionActions.CREATE_INCONTENT_SECTION,
			adPayload: Object.assign(adData, {
				width: adWidth,
				height: adHeight,
				adCode: atob(adPayload.adCode) === 'undefined' ? undefined : adPayload.adCode,
				id: adId,
				css,
				createTs: Math.floor(Date.now() / 1000),
				network: network,
				secondaryCss: float !== 'none' ? defaultSectionCss : undefined,
				networkData: adPayload.networkData
			}),
			sectionPayload: Object.assign(sectionPayload, {
				id: sectionId,
				ads: [adId],
				createTs: Math.floor(Date.now() / 1000),
				allXpaths: []
			}),
			sectionId,
			adId,
			variationId
		});

		dispatch(
			showNotification({
				mode: 'success',
				title: 'Operation Successful',
				message: 'In-content section has been created'
			})
		);
	},
	deleteSection = (sectionId, variationId, adId) => dispatch => {
		const isSectionDeletion = confirm('Are you sure you want to delete this section ?');

		if (isSectionDeletion) {
			// TODO: Optimise below two individual dispatch actions
			// How to: Merge below actions into one (for e.g., DELETE_AD), make it a thunk
			// and set a boolean flag in action data if that section needs to be deleted.
			// That way, only one action will be dispatched and this approach helps in
			// upcoming features (for e.g., Time travel, Redo-Undo) implementation
			dispatch({ type: adActions.DELETE_AD, adId, sectionId });
			dispatch({
				type: sectionActions.DELETE_SECTION,
				sectionId,
				variationId
			});
		}
	},
	updatePartnerData = (sectionId, adId, partnerData) => {
		return {
			type: sectionActions.UPDATE_PARTNER_DATA,
			sectionId,
			adId,
			partnerData
		};
	},
	sectionAllXPaths = (sectionId, xpath) => {
		return {
			type: sectionActions.GET_ALL_XPATHS,
			sectionId,
			xpath
		};
	},
	validateXPath = (sectionId, xpath) => {
		return {
			type: sectionActions.VALIDATE_XPATH,
			sectionId,
			xpath
		};
	},
	validateSectionXPath = (sectionId, xpath) => {
		return {
			type: sectionActions.VALIDATE_XPATH_SECTION,
			sectionId,
			xpath
		};
	},
	renameSection = (section, variationId, name) => (dispatch, getState) => {
		const variationSections = getVariationSectionsWithAds(getState(), { variationId }).sections,
			arr = _.map(variationSections, data => {
				return data;
			});
		if (_.find(arr, { name })) {
			alert('Cannot create section with same section name!');
			return;
		}

		dispatch({
			type: sectionActions.RENAME_SECTION,
			sectionId: section.id,
			name
		});
	},
	updateXPath = (sectionId, xpath) => {
		return {
			type: sectionActions.UPDATE_XPATH,
			sectionId,
			xpath
		};
	},
	updateIncontentFloat = (sectionId, adId, float) => {
		let floatCss = '';

		switch (float) {
			case 'right':
				floatCss = rightSectionCss;
				break;
			case 'left':
				floatCss = leftSectionCss;
				break;
			default:
				floatCss = defaultSectionCss;
				break;
		}

		return {
			type: sectionActions.UPDATE_INCONTENT_FLOAT,
			sectionId,
			adId,
			float,
			floatCss
		};
	},
	scrollSectionIntoView = adId => {
		return {
			type: sectionActions.SCROLL_TO_VIEW,
			adId
		};
	};

export {
	createSection,
	deleteSection,
	renameSection,
	createIncontentSection,
	updatePartnerData,
	updateXPath,
	sectionAllXPaths,
	validateXPath,
	validateSectionXPath,
	updateIncontentFloat,
	scrollSectionIntoView
};
