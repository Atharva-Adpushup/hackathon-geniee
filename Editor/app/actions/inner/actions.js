import Utils from 'libs/utils';
import { hbBoxActions, innerVariationActions, innerActions, messengerCommands } from 'consts/commonConsts';
import { sendMessage } from 'scripts/inner/messengerHelper';
import $ from 'jquery';

const highlightElement = ($el) => {
		const el = $el.get(0);
		if (el.tagName === 'HTML' || el.tagName === 'BODY' || $el.hasClass('_ap_reject')) {
			return { type: hbBoxActions.HIDE_HB_BOX };
		}
		return {
			type: hbBoxActions.SHOW_HB_BOX,
			payload: Utils.dom.getElementRelativeBounds($el)
		};
	},

	hideHighlighter = () => ({ type: hbBoxActions.HIDE_HB_BOX }),

	updateLayout = (variation) => ({ type: innerVariationActions.UPDATE_VARIATION, variation }),

	hideElementSelector = () => ({ type: innerActions.HIDE_ELEMENT_SELECTOR }),

	setElementSelectorCords = (cords) => ({ type: innerActions.SET_ELEMENT_SELECTOR_CORDS, payload: cords });


export { highlightElement, setElementSelectorCords, updateLayout, hideHighlighter, hideElementSelector };
