import Messenger from 'libs/messenger';
import $ from 'jquery';
import { messengerCommands } from 'consts/commonConsts';
import Utils from 'libs/utils';
import {
	updateLayout,
	highlightElement,
	setElementSelectorCords,
	hideElementSelector,
	setViewingMode
} from '../../actions/inner/actions';
import { getAdpVitals, getAllXPaths, isValidXPath, scrollToView } from './domManager';

const messenger = new Messenger(),
	sendMessage = (cmd, data) => {
		switch (cmd) {
			case 'Hello':
				break;

			default:
				messenger.sendMessage(cmd, { ...data, channelId: window.ADP_CHANNEL_ID });
				break;
		}
	},
	initMessageHandler = ({ dispatch, getState }) => {
		messenger.onMessage.add((cmd, data) => {
			switch (cmd) {
				case messengerCommands.UPDATE_LAYOUT:
					dispatch(updateLayout(data));
					break;

				case messengerCommands.HIGHLIGHT_ELEMENT:
					dispatch(setElementSelectorCords(Utils.ui.getElementSelectorCords($(data.xpath))));
					dispatch(highlightElement($(data.xpath)));
					break;

				case messengerCommands.HIDE_ELEMENT_SELECTOR:
					dispatch(hideElementSelector());
					break;

				case messengerCommands.GET_RELEVANT_XPATHS:
					sendMessage(messengerCommands.SET_RELEVANT_XPATHS, {
						allXpaths: getAllXPaths(data.xpath),
						sectionId: data.sectionId
					});
					break;

				case messengerCommands.VALIDATE_XPATH:
					sendMessage(messengerCommands.XPATH_VALIDATED, {
						xpath: data.xpath,
						isValidXPath: isValidXPath(data.xpath),
						sectionId: data.sectionId
					});
					break;

				case messengerCommands.VALIDATE_XPATH_SECTION:
					sendMessage(messengerCommands.XPATH_SECTION_VALIDATED, {
						xpath: data.xpath,
						isValidXPath: isValidXPath(data.xpath),
						sectionId: data.sectionId
					});
					break;

				case messengerCommands.SCROLL_TO_VIEW:
					scrollToView(data.adId);
					break;

				case messengerCommands.SET_MODE:
					dispatch(setViewingMode(data.mode));
					break;

				case messengerCommands.SELECT_ELEMENT:
					const $el = $(data.xpath),
						vitals = getAdpVitals($el);
					if (vitals) {
						sendMessage(messengerCommands.SHOW_INSERT_CONTEXTMENU, {
							position: vitals.position,
							parents: vitals.parents,
							insertOptions: vitals.insertOptions,
							firstFold: vitals.firstFold
						});
						dispatch(setElementSelectorCords(Utils.ui.getElementSelectorCords($el)));
					}
					break;

				default:
					break;
			}
		});
	};

export { initMessageHandler, sendMessage };
