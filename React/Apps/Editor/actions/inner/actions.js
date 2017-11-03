import Utils from 'libs/utils';
import $ from 'jquery';
import { hbBoxActions, innerVariationActions, innerActions, messengerCommands } from 'consts/commonConsts';
import { sendMessage } from 'scripts/inner/messengerHelper';

const highlightElement = $el => {
		const el = $el.get(0);
		if (
			el.tagName === 'HTML' ||
			el.tagName === 'BODY' ||
			//$el.hasClass('_ap_reject') ||
			$el.parents().hasClass('_ap_reject')
		) {
			return { type: hbBoxActions.HIDE_HB_BOX };
		}
		return {
			type: hbBoxActions.SHOW_HB_BOX,
			payload: Utils.dom.getElementRelativeBounds($el)
		};
	},
	hideHighlighter = () => ({ type: hbBoxActions.HIDE_HB_BOX }),
	updateLayout = variation => dispatch => {
		dispatch({
			type: innerVariationActions.UPDATE_VARIATION,
			variation
		});
		const $el = variation.contentSelector ? $(variation.contentSelector) : null;

		if (!$el || !$el.length) {
			dispatch({
				type: innerActions.UPDATE_CONTENT_OVERLAY,
				payload: { selector: null, position: { top: 0, left: 0, width: 0, height: 0 } }
			});
			if (variation.contentSelector) {
				sendMessage(messengerCommands.CONTENT_SELECTOR_MISSING, { selector: variation.contentSelector });
			}
		} else {
			sendMessage(messengerCommands.CONTENT_SELECTOR_WORKED, { selector: variation.contentSelector });
			dispatch({
				type: innerActions.UPDATE_CONTENT_OVERLAY,
				payload: { selector: variation.contentSelector, position: Utils.dom.getElementRelativeBounds($el) }
			});
		}
	},
	hideElementSelector = () => ({ type: innerActions.HIDE_ELEMENT_SELECTOR }),
	setElementSelectorCords = cords => ({ type: innerActions.SET_ELEMENT_SELECTOR_CORDS, payload: cords }),
	setViewingMode = mode => ({ type: innerActions.SET_MODE, mode });

export {
	highlightElement,
	setElementSelectorCords,
	updateLayout,
	hideHighlighter,
	hideElementSelector,
	setViewingMode
};
