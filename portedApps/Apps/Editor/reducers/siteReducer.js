import { status, siteModes, uiActions, sectionActions } from 'consts/commonConsts';
import { immutablePush } from 'libs/immutableHelpers';
import utils from 'libs/utils';

const initialState = { mode: siteModes.DRAFT, partner: null, customSizes: [] },
	site = (state = {}, action) => {
		switch (action.type) {
			case uiActions.UPDATE_AFTER_SAVE_STATUS:
				const isCurrentModeDraft =
						action.status === status.SUCCESS && state.mode === siteModes.DRAFT && action.updateModeStatus,
					isCurrentModePublish =
						action.status === status.SUCCESS && state.mode === siteModes.PUBLISH && action.updateModeStatus;

				if (isCurrentModeDraft) {
					return siteModes.PUBLISH;
				} else if (isCurrentModePublish) {
					return siteModes.DRAFT;
				}

				return state.mode;

			default:
				return state;
		}
	},
	siteData = (state = initialState, action) => {
		switch (action.type) {
			case uiActions.UPDATE_AFTER_SAVE_STATUS:
				return {
					...state,
					mode: site(state, action)
				};
			case sectionActions.CREATE_SECTION:
				const size = { width: action.adPayload.width, height: action.adPayload.height };
				if (
					!action.adPayload.isCustomSize ||
					JSON.stringify(state.customSizes).indexOf(JSON.stringify(size)) > -1
				) {
					return state;
				}
				return {
					...state,
					customSizes: immutablePush(state.customSizes, size)
				};

			default:
				return state;
		}
	};

export default siteData;
