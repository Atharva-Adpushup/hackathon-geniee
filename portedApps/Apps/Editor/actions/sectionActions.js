import _ from 'lodash';

import {
	sectionActions,
	defaultSectionCss,
	leftSectionCss,
	rightSectionCss,
	adActions,
	uiActions,
	editMenuActions
} from 'consts/commonConsts';
import { getVariationSectionsWithAds } from 'selectors/variationSelectors';
import Utils from 'libs/utils';
import _ from 'lodash';
import { generateSectionName } from '../../../common/helpers';

const createSection = (sectionPayload, adPayload, variationId) => dispatch => {
		const adId = Utils.getRandomNumber();
		const sectionId = Utils.getRandomNumber();
		const isAdPayload = !!adPayload;
		const isAdNetworkData = !!(isAdPayload && adPayload.networkData);
		const isZoneId = !!(isAdNetworkData && adPayload.networkData.zoneId);
		const isCreateZoneContainerId = !!(isZoneId && adPayload.networkData.createZoneContainerId);
		const name = sectionPayload.namingData
			? generateSectionName({ ...sectionPayload.namingData, id: sectionId })
			: `Section-${sectionId}`;

		if (isCreateZoneContainerId) {
			adPayload.networkData.zoneContainerId = `${adPayload.networkData.zoneId}-${adId}`;
			delete adPayload.networkData.createZoneContainerId;
		}

		delete sectionPayload.namingData;

		return dispatch({
			type: sectionActions.CREATE_SECTION,
			adPayload: Object.assign(adPayload, {
				id: adId,
				css: adPayload.css ? adPayload.css : defaultSectionCss,
				createTs: Math.floor(Date.now() / 1000)
			}),
			sectionPayload: Object.assign(sectionPayload, {
				name,
				id: sectionId,
				ads: [adId],
				createTs: Math.floor(Date.now() / 1000),
				allXpaths: []
			}),
			sectionId,
			adId,
			variationId
		});
	},
	createIncontentSection = (sectionPayload, adPayload, variationId) => (dispatch, getState) => {
		const variationSections = getVariationSectionsWithAds(getState(), { variationId }).sections,
			arr = _.map(variationSections, data => data);

		if (_.find(arr, { sectionNo: sectionPayload.sectionNo })) {
			dispatch({
				type: uiActions.SHOW_NOTIFICATION,
				mode: 'error',
				title: 'Operation failed',
				message: 'Cannot create in content section with same section no.'
			});
			return;
		}
		if (_.find(arr, { sectionNo: sectionPayload.name })) {
			dispatch({
				type: uiActions.SHOW_NOTIFICATION,
				mode: 'error',
				title: 'Operation failed',
				message: 'Cannot create in content section with same section name.'
			});
			return;
		}

		const adId = Utils.getRandomNumber();
		const sectionId = Utils.getRandomNumber();
		const float = sectionPayload.float;
		const css =
			float !== 'none' ? (float === 'left' ? leftSectionCss : rightSectionCss) : defaultSectionCss;
		const customCSS = adPayload.customCSS || '';
		const multipleAdSizes = adPayload.multipleAdSizes || null;
		const adData = {};
		const network =
			currentUser.userType === 'partner'
				? 'geniee'
				: adPayload.network
				? adPayload.network
				: 'custom';
		const isAdPayload = !!adPayload;
		const isAdNetworkData = !!(isAdPayload && adPayload.networkData);
		const isZoneId = !!(isAdNetworkData && adPayload.networkData.zoneId);
		const isCreateZoneContainerId = !!(isZoneId && adPayload.networkData.createZoneContainerId);
		let adWidth = adPayload.adSize.substr(0, adPayload.adSize.indexOf('x')).trim();
		let adHeight = adPayload.adSize.substr(adPayload.adSize.indexOf('x') + 1).trim();
		const isAdWidthNotANumber = isNaN(adWidth);
		const isAdHeightNotANumber = isNaN(adHeight);

		adWidth = isAdWidthNotANumber ? adWidth : parseInt(adWidth, 10);
		adHeight = isAdHeightNotANumber ? adHeight : parseInt(adHeight, 10);

		if (isCreateZoneContainerId) {
			adPayload.networkData.zoneContainerId = `${adPayload.networkData.zoneId}-${adId}`;
			delete adPayload.networkData.createZoneContainerId;
		}

		dispatch({
			type: sectionActions.CREATE_INCONTENT_SECTION,
			adPayload: Object.assign(adData, {
				width: adWidth,
				height: adHeight,
				adCode: atob(adPayload.adCode) === 'undefined' ? undefined : adPayload.adCode,
				id: adId,
				css,
				customCSS,
				multipleAdSizes,
				createTs: Math.floor(Date.now() / 1000),
				network,
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

		dispatch({
			type: uiActions.SHOW_NOTIFICATION,
			mode: 'success',
			title: 'Operation Successful',
			message: 'In-content section has been created'
		});
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
	updatePartnerData = (sectionId, adId, partnerData) => ({
		type: sectionActions.UPDATE_PARTNER_DATA,
		sectionId,
		adId,
		partnerData
	}),
	sectionAllXPaths = (sectionId, xpath) => ({
		type: sectionActions.GET_ALL_XPATHS,
		sectionId,
		xpath
	}),
	validateXPath = (sectionId, xpath) => ({
		type: sectionActions.VALIDATE_XPATH,
		sectionId,
		xpath
	}),
	validateSectionXPath = (sectionId, xpath) => ({
		type: sectionActions.VALIDATE_XPATH_SECTION,
		sectionId,
		xpath
	}),
	renameSection = (section, variationId, name) => (dispatch, getState) => {
		const variationSections = getVariationSectionsWithAds(getState(), { variationId }).sections,
			arr = _.map(variationSections, data => data);
		if (_.find(arr, { name })) {
			dispatch({
				type: uiActions.SHOW_NOTIFICATION,
				mode: 'error',
				title: 'Operation failed',
				message: 'Cannot create section with same section name'
			});
			return;
		}

		dispatch({
			type: sectionActions.RENAME_SECTION,
			sectionId: section.id,
			name
		});
	},
	updateXPath = (sectionId, xpath) => ({
		type: sectionActions.UPDATE_XPATH,
		sectionId,
		xpath
	}),
	updateOperation = (sectionId, operation) => ({
		type: sectionActions.UPDATE_OPERATION,
		sectionId,
		operation
	}),
	updateInContentMinDistanceFromPrevAd = (sectionId, minDistanceFromPrevAd) => ({
		type: sectionActions.UPDATE_INCONTENT_MIN_DISTANCE_FROM_PREV_AD,
		sectionId,
		minDistanceFromPrevAd
	}),
	updateInContentNotNear = (sectionId, notNear) => ({
		type: sectionActions.UPDATE_INCONTENT_NOT_NEAR,
		sectionId,
		notNear
	}),
	updateType = (sectionId, value) => ({
		type: sectionActions.UPDATE_TYPE,
		sectionId,
		value
	}),
	updateFormatData = (sectionId, formatData) => (dispatch, getState) => {
		dispatch({
			type: uiActions.SHOW_NOTIFICATION,
			mode: 'success',
			title: 'Operation Successfull',
			message: 'Format Data updated'
		});
		dispatch({
			type: editMenuActions.HIDE_EDIT_MENU
		});
		return dispatch({
			type: sectionActions.UPDATE_FORMAT_DATA,
			sectionId,
			formatData
		});
	},
	updateSection = (sectionId, params) => (dispatch, getState) => {
		dispatch({
			type: uiActions.SHOW_NOTIFICATION,
			mode: 'success',
			title: 'Operation Successful',
			message: 'Section updated'
		});
		return dispatch({
			type: sectionActions.UPDATE_SECTION,
			sectionId,
			params
		});
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
	scrollSectionIntoView = adId => ({
		type: sectionActions.SCROLL_TO_VIEW,
		adId
	}),
	toggleLazyLoad = (sectionId, value) => ({
		type: sectionActions.ENABLE_LAZYLOAD,
		sectionId,
		value
	});

export {
	createSection,
	deleteSection,
	renameSection,
	createIncontentSection,
	updatePartnerData,
	updateXPath,
	updateOperation,
	updateInContentMinDistanceFromPrevAd,
	updateInContentNotNear,
	sectionAllXPaths,
	validateXPath,
	validateSectionXPath,
	updateIncontentFloat,
	scrollSectionIntoView,
	updateSection,
	updateType,
	updateFormatData,
	toggleLazyLoad
};
