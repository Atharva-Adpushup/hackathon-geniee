import $ from 'jquery';
import Selectorator from 'libs/cssSelectorator';
import Utils from 'libs/utils';
import { highlightElement, setElementSelectorCords, hideHighlighter } from '../../actions/inner/actions';
import { sendMessage } from './messengerHelper';
import { messengerCommands } from '../../consts/commonConsts';

const selectorator = new Selectorator(),
	events = 'click mouseup mouseleave mousedown mouseover',
	getInsertOptions = (el) => {
		switch (el.nodeName.toLowerCase()) {
			case 'table':
			case 'ul':
			case 'img':
			case 'input':
			case 'textarea':
			case 'button':
			case 'embed':
				return ['Insert After', 'Insert Before'];

			case 'li':
			case 'td':
				return ['Append', 'Prepend'];

			default:
				return ['Append', 'Prepend', 'Insert After', 'Insert Before'];
		}
	},
	getAdpVitals = ($el, force = false) => {
		if (!force && ($el.get(0).tagName === 'HTML' || $el.get(0).tagName === 'BODY' || $el.hasClass('_ap_reject') || $el.parents().hasClass('_ap_reject'))) {
			return false;
		}
		const xpath = selectorator.generate($el)[0],
			insertOptions = getInsertOptions($el.get(0)),
			position = Utils.dom.getElementBounds($el),
			parents = [{ xpath, tagName: $el.prop('tagName') }],
			firstFold = Utils.dom.isElementInFirstFold($el);

		$el.parents().each((index, parent) => {
			if (parent.tagName !== 'HTML' && parent.tagName !== 'BODY') {
				parents.push({
					xpath: selectorator.generate($(parent))[0],
					tagName: parent.tagName
				});
			}
		});

		return { xpath, insertOptions, parents, position, firstFold };
	},
	getAllXPaths = xpath => selectorator.generate($(xpath)),
	isValidXPath = xpath => {
		try {
			return $(xpath).length ? true : false;
		}
		catch (err) {
			return false;
		}
    },
    scrollToView = adId => {
        let id = `#ad-${adId}`,
            ele = $(id);

        $('html, body').animate({
            scrollTop: ele.offset().top
        }, 500);

        ele.css("border", "3px solid #cf474b");
        return true;
    },
	initDomEvents = ({ dispatch }) => {
		$(document).ready(() => {
			sendMessage(messengerCommands.CM_FRAMELOAD_SUCCESS, { channelId: window.ADP_CHANNEL_ID });
		});

		$('html').off().on(events, (e) => {
			// isScriptedEvent, a variable that checks whether e was triggered by a script or not
			const isScriptedEvent = (typeof e.originalEvent === 'undefined')
				|| (e.originalEvent.hasOwnProperty('isTrusted')
					&& !e.originalEvent.isTrusted)
				|| (e.originalEvent.screenX === 0
					&& e.originalEvent.screenY === 0),
				$target = $(e.target);

			if (!isScriptedEvent) {
				e.preventDefault();

				switch (e.type) {
					case 'mouseover':
						dispatch(highlightElement($target));
						break;

					case 'click':
						const vitals = getAdpVitals($target);
						if (vitals) {
							sendMessage(messengerCommands.SHOW_INSERT_CONTEXTMENU, {
								position: vitals.position,
								parents: vitals.parents,
								insertOptions: vitals.insertOptions,
								firstFold: vitals.firstFold
							});
							dispatch(setElementSelectorCords(Utils.ui.getElementSelectorCords($target)));
						}
						break;
					default:
						return;
				}
			}
		});
	};

export { initDomEvents, getAdpVitals, getAllXPaths, isValidXPath, scrollToView };
