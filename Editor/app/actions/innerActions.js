import Utils from 'libs/custom/utils';
import { hbBoxActions, innerVariationActions, innerActions, messengerCommands } from '../consts/commonConsts';
import { sendMessage } from '../scripts/inner/messengerHelper';

const getCords = ($el) => {
		const w = $el.offset().top,
			p = $el.offset().left,
			y = $el.outerHeight(),
			o = $el.outerWidth(),
			v = Utils.dom.getViewPort(),
			x = p + o;
		return {
			BOTTOM: {
				top: w + y,
				left: 0,
				height: v.height - (y + w),
				width: '100%'
			},
			TOP: {
				top: 0,
				left: 0,
				height: w,
				width: '100%'
			},
			LEFT: {
				top: w,
				left: 0,
				width: p,
				height: y
			},
			RIGHT: {
				top: w,
				left: x,
				width: v.width - x,
				height: y
			}
		};
	},

	highlightElement = ($el) => {
		const el = $el.get(0);
		if (el.tagName === 'HTML' || el.tagName === 'BODY' || $el.hasClass('_ap_reject')) {
			return { type: hbBoxActions.HIDE_HB_BOX };
		}
		return {
			type: hbBoxActions.SHOW_HB_BOX,
			payload: getCords($el)
		};
	},
	hideHighlighter = () => ({ type: hbBoxActions.HIDE_HB_BOX }),
	updateLayout = (variation) => ({ type: innerVariationActions.UPDATE_VARIATION, variation }),
	setAdpElement = (payload) => {
		sendMessage(messengerCommands.SHOW_INSERT_CONTEXTMENU, {
			position: payload.position,
			parents: payload.parents,
			insertOptions: payload.insertOptions
		});
		return {
			type: innerActions.SET_ADP_ELEMENT,
			payload
		};
	};

export { highlightElement, setAdpElement, updateLayout, hideHighlighter };
