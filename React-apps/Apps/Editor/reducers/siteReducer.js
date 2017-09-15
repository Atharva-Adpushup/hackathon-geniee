import { status, siteModes, uiActions } from 'consts/commonConsts';

const initialState = { mode: siteModes.DRAFT, partner: null },
	site = (state = {}, action) => {
		switch (action.type) {
			case uiActions.UPDATE_AFTER_SAVE_STATUS:
				const isCurrentModeDraft = (action.status === status.SUCCESS) && (state.mode === siteModes.DRAFT) && action.updateModeStatus,
					isCurrentModePublish = (action.status === status.SUCCESS) && (state.mode === siteModes.PUBLISH) && action.updateModeStatus;

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

			default:
				return state;
		}
	};

export default siteData;
