import { messengerCommands } from 'consts/commonConsts';
import { showMenu } from 'actions/insertMenuActions';
import Messenger from 'libs/messenger';
import { openChannelSuccess, contentSelectorMissing, contentSelectorWorked } from 'actions/channelActions';
import { deleteAd } from 'actions/adActions';
import { deleteSection } from 'actions/sectionActions';
import { showMenu as showEditMenu } from '../actions/editMenuActions';


const messenger = new Messenger(),
	getTarget = (channelId) => {
		const channelFrame = document.querySelector(`iframe[data-adpid="iframe${channelId}"]`);
		if (!channelFrame) {
			return false;
		}

		return channelFrame.contentWindow;
	},
	initMessageHandler = ({ dispatch, getState }) => {
		messenger.onMessage.add((cmd, data) => {
			switch (cmd) {
				case messengerCommands.SHOW_INSERT_CONTEXTMENU:
					dispatch(showMenu(data));
					break;

				case messengerCommands.SHOW_EDIT_CONTEXTMENU:
					dispatch(showEditMenu(data.sectionId, data.adId, data.position));
					break;

				case messengerCommands.CM_FRAMELOAD_SUCCESS:
					dispatch(openChannelSuccess(data.channelId));
					break;

				case messengerCommands.REMOVE_AD:
					dispatch(deleteAd(data.adId, data.sectionId));
					break;

				case messengerCommands.REMOVE_SECTION:
					dispatch(deleteSection(data.sectionId));
					break;

				case messengerCommands.CONTENT_SELECTOR_MISSING:
					dispatch(contentSelectorMissing(data.channelId));
					break;

				case messengerCommands.CONTENT_SELECTOR_WORKED:
					dispatch(contentSelectorWorked(data.channelId));
					break;

				case messengerCommands.SECTION_ALL_XPATHS:
					this.flux.actions.updateSection(data);
					break;

				case messengerCommands.SECTION_XPATH_MISSING:
					this.flux.actions.updateSection({ id: data.id, xpathMissing: true });
					break;

				default:
					break;

			}
		});
	},
	sendMessage = (channelId, cmd, data) => {
		const target = getTarget(channelId);
		if (!target) {
			alert('Post message target not found');
			return false;
		}
		messenger.setTarget(target);
		switch (cmd) {
			case 'Hello':

				break;

			default:
				messenger.sendMessage(cmd, data);
				break;
		}
	};


export { initMessageHandler, sendMessage };
