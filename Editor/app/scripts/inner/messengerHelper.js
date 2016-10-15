import Messenger from 'libs/custom/messenger';
import $ from 'jquery';
import { updateLayout, highlightElement, setAdpElement } from '../../actions/innerActions';
import { getAdpVitals } from '../../scripts/inner/domManager';
import { messengerCommands } from '../../consts/commonConsts';

const messenger = new Messenger(),
	initMessageHandler = ({ dispatch, getState }) => {
		messenger.onMessage.add((cmd, data) => {
			switch (cmd) {
				case messengerCommands.UPDATE_LAYOUT:
					dispatch(updateLayout(data));
					break;

				case messengerCommands.HIGHLIGHT_ELEMENT:
					dispatch(highlightElement($(data.xpath)));
					break;

				case messengerCommands.SELECT_ELEMENT:
					dispatch(setAdpElement(getAdpVitals($(data.xpath))));
					break;

				default:
					break;
			}
		});
	},
	sendMessage = (cmd, data) => {
		switch (cmd) {
			case 'Hello':

				break;

			default:
				messenger.sendMessage(cmd, data);
				break;
		}
	};

export { initMessageHandler, sendMessage };
